import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import type { HealthScore } from '@/utils/healthScore';

const gradeBarColors: Record<string, string> = {
  A: 'bg-emerald-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  F: 'bg-red-500',
};

interface Props {
  score: HealthScore;
  defaultExpanded?: boolean;
}

export function HealthDetail({ score, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const barColor = gradeBarColors[score.grade];

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)]">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
          )}
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Health Score
          </span>
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            {score.percentage}%
          </span>
          <span
            className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${
              score.grade === 'A'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : score.grade === 'B'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                  : score.grade === 'C'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                    : score.grade === 'D'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
            }`}
          >
            {score.grade}
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {score.total} / {score.maxTotal} pts
        </span>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-secondary)]">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${score.percentage}%` }}
          />
        </div>
      </div>

      {/* Expandable checks list */}
      {expanded && (
        <div className="border-t border-[var(--border-default)]">
          <ul className="divide-y divide-[var(--border-default)]">
            {score.checks.map((check) => (
              <li
                key={check.name}
                className="flex items-start gap-3 px-4 py-2.5"
              >
                {check.passed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {check.name}
                    </span>
                    <span className="ml-2 text-xs text-[var(--text-secondary)]">
                      {check.points} / {check.maxPoints}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
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
