import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ExecutiveSummary } from '../views/ExecutiveSummary';

// Stubs (to be created next)
import { OriginationAnalytics } from '../views/OriginationAnalytics';
import { ServicingPerformance } from '../views/ServicingPerformance';
import { RiskAnalytics } from '../views/RiskAnalytics';
import { FinancialDashboard } from '../views/FinancialDashboard';
import { AskTheData } from '../views/AskTheData';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState('executive');

  const renderContent = () => {
    switch(activeTab) {
      case 'executive': return <ExecutiveSummary />;
      case 'origination': return <OriginationAnalytics />;
      case 'servicing': return <ServicingPerformance />;
      case 'risk': return <RiskAnalytics />;
      case 'financial': return <FinancialDashboard />;
      case 'ask': return <AskTheData />;
      default: return <ExecutiveSummary />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-muted-text overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10 transition-colors" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10 transition-colors" />
        
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
