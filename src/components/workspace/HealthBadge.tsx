import { useState, useRef } from 'react';
import type { HealthGrade } from '@/utils/healthScore';

const gradeColors: Record<HealthGrade, { bg: string; text: string; ring: string }> = {
  A: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-500/30' },
  B: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-500/30' },
  C: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-400', ring: 'ring-yellow-500/30' },
  D: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-400', ring: 'ring-orange-500/30' },
  F: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-400', ring: 'ring-red-500/30' },
};

interface Props {
  grade: HealthGrade;
  percentage: number;
}

export function HealthBadge({ grade, percentage }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const colors = gradeColors[grade];

  return (
    <span className="relative inline-flex" ref={badgeRef}>
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1 ${colors.bg} ${colors.text} ${colors.ring}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {grade}
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white shadow dark:bg-slate-700">
          Health: {percentage}%
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
        </span>
      )}
    </span>
  );
}
