from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import duckdb
import os
import math
import re
import pandas as pd

from llm_utils import load_env_file, request_llm_query_plan

app = FastAPI(title="LoanIntel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DuckDB connection
conn = duckdb.connect(database=':memory:', read_only=False)

# File paths
BASE_DIR = r"c:\Users\vaibh\Downloads\sample_2020"
ORIG_FILE = os.path.join(BASE_DIR, "sample_orig_2020.txt")
SVCG_FILE = os.path.join(BASE_DIR, "sample_svcg_2020.txt")

load_env_file(os.path.join(os.path.dirname(__file__), ".env"))

SCHEMA_PROMPT = """
Database objects:
- orig(credit_score, first_payment_date, first_time_homebuyer, maturity_date, msa, mi_percent, number_of_units, occupancy_status, original_cltv, original_dti, original_upb, original_ltv, original_interest_rate, channel, ppm_flag, amortization_type, property_state, property_type, postal_code, loan_sequence_number, loan_purpose, original_loan_term, number_of_borrowers, seller_name, servicer_name, super_conforming_flag, pre_harp_loan_sequence_number, program_indicator, harp_indicator, property_valuation_method, io_indicator, mi_cancellation_indicator)
- svcg(loan_sequence_number, monthly_reporting_period, current_actual_upb, current_loan_delinquency_status, loan_age, remaining_months_to_maturity, defect_settlement_date, modification_flag, zero_balance_code, zero_balance_effective_date, current_interest_rate, current_deferred_upb, due_date_of_last_paid_installment, mi_recoveries, net_sales_proceeds, non_mi_recoveries, expenses, legal_costs, maintenance_preservation_costs, taxes_and_insurance, miscellaneous_expenses, actual_loss_calculation, modification_cost, step_modification_flag, deferred_payment_plan, estimated_property_value, zero_balance_removal_upb, delinquent_accrued_interest, disaster_indicator, borrower_assistance_status, current_month_modification_cost, interest_bearing_upb)

Join rule:
- Join orig and svcg on loan_sequence_number.

Conventions and safety rules:
- Only produce a single read-only SELECT or WITH query.
- Never emit INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, ATTACH, COPY, or CALL.
- Treat monthly_reporting_period as YYYYMM.
- Exclude sentinel values where relevant: credit_score = 9999, original_dti = 999, original_ltv = 999, original_cltv = 999.
- Servicing numeric-looking fields can arrive as text from CSV ingestion; use TRY_CAST(... AS DOUBLE) before aggregating when needed.
- Serious delinquency means current_loan_delinquency_status in ('3','4','5','6','7','8','9','10','11','12','13','14','15','RA').
- Prefer concise result sets suitable for charts.
"""

# Setup Views
conn.execute(f"""
    CREATE VIEW orig AS 
    SELECT * FROM read_csv('{ORIG_FILE}', sep='|', header=False, names=[
        'credit_score', 'first_payment_date', 'first_time_homebuyer', 'maturity_date',
        'msa', 'mi_percent', 'number_of_units', 'occupancy_status', 'original_cltv',
        'original_dti', 'original_upb', 'original_ltv', 'original_interest_rate',
        'channel', 'ppm_flag', 'amortization_type', 'property_state', 'property_type',
        'postal_code', 'loan_sequence_number', 'loan_purpose', 'original_loan_term',
        'number_of_borrowers', 'seller_name', 'servicer_name', 'super_conforming_flag',
        'pre_harp_loan_sequence_number', 'program_indicator', 'harp_indicator',
        'property_valuation_method', 'io_indicator', 'mi_cancellation_indicator'
    ]);
""")

conn.execute(f"""
    CREATE VIEW svcg AS 
    SELECT * FROM read_csv('{SVCG_FILE}', sep='|', header=False, names=[
        'loan_sequence_number', 'monthly_reporting_period', 'current_actual_upb',
        'current_loan_delinquency_status', 'loan_age', 'remaining_months_to_maturity',
        'defect_settlement_date', 'modification_flag', 'zero_balance_code',
        'zero_balance_effective_date', 'current_interest_rate', 'current_deferred_upb',
        'due_date_of_last_paid_installment', 'mi_recoveries', 'net_sales_proceeds',
        'non_mi_recoveries', 'expenses', 'legal_costs', 'maintenance_preservation_costs',
        'taxes_and_insurance', 'miscellaneous_expenses', 'actual_loss_calculation',
        'modification_cost', 'step_modification_flag', 'deferred_payment_plan',
        'estimated_property_value', 'zero_balance_removal_upb', 'delinquent_accrued_interest',
        'disaster_indicator', 'borrower_assistance_status', 'current_month_modification_cost',
        'interest_bearing_upb'
    ], types={{'current_loan_delinquency_status': 'VARCHAR', 'zero_balance_code': 'VARCHAR'}});
""")

class QueryRequest(BaseModel):
    sql: str | None = None
    question: str | None = None

SERIOUS_DELINQUENCY_STATUSES = ('3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', 'RA')
READ_ONLY_BLOCKLIST = ('insert ', 'update ', 'delete ', 'drop ', 'alter ', 'create ', 'attach ', 'copy ', 'call ')


def is_sql_query(text: str) -> bool:
    normalized = text.lstrip().lower()
    return normalized.startswith('select') or normalized.startswith('with')


def serious_delinquency_case(alias: str = 's') -> str:
    statuses = ', '.join(f"'{status}'" for status in SERIOUS_DELINQUENCY_STATUSES)
    return f"CASE WHEN {alias}.current_loan_delinquency_status IN ({statuses}) THEN 1 ELSE 0 END"


def latest_reporting_period_filter(alias: str = 's') -> str:
    return f"{alias}.monthly_reporting_period = (SELECT MAX(monthly_reporting_period) FROM svcg)"


def extract_quarter_filter(question: str) -> str:
    quarter_match = re.search(r'\bq([1-4])\b', question)
    year_match = re.search(r'\b(20\d{2})\b', question)

    if not quarter_match and not year_match:
        return ""

    year = year_match.group(1) if year_match else '2020'
    filters = [f"SUBSTRING(CAST(o.first_payment_date AS VARCHAR), 1, 4) = '{year}'"]

    if quarter_match:
        filters.append(
            "CEIL(CAST(SUBSTRING(CAST(o.first_payment_date AS VARCHAR), 5, 2) AS INTEGER) / 3.0) = "
            f"{quarter_match.group(1)}"
        )

    return " AND ".join(filters)


def extract_limit(question: str, default: int = 5, maximum: int = 25) -> int:
    limit_match = re.search(r'\btop\s+(\d+)\b', question)
    if not limit_match:
        return default

    return min(int(limit_match.group(1)), maximum)


def build_query_plan(
    sql: str,
    explanation: str,
    chart_type: str = "table",
    x_field: str | None = None,
    y_fields: list[str] | None = None,
    title: str | None = None,
    translation_source: str = "heuristic",
) -> dict[str, object]:
    return {
        "sql": sql,
        "explanation": explanation,
        "chart_type": chart_type,
        "x_field": x_field,
        "y_fields": y_fields or [],
        "title": title,
        "translation_source": translation_source,
    }


def translate_natural_language_query(question: str) -> dict[str, object]:
    normalized = re.sub(r'\s+', ' ', question.lower()).strip()
    limit = extract_limit(normalized)
    quarter_filter = extract_quarter_filter(normalized)

    if ('default risk' in normalized or 'default rate' in normalized or 'delinquency rate' in normalized) and 'state' in normalized:
        sql = f"""
            SELECT
                o.property_state,
                ROUND(CAST(SUM({serious_delinquency_case()}) AS DOUBLE) / NULLIF(COUNT(*), 0) * 100, 2) AS serious_delinquency_rate
            FROM orig o
            JOIN svcg s USING (loan_sequence_number)
            WHERE {latest_reporting_period_filter()}
            GROUP BY o.property_state
            ORDER BY serious_delinquency_rate DESC
            LIMIT {limit}
        """
        explanation = "Using the latest serious-delinquency rate as a current default-risk proxy by state."
        return build_query_plan(sql, explanation, chart_type="bar", x_field="property_state", y_fields=["serious_delinquency_rate"], title="Highest Default Risk States")

    if 'sdq' in normalized or 'serious delinquency' in normalized:
        filters = [latest_reporting_period_filter()]
        if quarter_filter:
            filters.append(quarter_filter)

        where_clause = " AND ".join(filters)
        sql = f"""
            SELECT
                ROUND(CAST(SUM({serious_delinquency_case()}) AS DOUBLE) / NULLIF(COUNT(*), 0) * 100, 2) AS sdq_rate
            FROM orig o
            JOIN svcg s USING (loan_sequence_number)
            WHERE {where_clause}
        """
        explanation = "Translated the request to the latest-period serious-delinquency calculation for the matching origination cohort."
        return build_query_plan(sql, explanation, chart_type="metric", y_fields=["sdq_rate"], title="Serious Delinquency Rate")

    if ('average interest rate' in normalized or 'avg interest rate' in normalized) and 'channel' in normalized:
        sql = """
            SELECT
                channel,
                ROUND(AVG(original_interest_rate), 3) AS avg_interest_rate
            FROM orig
            GROUP BY channel
            ORDER BY avg_interest_rate DESC
        """
        explanation = "Grouped origination records by channel and averaged the original interest rate."
        return build_query_plan(sql, explanation, chart_type="bar", x_field="channel", y_fields=["avg_interest_rate"], title="Average Interest Rate by Channel")

    if ('loss severity' in normalized or 'actual loss' in normalized) and 'servicer' in normalized:
        sql = f"""
            SELECT
                o.servicer_name,
                ROUND(AVG(TRY_CAST(s.actual_loss_calculation AS DOUBLE)), 2) AS avg_loss_severity
            FROM orig o
            JOIN svcg s USING (loan_sequence_number)
            WHERE TRY_CAST(s.actual_loss_calculation AS DOUBLE) IS NOT NULL
            GROUP BY o.servicer_name
            ORDER BY avg_loss_severity DESC
            LIMIT {limit}
        """
        explanation = "Joined origination and servicing records, then averaged actual loss severity by servicer."
        return build_query_plan(sql, explanation, chart_type="bar", x_field="servicer_name", y_fields=["avg_loss_severity"], title="Average Loss Severity by Servicer")

    if ('state' in normalized or 'states' in normalized) and ('volume' in normalized or 'origination' in normalized or 'upb' in normalized):
        sql = f"""
            SELECT
                property_state,
                ROUND(SUM(original_upb) / 1000000000.0, 2) AS volume_billion
            FROM orig
            GROUP BY property_state
            ORDER BY volume_billion DESC
            LIMIT {limit}
        """
        explanation = "Summed original UPB by state and returned the largest state exposures."
        return build_query_plan(sql, explanation, chart_type="bar", x_field="property_state", y_fields=["volume_billion"], title="Origination Volume by State")

    if ('how many' in normalized or 'count' in normalized) and ('ltv' in normalized or 'loan to value' in normalized):
        threshold_match = re.search(r'(?:ltv|loan to value)[^0-9]*(\d+(?:\.\d+)?)', normalized)
        threshold = threshold_match.group(1) if threshold_match else '80'
        sql = f"""
            SELECT
                COUNT(*) AS loan_count
            FROM orig
            WHERE original_ltv > {threshold}
        """
        explanation = f"Counted loans with original LTV above {threshold}."
        return build_query_plan(sql, explanation, chart_type="metric", y_fields=["loan_count"], title=f"Loans with LTV Above {threshold}")

    if 'origination volume' in normalized and 'quarter' in normalized:
        sql = """
            SELECT
                'Q' || CEIL(CAST(SUBSTRING(CAST(first_payment_date AS VARCHAR), 5, 2) AS INTEGER) / 3.0) || ' 2020' AS quarter,
                ROUND(SUM(original_upb) / 1000000000.0, 2) AS volume_billion
            FROM orig
            GROUP BY quarter
            ORDER BY quarter
        """
        explanation = "Bucketed originations by quarter and summed original UPB."
        return build_query_plan(sql, explanation, chart_type="bar", x_field="quarter", y_fields=["volume_billion"], title="Origination Volume by Quarter")

    if 'loan count' in normalized or 'how many loans' in normalized:
        return build_query_plan("SELECT COUNT(*) AS loan_count FROM orig", "Counted loans from the origination dataset.", chart_type="metric", y_fields=["loan_count"], title="Loan Count")

    if 'origination volume' in normalized:
        return build_query_plan(
            "SELECT ROUND(SUM(original_upb) / 1000000000.0, 2) AS total_origination_volume_billion FROM orig",
            "Summed original UPB across all origination records.",
            chart_type="metric",
            y_fields=["total_origination_volume_billion"],
            title="Total Origination Volume",
        )

    if 'average credit score' in normalized or 'avg credit score' in normalized:
        return build_query_plan(
            "SELECT ROUND(AVG(NULLIF(credit_score, 9999)), 1) AS avg_credit_score FROM orig",
            "Excluded sentinel values and averaged origination credit scores.",
            chart_type="metric",
            y_fields=["avg_credit_score"],
            title="Average Credit Score",
        )

    if 'average dti' in normalized or 'avg dti' in normalized:
        return build_query_plan(
            "SELECT ROUND(AVG(NULLIF(original_dti, 999)), 2) AS avg_dti FROM orig",
            "Excluded sentinel values and averaged origination DTI.",
            chart_type="metric",
            y_fields=["avg_dti"],
            title="Average DTI",
        )

    if 'average ltv' in normalized or 'avg ltv' in normalized:
        return build_query_plan(
            "SELECT ROUND(AVG(NULLIF(original_ltv, 999)), 2) AS avg_ltv FROM orig",
            "Excluded sentinel values and averaged origination LTV.",
            chart_type="metric",
            y_fields=["avg_ltv"],
            title="Average LTV",
        )

    raise HTTPException(
        status_code=400,
        detail=(
            "Unsupported natural-language query. Try a question like "
            "'What is the SDQ rate for loans originated in Q1 2020?' or use raw DuckDB SQL."
        ),
    )


def get_nl_query_plan(question: str) -> dict[str, object]:
    llm_error = None

    try:
        llm_plan = request_llm_query_plan(question, SCHEMA_PROMPT)
        if llm_plan:
            return llm_plan
    except ValueError as error:
        llm_error = str(error)

    query_plan = translate_natural_language_query(question)
    if llm_error:
        query_plan["explanation"] = f"{query_plan['explanation']} LLM API was unavailable, so a local fallback translator handled this request."
        query_plan["translation_source"] = "heuristic_fallback"

    return query_plan


def infer_chart_plan(df: pd.DataFrame, prompt: str, query_plan: dict[str, object] | None = None) -> dict[str, object]:
    plan = dict(query_plan or {})
    columns = list(df.columns)

    if not columns:
        return build_query_plan("SELECT 1", "No chartable data returned.", title="Query Result")

    numeric_columns = [column for column in columns if pd.api.types.is_numeric_dtype(df[column])]
    x_field = plan.get("x_field")
    x_field = str(x_field) if x_field in columns else None

    y_fields_raw = plan.get("y_fields")
    if isinstance(y_fields_raw, list):
        y_fields = [str(field) for field in y_fields_raw if str(field) in columns and str(field) != x_field]
    else:
        y_fields = []

    if not x_field:
        x_field = next((column for column in columns if column not in numeric_columns), columns[0] if columns else None)

    if not y_fields:
        y_fields = [column for column in numeric_columns if column != x_field][:3]

    chart_type = str(plan.get("chart_type", "")).lower()
    time_tokens = ("date", "period", "month", "quarter", "year")
    if chart_type not in {"metric", "bar", "line", "table"}:
        if len(df.index) == 1 and numeric_columns:
            chart_type = "metric"
        elif x_field and y_fields:
            chart_type = "line" if any(token in x_field.lower() for token in time_tokens) else "bar"
        else:
            chart_type = "table"
    elif chart_type == "metric" and len(df.index) > 1 and x_field and y_fields:
        chart_type = "line" if any(token in x_field.lower() for token in time_tokens) else "bar"

    if chart_type == "metric" and not y_fields and numeric_columns:
        y_fields = numeric_columns[:3]

    title = plan.get("title")
    if not title:
        title = "Query Result" if is_sql_query(prompt) else prompt.strip().rstrip("?").title()

    return {
        "chart_type": chart_type,
        "x_field": x_field,
        "y_fields": y_fields,
        "title": title,
        "explanation": plan.get("explanation"),
        "translation_source": plan.get("translation_source"),
    }

def safe_float(val):
    if val is None or math.isnan(val):
        return 0.0
    return val


def format_reporting_period(period) -> str:
    period_str = str(period)
    if len(period_str) == 6:
        return f"{period_str[:4]}-{period_str[4:6]}"
    return period_str


def get_cursor():
    return conn.cursor()

@app.get("/api/summary")
def get_summary():
    db = get_cursor()

    # Origination KPIs
    res = db.execute("""
        SELECT 
            SUM(original_upb) as total_orig_volume,
            COUNT(*) as total_loan_count,
            AVG(NULLIF(credit_score, 9999)) as avg_credit_score
        FROM orig
    """).fetchone()
    
    # Servicing KPIs (Current UPB and SDQ)
    svcg_res = db.execute("""
        SELECT 
            SUM(current_actual_upb) as current_upb,
            CAST(SUM(CASE WHEN current_loan_delinquency_status IN ('3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', 'RA') THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100 as sdq_rate
        FROM svcg
        WHERE monthly_reporting_period = (SELECT MAX(monthly_reporting_period) FROM svcg)
    """).fetchone()
    
    # Monthly SDQ Trend
    trend_res = db.execute("""
        SELECT 
            monthly_reporting_period,
            CAST(SUM(CASE WHEN current_loan_delinquency_status IN ('3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', 'RA') THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100 as rate
        FROM svcg
        GROUP BY monthly_reporting_period
        ORDER BY monthly_reporting_period
    """).fetchall()
    
    trend_data = [{"month": str(r[0])[4:6], "rate": round(safe_float(r[1]), 2)} for r in trend_res[-12:]]

    # Top States
    states_res = db.execute("""
        SELECT property_state, SUM(original_upb) / 1000000000.0 as volume
        FROM orig
        GROUP BY property_state
        ORDER BY volume DESC
        LIMIT 5
    """).fetchall()
    
    states_data = [{"state": r[0], "volume": round(safe_float(r[1]), 1)} for r in states_res]
    
    return {
        "kpi_orig_vol": res[0] if res else 0,
        "kpi_loan_count": res[1] if res else 0,
        "kpi_avg_score": round(res[2]) if res and res[2] else 0,
        "kpi_current_upb": svcg_res[0] if svcg_res else 0,
        "kpi_sdq": round(safe_float(svcg_res[1]), 2) if svcg_res else 0,
        "sdqTrendData": trend_data,
        "topStatesData": states_data
    }

@app.get("/api/origination")
def get_origination():
    db = get_cursor()

    res = db.execute("""
        SELECT 
            AVG(original_upb) as avg_loan,
            AVG(NULLIF(credit_score, 9999)) as avg_fico,
            AVG(NULLIF(original_dti, 999)) as avg_dti,
            AVG(NULLIF(original_ltv, 999)) as avg_ltv
        FROM orig
    """).fetchone()
    
    q_res = db.execute("""
        SELECT 
            'Q' || CEIL(CAST(SUBSTRING(CAST(first_payment_date AS VARCHAR), 5, 2) AS INTEGER) / 3.0) || ' 2020' as quarter,
            SUM(original_upb) / 1000000000.0 as volume
        FROM orig
        GROUP BY quarter
        ORDER BY quarter
    """).fetchall()
    quarter_data = [{"quarter": str(r[0]), "volume": round(safe_float(r[1]), 1)} for r in q_res]

    monthly_res = db.execute("""
        SELECT
            monthly_reporting_period,
            AVG(original_upb) / 1000.0 as avg_loan_size_k,
            COUNT(*) as active_loan_count,
            SUM(original_upb) / 1000000000.0 as active_orig_upb_billion,
            AVG(NULLIF(credit_score, 9999)) as avg_fico,
            AVG(NULLIF(original_dti, 999)) as avg_dti,
            AVG(NULLIF(original_ltv, 999)) as avg_ltv
        FROM orig o
        JOIN svcg s USING (loan_sequence_number)
        GROUP BY monthly_reporting_period
        ORDER BY monthly_reporting_period
    """).fetchall()
    monthly_kpi_trend = [
        {
            "period": format_reporting_period(r[0]),
            "avg_loan_size_k": round(safe_float(r[1]), 1),
            "active_loan_count": int(r[2]) if r[2] else 0,
            "active_orig_upb_billion": round(safe_float(r[3]), 2),
            "avg_fico": round(safe_float(r[4]), 1),
            "avg_dti": round(safe_float(r[5]), 2),
            "avg_ltv": round(safe_float(r[6]), 2),
        }
        for r in monthly_res
    ]
    
    score_res = db.execute("""
        SELECT 
            CASE 
                WHEN credit_score < 650 THEN '<650'
                WHEN credit_score BETWEEN 650 AND 699 THEN '650-699'
                WHEN credit_score BETWEEN 700 AND 749 THEN '700-749'
                WHEN credit_score >= 750 AND credit_score < 9999 THEN '750+'
                ELSE 'Unknown'
            END as band,
            COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orig WHERE credit_score < 9999) as count
        FROM orig
        WHERE credit_score < 9999
        GROUP BY band
        ORDER BY MIN(credit_score)
    """).fetchall()
    score_data = [{"band": r[0], "count": round(safe_float(r[1]), 1)} for r in score_res]
    
    mix_res = db.execute("""
        SELECT amortization_type, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orig) as value
        FROM orig
        GROUP BY amortization_type
    """).fetchall()
    mix_data = [{"name": r[0], "value": round(safe_float(r[1]), 1)} for r in mix_res]

    return {
        "kpi_avg_loan": round(safe_float(res[0])),
        "kpi_avg_fico": round(safe_float(res[1])),
        "kpi_avg_dti": round(safe_float(res[2]), 1),
        "kpi_avg_ltv": round(safe_float(res[3]), 1),
        "originationByQuarter": quarter_data,
        "monthlyKpiTrend": monthly_kpi_trend,
        "creditScoreDist": score_data,
        "productMixData": mix_data
    }


@app.get("/api/servicing")
def get_servicing():
    db = get_cursor()

    monthly_res = db.execute(f"""
        SELECT
            s.monthly_reporting_period,
            SUM(TRY_CAST(s.current_actual_upb AS DOUBLE)) / 1000000000.0 as current_upb_billion,
            CAST(SUM(CASE WHEN s.current_loan_delinquency_status = '1' THEN 1 ELSE 0 END) AS DOUBLE) / NULLIF(COUNT(*), 0) * 100 as dq30_rate,
            CAST(SUM(CASE WHEN s.current_loan_delinquency_status = '2' THEN 1 ELSE 0 END) AS DOUBLE) / NULLIF(COUNT(*), 0) * 100 as dq60_rate,
            CAST(SUM({serious_delinquency_case()}) AS DOUBLE) / NULLIF(COUNT(*), 0) * 100 as sdq_rate,
            AVG(TRY_CAST(s.loan_age AS DOUBLE)) as avg_loan_age,
            AVG(TRY_CAST(s.remaining_months_to_maturity AS DOUBLE)) as avg_remaining_term,
            AVG(TRY_CAST(s.current_interest_rate AS DOUBLE)) as avg_current_rate
        FROM svcg s
        GROUP BY s.monthly_reporting_period
        ORDER BY s.monthly_reporting_period
    """).fetchall()

    monthly_kpi_trend = [
        {
            "period": format_reporting_period(r[0]),
            "current_upb_billion": round(safe_float(r[1]), 2),
            "dq30_rate": round(safe_float(r[2]), 2),
            "dq60_rate": round(safe_float(r[3]), 2),
            "sdq_rate": round(safe_float(r[4]), 2),
            "avg_loan_age": round(safe_float(r[5]), 1),
            "avg_remaining_term": round(safe_float(r[6]), 1),
            "avg_current_rate": round(safe_float(r[7]), 3),
        }
        for r in monthly_res
    ]

    latest = monthly_kpi_trend[-1] if monthly_kpi_trend else None

    return {
        "kpi_current_upb": latest["current_upb_billion"] if latest else 0,
        "kpi_30d": latest["dq30_rate"] if latest else 0,
        "kpi_60d": latest["dq60_rate"] if latest else 0,
        "kpi_sdq": latest["sdq_rate"] if latest else 0,
        "kpi_avg_loan_age": latest["avg_loan_age"] if latest else 0,
        "kpi_avg_remaining_term": latest["avg_remaining_term"] if latest else 0,
        "kpi_current_rate": latest["avg_current_rate"] if latest else 0,
        "monthlyKpiTrend": monthly_kpi_trend,
    }

@app.post("/api/query")
def execute_query(req: QueryRequest):
    try:
        db = get_cursor()

        user_input = (req.question or req.sql or "").strip()
        if not user_input:
            raise HTTPException(status_code=400, detail="Provide a natural-language question or a read-only SQL query.")

        mode = "sql"
        sql_to_execute = user_input
        query_plan: dict[str, object] = {}

        if not is_sql_query(user_input):
            query_plan = get_nl_query_plan(user_input)
            sql_to_execute = str(query_plan["sql"])
            mode = "nl"

        sql_lower = sql_to_execute.lower()
        if any(keyword in sql_lower for keyword in READ_ONLY_BLOCKLIST):
            raise HTTPException(status_code=400, detail="Only SELECT queries are allowed.")
            
        df = db.execute(sql_to_execute).df()
        
        # Replace NaN with None for JSON serialization
        df = df.replace({float('nan'): None})
        chart_plan = infer_chart_plan(df, user_input, query_plan)
        
        records = df.to_dict(orient="records")
        return {
            "columns": list(df.columns),
            "rows": records,
            "mode": mode,
            "input": user_input,
            "generated_sql": sql_to_execute,
            "explanation": chart_plan.get("explanation"),
            "chart_type": chart_plan.get("chart_type"),
            "x_field": chart_plan.get("x_field"),
            "y_fields": chart_plan.get("y_fields"),
            "title": chart_plan.get("title"),
            "translation_source": chart_plan.get("translation_source"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
