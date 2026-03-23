import { useState, Fragment } from 'react';
import { Bot, ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';
import type { UserSummary } from '@/utils/effectiveAccess';
import { ROLE_COLORS } from '@/utils/constants';

interface Props {
  userSummaries: UserSummary[];
}

const ROLE_BADGE: Record<string, string> = {
  Admin: 'bg-[var(--m-error-bg)] text-[var(--m-error-text)]',
  Member: 'bg-[var(--m-primary-subtle)] text-[var(--m-primary)]',
  Contributor: 'bg-[var(--m-accent-subtle)] text-[var(--m-accent)]',
  Viewer: 'bg-[var(--m-success-bg)] text-[var(--m-success)]',
};

export function SpnGovernancePanel({ userSummaries }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const spns = userSummaries
    .filter(
      (u) =>
        u.principalType === 'ServicePrincipal' ||
        u.principalType === 'ServicePrincipalProfile',
    )
    .slice()
    .sort((a, b) => {
      // Admin SPNs first, then by total assignment count desc
      const aAdmins = a.assignments.filter((x) => x.role === 'Admin').length;
      const bAdmins = b.assignments.filter((x) => x.role === 'Admin').length;
      if (bAdmins !== aAdmins) return bAdmins - aAdmins;
      return b.assignments.length - a.assignments.length;
    });

  const adminSpnCount = spns.filter((u) =>
    u.assignments.some((a) => a.role === 'Admin'),
  ).length;

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            SPN Governance
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {adminSpnCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
              <ShieldAlert className="h-3 w-3" />
              {adminSpnCount} with Admin
            </span>
          )}
          <span className="rounded-full bg-[var(--m-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            {spns.length} SPN{spns.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {spns.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ShieldCheck className="h-7 w-7 text-[var(--m-success)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">
            No service principals with workspace access.
          </p>
          <p className="text-xs text-[var(--m-text-secondary)]">
            Automation has no direct role assignments in this tenant.
          </p>
        </div>
      )}

      {/* Table */}
      {spns.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Service Principal
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Admin
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Other Roles
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Total Scope
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--m-border)]">
              {spns.map((spn) => {
                const adminCount = spn.assignments.filter((a) => a.role === 'Admin').length;
                const otherCount = spn.assignments.length - adminCount;
                const isExpanded = expandedIds.has(spn.email);
                const hasAdmin = adminCount > 0;

                return (
                  <Fragment key={spn.email}>
                    <tr
                      onClick={() => toggle(spn.email)}
                      className="cursor-pointer transition-colors hover:bg-[var(--m-surface-hover)]"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Bot
                            className={`h-3.5 w-3.5 shrink-0 ${hasAdmin ? 'text-[var(--m-error)]' : 'text-[var(--m-text-tertiary)]'}`}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--m-text)]">
                              {spn.displayName}
                            </p>
                            <p className="truncate text-[11px] text-[var(--m-text-tertiary)]">
                              {spn.email}
                            </p>
                          </div>
                          <ChevronRight
                            className={`ml-1 h-3.5 w-3.5 shrink-0 text-[var(--m-text-tertiary)] transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {adminCount > 0 ? (
                          <span
                            className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded px-1 text-xs font-semibold"
                            style={{ backgroundColor: `${ROLE_COLORS.Admin}22`, color: ROLE_COLORS.Admin }}
                          >
                            {adminCount}
                          </span>
                        ) : (
                          <span className="text-[var(--m-text-tertiary)]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {otherCount > 0 ? (
                          <span className="text-xs text-[var(--m-text-secondary)]">{otherCount}</span>
                        ) : (
                          <span className="text-[var(--m-text-tertiary)]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-xs font-medium text-[var(--m-text)]">
                          {spn.assignments.length}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded: workspace assignments */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={4} className="bg-[var(--m-surface)] px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {spn.assignments
                              .slice()
                              .sort((a, b) => {
                                const order = ['Admin', 'Member', 'Contributor', 'Viewer'];
                                return order.indexOf(a.role) - order.indexOf(b.role);
                              })
                              .map((a) => (
                                <div
                                  key={`${a.workspaceId}-${a.role}`}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_BADGE[a.role] ?? ''}`}
                                  title={a.workspaceName}
                                >
                                  {a.workspaceName}
                                  <span className="opacity-60">· {a.role}</span>
                                </div>
                              ))}
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
      )}

      {/* Footer */}
      {spns.length > 0 && (
        <div className="border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[11px] text-[var(--m-text-tertiary)]">
          Click any row to see workspace assignments · Admin-scoped SPNs have no MFA protection
        </div>
      )}
    </div>
  );
}
