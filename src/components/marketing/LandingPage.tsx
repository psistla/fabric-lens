import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Public landing page at `/`. Hero, value props, and closing CTA land in
 * Task 2.3 — this is the structural placeholder that lets the route split
 * ship on its own.
 */
export function LandingPage() {
  // Empty string yields the bare base title, not "fabric-lens | fabric-lens".
  useDocumentTitle('');

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      {/* m-display-hero is size-only; m-display carries weight 800 + tracking. */}
      <h1 className="m-display m-display-hero">fabric-lens</h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--m-text-secondary)]">
        Governance, health intelligence, and inventory management for Microsoft
        Fabric tenants.
      </p>
    </main>
  );
}
