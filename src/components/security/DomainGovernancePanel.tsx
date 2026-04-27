import { Layers, AlertTriangle, ShieldCheck, Share2 } from 'lucide-react';
import type { DomainStat } from '@/utils/domainGovernance';
import { DOMAIN_UNASSIGNED_WARNING_COUNT } from '@/utils/constants';

interface Props {
  domainStats: DomainStat[];
  unassignedCount: number;
  totalWorkspaces: number;
  hasCrossDomainSharing: boolean;
}

const HEADER = (
  <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
    Domain Governance
  </h2>
);

function DomainBar({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--m-border)]">
      <div
        className="h-full rounded-full bg-[var(--m-primary)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function DomainGovernancePanel({
  domainStats,
  unassignedCount,
  totalWorkspaces,
  hasCrossDomainSharing,
}: Props) {
  // Pre-scan state: workspaces not yet loaded
  if (totalWorkspaces === 0) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <Layers className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          {HEADER}
        </div>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Layers className="h-7 w-7 text-[var(--m-text-tertiary)]" />
          <p className="text-sm font-medium text-[var(--m-text-secondary)]">
            Run a scan to view domain assignment coverage.
          </p>
        </div>
      </div>
    );
  }

  const domainCount = domainStats.length;
  const assignedCount = totalWorkspaces - unassignedCount;
  const maxCount = Math.max(...domainStats.map((d) => d.workspaceCount), unassignedCount, 1);
  const unassignedWarning = unassignedCount >= DOMAIN_UNASSIGNED_WARNING_COUNT;

  // All unassigned
  if (domainCount === 0) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--m-error)]" />
            {HEADER}
          </div>
          <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
            {totalWorkspaces} unassigned
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <AlertTriangle className="h-7 w-7 text-[var(--m-error)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">
            No workspaces are assigned to a domain.
          </p>
          <p className="text-xs text-[var(--m-text-secondary)]">
            Domain assignment enables governance, lineage tracking, and access policy scoping.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--m-primary)]" />
          {HEADER}
        </div>
        <span className="text-[11px] text-[var(--m-text-tertiary)]">
          {domainCount} domain{domainCount !== 1 ? 's' : ''} · {assignedCount}/{totalWorkspaces} assigned
        </span>
      </div>

      {/* Cross-domain sharing alert */}
      {hasCrossDomainSharing && (
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] bg-[var(--m-accent-subtle)] px-4 py-2.5">
          <Share2 className="h-4 w-4 shrink-0 text-[var(--m-accent)]" />
          <p className="text-xs text-[var(--m-accent)]">
            Org-wide shared content detected — artifacts shared to all users bypass domain access boundaries.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Domain
              </th>
              <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Workspaces
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Distribution
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--m-border)]">
            {domainStats.map((d) => (
              <tr key={d.domainId} className="hover:bg-[var(--m-surface-hover)]">
                <td className="px-4 py-2.5 font-medium text-[var(--m-text)]">
                  {d.domainId}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-[var(--m-text-secondary)]">
                  {d.workspaceCount}
                </td>
                <td className="px-4 py-2.5">
                  <DomainBar count={d.workspaceCount} max={maxCount} />
                </td>
              </tr>
            ))}

            {/* Unassigned row */}
            {unassignedCount > 0 && (
              <tr className={unassignedWarning ? 'bg-[var(--m-warning-bg)] hover:bg-[var(--m-warning-bg)]' : 'hover:bg-[var(--m-surface-hover)]'}>
                <td className="px-4 py-2.5">
                  <span className={`font-medium ${unassignedWarning ? 'text-[var(--m-warning-text)]' : 'text-[var(--m-text-secondary)]'}`}>
                    Unassigned
                  </span>
                  {unassignedWarning && (
                    <AlertTriangle className="ml-1.5 inline h-3.5 w-3.5 text-[var(--m-warning)]" />
                  )}
                </td>
                <td className={`px-4 py-2.5 text-right tabular-nums ${unassignedWarning ? 'text-[var(--m-warning-text)]' : 'text-[var(--m-text-secondary)]'}`}>
                  {unassignedCount}
                </td>
                <td className="px-4 py-2.5">
                  <DomainBar count={unassignedCount} max={maxCount} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {unassignedCount === 0 ? (
        <div className="flex items-center gap-2 border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[11px] text-[var(--m-success)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          All workspaces are assigned to a domain.
        </div>
      ) : (
        <div className="border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[11px] text-[var(--m-text-tertiary)]">
          Assign unassigned workspaces to a domain in the Fabric Admin Portal to improve governance coverage.
        </div>
      )}
    </div>
  );
}
