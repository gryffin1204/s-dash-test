import { useEffect, useState } from 'react';
import { KPICard } from '../components/KPICard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import type { SummaryResponse } from '../types/api';

export function ExecutiveSummary() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/summary')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch summary config', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-muted-text text-sm">Querying DuckDB Backend...</p>
      </div>
    );
  }

  if (!data) return <div className="text-red-400">Failed to load data. Ensure backend is running.</div>;

  const formatBillion = (val: number) => `$${(val / 1000000000).toFixed(1)}B`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-heading text-main-text tracking-tight mb-1">Portfolio Overview</h2>
          <p className="text-sm text-muted-text">Executive summary of Freddie Mac Single-Family loan performance.</p>
        </div>
      </div>
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          id="kpi-orig-vol" 
          title="Total Origination Volume" 
          value={formatBillion(data.kpi_orig_vol)} 
          tooltip="Total original principal balance of all loans originated."
        />
        <KPICard 
          id="kpi-loan-count" 
          title="Total Loan Count" 
          value={data.kpi_loan_count.toLocaleString()} 
        />
        <KPICard 
          id="kpi-current-upb" 
          title="Current UPB" 
          value={formatBillion(data.kpi_current_upb)} 
          tooltip="Current Actual Unpaid Principal Balance across active loans."
        />
        <KPICard 
          id="kpi-avg-score" 
          title="Avg Credit Score (Orig)" 
          value={data.kpi_avg_score} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          id="kpi-sdq" 
          title="Current SDQ Rate" 
          value={`${data.kpi_sdq}%`} 
          warning={data.kpi_sdq > 2.5}
          className="md:col-span-1"
          tooltip="Serious Delinquency Rate (90+ days or in foreclosure)"
          exportData={data.sdqTrendData}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.sdqTrendData}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="rate" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </KPICard>

        {/* Keeping mocked values for these two as we only configured SDQ/UPB in MVP backend */}
        <KPICard 
          id="kpi-default-rate" 
          title="Cumulative Default Rate" 
          value="0.84%" 
          className="md:col-span-1"
        />

        <KPICard 
          id="kpi-loss-rate" 
          title="Cumulative Loss Rate" 
          value="0.12%" 
          className="md:col-span-1"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* SDQ Trend Chart */}
        <div className="glass-card p-6" id="chart-sdq-trend">
          <h3 className="text-lg font-heading text-main-text mb-6">Monthly SDQ Trend (2020)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sdqTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSdq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                  itemStyle={{ color: 'var(--secondary)' }}
                />
                <Area type="monotone" dataKey="rate" stroke="var(--secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSdq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top States Chart */}
        <div className="glass-card p-6" id="chart-top-states">
          <h3 className="text-lg font-heading text-main-text mb-6">Top 5 States by Volume ($B)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topStatesData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="state" type="category" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-main-text)', fontSize: 13 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(150,150,150,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.topStatesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent)' : 'var(--secondary)'} opacity={index === 0 ? 1 : 0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
