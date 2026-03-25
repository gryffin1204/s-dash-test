export interface SdqTrendPoint {
  month: string;
  rate: number;
}

export interface StateVolumePoint {
  state: string;
  volume: number;
}

export interface SummaryResponse {
  kpi_orig_vol: number;
  kpi_loan_count: number;
  kpi_avg_score: number;
  kpi_current_upb: number;
  kpi_sdq: number;
  sdqTrendData: SdqTrendPoint[];
  topStatesData: StateVolumePoint[];
}

export interface OriginationQuarterPoint {
  quarter: string;
  volume: number;
}

export interface MonthlyOriginationKpiPoint {
  period: string;
  avg_loan_size_k: number;
  active_loan_count: number;
  active_orig_upb_billion: number;
  avg_fico: number;
  avg_dti: number;
  avg_ltv: number;
}

export interface CreditScorePoint {
  band: string;
  count: number;
}

export interface ProductMixPoint {
  name: string;
  value: number;
}

export interface OriginationResponse {
  kpi_avg_loan: number;
  kpi_avg_fico: number;
  kpi_avg_dti: number;
  kpi_avg_ltv: number;
  originationByQuarter: OriginationQuarterPoint[];
  monthlyKpiTrend: MonthlyOriginationKpiPoint[];
  creditScoreDist: CreditScorePoint[];
  productMixData: ProductMixPoint[];
}

export interface MonthlyServicingKpiPoint {
  period: string;
  current_upb_billion: number;
  dq30_rate: number;
  dq60_rate: number;
  sdq_rate: number;
  avg_loan_age: number;
  avg_remaining_term: number;
  avg_current_rate: number;
}

export interface ServicingResponse {
  kpi_current_upb: number;
  kpi_30d: number;
  kpi_60d: number;
  kpi_sdq: number;
  kpi_avg_loan_age: number;
  kpi_avg_remaining_term: number;
  kpi_current_rate: number;
  monthlyKpiTrend: MonthlyServicingKpiPoint[];
}

export type QueryCell = string | number | boolean | null;
export type QueryRow = Record<string, QueryCell>;
export type QueryChartType = 'metric' | 'bar' | 'line' | 'table';

export interface QueryResponse {
  columns: string[];
  rows: QueryRow[];
  mode?: 'sql' | 'nl';
  input?: string;
  generated_sql?: string;
  explanation?: string;
  chart_type?: QueryChartType;
  x_field?: string | null;
  y_fields?: string[];
  title?: string | null;
  translation_source?: 'llm' | 'heuristic' | 'heuristic_fallback' | null;
}
