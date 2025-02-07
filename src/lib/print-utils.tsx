// src/lib/print-utils.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { type ScheduleEvent, type MedicationConfig } from './taper-calculations';
import PrintView from '@/components/PrintView';

// Base styles that will be included in the print window
const printStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
  }

  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
  }
  
  body { 
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.5;
    color: hsl(var(--foreground));
    background: hsl(var(--background));
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @page { 
    margin: 2cm;
    size: portrait;
  }

  @media print {
    body { 
      padding: 0;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .print-content {
      color: black !important;
    }
  }

  /* Tailwind-like utility classes needed for PrintView */
  .p-8 { padding: 2rem; }
  .mb-12 { margin-bottom: 3rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mt-12 { margin-top: 3rem; }
  .ml-4 { margin-left: 1rem; }
  .space-y-2 > * + * { margin-top: 0.5rem; }
  .space-y-1 > * + * { margin-top: 0.25rem; }
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gap-8 { gap: 2rem; }
  .gap-y-3 { row-gap: 0.75rem; }
  .gap-4 { gap: 1rem; }
  .p-6 { padding: 1.5rem; }
  .pt-6 { padding-top: 1.5rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  .divide-y > * + * { border-top-width: 1px; border-color: hsl(var(--border)); }
  .border-t { border-top-width: 1px; border-color: hsl(var(--border)); }
  .text-center { text-align: center; }
  .font-mono { font-family: ui-monospace, monospace; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .font-bold { font-weight: 700; }
  .font-medium { font-weight: 500; }
  .text-gray-600 { color: rgb(75 85 99); }
  .text-gray-500 { color: rgb(107 114 128); }
  .text-gray-900 { color: rgb(17 24 39); }
  .text-red-600 { color: rgb(220 38 38); }
  .bg-gray-50 { background-color: rgb(249 250 251); }
  .list-disc { list-style-type: disc; }
  .list-inside { list-style-position: inside; }
  .max-w-4xl { max-width: 56rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }
`;

export const openPrintWindow = (schedule: ScheduleEvent[], config: MedicationConfig): void => {
  // Open a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  // Write the print view content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${config.name} Taper Schedule</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${printStyles}</style>
      </head>
      <body>
        <div id="print-root"></div>
      </body>
    </html>
  `);

  // Render the PrintView component into the new window
  const root = printWindow.document.getElementById('print-root');
  if (root) {
    const reactRoot = createRoot(root);
    reactRoot.render(<PrintView schedule={schedule} config={config} />);

    // Print after styles and content are loaded
    printWindow.setTimeout(() => {
      printWindow.print();
      // Close window after printing
      printWindow.addEventListener('afterprint', () => {
        reactRoot.unmount(); // Cleanup React root before closing
        printWindow.close();
      });
    }, 1000); // Increased timeout to ensure styles are loaded
  }
};