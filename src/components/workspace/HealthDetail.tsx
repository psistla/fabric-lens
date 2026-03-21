import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import type { HealthScore } from '@/utils/healthScore';

// Progress bar colors aligned to --health-* tokens
const gradeBarColors: Record<string, string> = {
  A: 'bg-[var(--health-a)]',
  B: 'bg-[var(--health-b)]',
  C: 'bg-[var(--health-c)]',
  D: 'bg-[var(--health-d)]',
  F: 'bg-[var(--health-f)]',
};

// Grade pill styles using --health-* tokens
const gradePillColors: Record<string, string> = {
  A: 'bg-[var(--health-a-bg)] text-[var(--health-a)]',
  B: 'bg-[var(--health-b-bg)] text-[var(--health-b)]',
  C: 'bg-[var(--health-c-bg)] text-[var(--health-c)]',
  D: 'bg-[var(--health-d-bg)] text-[var(--health-d)]',
  F: 'bg-[var(--health-f-bg)] text-[var(--health-f)]',
};

interface Props {
  score: HealthScore;
  defaultExpanded?: boolean;
}

export function HealthDetail({ score, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const barColor = gradeBarColors[score.grade];

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          )}
          <span className="text-sm font-medium text-[var(--m-text)]">
            Health Score
          </span>
          <span className="text-sm font-semibold text-[var(--m-text-secondary)]">
            {score.percentage}%
          </span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${gradePillColors[score.grade]}`}
          >
            {score.grade}
          </span>
        </div>
        <span className="text-xs text-[var(--m-text-secondary)]">
          {score.total} / {score.maxTotal} pts
        </span>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--m-surface)]">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${score.percentage}%` }}
          />
        </div>
      </div>

      {/* Expandable checks list */}
      {expanded && (
        <div className="border-t border-[var(--m-border)]">
          <ul className="divide-y divide-[var(--m-border)]">
            {score.checks.map((check) => (
              <li
                key={check.name}
                className="flex items-start gap-3 px-4 py-2.5"
              >
                {check.passed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--m-success)]" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--m-error)]" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--m-text)]">
                      {check.name}
                    </span>
                    <span className="ml-2 text-xs text-[var(--m-text-secondary)]">
                      {check.points} / {check.maxPoints}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--m-text-secondary)]">
                    {check.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
