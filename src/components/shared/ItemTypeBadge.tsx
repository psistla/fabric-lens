import type { FabricItemType } from '@/api/types/item';

interface Props {
  type: FabricItemType;
}

// Pill badges — rounded-full, semibold, uppercase, 0.04em tracking
// Colors aligned to Meridian palette via CSS token variables
const typeColors: Partial<Record<FabricItemType, string>> = {
  Lakehouse:
    'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81]/40 dark:text-[#818CF8]',
  Notebook:
    'bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-900/40 dark:text-violet-400',
  Pipeline:
    'bg-[#F0FDF4] text-[#15803D] dark:bg-green-900/40 dark:text-green-400',
  Report:
    'bg-[#FFFBEB] text-[#B45309] dark:bg-amber-900/40 dark:text-amber-400',
  Warehouse:
    'bg-[#ECFEFF] text-[#0891B2] dark:bg-cyan-900/40 dark:text-cyan-400',
  SemanticModel:
    'bg-[#FDF2F8] text-[#DB2777] dark:bg-pink-900/40 dark:text-pink-400',
  Dashboard:
    'bg-[#FFF7ED] text-[#EA580C] dark:bg-orange-900/40 dark:text-orange-400',
  DataPipeline:
    'bg-[#F0FDF4] text-[#15803D] dark:bg-green-900/40 dark:text-green-400',
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
