import type { ReportData } from '@/utils/reportData';
import { HEALTH_GRADE_COLORS } from '@/utils/constants';

interface Props {
  gradeDistribution: ReportData['gradeDistribution'];
  worstWorkspaces: ReportData['worstWorkspaces'];
}

const GRADE_ORDER = ['F', 'D', 'C', 'B', 'A'] as const;

export function HealthSection({ gradeDistribution, worstWorkspaces }: Props) {
  const total = Object.values(gradeDistribution).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 1;

  return (
    <section className="bg-[var(--m-surface)] px-10 py-8 border-b border-[var(--m-border)] mt-0.5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)] mb-4">
        Health Scores
      </h2>
      <div className="flex gap-8 items-start">
        {/* Grade distribution bar chart */}
        <div className="flex-1">
          <p className="text-xs text-[var(--m-text-secondary)] mb-3">Grade distribution</p>
          <div className="flex items-end gap-2 h-20">
            {GRADE_ORDER.map((g) => {
              const count = gradeDistribution[g] ?? 0;
              const heightPct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={g} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 rounded-t"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      backgroundColor: HEALTH_GRADE_COLORS[g] ?? '#6b7280',
                      minHeight: count > 0 ? 4 : 0,
                    }}
                  />
                  <span className="text-[10px] font-bold text-[var(--m-text-secondary)]">{g}</span>
                  <span className="text-[10px] text-[var(--m-text)]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Worst workspaces table */}
        <div className="flex-2 min-w-0">
          <p className="text-xs text-[var(--m-text-secondary)] mb-3">Top workspaces needing attention</p>
          {worstWorkspaces.length === 0 ? (
            <p className="text-sm text-[var(--m-text-secondary)]">No workspaces loaded.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <tbody>
                {worstWorkspaces.map((ws) => (
                  <tr key={ws.workspaceId} className="border-b border-[var(--m-border)]">
                    <td className="py-1.5 pr-4 text-[var(--m-text)] truncate max-w-[200px]">{ws.workspaceName}</td>
                    <td className="py-1.5 text-right">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: HEALTH_GRADE_COLORS[ws.grade] ?? '#6b7280' }}
                      >
                        {ws.grade} · {ws.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
