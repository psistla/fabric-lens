import { useState, useMemo, Fragment } from 'react';
import { ChevronRight, ShieldAlert, AlertTriangle, ShieldCheck, Bot, Users, UsersRound } from 'lucide-react';
import type { WorkspaceUser } from '@/api/types/admin';
import type { Workspace } from '@/api/types/workspace';
import { ROLE_COLORS, ADMIN_ROLE_WARNING_THRESHOLD } from '@/utils/constants';

interface Props {
  workspaceUsers: Record<string, WorkspaceUser[]>;
  workspaces: Workspace[];
}

type RiskLevel = 'critical' | 'warning' | 'ok';

interface WorkspaceRow {
  id: string;
  name: string;
  adminCount: number;
  memberCount: number;
  contributorCount: number;
  viewerCount: number;
  spnAdminCount: number;
  totalPrincipals: number;
  risk: RiskLevel;
  assignments: WorkspaceUser[];
}

const RISK_ORDER: Record<RiskLevel, number> = { critical: 0, warning: 1, ok: 2 };

const RISK_CONFIG: Record<
  RiskLevel,
  { icon: typeof ShieldAlert; iconColor: string; label: string; labelStyle: string }
> = {
  critical: {
    icon: ShieldAlert,
    iconColor: 'text-[var(--m-error)]',
    label: 'Critical',
    labelStyle: 'bg-[var(--m-error-bg)] text-[var(--m-error-text)]',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-[var(--m-warning)]',
    label: 'Warning',
    labelStyle: 'bg-[var(--m-warning-bg)] text-[var(--m-warning-text)]',
  },
  ok: {
    icon: ShieldCheck,
    iconColor: 'text-[var(--m-success)]',
    label: 'OK',
    labelStyle: 'bg-[var(--m-success-bg)] text-[var(--m-success)]',
  },
};

const ROLE_BADGE: Record<string, string> = {
  Admin: 'bg-[var(--m-error-bg)] text-[var(--m-error-text)]',
  Member: 'bg-[var(--m-primary-subtle)] text-[var(--m-primary)]',
  Contributor: 'bg-[var(--m-accent-subtle)] text-[var(--m-accent)]',
  Viewer: 'bg-[var(--m-success-bg)] text-[var(--m-success)]',
};

const PRINCIPAL_ICONS = {
  User: Users,
  Group: UsersRound,
  ServicePrincipal: Bot,
  ServicePrincipalProfile: Bot,
};

function deriveRisk(adminCount: number, spnAdminCount: number): RiskLevel {
  if (adminCount === 0 || adminCount === 1) return 'critical';
  if (adminCount > ADMIN_ROLE_WARNING_THRESHOLD || spnAdminCount > 0) return 'warning';
  return 'ok';
}

function RoleCountCell({ count, role }: { count: number; role: string }) {
  if (count === 0) return <span className="text-[var(--m-text-tertiary)]">—</span>;
  return (
    <span
      className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded px-1 text-xs font-semibold"
      style={{ backgroundColor: `${ROLE_COLORS[role]}22`, color: ROLE_COLORS[role] }}
    >
      {count}
    </span>
  );
}

export function WorkspacePivotTable({ workspaceUsers, workspaces }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const wsNameMap = useMemo(
    () => new Map(workspaces.map((w) => [w.id, w.displayName])),
    [workspaces],
  );

  const rows = useMemo((): WorkspaceRow[] => {
    return Object.entries(workspaceUsers)
      .filter(([id]) => wsNameMap.has(id))
      .map(([id, assignments]) => {
        const name = wsNameMap.get(id) ?? id;
        const adminCount = assignments.filter((u) => u.workspaceAccessDetails.workspaceRole === 'Admin').length;
        const memberCount = assignments.filter((u) => u.workspaceAccessDetails.workspaceRole === 'Member').length;
        const contributorCount = assignments.filter((u) => u.workspaceAccessDetails.workspaceRole === 'Contributor').length;
        const viewerCount = assignments.filter((u) => u.workspaceAccessDetails.workspaceRole === 'Viewer').length;
        const spnAdminCount = assignments.filter(
          (u) =>
            (u.userDetails.principalType === 'ServicePrincipal' || u.userDetails.principalType === 'ServicePrincipalProfile') &&
            u.workspaceAccessDetails.workspaceRole === 'Admin',
        ).length;
        return {
          id,
          name,
          adminCount,
          memberCount,
          contributorCount,
          viewerCount,
          spnAdminCount,
          totalPrincipals: assignments.length,
          risk: deriveRisk(adminCount, spnAdminCount),
          assignments,
        };
      })
      .sort((a, b) => {
        const riskDiff = RISK_ORDER[a.risk] - RISK_ORDER[b.risk];
        return riskDiff !== 0 ? riskDiff : a.name.localeCompare(b.name);
      });
  }, [workspaceUsers, wsNameMap]);

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const criticalCount = rows.filter((r) => r.risk === 'critical').length;
  const warningCount = rows.filter((r) => r.risk === 'warning').length;

  return (
    <div>
      {/* Risk summary strip */}
      <div className="flex items-center gap-3 border-b border-[var(--m-border)] px-4 py-3 text-xs text-[var(--m-text-secondary)]">
        <span className="font-semibold text-[var(--m-text)]">{rows.length} workspaces</span>
        {criticalCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
            <ShieldAlert className="h-3 w-3" />
            {criticalCount} critical
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[var(--m-warning-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-warning-text)]">
            <AlertTriangle className="h-3 w-3" />
            {warningCount} warning
          </span>
        )}
        {criticalCount === 0 && warningCount === 0 && (
          <span className="flex items-center gap-1 text-[var(--m-success)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            All workspaces healthy
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
              <th className="w-8 px-4 py-2" />
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Workspace
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Admin
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Member
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Contrib
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Viewer
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                SPN
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--m-border)]">
            {rows.map((row) => {
              const isExpanded = expandedIds.has(row.id);
              const cfg = RISK_CONFIG[row.risk];
              const Icon = cfg.icon;
              return (
                <Fragment key={row.id}>
                  <tr
                    onClick={() => toggle(row.id)}
                    className="cursor-pointer transition-colors hover:bg-[var(--m-surface-hover)]"
                  >
                    <td className="px-4 py-2.5" title={cfg.label}>
                      <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--m-text)]">{row.name}</span>
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-[var(--m-text-tertiary)] transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <RoleCountCell count={row.adminCount} role="Admin" />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <RoleCountCell count={row.memberCount} role="Member" />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <RoleCountCell count={row.contributorCount} role="Contributor" />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <RoleCountCell count={row.viewerCount} role="Viewer" />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {row.spnAdminCount > 0 ? (
                        <span className="inline-flex items-center gap-0.5 rounded px-1 text-xs font-semibold text-[var(--m-error)]">
                          <Bot className="h-3 w-3" />
                          {row.spnAdminCount}
                        </span>
                      ) : (
                        <span className="text-[var(--m-text-tertiary)]">—</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded assignment list */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="bg-[var(--m-surface)] px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {row.assignments
                            .slice()
                            .sort((a, b) => {
                              const order = ['Admin', 'Member', 'Contributor', 'Viewer'];
                              return (
                                order.indexOf(a.workspaceAccessDetails.workspaceRole) -
                                order.indexOf(b.workspaceAccessDetails.workspaceRole)
                              );
                            })
                            .map((u) => {
                              const pType = u.userDetails.principalType ?? 'User';
                              const PIcon = PRINCIPAL_ICONS[pType] ?? Users;
                              const role = u.workspaceAccessDetails.workspaceRole;
                              return (
                                <div
                                  key={`${u.userDetails.userPrincipalName}-${role}`}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_BADGE[role] ?? ''}`}
                                  title={u.userDetails.userPrincipalName}
                                >
                                  <PIcon className="h-3 w-3 opacity-70" />
                                  {u.userDetails.displayName}
                                  <span className="opacity-60">· {role}</span>
                                </div>
                              );
                            })}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-xs text-[var(--m-text-secondary)]">
        {rows.length} workspaces · sorted by risk then name
      </div>
    </div>
  );
}
