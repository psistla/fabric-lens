import type { ReactNode } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import type { SecurityArea } from '@/utils/securityAreas';

interface Props {
  area: SecurityArea;
  /**
   * Areas start closed: the posture card and findings above them already answer
   * "what is wrong", and the summary row carries every count, so opening one is
   * a choice to see the evidence rather than a way to discover a problem.
   */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * One drill-in area on the Security page: a headline count and the question the
 * area answers, expanding to the existing panels for that area.
 *
 * Built on native `<details>`, so open/close state, keyboard operation, and
 * in-page find all work without a line of JS.
 */
export function SecurityAreaSection({ area, defaultOpen, children }: Props) {
  const clean = area.count === 0;

  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 p-4 transition-colors hover:bg-[var(--m-surface-hover)]">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[var(--m-text)]">
            {area.title}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--m-text-secondary)]">
            {area.question}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {area.signals.map((s) => (
              <span key={s.key} className="text-xs text-[var(--m-text-tertiary)]">
                <span
                  className={
                    s.count > 0
                      ? 'font-semibold text-[var(--m-text)]'
                      : 'font-semibold'
                  }
                >
                  {s.count}
                </span>{' '}
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {clean ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--m-success-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-success-text)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Clear
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[var(--m-warning-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-warning-text)]">
            {area.count} to review
          </span>
        )}

        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--m-text-tertiary)] transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="space-y-4 border-t border-[var(--m-border)] p-4">
        {children}
      </div>
    </details>
  );
}
