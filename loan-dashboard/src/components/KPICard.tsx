import type { ReactNode } from 'react';
import { ExportMenu } from './ExportMenu';
import { cn } from '../utils/cn';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';

interface KPICardProps {
  id: string;
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  warning?: boolean; // Glow amber/red if true
  children?: ReactNode; // Sparkline or extra content
  tooltip?: string;
  exportData?: object[];
  className?: string;
}

export function KPICard({ id, title, value, delta, deltaLabel, warning, children, tooltip, exportData, className }: KPICardProps) {
  return (
    <div 
      id={id}
      className={cn(
        "glass-card p-6 flex flex-col relative group overflow-hidden",
        warning && "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-sans tracking-wide text-muted-text">{title}</h3>
          {tooltip && (
            <div className="group/tooltip relative">
              <Info size={14} className="text-muted-text/70 hover:text-main-text cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 rounded-lg border border-glass-border bg-surface px-3 py-2 text-xs text-main-text opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none shadow-card">
                {tooltip}
                <div className="absolute border-4 border-transparent border-t-surface left-1/2 -translate-x-1/2 top-full" />
              </div>
            </div>
          )}
        </div>
        <ExportMenu 
          elementId={id} 
          filename={`export-${id}`} 
          data={exportData}
          className="opacity-0 group-hover:opacity-100 transition-opacity" 
        />
      </div>
      
      <div className="flex items-end gap-3 mb-4">
        <div className={cn("text-3xl font-mono tracking-tight", warning ? "text-red-500" : "text-main-text")}>
          {value}
        </div>
        
        {delta !== undefined && (
          <div className={cn(
            "flex items-center text-sm font-medium mb-1",
            delta > 0 ? "text-emerald-500" : delta < 0 ? "text-red-500" : "text-muted-text"
          )}>
            {delta > 0 ? <ChevronUp size={16} /> : delta < 0 ? <ChevronDown size={16} /> : null}
            <span>{Math.abs(delta)}%</span>
            {deltaLabel && <span className="ml-1 text-xs whitespace-nowrap text-muted-text/80">{deltaLabel}</span>}
          </div>
        )}
      </div>
      
      {children && (
        <div className="mt-auto h-16 w-full relative">
          {children}
        </div>
      )}
    </div>
  );
}
