import type { ReportData } from '@/utils/reportData';

interface Props {
  topRecommendations: ReportData['topRecommendations'];
}

export function RecommendationsSection({ topRecommendations }: Props) {
  return (
    <section className="bg-[var(--m-surface)] px-10 py-8 border-b border-[var(--m-border)] mt-0.5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)] mb-4">
        Top Recommendations
      </h2>
      {topRecommendations.length === 0 ? (
        <p className="text-sm text-[var(--m-text-secondary)]">No governance issues found. Well done.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {topRecommendations.map((rec, i) => (
            <div
              key={rec.action}
              className="report-rec-card flex items-start gap-3 px-4 py-2.5 bg-[var(--m-bg)] rounded-lg border-l-4 border-[var(--m-primary)]"
            >
              <span className="text-lg font-bold text-[var(--m-primary)] min-w-[24px]">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-[var(--m-text)]">{rec.action}</p>
                <p className="text-xs text-[var(--m-text-secondary)] mt-0.5">
                  Recovers up to <strong>{rec.recoverablePoints} pts</strong> across {rec.affectedCount} workspace{rec.affectedCount !== 1 ? 's' : ''} · {rec.priority}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
