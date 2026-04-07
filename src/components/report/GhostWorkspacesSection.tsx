import type { ReportData } from '@/utils/reportData';
import { GHOST_WORKSPACE_THRESHOLD_DAYS } from '@/utils/constants';

interface Props {
  ghostWorkspaces: ReportData['ghostWorkspaces'];
  activityLoaded: ReportData['activityLoaded'];
}

export function GhostWorkspacesSection({ ghostWorkspaces, activityLoaded }: Props) {
  return (
    <section className="bg-[var(--m-surface)] px-10 py-8 border-b border-[var(--m-border)] mt-0.5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)] mb-4">
        Inactive Workspaces
      </h2>
      {!activityLoaded ? (
        <p className="text-sm text-[var(--m-text-secondary)] italic">
          Security scan required. Visit the Security page to run a scan.
        </p>
      ) : ghostWorkspaces.length === 0 ? (
        <p className="text-sm text-[var(--m-text-secondary)]">
          No workspaces inactive for over {GHOST_WORKSPACE_THRESHOLD_DAYS} days.
        </p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--m-border)]">
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Workspace</th>
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Days Inactive</th>
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {ghostWorkspaces.map((ws) => (
              <tr key={ws.workspaceId} className="border-b border-[var(--m-border)]">
                <td className="py-1.5 text-[var(--m-text)]">{ws.workspaceName}</td>
                <td className="py-1.5 text-[var(--m-text-secondary)]">{ws.daysInactive}</td>
                <td className="py-1.5 text-[var(--m-text-secondary)]">
                  {ws.lastActivityDate ? ws.lastActivityDate.toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
