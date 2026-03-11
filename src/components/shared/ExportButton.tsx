import { Download } from 'lucide-react';

interface Props {
  onClick: () => void;
  label?: string;
}

export function ExportButton({ onClick, label = 'Export' }: Props) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-tertiary)]"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
