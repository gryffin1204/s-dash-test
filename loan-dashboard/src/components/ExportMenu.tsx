import { useState, useRef, useEffect } from 'react';
import { Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { exportToPNG, exportToCSV } from '../utils/exportUtils';
import { cn } from '../utils/cn';

interface ExportMenuProps {
  elementId: string;
  filename: string;
  data?: object[];
  className?: string;
}

export function ExportMenu({ elementId, filename, data, className }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPNG = () => {
    exportToPNG(elementId, filename);
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    if (data) {
      exportToCSV(data, filename);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("relative export-btn-container", className)} ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-md p-1.5 text-muted-text hover:bg-surface/80 hover:text-main-text transition-colors"
        title="Export options"
      >
        <Download size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 z-50 w-40 overflow-hidden rounded-lg border border-glass-border bg-surface py-1 shadow-card">
          <button 
            onClick={handleExportPNG}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-muted-text hover:bg-background/60 hover:text-main-text"
          >
            <ImageIcon size={14} />
            Export as PNG
          </button>
          {data && data.length > 0 && (
            <button 
              onClick={handleExportCSV}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-muted-text hover:bg-background/60 hover:text-main-text"
            >
              <FileSpreadsheet size={14} />
              Export as CSV
            </button>
          )}
        </div>
      )}
    </div>
  );
}
