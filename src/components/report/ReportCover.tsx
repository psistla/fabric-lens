import type { ReportData } from '@/utils/reportData';

interface Props {
  data: Pick<ReportData,
    'generatedAt' | 'overallGrade' | 'overallScore' | 'workspaceCount' |
    'securityPosture' | 'riskySettings' | 'settingsLoaded' |
    'ghostWorkspaces' | 'activityLoaded'>;
}

export function ReportCover({ data }: Props) {
  const dateStr = data.generatedAt.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const secScore = data.securityPosture?.score;
  const highRiskCount = data.settingsLoaded ? data.riskySettings.length : null;
  const ghostCount = data.activityLoaded ? data.ghostWorkspaces.length : null;

  return (
    <div className="bg-[var(--m-surface)] px-10 py-12 border-b-4 border-[var(--m-border)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--m-primary)] mb-2">
            Governance &amp; Health Audit
          </p>
          <h1 className="text-3xl font-bold text-[var(--m-text)] leading-tight">
            Microsoft Fabric<br />Tenant Audit
          </h1>
          <p className="mt-3 text-sm text-[var(--m-text-secondary)]">
            Generated {dateStr} · fabric-lens.com
          </p>
        </div>
        <div className="text-center bg-[var(--m-bg)] rounded-xl px-6 py-4">
          <p className="text-[11px] font-semibold text-[var(--m-text-secondary)] uppercase tracking-[0.06em]">
            Overall Grade
          </p>
          <p className="text-5xl font-bold text-[var(--m-primary)] leading-none">{data.overallGrade}</p>
          <p className="text-sm text-[var(--m-text-secondary)] mt-1">{data.overallScore} / 100</p>
        </div>
      </div>

      <div className="mt-6 flex gap-4 flex-wrap">
        {[
          { label: 'Workspaces', value: String(data.workspaceCount) },
          { label: 'Security Score', value: secScore !== undefined ? `${secScore} / 100` : 'Not scanned' },
          { label: 'High-Risk Settings', value: highRiskCount !== null ? String(highRiskCount) : 'Not scanned' },
          { label: 'Ghost Workspaces', value: ghostCount !== null ? String(ghostCount) : 'Not scanned' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[var(--m-bg)] border border-[var(--m-border)] rounded-lg px-4 py-2.5">
            <p className="text-[11px] font-semibold text-[var(--m-text-secondary)] uppercase">{label}</p>
            <p className="text-xl font-bold text-[var(--m-text)] mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
