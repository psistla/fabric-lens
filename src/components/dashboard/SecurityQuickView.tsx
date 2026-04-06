import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Users, ShieldAlert, Bot, AlertTriangle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useSecurityStore } from '@/store/securityStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useTenantSettingsStore } from '@/store/tenantSettingsStore';
import { useWidelySharedStore } from '@/store/widelySharedStore';
import { useActivityStore } from '@/store/activityStore';
import { ADMIN_ROLE_WARNING_THRESHOLD } from '@/utils/constants';
import { computeSecurityPosture } from '@/utils/securityFindings';

interface SecuritySummary {
  totalUniqueUsers: number;
  overPermissionedCount: number;
  spofCount: number;
  spnAdminCount: number;
}

export function SecurityQuickView() {
  const navigate = useNavigate();
  const { workspaceUsers, resolvedGroups, fetchAllWorkspaceUsers, loading } = useSecurityStore();
  const { workspaces } = useWorkspaceStore();
  const { fetchTenantSettings } = useTenantSettingsStore();
  const { fetchWidelySharedArtifacts } = useWidelySharedStore();
  const { fetchActivityEvents } = useActivityStore();

  const hasData = Object.keys(workspaceUsers).length > 0;

  const userSummaries = useMemo((): import('@/utils/effectiveAccess').UserSummary[] => {
    if (!hasData) return [];
    const map = new Map<string, import('@/utils/effectiveAccess').UserSummary>();
    for (const [wsId, users] of Object.entries(workspaceUsers)) {
      const wsName = workspaces.find((w) => w.id === wsId)?.displayName ?? wsId;
      for (const u of users) {
        const email = u.userDetails.userPrincipalName;
        const pType = u.userDetails.principalType ?? 'User';
        let s = map.get(email);
        if (!s) {
          s = { displayName: u.userDetails.displayName, email, principalType: pType, assignments: [] };
          map.set(email, s);
        }
        s.assignments.push({ workspaceId: wsId, workspaceName: wsName, role: u.workspaceAccessDetails.workspaceRole });
      }
    }
    return [...map.values()];
  }, [workspaceUsers, workspaces, hasData]);

  const posture = useMemo(
    () => (hasData ? computeSecurityPosture(userSummaries, resolvedGroups) : null),
    [userSummaries, resolvedGroups, hasData],
  );

  const summary = useMemo<SecuritySummary>(() => {
    if (!hasData) return { totalUniqueUsers: 0, overPermissionedCount: 0, spofCount: 0, spnAdminCount: 0 };

    const uniqueUpns = new Set<string>();
    const adminCountByUpn = new Map<string, number>();
    const adminCountByWs = new Map<string, number>();

    for (const [wsId, users] of Object.entries(workspaceUsers)) {
      for (const user of users) {
        const pType = user.userDetails.principalType ?? 'User';
        if (pType === 'User') {
          const upn = user.userDetails.userPrincipalName;
          uniqueUpns.add(upn);
          if (user.workspaceAccessDetails.workspaceRole === 'Admin') {
            adminCountByUpn.set(upn, (adminCountByUpn.get(upn) ?? 0) + 1);
          }
        }
        if (user.workspaceAccessDetails.workspaceRole === 'Admin') {
          adminCountByWs.set(wsId, (adminCountByWs.get(wsId) ?? 0) + 1);
        }
      }
    }

    const overPermissionedCount = [...adminCountByUpn.values()].filter(
      (c) => c >= ADMIN_ROLE_WARNING_THRESHOLD,
    ).length;
    const spofCount = [...adminCountByWs.values()].filter((c) => c === 1).length;
    const spnAdminCount = userSummaries.filter(
      (u) =>
        (u.principalType === 'ServicePrincipal' || u.principalType === 'ServicePrincipalProfile') &&
        u.assignments.some((a) => a.role === 'Admin'),
    ).length;

    return { totalUniqueUsers: uniqueUpns.size, overPermissionedCount, spofCount, spnAdminCount };
  }, [workspaceUsers, userSummaries, hasData]);

  const handleLoad = () => {
    void fetchTenantSettings();
    void fetchWidelySharedArtifacts();
    void fetchActivityEvents(workspaces);
    void fetchAllWorkspaceUsers(workspaces.map((ws) => ws.id));
  };

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--m-text-secondary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
            Security Overview
          </h2>
        </div>
        {posture && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            posture.grade === 'A' ? 'bg-[var(--m-success-bg)] text-[var(--m-success)]' :
            posture.grade === 'B' ? 'bg-[var(--m-primary-subtle)] text-[var(--m-primary)]' :
            posture.grade === 'C' ? 'bg-[var(--m-accent-subtle)] text-[var(--m-accent)]' :
            'bg-[var(--m-error-bg)] text-[var(--m-error-text)]'
          }`}>
            Posture {posture.grade}
          </span>
        )}
      </div>

      {/* No data CTA */}
      {!hasData && !loading && (
        <div className="px-4 py-6">
          <p className="text-sm font-semibold text-[var(--m-text)]">Uncover hidden access risks</p>
          <p className="mt-1 text-xs text-[var(--m-text-secondary)]">
            Run a scan to surface permission issues across your {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
          </p>
          <div className="mt-4 space-y-2.5">
            {([
              `Users with Admin on ${ADMIN_ROLE_WARNING_THRESHOLD}+ workspaces`,
              'Single-admin workspaces (SPOF risk)',
              'Service principals with Admin role',
            ] as const).map((label) => (
              <div key={label} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--m-text-tertiary)]" />
                <span className="text-xs text-[var(--m-text-secondary)]">{label}</span>
                <span className="ml-auto font-mono text-xs font-semibold text-[var(--m-text-tertiary)]">—</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleLoad}
            disabled={workspaces.length === 0}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--m-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
            icon={AlertTriangle}
            label="Single-admin workspaces (SPOF)"
            value={String(summary.spofCount)}
            alert={summary.spofCount > 0}
          />
          <MetricRow
            icon={Bot}
            label="Service principals with Admin role"
            value={String(summary.spnAdminCount)}
            alert={summary.spnAdminCount > 0}
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
    <div className={`flex items-center gap-3 px-4 py-3 ${alert ? 'bg-[var(--m-error-bg)]' : ''}`}>
      <Icon
        className={`h-4 w-4 shrink-0 ${alert ? 'text-[var(--m-error)]' : 'text-[var(--m-text-secondary)]'}`}
      />
      <span className={`min-w-0 flex-1 text-sm ${alert ? 'text-[var(--m-error-text)]' : 'text-[var(--m-text-secondary)]'}`}>
        {label}
      </span>
      <span className={`shrink-0 font-mono text-sm font-semibold ${alert ? 'text-[var(--m-error-text)]' : 'text-[var(--m-text)]'}`}>
        {value}
      </span>
    </div>
  );
}
