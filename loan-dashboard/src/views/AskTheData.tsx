import { useState } from 'react';
import { Send, Sparkles, AlertCircle, BadgeInfo, Bot } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { KPICard } from '../components/KPICard';
import type { QueryCell, QueryResponse } from '../types/api';

const CHART_COLORS = ['var(--accent)', 'var(--secondary)', '#f59e0b', '#ef4444'];

function toNumber(value: QueryCell): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const normalized = value.replace(/,/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getChartConfig(result: QueryResponse) {
  const numericColumns = result.columns.filter((column) =>
    result.rows.some((row) => toNumber(row[column]) !== null),
  );

  const xField = result.x_field && result.columns.includes(result.x_field)
    ? result.x_field
    : result.columns.find((column) => !numericColumns.includes(column)) ?? result.columns[0] ?? null;

  const requestedYFields = (result.y_fields ?? []).filter((column) => result.columns.includes(column) && column !== xField);
  const yFields = requestedYFields.length ? requestedYFields : numericColumns.filter((column) => column !== xField).slice(0, 3);

  let chartType = result.chart_type ?? 'table';
  if (chartType === 'table') {
    if (result.rows.length === 1 && yFields.length > 0) {
      chartType = 'metric';
    } else if (xField && yFields.length > 0) {
      chartType = /period|date|month|quarter|year/i.test(xField) ? 'line' : 'bar';
    }
  }

  const chartData = result.rows
    .map((row) => {
      const entry: Record<string, string | number> = {};

      if (xField) {
        const xValue = row[xField];
        entry[xField] = typeof xValue === 'number' || typeof xValue === 'string' ? xValue : String(xValue ?? '');
      }

      yFields.forEach((field) => {
        const numericValue = toNumber(row[field]);
        if (numericValue !== null) {
          entry[field] = numericValue;
        }
      });

      return entry;
    })
    .filter((entry) => chartType === 'metric' || yFields.some((field) => typeof entry[field] === 'number'));

  if (chartType !== 'metric' && (!xField || yFields.length === 0 || chartData.length === 0)) {
    return null;
  }

  return {
    chartType,
    xField,
    yFields,
    chartData,
    title: result.title ?? 'Query Result',
  };
}

export function AskTheData() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (input: string) => {
    const prompt = input.trim();
    if (!prompt) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setQuery(prompt);
    
    try {
      const res = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });

      const data = await res.json() as QueryResponse & { detail?: string; error?: string };

      if (!res.ok || data.error) {
        throw new Error(data.detail || data.error || 'Failed to execute query');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleQuery(query);
  };

  const renderResult = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-muted-text">Translating and executing query via DuckDB...</p>
      </div>
    );
    if (error) return (
      <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 flex gap-3 text-red-500 mt-6 shadow-sm">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <div className="text-sm break-all">
          <div className="font-medium">{error}</div>
          <div className="mt-1 font-mono text-xs text-red-500/80">Try rephrasing the question or switch to raw DuckDB SQL.</div>
        </div>
      </div>
    );
    if (!result) return null;

    const chartConfig = getChartConfig(result);
    const metadata = (
      <div className="glass-panel rounded-2xl border border-glass-border p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-text">
          <span className="rounded-full border border-glass-border px-2.5 py-1">{result.mode === 'nl' ? 'Natural Language' : 'Raw SQL'}</span>
          <span className="rounded-full border border-glass-border px-2.5 py-1">Read Only</span>
          {result.translation_source && (
            <span className="rounded-full border border-glass-border px-2.5 py-1">
              {result.translation_source === 'llm' ? 'LLM API' : 'Fallback Translator'}
            </span>
          )}
        </div>
        {result.explanation && (
          <div className="mt-3 flex gap-2 text-sm text-muted-text">
            <BadgeInfo size={16} className="mt-0.5 shrink-0 text-secondary" />
            <p>{result.explanation}</p>
          </div>
        )}
        {result.generated_sql && (
          <details className="mt-4 group" open={result.mode === 'nl'}>
            <summary className="cursor-pointer text-sm font-medium text-main-text">View Generated SQL</summary>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-glass-border bg-background/70 p-4 text-xs text-main-text">{result.generated_sql}</pre>
          </details>
        )}
      </div>
    );

    if (result.rows.length === 0) return (
      <div className="mt-8 space-y-4">
        {metadata}
        <div className="glass-panel rounded-2xl border border-glass-border p-6 text-center text-muted-text shadow-sm">
          Query returned 0 rows.
        </div>
      </div>
    );

    const cols = result.columns;
    
    return (
      <div className="mt-8 space-y-6">
        {metadata}
        {chartConfig && (
          <div className="glass-panel rounded-2xl border border-glass-border p-6 shadow-card">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-lg font-heading text-main-text">{chartConfig.title}</h3>
                <p className="text-sm text-muted-text">Generated automatically from the query result shape and planner metadata.</p>
              </div>
            </div>

            {chartConfig.chartType === 'metric' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {chartConfig.yFields.map((field) => (
                  <KPICard
                    key={field}
                    id={`ask-metric-${field}`}
                    title={field.replace(/_/g, ' ')}
                    value={result.rows[0]?.[field]?.toString() ?? 'null'}
                  />
                ))}
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartConfig.chartType === 'line' ? (
                    <LineChart data={chartConfig.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" vertical={false} />
                      <XAxis dataKey={chartConfig.xField ?? undefined} stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-muted-text)' }} />
                      {chartConfig.yFields.map((field, index) => (
                        <Line
                          key={field}
                          type="monotone"
                          dataKey={field}
                          name={field.replace(/_/g, ' ')}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <BarChart data={chartConfig.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" vertical={false} />
                      <XAxis dataKey={chartConfig.xField ?? undefined} stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-muted-text)' }} />
                      {chartConfig.yFields.map((field, index) => (
                        <Bar
                          key={field}
                          dataKey={field}
                          name={field.replace(/_/g, ' ')}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
        <div className="glass-panel rounded-2xl overflow-hidden border-glass-border shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-text uppercase bg-surface/80 border-b border-glass-border">
                <tr>
                  {cols.map((c: string) => <th key={c} className="px-6 py-4 font-bold">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i} className="border-b border-glass-border/30 hover:bg-surface/50 transition-colors">
                    {cols.map((c: string) => <td key={`${i}-${c}`} className="px-6 py-4 text-main-text whitespace-nowrap">{row[c]?.toString() ?? 'null'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent/20 text-accent shadow-glow">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-heading text-main-text mb-3">Ask the Data</h2>
        <p className="text-muted-text max-w-2xl mx-auto">Ask a question in plain English or write raw DuckDB SQL. The backend keeps execution read-only and shows the generated SQL when a natural-language prompt is translated.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-glass-border bg-surface/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-text">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Read-only mode
        </div>
      </div>
      
      <div className="glass-panel p-2 rounded-2xl border-glass-border shadow-card mb-8 transition-all focus-within:border-accent/40 focus-within:shadow-card-hover group">
        <div className="bg-surface/50 rounded-xl flex items-center px-4 py-2 border border-transparent group-focus-within:bg-surface/80 transition-colors">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. What is the SDQ rate for loans originated in Q1 2020?" 
            className="w-full bg-transparent border-none text-main-text text-lg placeholder-muted-text focus:outline-none focus:ring-0 py-4 font-mono"
            spellCheck="false"
          />
          <button 
            onClick={() => handleQuery(query)}
            disabled={loading || !query.trim()}
            className="bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:hover:bg-accent text-white rounded-lg p-3 ml-4 transition-all flex shrink-0 shadow-sm disabled:shadow-none"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <p className="w-full text-center text-xs text-muted-text uppercase tracking-widest font-semibold mb-2">Suggested Questions</p>
        <button 
          onClick={() => handleQuery('Which states have the highest default risk right now?')}
          className="px-4 py-2 rounded-full glass-panel text-sm text-muted-text hover:text-main-text hover:bg-surface transition-colors border-glass-border"
        >
          Highest Default Risk States
        </button>
        <button 
          onClick={() => handleQuery('Show me average interest rate by channel')}
          className="px-4 py-2 rounded-full glass-panel text-sm text-muted-text hover:text-main-text hover:bg-surface transition-colors border-glass-border"
        >
          Average Interest Rate by Channel
        </button>
        <button 
          onClick={() => handleQuery('What is the SDQ rate for loans originated in Q1 2020?')}
          className="px-4 py-2 rounded-full glass-panel text-sm text-muted-text hover:text-main-text hover:bg-surface transition-colors border-glass-border"
        >
          SDQ Rate for Q1 2020 Loans
        </button>
        <button 
          onClick={() => handleQuery('Show me average loss severity by servicer')}
          className="px-4 py-2 rounded-full glass-panel text-sm text-muted-text hover:text-main-text hover:bg-surface transition-colors border-glass-border"
        >
          Average Loss Severity by Servicer
        </button>
      </div>

      {renderResult()}
    </div>
  );
}
