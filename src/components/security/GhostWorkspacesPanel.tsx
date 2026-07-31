import { useMemo } from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import type { GhostWorkspace } from '@/utils/ghostWorkspaces';
import type { Workspace } from '@/api/types/workspace';
import type { Item } from '@/api/types/item';
import { calculateWorkspaceHealth } from '@/utils/healthScore';
import type { HealthGrade } from '@/utils/healthScore';
import { GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS } from '@/utils/constants';

interface Props {
  ghostWorkspaces: GhostWorkspace[];
  workspaces: Workspace[];
  /** Real items per workspace. Grades computed against an empty list are systematically depressed. */
  allItemsByWorkspace: Record<string, Item[]>;
  loading: boolean;
  error: string | null;
  /** The window returned no events at all, so there is nothing to judge inactivity against. */
  noActivityData: boolean;
  scanProgress: { completed: number; total: number } | null;
  onRetry: () => void;
}

const GRADE_COLORS: Record<HealthGrade, { bg: string; text: string }> = {
  A: { bg: 'bg-[var(--health-a-bg)]', text: 'text-[var(--health-a)]' },
  B: { bg: 'bg-[var(--health-b-bg)]', text: 'text-[var(--health-b)]' },
  C: { bg: 'bg-[var(--health-c-bg)]', text: 'text-[var(--health-c)]' },
  D: { bg: 'bg-[var(--health-d-bg)]', text: 'text-[var(--health-d)]' },
  F: { bg: 'bg-[var(--health-f-bg)]', text: 'text-[var(--health-f)]' },
};

function GradeChip({ grade }: { grade: HealthGrade }) {
  const colors = GRADE_COLORS[grade];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${colors.bg} ${colors.text}`}
    >
      {grade}
    </span>
  );
}

const HEADER_TITLE = (
  <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
    Inactive Workspaces
  </h2>
);

export function GhostWorkspacesPanel({
  ghostWorkspaces,
  workspaces,
  allItemsByWorkspace,
  loading,
  error,
  noActivityData,
  scanProgress,
  onRetry,
}: Props) {
  // Build a lookup map from workspaceId → Workspace for health grade computation
  const workspaceMap = useMemo(
    () => new Map(workspaces.map((w) => [w.id, w])),
    [workspaces]
  );

  // Sort descending by daysInactive (deriveGhostWorkspaces already does this,
  // but re-sort here for safety)
  const sorted = useMemo(
    () => [...ghostWorkspaces].sort((a, b) => b.daysInactive - a.daysInactive),
    [ghostWorkspaces]
  );

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--m-text-tertiary)]" />
            {HEADER_TITLE}
          </div>
          {scanProgress && (
            <span className="text-[11px] tabular-nums text-[var(--m-text-tertiary)]">
              Reading audit log, day {scanProgress.completed} of {scanProgress.total}
            </span>
          )}
        </div>
        <div className="divide-y divide-[var(--m-border)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="m-skeleton h-4 w-48" />
              <div className="m-skeleton h-5 w-8 rounded-full" />
              <div className="m-skeleton h-4 w-28" />
              <div className="m-skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <Clock className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          {HEADER_TITLE}
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[var(--m-warning-text)]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--m-warning)]" />
            Ghost workspace data unavailable. Check admin permissions.
          </div>
          <button
            onClick={onRetry}
            aria-label="Retry loading ghost workspaces"
            className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-[var(--m-primary)] ring-1 ring-[var(--m-primary)]/40 transition-colors hover:bg-[var(--m-primary-subtle)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state — distinct from "nothing found". An empty window means the audit log returned
  // nothing at all, which would otherwise mark every workspace in the tenant as inactive.
  if (noActivityData) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <Clock className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          {HEADER_TITLE}
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[var(--m-text-secondary)]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--m-warning)]" />
            No activity data available. The audit log returned no events for the last{' '}
            {ACTIVITY_LOG_LOOKBACK_DAYS} days, so inactivity cannot be assessed.
          </div>
          <button
            onClick={onRetry}
            aria-label="Retry loading ghost workspaces"
            className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-[var(--m-primary)] ring-1 ring-[var(--m-primary)]/40 transition-colors hover:bg-[var(--m-primary-subtle)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (ghostWorkspaces.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <Clock className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          {HEADER_TITLE}
        </div>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ShieldCheck className="h-7 w-7 text-[var(--m-success)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">
            All workspaces have recent activity.
          </p>
          <p className="text-xs text-[var(--m-text-secondary)]">No inactive workspaces detected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--m-error)]" />
          {HEADER_TITLE}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
            {sorted.length} {sorted.length === 1 ? 'workspace' : 'workspaces'}
          </span>
          <span className="text-[11px] text-[var(--m-text-tertiary)]">({GHOST_WORKSPACE_THRESHOLD_DAYS}+ days inactive)</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Workspace
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Grade
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Last Activity
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Days Inactive
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--m-border)]">
            {sorted.map((ghost) => {
              const workspace = workspaceMap.get(ghost.workspaceId);
              const grade = workspace
                ? calculateWorkspaceHealth(workspace, allItemsByWorkspace[ghost.workspaceId] ?? []).grade
                : 'F';

              return (
                <tr key={ghost.workspaceId} className="hover:bg-[var(--m-surface-hover)]">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/workspaces/${ghost.workspaceId}`}
                      className="font-medium text-[var(--m-primary)] hover:underline"
                    >
                      {ghost.workspaceName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <GradeChip grade={grade} />
                  </td>
                  <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                    {ghost.lastActivityDate
                      ? ghost.lastActivityDate.toLocaleDateString()
                      : `None in ${ACTIVITY_LOG_LOOKBACK_DAYS}-day window`}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                    {/* No event in the window bounds inactivity from below; it is not a measurement. */}
                    {ghost.lastActivityDate
                      ? `${ghost.daysInactive} days`
                      : `${ACTIVITY_LOG_LOOKBACK_DAYS}+ days`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[11px] text-[var(--m-text-tertiary)]">
        Workspaces with no recorded user activity in the last {GHOST_WORKSPACE_THRESHOLD_DAYS} days.
        The Power BI audit log retains {ACTIVITY_LOG_LOOKBACK_DAYS} days, so {ACTIVITY_LOG_LOOKBACK_DAYS}+
        means no activity anywhere in the full window. Review and consider archiving.
      </div>
    </div>
  );
}
