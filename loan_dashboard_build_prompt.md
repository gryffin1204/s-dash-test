# 🏗️ Build Prompt: Loan Intelligence Dashboard
### A 3D Minimal Web App with NL-to-SQL, KPI Export & Live DB Connectivity

---

## 🎯 Project Overview

Build a **production-grade, 3D minimal loan analytics dashboard** for the **Freddie Mac Single-Family Loan-Level Dataset**. The app must feel like a premium fintech product — clean, fast, and deeply intelligent. It combines:

1. A **3D minimal visual design** with glass-morphism, depth layers, and floating card components
2. **KPI panels** organized by domain (Portfolio, Credit Risk, Performance, Financial)
3. **Export** functionality per KPI (PNG screenshot or CSV data download)
4. A **Natural Language Query (NL-to-SQL) interface** powered by an LLM that connects to the database and returns live results
5. **User-friendly section navigation** that makes the app approachable for both analysts and executives

---

## 🎨 Design Language

### Visual Direction: "Obsidian Intelligence"
- **Theme**: Dark mode first. Deep charcoal/near-black backgrounds (`#0A0C10`, `#0F1117`) with glowing accent surfaces
- **Accent Color**: Cold electric blue (`#3B82F6`) with secondary teal (`#06B6D4`) for highlights and active states
- **3D Aesthetic**: Use CSS `transform-style: preserve-3d`, `perspective`, and subtle `rotateX/rotateY` on hover to give cards a floating 3D feel. Cards should cast soft ambient shadows that respond to cursor proximity (JS mouse parallax).
- **Glass Cards**: `background: rgba(255,255,255,0.04)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.08)` — like frosted obsidian panels
- **Typography**: Use `'DM Mono'` or `'JetBrains Mono'` for data values and metrics. Use `'Syne'` or `'Outfit'` for section headings. Keep body text in `'Inter'` but only for supporting labels.
- **Motion**: Staggered mount animations for cards on load. Hover: subtle lift + glow border. Chart entrance: line draws from left, bars rise from bottom. Use `Framer Motion` or CSS keyframes.
- **Spacing**: Generous padding. Breathable grids. KPI cards should never feel cramped.

---

## 🗂️ App Sections

The app is divided into **6 clearly labeled sections**, accessible via a fixed left sidebar or a horizontal top tab bar. Each section maps to a domain from the KPI document.

---

### Section 1: Executive Summary
**Purpose**: Quick health check for leadership and portfolio managers

**KPI Cards to show** (Metric Cards):
- Total Origination Volume (SUM of Original Principal Balance)
- Total Loan Count
- Current UPB (outstanding balance)
- Current Serious Delinquency Rate (SDQ %)
- Cumulative Default Rate
- Cumulative Loss Rate
- Average Credit Score (Origination)

**Visualizations**:
- A **Top 5 States by Volume** horizontal bar chart
- A **Monthly SDQ Trend** sparkline time series

**Export per KPI card**: PNG (snapshot of that card) or CSV (raw underlying numbers)

---

### Section 2: Origination Analytics
**Purpose**: Understand the shape and quality of the loan book at origination

**Sub-tabs inside this section**:

#### 2a. Portfolio Composition
- Origination by Quarter (bar/time series)
- Average & Median Loan Size (metric cards)
- Loan Size Distribution (histogram)

#### 2b. Credit Quality
- Average Credit Score, DTI Ratio, LTV, CLTV (metric cards)
- Credit Score Distribution (stacked bar in bands: <650, 650–700, 700–750, 750+)
- DTI Distribution (<36%, 36–43%, 43–50%, >50%)
- High Risk % flags: High LTV %, High DTI %, High Credit Risk % (metric cards with red/amber indicators)

#### 2c. Product Mix
- FRM vs ARM mix (donut chart)
- Loan Purpose mix: Purchase / Cash-Out Refi / Rate-Term Refi (stacked bar)
- Channel mix (Retail / Broker / Correspondent / TPO)
- Occupancy mix: Primary / Second Home / Investment (pie)
- Property Type mix (SF, Condo, PUD, MH)
- Key flag metrics: Interest-Only %, HARP %, Super Conforming %, First-Time Homebuyer %

#### 2d. Geographic & Demographic
- Top States by Volume (map + horizontal bar)
- Top MSAs by Volume (sortable table)
- Rural vs Urban %, Multi-Unit %, Multi-Borrower %

#### 2e. Interest Rate & Term
- Average Interest Rate, Average Loan Term (metric cards)
- Rate Distribution (histogram in 0.5% buckets)
- Rate by Credit Score band (line chart)
- 15-yr / 30-yr term split (pie)

**Export**: Each chart and card individually exportable as PNG or the underlying data as CSV.

---

### Section 3: Servicing Performance
**Purpose**: Monitor ongoing loan health and payment behavior

#### 3a. Delinquency Tracking (🔴 Critical Section)
- 30-day, 60-day, 90-day, SDQ rates (metric cards with gauge rings)
- REO Rate (metric card)
- Delinquency by Vintage (line chart — each origination cohort as a separate line)
- Delinquency by Loan Age / Seasoning (seasoning curve)
- Weighted Average Delinquency

#### 3b. Prepayment & Termination
- CPR (Constant Prepayment Rate) and SMM (Single Month Mortality) — metric cards + time series
- Voluntary Payoff Rate, Third Party Sale Rate, Foreclosure Rate, REO Disposition Rate
- Annualized Default Rate

#### 3c. Loss & Recovery
- Total Actual Losses, Average Loss Severity (metric cards)
- Net Sales Proceeds Ratio
- MI Recovery Rate
- Cumulative Loss Rate trend (time series)

**Export**: Each delinquency card or chart → PNG or CSV.

---

### Section 4: Risk Analytics
**Purpose**: Deep dive into what factors drive risk

- Default Rate by: Credit Score Band, LTV Band, DTI Band, State, Vintage (multi-view bar charts)
- Product Risk: ARM vs FRM Default Rate, Cash-Out vs Rate-Term, Investment vs Primary
- Roll Rate Matrix (Current → 30DPD → 60DPD → 90DPD → Default) — displayed as a **heatmap** with color gradient
- Servicer Performance: SDQ Rate, Default Rate, Loss Severity, Modification Rate — all by servicer (horizontal bar)
- Modification & Forbearance metrics
- Burnout Analysis (scatter / 3D surface)
- Refinance Incentive (distribution + In-the-Money %)
- S-Curve Analysis (CPR vs refi incentive scatter)

**Export**: Each chart → PNG or CSV of the data table behind it.

---

### Section 5: Financial Dashboard
**Purpose**: Yield, cash flow, and return analytics

- Gross Yield, Net Yield, Expected Return (metric cards)
- Duration, Convexity, Option-Adjusted Spread (metric cards with info tooltips)
- Cash Flow Projections (projected time series chart)
- Loss Forecasting (projected vs actual line chart)
- Return Attribution breakdown
- Expense Analysis

**Export**: All charts as PNG; all data as CSV.

---

### Section 6: Ask the Data (NL-to-SQL AI Query Engine)
**Purpose**: Let any user — technical or not — ask questions in plain English and get live answers from the database

**UI Design**:
- Full-width panel with a large, centered text input that glows on focus: `"Ask anything about your loan portfolio..."`
- Below the input: **Suggested questions** as pill buttons (e.g., *"What is the SDQ rate for loans originated in Q1 2020?"*, *"Which states have the highest default rates?"*, *"Show me average loss severity by servicer"*)
- When a question is submitted:
  1. A loading skeleton appears
  2. The LLM translates the question to a SQL query (displayed collapsibly as `View Generated SQL`)
  3. The query runs against the connected database
  4. Results are rendered as: a **data table** + an **auto-selected chart** (bar, line, or metric card depending on result shape)
  5. The user can export results as **CSV** or the chart as **PNG**

**LLM Integration**:
- Use `claude-sonnet-4-20250514` via Anthropic API
- System prompt to the LLM should include:
  - Full database schema (Origination table fields + Servicing table fields)
  - Table names and join keys (`Loan Sequence Number` as primary key)
  - Instructions to return ONLY valid SQL for the connected dialect (PostgreSQL / SQLite / etc.)
  - Known data conventions (e.g., exclude `Credit Score = 9999`, `DTI = 999`, `LTV = 999`)
  - Return format: JSON with `{ sql: "...", chart_type: "bar|line|metric|table", x_field: "...", y_field: "..." }`
- After SQL is returned, execute it via the backend API endpoint `/api/query` (POST with `{ sql }`)
- Display an error message gracefully if the query fails, with a "Try rephrasing" suggestion

**Safety**:
- Whitelist only `SELECT` statements — block any INSERT, UPDATE, DELETE, DROP
- Show a `Read-only mode` badge in the UI

---

## ⬇️ Export System (Per-KPI)

Every KPI card and chart must have a small **export icon** in the top-right corner (visible on hover). Clicking it opens a small dropdown:

```
[ 📷 Export as PNG ]
[ 📄 Export as CSV ]
```

- **PNG Export**: Use `html2canvas` or `dom-to-image` to capture the card/chart DOM node, download as `.png`
- **CSV Export**: Package the underlying data array for that KPI into a CSV string using a simple serializer, download as `.csv` with a descriptive filename like `sdq_rate_by_vintage_2026-03.csv`
- The export system should work for **every individual card** — not just global exports

---

## 🔌 Database Connectivity

- Backend: **Node.js (Express)** or **Python (FastAPI)** — whichever is simpler for the team
- Database: Compatible with **PostgreSQL**, **SQLite**, or **DuckDB** (DuckDB preferred for large Parquet/CSV loan files)
- Expose REST endpoints:
  - `GET /api/kpis` — returns pre-computed KPI values for the dashboard sections
  - `POST /api/query` — accepts `{ sql: string }`, executes it, returns `{ columns, rows }` JSON
  - `GET /api/schema` — returns table schema for the LLM system prompt
- All DB credentials stored in `.env` file, never exposed to the frontend

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | **React 18** with hooks |
| Styling | **Tailwind CSS** + custom CSS for 3D effects |
| Charts | **Recharts** (standard) + **D3.js** (roll rate heatmap, S-curve) |
| Animations | **Framer Motion** |
| 3D Effects | CSS `perspective` / `transform-style: preserve-3d` + JS mouse parallax |
| Export | `html2canvas` (PNG) + custom CSV serializer |
| LLM | **Anthropic Claude API** (`claude-sonnet-4-20250514`) |
| Backend | **FastAPI (Python)** or **Express (Node.js)** |
| Database | **DuckDB** (recommended for Freddie Mac flat files) |
| Fonts | `Syne` (headings) + `DM Mono` (values) + `Inter` (labels) via Google Fonts |

---

## 🗺️ Navigation & UX

- **Left sidebar** (collapsible): Section icons + labels. Active section highlighted with glowing left border.
- **Top bar**: Logo/title left, global filters right (Date Range, State, Product Type, Credit Score Band) — these filters cascade into ALL sections simultaneously
- **Breadcrumb** below top bar: e.g., `Origination Analytics > Credit Quality`
- **Search bar** in top bar: instantly jumps to any KPI by name
- **Tooltips**: Every metric card has an `ⓘ` icon that shows the exact formula/definition on hover
- **Responsive**: Desktop-first but gracefully collapsible on tablets
- **Loading states**: Skeleton cards while data fetches; spinner in the AI query section

---

## 📐 KPI Card Component Spec

Each KPI card must contain:
- **Metric title** (small, muted label)
- **Primary value** (large, bold, monospaced — e.g., `4.23%` or `$2.1B`)
- **Delta indicator**: ▲ or ▼ vs prior period with color coding (green/red)
- **Sparkline** (optional, for time-series KPIs)
- **Export button** (top-right, appears on hover)
- **3D hover effect**: lifts 4–6px on hover with shadow deepening
- **Glow on critical thresholds**: e.g., SDQ Rate > 3% card glows amber/red

---

## ✅ Feasibility Notes

- **Phase 1 (MVP)**: Static KPI cards with mock data + NL query UI wired to LLM + PNG/CSV export
- **Phase 2**: Connect backend to real DuckDB/PostgreSQL with Freddie Mac data; live KPI computation
- **Phase 3**: Add drill-down, cohort comparisons, and saved query history

---

*This prompt is designed to be handed directly to a development team or used as context for an AI coding assistant (e.g., Claude Code, Cursor, or v0.dev). All KPI definitions are sourced from the `loan_dashboard_kpis.md` document based on the Freddie Mac Single-Family Loan-Level Dataset (2020 Sample).*
