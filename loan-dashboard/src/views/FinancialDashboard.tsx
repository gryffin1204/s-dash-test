import { KPICard } from '../components/KPICard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const cashFlowData = [
  { year: 2020, principal: 12.4, interest: 4.2 },
  { year: 2021, principal: 14.1, interest: 3.9 },
  { year: 2022, principal: 15.8, interest: 3.5 },
  { year: 2023, principal: 11.2, interest: 3.0 },
  { year: 2024, principal: 9.5, interest: 2.6 },
  { year: 2025, principal: 8.2, interest: 2.3 },
];

export function FinancialDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-heading text-main-text tracking-tight mb-1">Financial Dashboard</h2>
          <p className="text-sm text-muted-text">Yield, cash flow, and return metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard id="fin-gross-yield" title="Gross Yield" value="4.12%" delta={-0.05} />
        <KPICard id="fin-net-yield" title="Net Yield" value="3.98%" delta={0.02} />
        <KPICard id="fin-duration" title="Duration" value="3.4 yrs" />
        <KPICard id="fin-oas" title="Option-Adjusted Spread" value="115 bps" delta={-12} deltaLabel="bps" />
      </div>

      <div className="grid grid-cols-1 gap-6 pb-8">
        <div className="glass-card p-6" id="chart-cashflow">
          <h3 className="text-lg font-heading text-main-text mb-6">Cash Flow Projections ($B)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" vertical={false} />
                <XAxis dataKey="year" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}B`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                />
                <Area type="monotone" dataKey="principal" stackId="1" stroke="#3B82F6" fill="url(#colorPrincipal)" />
                <Area type="monotone" dataKey="interest" stackId="1" stroke="#06B6D4" fill="url(#colorInterest)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
