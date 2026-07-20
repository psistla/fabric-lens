import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShieldCheck, Activity, Boxes, Gauge } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HealthGrid } from '@/components/dashboard/HealthGrid';
import { mockWorkspaces, getMockAllWorkspaceItems } from '@/api/demo';
import { calculateWorkspaceHealth } from '@/utils/healthScore';
import { GITHUB_URL } from '@/utils/constants';

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: 'Security posture',
    body: 'Over-permissioned workspaces, org-wide shares, risky tenant settings, and service principal sprawl, surfaced as findings you can act on.',
  },
  {
    icon: Activity,
    title: 'Health intelligence',
    body: 'Every workspace scored against nine governance checks, graded A to F, with the quick win named on each one.',
  },
  {
    icon: Boxes,
    title: 'Inventory',
    body: 'Workspaces, items, capacities, and domains in one searchable view, exportable to CSV for the client deck.',
  },
  {
    icon: Gauge,
    title: 'Capacity cost',
    body: 'SKU sizing and utilization against live Azure retail rates, so the capacity conversation starts from a number.',
  },
] as const;

const STEPS = [
  {
    title: 'Open it',
    body: 'No install, no backend, no trial signup. Try the demo tenant first if you want to look before you connect.',
  },
  {
    title: 'Connect your tenant',
    body: 'Sign in with your work account. Read-only Fabric scopes, requested incrementally, so admin APIs are only consented when you use them.',
  },
  {
    title: 'Read the findings',
    body: 'Scores, findings, and inventory render in the browser. Export what matters and share the page with the tenant owner.',
  },
] as const;

function ValueProps() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="m-display text-3xl">What it tells you</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] p-6"
          >
            <Icon className="h-5 w-5 text-[var(--m-primary)]" />
            <h3 className="mt-4 text-base font-bold text-[var(--m-text)]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--m-text-secondary)]">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="border-y border-[var(--m-border)] bg-[var(--m-surface)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="m-display text-3xl">How it works</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ title, body }, i) => (
            <li key={title}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--m-primary-subtle)] text-sm font-bold text-[var(--m-primary)]">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-bold text-[var(--m-text)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--m-text-secondary)]">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * Public landing page at `/`.
 *
 * The product glimpse reuses the real `HealthGrid` over the demo tenant, scored
 * by the real `calculateWorkspaceHealth`, so the visual on the landing page is
 * the same component and the same math a visitor meets on the dashboard.
 */
export function LandingPage() {
  // Empty string yields the bare base title, not "fabric-lens | fabric-lens".
  useDocumentTitle('');
  const navigate = useNavigate();

  const glimpse = useMemo(() => {
    const itemsByWorkspace = getMockAllWorkspaceItems();
    return mockWorkspaces.map((ws) => {
      const health = calculateWorkspaceHealth(ws, itemsByWorkspace[ws.id] ?? []);
      return {
        id: ws.id,
        name: ws.displayName,
        score: health.percentage,
        grade: health.grade,
        topFailedCheck: health.checks.find((c) => !c.passed)?.detail,
      };
    });
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <h1 className="m-display m-display-hero max-w-3xl">
          Know what your Fabric tenant is{' '}
          <span className="m-gradient-text">actually doing</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--m-text-secondary)]">
          Governance, security posture, and health intelligence for Microsoft
          Fabric. It runs entirely in your browser against the Fabric REST APIs,
          so tenant data never passes through anyone else's servers.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/dashboard"
            className="m-cta"
          >
            Try the demo
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="m-cta-ghost"
          >
            View the source
          </a>
        </div>

        {/* Product glimpse */}
        <div className="mt-16">
          <HealthGrid
            workspaces={glimpse}
            onWorkspaceClick={() => navigate('/dashboard')}
          />
          <p className="mt-3 text-xs text-[var(--m-text-tertiary)]">
            Live component, demo tenant. Every tile is a workspace graded on the
            same checks your tenant would be.
          </p>
        </div>
      </section>

      <ValueProps />
      <HowItWorks />

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="m-display text-3xl">See your own tenant</h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--m-text-secondary)]">
          Free and open source. Nothing to deploy, nothing to configure.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/dashboard"
            className="m-cta"
          >
            Try the demo
          </Link>
          <Link
            to="/about"
            className="m-cta-ghost"
          >
            How scoring works
          </Link>
        </div>
      </section>
    </main>
  );
}
