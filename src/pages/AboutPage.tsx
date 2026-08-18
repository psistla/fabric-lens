import { usePageMeta } from '@/hooks/usePageMeta';
import {
  GITHUB_URL,
  GITHUB_ISSUES_URL,
  HEALTH_SCORE_WEIGHTS,
  MAX_REASONABLE_ITEM_COUNT,
} from '@/utils/constants';
import {
  ShieldCheck,
  LayoutDashboard,
  Gauge,
  FlaskConical,
  ExternalLink,
  CheckCircle2,
  Lock,
  Globe,
  GitFork,
} from 'lucide-react';

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-4 text-xl font-semibold text-[var(--m-text)]">{title}</h2>
      {children}
    </section>
  );
}

interface TableRow {
  criterion: string;
  points: number;
  note?: string;
}

// Points come from HEALTH_SCORE_WEIGHTS rather than being written out here.
// This table is public, prerendered documentation of how scoring works, and the
// hand-copied version drifted: it claimed Semantic Models counted as a data
// layer and that 100 items failed the count check. Neither was true.
const healthChecks: TableRow[] = [
  { criterion: 'Assigned to a capacity', points: HEALTH_SCORE_WEIGHTS.capacity, note: 'Critical' },
  { criterion: 'Workspace identity configured (SPN + Git)', points: HEALTH_SCORE_WEIGHTS.workspaceIdentity, note: 'Critical' },
  { criterion: 'Has a description', points: HEALTH_SCORE_WEIGHTS.description, note: 'Critical' },
  { criterion: 'Assigned to a domain', points: HEALTH_SCORE_WEIGHTS.domain },
  { criterion: 'Follows naming convention', points: HEALTH_SCORE_WEIGHTS.naming },
  { criterion: 'Contains at least one item', points: HEALTH_SCORE_WEIGHTS.activeItems },
  { criterion: 'Includes a data layer (Lakehouse/Warehouse)', points: HEALTH_SCORE_WEIGHTS.dataLayer },
  { criterion: `Reasonable item count (≤ ${MAX_REASONABLE_ITEM_COUNT})`, points: HEALTH_SCORE_WEIGHTS.reasonableCount },
  { criterion: 'Tag coverage ≥ 80% of items', points: HEALTH_SCORE_WEIGHTS.tagCoverage, note: 'Skipped if no items' },
];

const toc = [
  { id: 'what-is', label: 'What is fabric-lens?' },
  { id: 'capabilities', label: 'Key capabilities' },
  { id: 'how-to-use', label: 'How to use this site' },
  { id: 'requirements', label: 'What you need for a tenant audit' },
  { id: 'health-scoring', label: 'Workspace health scoring' },
  { id: 'security-audit', label: 'Tenant security audit' },
  { id: 'demo-mode', label: 'Demo mode' },
  { id: 'links', label: 'Links' },
];

export function AboutPage() {
  usePageMeta({
    path: '/about',
    title: 'Microsoft Fabric governance and tenant auditing | fabric-lens',
    description:
      'How fabric-lens scores workspace health, what the security audit checks, which Fabric REST APIs it calls, and why it runs entirely in your browser with no backend.',
  });
  // Page chrome (nav, footer, background) comes from MarketingShell.
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex gap-12">
          {/* Table of contents (sticky sidebar) */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-tertiary)]">
                On this page
              </p>
              <nav className="space-y-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded px-2 py-1 text-sm text-[var(--m-text-secondary)] transition-colors hover:bg-[var(--m-surface-hover)] hover:text-[var(--m-text)]"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1 space-y-14">
            {/* Page title */}
            <div>
              <h1 className="mb-3 text-3xl font-bold text-[var(--m-text)]">
                About fabric-lens: Microsoft Fabric governance and tenant auditing
              </h1>
              <p className="text-base leading-relaxed text-[var(--m-text-secondary)]">
                How workspace health scoring, the security audit, and capacity monitoring work,
                and what access each one needs.
              </p>
            </div>

            {/* What is fabric-lens */}
            <Section id="what-is" title="What is fabric-lens?">
              <p className="leading-relaxed text-[var(--m-text-secondary)]">
                fabric-lens is a free, open-source governance and health intelligence dashboard for
                Microsoft Fabric tenants. It connects directly to the Fabric and Power BI Admin APIs
                using your existing Azure AD credentials. No backend server, no data export, no
                third-party data handling. Every API call runs in your browser, so tenant data
                never leaves your session. It is designed for Fabric administrators and Microsoft
                data platform consultants who need a fast, structured way to audit a tenant's
                workspace hygiene, security posture, and capacity utilisation.
              </p>
            </Section>

            {/* Key capabilities */}
            <Section id="capabilities" title="Key capabilities">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: LayoutDashboard,
                    title: 'Workspace health scoring',
                    desc: 'Every workspace scored across 9 governance checks, from capacity assignment to tag coverage. Grades A through F with drill-down.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Security audit',
                    desc: 'Access concentration, SPOF workspaces, SPN governance, widely shared objects, ghost workspace detection, and tenant settings risk.',
                  },
                  {
                    icon: Gauge,
                    title: 'Capacity monitoring',
                    desc: 'Live SKU pricing, CU allocation, and workspace distribution across all capacities in the tenant.',
                  },
                  {
                    icon: Globe,
                    title: 'Tenant settings risk panel',
                    desc: 'Surfaces high- and medium-risk tenant settings that are currently enabled (e.g. Publish to Web, external sharing).',
                  },
                  {
                    icon: Lock,
                    title: 'Widely shared objects',
                    desc: 'Identifies reports, dashboards, and semantic models shared via organisation-wide links.',
                  },
                  {
                    icon: FlaskConical,
                    title: 'Demo mode',
                    desc: 'Fully functional with realistic mock data. No Azure tenant or credentials required; share a link and it just works.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[var(--m-primary)]" />
                      <span className="text-sm font-semibold text-[var(--m-text)]">{title}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--m-text-secondary)]">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* How to use */}
            <Section id="how-to-use" title="How to use this site">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--m-text-tertiary)]">
                    Demo mode (no credentials needed)
                  </h3>
                  <ol className="space-y-2 text-sm text-[var(--m-text-secondary)]">
                    {[
                      'The app opens in demo mode automatically. No login or credentials needed.',
                      'Explore the Dashboard to see health grade distribution and governance issues.',
                      'Open the Security page and click "Scan All" to run the full security audit against mock data.',
                      'Browse the Workspaces and Capacity pages to see inventory and cost breakdowns.',
                      'Use the demo as a walkthrough script when introducing the tool to a client.',
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--m-primary-subtle)] text-[11px] font-semibold text-[var(--m-primary)]">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--m-text-tertiary)]">
                  Live mode: connected to your Fabric tenant
                  </h3>
                  <ol className="space-y-2 text-sm text-[var(--m-text-secondary)]">
                    {[
                      'Click "Sign in to tenant" in the top-right corner.',
                      'Authenticate with a Microsoft account that has Fabric Administrator role in your tenant.',
                      'Workspaces and capacities load automatically. Open Security → Scan All for the full audit.',
                      'Export workspace data as CSV or JSON using the export button on any data table.',
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--m-primary-subtle)] text-[11px] font-semibold text-[var(--m-primary)]">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Section>

            {/* Requirements */}
            <Section id="requirements" title="What you need for a Fabric tenant audit">
              <div className="space-y-6 text-sm text-[var(--m-text-secondary)]">
                <div>
                  <h3 className="mb-2 font-semibold text-[var(--m-text)]">Required permissions</h3>
                  <ul className="space-y-1.5">
                    {[
                      'Fabric Administrator role in the target tenant, required for admin API access (workspace users, tenant settings, scanner API)',
                      'A Microsoft account in the target tenant, or a guest account with Fabric Admin role assigned',
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--m-primary)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] p-4">
                  <p className="text-sm text-[var(--m-text-secondary)]">
                    <span className="font-semibold text-[var(--m-text)]">Note on consent prompts: </span>
                    fabric-lens requests only the scopes it needs, when it needs them. Core Fabric
                    and ARM scopes are requested on sign-in. Admin API scopes are requested the
                    first time you visit the Security or Settings page. Group expansion (Microsoft
                    Graph) is opt-in from Settings. You will see a Microsoft consent prompt once
                    per scope, not on every page visit.
                  </p>
                </div>
              </div>
            </Section>

            {/* Health scoring */}
            <Section id="health-scoring" title="Fabric workspace health scoring explained">
              <p className="mb-4 text-sm leading-relaxed text-[var(--m-text-secondary)]">
                Every workspace is scored across nine governance checks, worth a combined maximum of
                110 points when the workspace has items (100 points when empty; tag coverage is
                skipped). The score is normalised to a percentage and converted to a letter grade.
              </p>
              <div className="overflow-x-auto rounded-xl border border-[var(--m-border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                        Check
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                        Points
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--m-border)]">
                    {healthChecks.map((row) => (
                      <tr key={row.criterion} className="bg-[var(--m-bg)] hover:bg-[var(--m-surface-hover)]">
                        <td className="px-4 py-3 text-[var(--m-text)]">{row.criterion}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[var(--m-text)]">{row.points}</td>
                        <td className="px-4 py-3 text-[var(--m-text-tertiary)]">
                          {row.note === 'Critical' ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-950 dark:text-red-400">
                              Critical
                            </span>
                          ) : (
                            row.note ?? '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { grade: 'A', label: '≥ 90%', color: 'bg-[#15803D] text-white' },
                  { grade: 'B', label: '≥ 80%', color: 'bg-[#4F46E5] text-white' },
                  { grade: 'C', label: '≥ 65%', color: 'bg-[#B45309] text-white' },
                  { grade: 'D', label: '≥ 50%', color: 'bg-[#C2410C] text-white' },
                  { grade: 'F', label: '< 50%', color: 'bg-[#DC2626] text-white' },
                ].map(({ grade, label, color }) => (
                  <div key={grade} className="flex items-center gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold ${color}`}>
                      {grade}
                    </span>
                    <span className="text-sm text-[var(--m-text-secondary)]">{label}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Security audit */}
            <Section id="security-audit" title="Fabric tenant security audit explained">
              <p className="mb-4 text-sm leading-relaxed text-[var(--m-text-secondary)]">
                The security audit runs when you click "Scan All" on the Security page. It requires
                Fabric Administrator role for most checks. The overall posture score is a weighted
                composite of individual check results, expressed as a percentage.
              </p>
              <div className="space-y-3">
                {[
                  {
                    title: 'Access concentration',
                    desc: 'Identifies workspaces with an unusually high proportion of Admin-role assignments relative to total members.',
                  },
                  {
                    title: 'Single point of failure (SPOF) workspaces',
                    desc: 'Workspaces where only one user holds the Admin role. If that user leaves, the workspace becomes unmanageable.',
                  },
                  {
                    title: 'Service principal governance',
                    desc: 'Surfaces service principals with Admin or Member roles across workspaces, useful for auditing automation access.',
                  },
                  {
                    title: 'Tenant settings risk',
                    desc: 'Flags high- and medium-risk tenant settings that are currently enabled, such as Publish to Web or external sharing options.',
                  },
                  {
                    title: 'Widely shared objects',
                    desc: 'Lists reports, dashboards, and datasets shared via organisation-wide links using the Power BI Admin API.',
                  },
                  {
                    title: 'Ghost workspace detection',
                    desc: 'Finds workspaces with no recorded user activity in the last 28 days, the full retention window of the Power BI audit log.',
                  },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-3 rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] p-4">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--m-primary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--m-text)]">{title}</p>
                      <p className="mt-0.5 text-sm text-[var(--m-text-secondary)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Demo mode */}
            <Section id="demo-mode" title="Demo mode">
              <p className="text-sm leading-relaxed text-[var(--m-text-secondary)]">
                No credentials needed. The app opens in demo mode automatically, with a complete
                audit of a realistic mock Fabric tenant: 35 workspaces, 3 capacities, 200+
                items across 21 item types, and pre-loaded security findings.
              </p>
            </Section>

            {/* Links */}
            <Section id="links" title="Links">
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    icon: GitFork,
                    label: 'GitHub repository',
                    href: GITHUB_URL,
                  },
                  {
                    icon: ExternalLink,
                    label: 'Fabric REST API docs',
                    href: 'https://learn.microsoft.com/en-us/rest/api/fabric/articles/',
                  },
                  {
                    icon: ExternalLink,
                    label: 'Report an issue',
                    href: GITHUB_ISSUES_URL,
                  },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2.5 text-sm text-[var(--m-text-secondary)] transition-colors hover:border-[var(--m-primary)] hover:text-[var(--m-text)]"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </div>
            </Section>
          </main>
        </div>
    </div>
  );
}
