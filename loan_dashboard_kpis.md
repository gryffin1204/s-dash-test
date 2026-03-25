# Loan Data Dashboard KPIs

## Executive Summary
This document outlines key performance indicators (KPIs) for analyzing the Freddie Mac Single-Family Loan-Level Dataset. The KPIs are categorized by data source (Origination-only, Servicing-only, and Merged) and by business domain (Portfolio, Credit Risk, Performance, Financial).

---

## 1. ORIGINATION-ONLY KPIs (Static Loan Characteristics)

### 1.1 Portfolio Composition KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Total Origination Volume** | SUM(Original Principal Balance) | Total dollar amount of loans originated | Metric Card, Time Series |
| **Loan Count** | COUNT(Loan Sequence Number) | Total number of loans in portfolio | Metric Card |
| **Average Loan Size** | AVG(Original Principal Balance) | Mean loan amount | Metric Card |
| **Median Loan Size** | MEDIAN(Original Principal Balance) | Median loan amount | Metric Card |
| **Loan Size Distribution** | Percentiles of Original Principal Balance | Distribution of loan sizes | Histogram, Box Plot |
| **Origination by Quarter** | COUNT/SUM grouped by origination quarter | Seasonal origination trends | Bar Chart, Time Series |

### 1.2 Credit Quality KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Average Credit Score** | AVG(Credit Score, excluding 9999) | Mean borrower credit score | Metric Card, Distribution |
| **Credit Score Distribution** | % in ranges (300-650, 650-700, 700-750, 750+) | Risk stratification by FICO | Stacked Bar, Pie Chart |
| **High Credit Risk %** | COUNT(Credit Score < 650) / Total Count | Proportion of subprime loans | Metric Card, Gauge |
| **Average DTI Ratio** | AVG(Original DTI, excluding 999) | Mean debt-to-income ratio | Metric Card |
| **DTI Distribution** | % in ranges (<36%, 36-43%, 43-50%, >50%) | DTI risk buckets | Stacked Bar |
| **High DTI %** | COUNT(DTI > 43) / Total Count | Proportion of high DTI loans | Metric Card |
| **Average LTV** | AVG(Original LTV, excluding 999) | Mean loan-to-value ratio | Metric Card |
| **Average CLTV** | AVG(Original CLTV, excluding 999) | Mean combined LTV | Metric Card |
| **High LTV %** | COUNT(LTV > 80) / Total Count | Proportion of high LTV loans | Metric Card |
| **MI Coverage %** | COUNT(MI % > 0) / Total Count | % of loans with mortgage insurance | Metric Card |
| **Average MI %** | AVG(MI %, excluding 0 and 999) | Average MI coverage | Metric Card |

### 1.3 Product Mix KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Product Type Mix** | COUNT by Amortization Type (FRM/ARM) | Fixed vs Adjustable rate | Pie Chart, Donut |
| **Channel Mix** | COUNT by Channel (R/B/C/T/9) | Origination channel distribution | Pie Chart, Bar |
| **Loan Purpose Mix** | COUNT by Purpose (P/C/N/R) | Purchase vs Refinance breakdown | Stacked Bar, Pie |
| **Cash-Out Refi %** | COUNT(Purpose='C') / COUNT(Purpose in ['C','N','R']) | Refinance cash-out ratio | Metric Card |
| **First-Time Homebuyer %** | COUNT(First Time Homebuyer='Y') / Total | First-time buyer proportion | Metric Card |
| **Occupancy Mix** | COUNT by Occupancy (P/S/I) | Primary/Second/Investment | Stacked Bar, Pie |
| **Investment Property %** | COUNT(Occupancy='I') / Total | Investment loan proportion | Metric Card |
| **Property Type Mix** | COUNT by Property Type (SF/CO/PU/MH/CP) | Property type distribution | Bar Chart |
| **Condo/Co-op %** | COUNT(Property Type in ['CO','CP']) / Total | Non-single family % | Metric Card |
| **Super Conforming %** | COUNT(Super Conforming Flag='Y') / Total | Jumbo conforming loans | Metric Card |
| **Program Indicator Mix** | COUNT by Program (H/F/9) | Affordable housing programs | Bar Chart |
| **Home Possible %** | COUNT(Program='H') / Total | Home Possible loans | Metric Card |
| **HARP Loan %** | COUNT(HARP Indicator='Y') / Total | Refinance assistance loans | Metric Card |
| **Interest Only %** | COUNT(I/O Indicator='Y') / Total | Interest-only loans | Metric Card |
| **PPM %** | COUNT(PPM Flag='Y') / Total | Prepayment penalty mortgages | Metric Card |

### 1.4 Geographic & Demographic KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Top States by Volume** | SUM(UPB) by Property State | Geographic concentration | Map, Horizontal Bar |
| **Top MSAs by Volume** | SUM(UPB) by MSA | Metro area concentration | Map, Table |
| **Rural vs Urban %** | COUNT(MSA is NULL) / Total | Non-metro area proportion | Metric Card |
| **Multi-Unit %** | COUNT(Number of Units > 1) / Total | 2-4 unit properties | Metric Card |
| **Multi-Borrower %** | COUNT(Number of Borrowers > 1) / Total | Co-borrower loans | Metric Card |

### 1.5 Seller & Servicer KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Top Sellers by Volume** | SUM(UPB) by Seller Name | Seller concentration | Horizontal Bar |
| **Top Servicers by Volume** | SUM(UPB) by Servicer Name | Servicer concentration | Horizontal Bar |
| **Seller Concentration (HHI)** | SUM((Seller Volume/Total)^2) | Herfindahl-Hirschman Index | Metric Card |
| **Other Sellers %** | COUNT(Seller='Other Sellers') / Total | Undisclosed seller % | Metric Card |

### 1.6 Interest Rate KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Average Interest Rate** | AVG(Original Interest Rate) | Mean note rate | Metric Card |
| **Interest Rate Distribution** | % in 0.5% buckets | Rate stratification | Histogram |
| **Rate by Credit Score Band** | AVG(Rate) by Credit Score range | Risk-based pricing | Line Chart, Bar |
| **Rate by LTV Band** | AVG(Rate) by LTV range | LTV-based pricing | Line Chart |
| **Spread to Benchmark** | AVG(Rate) - Treasury Yield | Relative pricing | Time Series |

### 1.7 Loan Term KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Average Loan Term** | AVG(Original Loan Term) | Mean maturity in months | Metric Card |
| **Term Distribution** | % by term buckets (15yr, 20yr, 30yr) | Term stratification | Pie Chart |
| **15-Year %** | COUNT(Term <= 180) / Total | Short-term loans | Metric Card |
| **30-Year %** | COUNT(Term between 300 and 360) / Total | Standard loans | Metric Card |

---

## 2. SERVICING-ONLY KPIs (Monthly Performance)

### 2.1 Current Performance KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Current UPB** | SUM(Current Actual UPB) | Outstanding balance | Metric Card |
| **Average Loan Age** | AVG(Loan Age) | Months since origination | Metric Card |
| **Average Remaining Term** | AVG(Remaining Months to Maturity) | Months to maturity | Metric Card |
| **Current Interest Rate** | AVG(Current Interest Rate) | Weighted avg current rate | Metric Card |

### 2.2 Delinquency KPIs (Critical)

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Current Delinquency Rate** | COUNT(Delinquency Status > 0) / Total | % loans 30+ days past due | Metric Card, Gauge |
| **30-Day Delinquency Rate** | COUNT(Delinquency Status = 1) / Total | Early stage delinquency | Metric Card |
| **60-Day Delinquency Rate** | COUNT(Delinquency Status = 2) / Total | Moderate delinquency | Metric Card |
| **90-Day Delinquency Rate** | COUNT(Delinquency Status >= 3) / Total | Serious delinquency | Metric Card |
| **Serious Delinquency Rate** | COUNT(Delinquency Status >= 3) / Total | SDQ rate (industry standard) | Metric Card, Trend |
| **REO Rate** | COUNT(Delinquency Status = 'RA') / Total | Real estate owned % | Metric Card |
| **Delinquency by Vintage** | SDQ Rate by origination quarter | Vintage performance | Line Chart |
| **Delinquency by Seasoning** | SDQ Rate by loan age buckets | Seasoning curve | Line Chart |
| **Weighted Avg Delinquency** | SUM(Delinquency Status * UPB) / SUM(UPB) | UPB-weighted severity | Metric Card |

### 2.3 Prepayment & Termination KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Prepayment Rate (CPR)** | Annualized prepayment speed | Constant Prepayment Rate | Metric Card, Trend |
| **Single Month Mortality (SMM)** | Monthly prepayment rate | Monthly prepayment speed | Time Series |
| **Voluntary Payoff Rate** | COUNT(Zero Balance Code='01') / Active | Prepayment/Maturity rate | Metric Card |
| **Third Party Sale Rate** | COUNT(Zero Balance Code='02') / Active | Short sale rate | Metric Card |
| **Foreclosure Rate** | COUNT(Zero Balance Code='03') / Active | Foreclosure completion rate | Metric Card |
| **REO Disposition Rate** | COUNT(Zero Balance Code='09') / Active | REO sale rate | Metric Card |
| **Cumulative Loss Rate** | SUM(Actual Loss) / Original UPB | Total realized losses | Metric Card |
| **Annualized Default Rate** | COUNT(Zero Balance Code in ['02','03','09']) / Active | Default flow rate | Metric Card |

### 2.4 Loss & Recovery KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Total Actual Losses** | SUM(Actual Loss Calculation) | Sum of realized losses | Metric Card |
| **Average Loss Severity** | AVG(Actual Loss / Zero Balance Removal UPB) | Loss given default | Metric Card |
| **Net Sales Proceeds Ratio** | AVG(Net Sales Proceeds / Property Value) | Recovery rate | Metric Card |
| **MI Recovery Rate** | SUM(MI Recoveries) / SUM(Actual Loss) | Insurance recovery % | Metric Card |
| **Total Expenses** | SUM(Expenses) | Servicing expenses | Metric Card |
| **Legal Costs per Loan** | AVG(Legal Costs) | Average legal costs | Metric Card |
| **Maintenance Costs per Loan** | AVG(Maintenance/Preservation) | Property preservation | Metric Card |
| **Cumulative Modification Cost** | SUM(Cumulative Modification Cost) | Total modification expense | Metric Card |

### 2.5 Modification KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Modification Rate** | COUNT(Modification Flag='Y' or 'P') / Total | % of loans modified | Metric Card |
| **Current Period Mod Rate** | COUNT(Modification Flag='Y') / Total | New modifications | Metric Card |
| **Step Modification %** | COUNT(Step Modification Flag='Y') / Total | Step-rate modifications | Metric Card |
| **Payment Deferral Rate** | COUNT(Deferred Payment Plan='Y' or 'P') / Total | Deferral utilization | Metric Card |
| **Avg Monthly Mod Cost** | AVG(Current Month Modification Cost) | Current modification expense | Metric Card |
| **Modification Success Rate** | COUNT(Modified & Current) / COUNT(Modified) | Re-default analysis | Metric Card |

### 2.6 Forbearance & Assistance KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Forbearance Rate** | COUNT(Borrower Assistance='F') / Total | Active forbearance % | Metric Card |
| **Repayment Plan Rate** | COUNT(Borrower Assistance='R') / Total | Repayment plan % | Metric Card |
| **Trial Period Rate** | COUNT(Borrower Assistance='T') / Total | Trial modification % | Metric Card |
| **Disaster Impacted Loans** | COUNT(Disaster Indicator='Y') / Total | Disaster area loans | Metric Card |

### 2.7 Current LTV & Equity KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Average Current LTV** | AVG(Estimated LTV, excluding 999) | Current LTV from AVM | Metric Card |
| **Negative Equity %** | COUNT(ELTV > 100) / Total | Underwater loans | Metric Card |
| **High Equity %** | COUNT(ELTV < 50) / Total | >50% equity | Metric Card |
| **Equity Distribution** | % by ELTV buckets | Equity position | Histogram |

---

## 3. MERGED DATA KPIs (Origination + Servicing)

### 3.1 Vintage Performance Analysis

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Vintage Default Rate** | Defaults by Origination Quarter / Original Count | Cumulative default by vintage | Line Chart (Vintage Curves) |
| **Vintage SDQ Rate** | SDQ by Origination Quarter / Active | Serious delinquency by vintage | Line Chart |
| **Vintage CPR** | CPR by Origination Quarter | Prepayment by vintage | Line Chart |
| **Vintage Loss Rate** | Losses by Origination Quarter / Original UPB | Loss by vintage | Line Chart |
| **Vintage Cumulative Return** | (Payments - Losses) / Original UPB | ROI by vintage | Line Chart |
| **Vintage Delinquency Curve** | SDQ% vs Loan Age by Vintage | Seasoning patterns | Multi-line Chart |

### 3.2 Credit Risk Stratification Performance

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Default Rate by Credit Score** | Defaults by FICO bucket / Count | FICO predictive power | Bar Chart |
| **SDQ Rate by DTI** | SDQ by DTI bucket / Count | DTI risk correlation | Bar Chart |
| **Default Rate by LTV** | Defaults by LTV bucket / Count | LTV risk correlation | Bar Chart |
| **Default Rate by Channel** | Defaults by Channel / Count | Channel risk profile | Bar Chart |
| **Default Rate by Occupancy** | Defaults by Occupancy / Count | Purpose risk profile | Bar Chart |
| **Default Rate by Property Type** | Defaults by Property Type / Count | Property risk profile | Bar Chart |
| **Risk Scorecard Performance** | Default rate by combined risk buckets | Multi-factor risk | Heatmap |

### 3.3 Geographic Performance KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Default Rate by State** | Defaults by State / Count | State-level performance | Choropleth Map |
| **SDQ Rate by State** | SDQ by State / Active | Current state delinquency | Choropleth Map |
| **Loss Rate by State** | Losses by State / UPB | State loss severity | Choropleth Map |
| **Prepayment by State** | CPR by State | Geographic prepay speeds | Choropleth Map |
| **Top Performing States** | Lowest default rates | Best performers | Table, Map |
| **Bottom Performing States** | Highest default rates | Worst performers | Table, Map |
| **MSA Performance Ranking** | Default/SDQ by MSA | Metro performance | Table, Scatter |

### 3.4 Product Performance KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **ARM vs FRM Default Rate** | Defaults by Product Type / Count | Product risk comparison | Bar Chart |
| **ARM vs FRM Prepayment** | CPR by Product Type | Product prepay speeds | Bar Chart |
| **Cash-Out vs Rate-Term Default** | Defaults by Purpose / Count | Refinance risk | Bar Chart |
| **Investment vs Primary Default** | Defaults by Occupancy / Count | Occupancy risk | Bar Chart |
| **Condo vs SF Default** | Defaults by Property Type / Count | Property type risk | Bar Chart |
| **High-Balance vs Conforming** | Defaults by Super Conforming / Count | Loan size risk | Bar Chart |

### 3.5 Time-Series Performance KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Monthly SDQ Trend** | SDQ Rate by Reporting Period | Delinquency trend | Time Series |
| **Monthly Default Flow** | New defaults by month | Default incidence | Time Series |
| **Monthly Prepayment Trend** | CPR by Reporting Period | Prepayment trend | Time Series |
| **Monthly Loss Trend** | Actual Loss by Period | Loss trend | Time Series |
| **Roll Rate Analysis** | Transition matrix (Current→30→60→90→Default) | Delinquency migration | Heatmap, Sankey |
| **Cure Rate** | COUNT(Cured from Delinquent) / COUNT(Delinquent) | Recovery probability | Metric Card, Trend |
| **Roll to Default Rate** | COUNT(Went to Default) / COUNT(90+ days) | Severity indicator | Metric Card |

### 3.6 Servicer Performance KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Servicer SDQ Rate** | SDQ by Servicer / Active | Servicer delinquency | Bar Chart |
| **Servicer Default Rate** | Defaults by Servicer / Count | Servicer default rate | Bar Chart |
| **Servicer Loss Severity** | Avg Loss by Servicer | Servicer loss efficiency | Bar Chart |
| **Servicer Modification Rate** | Mods by Servicer / Count | Workout activity | Bar Chart |
| **Servicer Timeline to Resolution** | Avg months to Zero Balance | Efficiency metric | Bar Chart |

### 3.7 Predictive & Analytical KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Burnout Analysis** | CPR by Loan Age and Refi Incentive | Prepayment burnout | Scatter, 3D Surface |
| **Refinance Incentive** | Current Rate - Original Rate | Rate incentive | Distribution |
| **In-the-Money %** | COUNT(Current Rate > Market + 50bps) / Total | Refi candidates | Metric Card |
| **S-Curve Analysis** | CPR vs Refi Incentive | Prepayment sensitivity | Scatter with Fit |
| **Seasonality Factor** | CPR by Calendar Month | Seasonal patterns | Seasonal Plot |
| **Home Price Appreciation Impact** | Default/Prepay vs HPA | Housing market correlation | Scatter |

### 3.8 Financial & Cash Flow KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **Gross Yield** | SUM(Interest Bearing UPB * Rate) / SUM(UPB) | Portfolio yield | Metric Card |
| **Net Yield** | (Interest - Losses) / Average UPB | Risk-adjusted yield | Metric Card |
| **Expected Return** | Projected cash flows / Original UPB | Total return estimate | Metric Card |
| **Duration** | Weighted avg time to cash flows | Interest rate sensitivity | Metric Card |
| **Convexity** | Second derivative of price vs rate | Risk metric | Metric Card |
| **Option-Adjusted Spread** | Yield - Treasury - Option Cost | Relative value | Metric Card |

### 3.9 Cohort Analysis KPIs

| KPI Name | Calculation | Description | Visualization |
|----------|-------------|-------------|---------------|
| **First-Time Buyer Performance** | Default/SDQ by First-Time Flag | FTB vs Repeat buyer | Comparison |
| **Affordable Housing Performance** | Default/SDQ by Program Indicator | HFA/Home Possible | Comparison |
| **HARP Performance** | Default/SDQ by HARP Indicator | Refi program success | Comparison |
| **Low-Down-Payment Performance** | Default/SDQ by LTV > 95% | High LTV analysis | Comparison |
| **Self-Employed Proxy** | Performance by DTI > 50% | Alternative doc risk | Comparison |

---

## 4. DASHBOARD RECOMMENDATIONS

### 4.1 Executive Summary Dashboard
- Total UPB Originated
- Current Active UPB
- Current SDQ Rate
- Cumulative Default Rate
- Cumulative Loss Rate
- Average Credit Score (Origination)
- Top 5 States by Volume

### 4.2 Origination Dashboard
- Origination Volume Trend
- Credit Score Distribution
- LTV/CLTV Distribution
- DTI Distribution
- Product Mix (FRM/ARM, Purpose, Channel)
- Geographic Heatmap
- Seller/Servicer Concentration

### 4.3 Performance Monitoring Dashboard
- Delinquency Trend (30/60/90/SDQ)
- Vintage Curves (SDQ by Seasoning)
- Prepayment Speed (CPR/SMM)
- Roll Rate Matrix
- Modification Activity
- Forbearance Tracking

### 4.4 Risk Analytics Dashboard
- Default Rate by Risk Factors
- Loss Severity Analysis
- Geographic Risk Heatmaps
- Servicer Performance Comparison
- Burnout Analysis
- Refinance Incentive Analysis

### 4.5 Financial Dashboard
- Cash Flow Projections
- Yield Analysis
- Loss Forecasting
- Return Attribution
- Expense Analysis

---

## 5. TECHNICAL IMPLEMENTATION NOTES

### 5.1 Data Joins
- **Primary Key**: Loan Sequence Number
- **Join Type**: LEFT JOIN (Origination LEFT JOIN Servicing)
- **Aggregation Levels**: Loan-level, Monthly, Quarterly, State, MSA, Vintage

### 5.2 Calculated Fields Required
- **Vintage**: Extract from Loan Sequence Number (F20Q1 = 2020 Q1)
- **Seasoning**: Loan Age or (Reporting Period - First Payment Date)
- **Refi Incentive**: Current Market Rate - Original Interest Rate
- **CPR**: 1 - (1 - SMM)^12
- **SMM**: (Prepayments + Defaults) / (Beginning Balance - Scheduled Principal)

### 5.3 Filters & Slicers
- Origination Date Range
- Current Reporting Period
- State/MSA
- Credit Score Bands
- LTV Bands
- Product Type
- Loan Purpose
- Channel
- Servicer

---

*Generated for: Freddie Mac Single-Family Loan-Level Dataset (2020 Sample)*
*Document Version: 1.0*
*Date: March 2026*
