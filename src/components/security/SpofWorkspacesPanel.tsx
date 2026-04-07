import { useMemo } from 'react';
import { AlertTriangle, ShieldCheck, User } from 'lucide-react';
import type { WorkspaceUser } from '@/api/types/admin';
import type { Workspace } from '@/api/types/workspace';

interface Props {
  workspaceUsers: Record<string, WorkspaceUser[]>;
  workspaces: Workspace[];
}

interface SpofRow {
  workspaceId: string;
  workspaceName: string;
  adminName: string;
  adminEmail: string;
}

export function SpofWorkspacesPanel({ workspaceUsers, workspaces }: Props) {
  const wsNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const ws of workspaces) m[ws.id] = ws.displayName;
    return m;
  }, [workspaces]);

  const spofRows = useMemo((): SpofRow[] => {
    const rows: SpofRow[] = [];
    for (const [wsId, users] of Object.entries(workspaceUsers)) {
      const admins = users.filter(
        (u) => u.workspaceAccessDetails.workspaceRole === 'Admin',
      );
      if (admins.length === 1) {
        const admin = admins[0];
        rows.push({
          workspaceId: wsId,
          workspaceName: wsNameMap[wsId] ?? wsId,
          adminName: admin.userDetails.displayName,
          adminEmail: admin.userDetails.userPrincipalName,
        });
      }
    }
    return rows.sort((a, b) => a.workspaceName.localeCompare(b.workspaceName));
  }, [workspaceUsers, wsNameMap]);

  if (spofRows.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Single-Admin Workspaces (SPOF)
          </h2>
        </div>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ShieldCheck className="h-7 w-7 text-[var(--m-success)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">
            All workspaces have at least 2 admins.
          </p>
          <p className="text-xs text-[var(--m-text-secondary)]">
            No single-point-of-failure risk detected.
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
          <AlertTriangle className="h-4 w-4 text-[var(--m-error)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Single-Admin Workspaces (SPOF)
          </h2>
        </div>
        <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
          {spofRows.length} at risk
        </span>
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
                Sole Admin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--m-border)]">
            {spofRows.map((row) => (
              <tr key={row.workspaceId} className="hover:bg-[var(--m-surface-hover)]">
                <td className="px-4 py-2.5">
                  <span className="font-medium text-[var(--m-text)]">
                    {row.workspaceName}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 shrink-0 text-[var(--m-text-tertiary)]" />
                    <div className="min-w-0">
                      <p className="truncate text-[var(--m-text)]">{row.adminName}</p>
                      <p className="truncate text-[11px] text-[var(--m-text-tertiary)]">
                        {row.adminEmail}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[11px] text-[var(--m-text-tertiary)]">
        If this admin loses access, the workspace becomes unmanageable. Add a second admin
      </div>
    </div>
  );
}
