import { LayoutDashboard, FileBarChart, Activity, AlertTriangle, DollarSign, DatabaseZap } from 'lucide-react';
import { cn } from '../utils/cn';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'executive', label: 'Executive Summary', icon: <LayoutDashboard size={20} /> },
  { id: 'origination', label: 'Origination Analytics', icon: <FileBarChart size={20} /> },
  { id: 'servicing', label: 'Servicing Performance', icon: <Activity size={20} /> },
  { id: 'risk', label: 'Risk Analytics', icon: <AlertTriangle size={20} /> },
  { id: 'financial', label: 'Financial Dashboard', icon: <DollarSign size={20} /> },
  { id: 'ask', label: 'Ask the Data', icon: <DatabaseZap size={20} /> },
];

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) {
  return (
    <aside className="w-64 border-r border-glass-border bg-surface/50 backdrop-blur-xl h-screen sticky top-0 flex flex-col pt-6 pb-4 shrink-0 transition-all z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center shadow-glow">
          <DatabaseZap className="text-accent" size={18} />
        </div>
        <h1 className="text-lg font-heading tracking-tight text-main-text">LoanIntel</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === item.id 
                ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative" 
                : "text-muted-text hover:text-main-text hover:bg-surface"
            )}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r" />
            )}
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="px-6 mt-auto">
        <div className="p-4 rounded-xl border border-glass-border bg-surface text-xs text-muted-text">
          <p className="font-medium text-main-text mb-1">Freddie Mac Sample</p>
          <p>Single-Family Dataset (2020)</p>
        </div>
      </div>
    </aside>
  );
}
