import { useEffect, useState } from 'react';
import { KPICard } from '../components/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area } from 'recharts';
import type { ServicingResponse } from '../types/api';

export function ServicingPerformance() {
  const [data, setData] = useState<ServicingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/servicing')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch servicing data', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-muted-text text-sm">Loading monthly servicing KPIs...</p>
      </div>
    );
  }

  if (!data) return <div className="text-red-400">Failed to load data. Ensure backend is running.</div>;

  const formatBillion = (val: number) => `$${val.toFixed(1)}B`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-heading text-main-text tracking-tight mb-1">Servicing Performance</h2>
          <p className="text-sm text-muted-text">Delinquency tracking, prepayment rates, and loss severity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard id="perf-upb" title="Current UPB" value={formatBillion(data.kpi_current_upb)} />
        <KPICard id="perf-30d" title="30-Day Delinquency" value={`${data.kpi_30d}%`} />
        <KPICard id="perf-60d" title="60-Day Delinquency" value={`${data.kpi_60d}%`} />
        <KPICard id="perf-90d" title="Serious Delinquency" value={`${data.kpi_sdq}%`} warning={data.kpi_sdq > 2.5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <div className="glass-card p-6" id="chart-servicing-monthly-delinquency">
          <h3 className="text-lg font-heading text-main-text mb-2">Servicing Delinquency by Monthly Reporting Period</h3>
          <p className="mb-6 text-sm text-muted-text">Current UPB is shown alongside 30-day, 60-day, and serious delinquency rates for each monthly reporting cut.</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.monthlyKpiTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorServicingUpb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" vertical={false} />
                <XAxis dataKey="period" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rate" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <YAxis yAxisId="balance" orientation="right" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}B`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-muted-text)' }} />
                <Area yAxisId="balance" type="monotone" dataKey="current_upb_billion" name="Current UPB" stroke="var(--accent)" fill="url(#colorServicingUpb)" strokeWidth={2.5} />
                <Line yAxisId="rate" type="monotone" dataKey="dq30_rate" name="30-Day Rate" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <Line yAxisId="rate" type="monotone" dataKey="dq60_rate" name="60-Day Rate" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                <Line yAxisId="rate" type="monotone" dataKey="sdq_rate" name="Serious Delinquency" stroke="#ef4444" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6" id="chart-servicing-monthly-economics">
          <h3 className="text-lg font-heading text-main-text mb-2">Servicing Rate and Seasoning by Monthly Reporting Period</h3>
          <p className="mb-6 text-sm text-muted-text">Shows how current note rate, average loan age, and average remaining term evolve through the reporting year.</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyKpiTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" vertical={false} />
                <XAxis dataKey="period" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rate" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <YAxis yAxisId="months" orientation="right" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}m`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-muted-text)' }} />
                <Line yAxisId="rate" type="monotone" dataKey="avg_current_rate" name="Avg Current Rate" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
                <Line yAxisId="months" type="monotone" dataKey="avg_loan_age" name="Avg Loan Age" stroke="var(--secondary)" strokeWidth={2.5} dot={false} />
                <Line yAxisId="months" type="monotone" dataKey="avg_remaining_term" name="Avg Remaining Term" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
