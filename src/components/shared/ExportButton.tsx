import { Download } from 'lucide-react';

interface Props {
  onClick: () => void;
  label?: string;
}

export function ExportButton({ onClick, label = 'Export' }: Props) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--m-text-secondary)] transition-colors hover:bg-[var(--m-surface)]"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
