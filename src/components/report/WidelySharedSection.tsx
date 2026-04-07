import type { ReportData } from '@/utils/reportData';

interface Props {
  artifacts: ReportData['widelySharedArtifacts'];
  artifactsLoaded: ReportData['artifactsLoaded'];
}

export function WidelySharedSection({ artifacts, artifactsLoaded }: Props) {
  return (
    <section className="bg-[var(--m-surface)] px-10 py-8 border-b border-[var(--m-border)] mt-0.5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)] mb-4">
        Widely Shared Objects
      </h2>
      {!artifactsLoaded ? (
        <p className="text-sm text-[var(--m-text-secondary)] italic">
          Security scan required. Visit the Security page to run a scan.
        </p>
      ) : artifacts.length === 0 ? (
        <p className="text-sm text-[var(--m-text-secondary)]">No org-wide shared artifacts found.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--m-border)]">
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Name</th>
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Type</th>
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Shared by</th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((a) => (
              <tr key={a.artifactId} className="border-b border-[var(--m-border)]">
                <td className="py-1.5 text-[var(--m-text)]">{a.displayName}</td>
                <td className="py-1.5 text-[var(--m-text-secondary)]">{a.artifactType}</td>
                <td className="py-1.5 text-[var(--m-text-secondary)]">{a.sharer?.displayName ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
