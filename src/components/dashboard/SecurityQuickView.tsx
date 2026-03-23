import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Users, ShieldAlert, Server, UsersRound, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useSecurityStore } from '@/store/securityStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ADMIN_ROLE_WARNING_THRESHOLD } from '@/utils/constants';

interface SecuritySummary {
  totalUniqueUsers: number;
  overPermissionedCount: number;
  spnConfiguredCount: number;
  totalWorkspaces: number;
  resolvedGroupCount: number;
}

export function SecurityQuickView() {
  const navigate = useNavigate();
  const { workspaceUsers, resolvedGroups, fetchAllWorkspaceUsers, loading } = useSecurityStore();
  const { workspaces } = useWorkspaceStore();

  const hasData = Object.keys(workspaceUsers).length > 0;

  const summary = useMemo<SecuritySummary>(() => {
    const totalWorkspaces = workspaces.length;
    const spnConfiguredCount = workspaces.filter((ws) => ws.workspaceIdentity != null).length;
    const resolvedGroupCount = Object.keys(resolvedGroups).length;

    if (!hasData) {
      return { totalUniqueUsers: 0, overPermissionedCount: 0, spnConfiguredCount, totalWorkspaces, resolvedGroupCount };
    }

    const uniqueUpns = new Set<string>();
    const adminCountByUpn = new Map<string, number>();

    for (const users of Object.values(workspaceUsers)) {
      for (const user of users) {
        if (user.principalType === 'Group' || user.principalType === 'ServicePrincipal' || user.principalType === 'ServicePrincipalProfile') {
          continue;
        }
        const upn = user.userDetails.userPrincipalName;
        uniqueUpns.add(upn);
        if (user.workspaceAccessDetails.workspaceRole === 'Admin') {
          adminCountByUpn.set(upn, (adminCountByUpn.get(upn) ?? 0) + 1);
        }
      }
    }

    const overPermissionedCount = [...adminCountByUpn.values()].filter(
      (count) => count >= ADMIN_ROLE_WARNING_THRESHOLD,
    ).length;

    return { totalUniqueUsers: uniqueUpns.size, overPermissionedCount, spnConfiguredCount, totalWorkspaces, resolvedGroupCount };
  }, [workspaceUsers, resolvedGroups, workspaces, hasData]);

  const handleLoad = () => {
    void fetchAllWorkspaceUsers(workspaces.map((ws) => ws.id));
  };

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--m-text-secondary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Security Overview
          </h2>
        </div>
      </div>

      {/* No data CTA */}
      {!hasData && !loading && (
        <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
          <ShieldCheck className="h-8 w-8 text-[var(--m-text-tertiary)]" />
          <div>
            <p className="text-sm font-medium text-[var(--m-text)]">
              Permission data not yet loaded
            </p>
            <p className="mt-1 text-xs text-[var(--m-text-secondary)]">
              Load security data to see permission summary
            </p>
          </div>
          <button
            onClick={handleLoad}
            disabled={workspaces.length === 0}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[var(--m-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Load security data
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !hasData && (
        <div className="flex flex-col items-center gap-2 px-4 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--m-primary)]" />
          <p className="text-xs text-[var(--m-text-secondary)]">Scanning workspace permissions…</p>
        </div>
      )}

      {/* Metric rows */}
      {hasData && (
        <div className="divide-y divide-[var(--m-border)]">
          <MetricRow
            icon={Users}
            label="Unique users across tenant"
            value={String(summary.totalUniqueUsers)}
          />
          <MetricRow
            icon={ShieldAlert}
            label={`Users with Admin on ${ADMIN_ROLE_WARNING_THRESHOLD}+ workspaces`}
            value={String(summary.overPermissionedCount)}
            alert={summary.overPermissionedCount > 0}
          />
          <MetricRow
            icon={Server}
            label="Workspaces with SPN configured"
            value={`${summary.spnConfiguredCount} / ${summary.totalWorkspaces}`}
          />
          <MetricRow
            icon={UsersRound}
            label="Security groups resolved"
            value={String(summary.resolvedGroupCount)}
          />
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[var(--m-border)] px-4 py-2.5">
        <button
          onClick={() => void navigate('/security')}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--m-primary)] transition-opacity hover:opacity-75"
        >
          View Security Audit
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

interface MetricRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  alert?: boolean;
}

function MetricRow({ icon: Icon, label, value, alert = false }: MetricRowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        alert ? 'bg-red-50 dark:bg-red-950/30' : ''
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${
          alert ? 'text-red-600 dark:text-red-400' : 'text-[var(--m-text-secondary)]'
        }`}
      />
      <span className={`min-w-0 flex-1 text-sm ${alert ? 'text-red-700 dark:text-red-300' : 'text-[var(--m-text-secondary)]'}`}>
        {label}
      </span>
      <span
        className={`shrink-0 font-mono text-sm font-semibold ${
          alert ? 'text-red-700 dark:text-red-300' : 'text-[var(--m-text)]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
