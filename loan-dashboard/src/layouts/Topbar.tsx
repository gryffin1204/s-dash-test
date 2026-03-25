import { Search, Settings, Bell, Calendar, MapPin, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'loanintel-theme';

export function Topbar() {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
    window.localStorage.setItem(THEME_STORAGE_KEY, isLight ? 'light' : 'dark');
  }, [isLight]);

  return (
    <header className="h-16 border-b border-glass-border bg-background/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-8 shrink-0 transition-colors">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" size={16} />
        <input 
          type="text" 
          placeholder="Search KPIs, metrics, or input NL query..." 
          className="w-full bg-surface/50 border border-glass-border rounded-full py-2 pl-12 pr-4 text-sm text-main-text placeholder:text-muted-text focus:outline-none focus:border-accent/50 focus:bg-surface transition-all shadow-inner"
        />
      </div>
      
      <div className="flex items-center gap-4 ml-8">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-border glass-panel text-xs text-muted-text">
          <Calendar size={14} className="text-secondary" />
          <span>Q1 2020 - Q4 2020</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-border glass-panel text-xs text-muted-text">
          <MapPin size={14} className="text-secondary" />
          <span>All States</span>
        </div>
        
        <div className="h-6 w-px bg-glass-border mx-2 hidden md:block" />
        
        <button
          onClick={() => setIsLight(!isLight)}
          className="text-muted-text hover:text-main-text transition-colors"
          title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button className="text-muted-text hover:text-main-text transition-colors">
          <Bell size={18} />
        </button>
        <button className="text-muted-text hover:text-main-text transition-colors">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-secondary ml-2 border border-glass-border shadow-glow cursor-pointer" />
      </div>
    </header>
  );
}
