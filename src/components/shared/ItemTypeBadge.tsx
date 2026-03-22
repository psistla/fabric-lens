import type { FabricItemType } from '@/api/types/item';

interface Props {
  type: FabricItemType;
}

// Pill badges — rounded-full, semibold, uppercase, 0.04em tracking
// Colors via CSS token variables — auto-adapt to dark mode via .dark {} overrides
const typeColors: Partial<Record<FabricItemType, string>> = {
  Lakehouse:    'bg-[var(--item-lakehouse-bg)] text-[var(--item-lakehouse)]',
  Notebook:     'bg-[var(--item-notebook-bg)] text-[var(--item-notebook)]',
  Pipeline:     'bg-[var(--item-pipeline-bg)] text-[var(--item-pipeline)]',
  Report:       'bg-[var(--item-report-bg)] text-[var(--item-report)]',
  Warehouse:    'bg-[var(--item-warehouse-bg)] text-[var(--item-warehouse)]',
  SemanticModel:'bg-[var(--item-semantic-model-bg)] text-[var(--item-semantic-model)]',
  Dashboard:    'bg-[var(--item-dashboard-bg)] text-[var(--item-dashboard)]',
  DataPipeline: 'bg-[var(--item-pipeline-bg)] text-[var(--item-pipeline)]',
};

const defaultColors =
  'bg-[var(--m-surface)] text-[var(--m-text-secondary)]';

export function ItemTypeBadge({ type }: Props) {
  const colors = typeColors[type] ?? defaultColors;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${colors}`}
    >
      {type}
    </span>
  );
}
