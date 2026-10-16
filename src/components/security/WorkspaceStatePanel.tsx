import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { AdminWorkspace } from '@/api/types/admin';

interface Props {
  workspaces: AdminWorkspace[];
}

export function WorkspaceStatePanel({ workspaces }: Props) {
  const rows = [...workspaces].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Workspace State
          </h2>
        </div>
        {rows.length > 0 && (
          <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
            {rows.length} not active
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ShieldCheck className="h-7 w-7 text-[var(--m-success)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">
            Every workspace the admin API lists is Active.
          </p>
          <p className="text-xs text-[var(--m-text-secondary)]">
            Orphaned, deleted and removing workspaces would appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Workspace
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  State
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-b border-[var(--m-border)] last:border-0">
                  <td className="px-4 py-2 text-[var(--m-text)]">{w.name}</td>
                  <td className="px-4 py-2 text-[var(--m-text-secondary)]">{w.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
