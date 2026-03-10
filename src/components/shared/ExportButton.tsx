import { Download } from 'lucide-react';

interface Props {
  onClick: () => void;
  label?: string;
}

export function ExportButton({ onClick, label = 'Export' }: Props) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
