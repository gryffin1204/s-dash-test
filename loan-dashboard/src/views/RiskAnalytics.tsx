import { KPICard } from '../components/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const defaultByFicoData = [
  { band: '<650', rate: 4.2 },
  { band: '650-699', rate: 2.1 },
  { band: '700-749', rate: 0.8 },
  { band: '750+', rate: 0.2 },
];

const servicerPerfData = [
  { name: 'Servicer A', sdq: 1.2, loss: 0.1 },
  { name: 'Servicer B', sdq: 1.8, loss: 0.15 },
  { name: 'Servicer C', sdq: 2.4, loss: 0.22 },
  { name: 'Servicer D', sdq: 3.1, loss: 0.35 },
];

export function RiskAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-heading text-main-text tracking-tight mb-1">Risk Analytics</h2>
          <p className="text-sm text-muted-text">Identify drivers of default and structural risk factors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard id="risk-mod-rate" title="Modification Rate" value="3.2%" delta={0.5} />
        <KPICard id="risk-loss-sev" title="Avg Loss Severity" value="28.4%" delta={-1.2} />
        <KPICard id="risk-burnout" title="Refi In-The-Money" value="15.2%" delta={4.1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <div className="glass-card p-6" id="chart-default-fico">
          <h3 className="text-lg font-heading text-main-text mb-6">Default Rate by Credit Score (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defaultByFicoData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" vertical={false} />
                <XAxis dataKey="band" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  cursor={{ fill: 'var(--glass-bg)' }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={40}>
                  {defaultByFicoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rate > 3 ? '#ef4444' : entry.rate > 1.5 ? '#f59e0b' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6" id="chart-servicer">
          <h3 className="text-lg font-heading text-main-text mb-6">Servicer Performance (SDQ %)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicerPerfData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--color-muted-text)" tick={{ fill: 'var(--color-main-text)', fontSize: 13 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--glass-bg)' }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)', borderRadius: '8px', color: 'var(--color-main-text)' }}
                />
                <Bar dataKey="sdq" fill="#06B6D4" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
