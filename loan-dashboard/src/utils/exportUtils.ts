import html2canvas from 'html2canvas';

export const exportToPNG = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  // Hide export buttons during capture
  const exportButtons = element.querySelectorAll<HTMLElement>('.export-btn-container');
  exportButtons.forEach((btn) => {
    btn.style.display = 'none';
  });

  const rootStyles = getComputedStyle(document.documentElement);
  const elementBackground = getComputedStyle(element).backgroundColor;
  const fallbackBackground = rootStyles.getPropertyValue('--surface').trim() || '#0F1117';
  const backgroundColor = elementBackground === 'rgba(0, 0, 0, 0)' ? fallbackBackground : elementBackground;
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale: 2,
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Failed to export PNG', err);
  } finally {
    // Restore buttons
    exportButtons.forEach((btn) => {
      btn.style.display = '';
    });
  }
};

export const exportToCSV = (data: object[], filename: string) => {
  if (!data || !data.length) return;
  
  const rows = data as Array<Record<string, string | number | boolean | null | undefined>>;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => JSON.stringify(row[header] ?? '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
