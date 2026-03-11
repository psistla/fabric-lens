import type { FabricItemType } from '@/api/types/item';

interface Props {
  type: FabricItemType;
}

const typeColors: Partial<Record<FabricItemType, string>> = {
  Lakehouse:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Notebook:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Pipeline:
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Report:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Warehouse:
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  SemanticModel:
    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Dashboard:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  DataPipeline:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const defaultColors =
  'bg-[var(--surface-secondary)] text-[var(--text-secondary)]';

export function ItemTypeBadge({ type }: Props) {
  const colors = typeColors[type] ?? defaultColors;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colors}`}
    >
      {type}
    </span>
  );
}
