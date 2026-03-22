import { useState, useRef } from 'react';
import type { HealthGrade } from '@/utils/healthScore';

// Map grades to --health-* CSS tokens for consistent colors across all health UI
const gradeColors: Record<HealthGrade, { bg: string; text: string; ring: string }> = {
  A: { bg: 'bg-[var(--health-a-bg)]', text: 'text-[var(--health-a)]', ring: 'ring-[var(--health-a)]/30' },
  B: { bg: 'bg-[var(--health-b-bg)]', text: 'text-[var(--health-b)]', ring: 'ring-[var(--health-b)]/30' },
  C: { bg: 'bg-[var(--health-c-bg)]', text: 'text-[var(--health-c)]', ring: 'ring-[var(--health-c)]/30' },
  D: { bg: 'bg-[var(--health-d-bg)]', text: 'text-[var(--health-d)]', ring: 'ring-[var(--health-d)]/30' },
  F: { bg: 'bg-[var(--health-f-bg)]', text: 'text-[var(--health-f)]', ring: 'ring-[var(--health-f)]/30' },
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
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ring-1 transition-transform duration-[120ms] hover:scale-110 ${colors.bg} ${colors.text} ${colors.ring}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {grade}
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 z-[var(--m-z-tooltip)] mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--m-tooltip-bg)] px-2 py-1 text-xs text-[var(--m-tooltip-text)] shadow-[var(--m-shadow-md)]">
          Health: {percentage}%
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--m-tooltip-bg)]" />
        </span>
      )}
    </span>
  );
}
