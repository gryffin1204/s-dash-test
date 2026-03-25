import { useEffect, useState } from 'react';
import { KPICard } from '../components/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area } from 'recharts';
import type { OriginationResponse } from '../types/api';

export function OriginationAnalytics() {
  const [data, setData] = useState<OriginationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/origination')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch origination data', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-muted-text text-sm">Aggregating Origination Metrics...</p>
      </div>
    );
  }

  if (!data) return <div className="text-red-400">Failed to load data. Ensure backend is running.</div>;

  const COLORS = ['var(--accent)', 'var(--secondary)', 'var(--color-muted-text)', '#38bdf8'];
  const formatThousand = (val: number) => `$${(val / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-heading text-main-text tracking-tight mb-1">Origination Analytics</h2>
          <p className="text-sm text-muted-text">Portfolio composition, credit quality, and product mix at origination.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          id="kpi-avg-loan" 
          title="Average Loan Size" 
          value={formatThousand(data.kpi_avg_loan)} 
        />
        <KPICard 
          id="kpi-avg-fico" 
          title="Average Credit Score" 
          value={data.kpi_avg_fico || "N/A"} 
        />
        <KPICard 
          id="kpi-avg-dti" 
          title="Average DTI" 
          value={`${data.kpi_avg_dti}%`} 
        />
        <KPICard 
          id="kpi-avg-ltv" 
          title="Average LTV" 
          value={`${data.kpi_avg_ltv}%`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Origination by Quarter */}
        <div className="glass-card p-6 col-span-1 lg:col-span-2" id="chart-orig-quarter">
          <h3 className="text-lg font-heading text-main-text mb-6">Origination Volume by Quarter ($B)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.originationByQuarter} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="quarter" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}B`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(150,150,150,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                />
                <Bar dataKey="volume" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.originationByQuarter.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent)' : 'var(--secondary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Mix */}
        <div className="glass-card p-6 flex flex-col items-center justify-center" id="chart-product-mix">
          <h3 className="text-lg font-heading text-main-text mb-2 self-start w-full">Product Mix</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.productMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.productMixData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                  itemStyle={{ color: 'var(--accent)' }}
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-mono text-main-text">FRM</span>
              <span className="text-xs text-muted-text">Dominant</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Credit Score Dist */}
        <div className="glass-card p-6" id="chart-credit-dist">
          <h3 className="text-lg font-heading text-main-text mb-6">Credit Score Distribution (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.creditScoreDist} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="band" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(150,150,150,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                />
                <Bar dataKey="count" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6" id="chart-orig-monthly-credit">
          <h3 className="text-lg font-heading text-main-text mb-2">Origination Credit Mix by Monthly Reporting Period</h3>
          <p className="mb-6 text-sm text-muted-text">Average borrower quality of the actively serviced loan population, measured on each monthly reporting cut.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyKpiTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="period" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="ratio" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <YAxis yAxisId="fico" orientation="right" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }} />
                <Line yAxisId="fico" type="monotone" dataKey="avg_fico" name="Avg FICO" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line yAxisId="ratio" type="monotone" dataKey="avg_dti" name="Avg DTI" stroke="var(--secondary)" strokeWidth={2.5} dot={false} />
                <Line yAxisId="ratio" type="monotone" dataKey="avg_ltv" name="Avg LTV" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 pb-8">
        <div className="glass-card p-6" id="chart-orig-monthly-exposure">
          <h3 className="text-lg font-heading text-main-text mb-2">Origination Exposure by Monthly Reporting Period</h3>
          <p className="mb-6 text-sm text-muted-text">Tracks how the active loan count and original balance footprint evolve across monthly servicing snapshots.</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.monthlyKpiTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrigExposure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="period" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="balance" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}B`} />
                <YAxis yAxisId="count" orientation="right" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${Math.round(val / 1000)}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }} />
                <Area yAxisId="balance" type="monotone" dataKey="active_orig_upb_billion" name="Active Original UPB" stroke="var(--accent)" fill="url(#colorOrigExposure)" strokeWidth={2.5} />
                <Line yAxisId="count" type="monotone" dataKey="active_loan_count" name="Active Loan Count" stroke="var(--secondary)" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
