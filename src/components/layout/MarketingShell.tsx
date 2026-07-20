import { Outlet } from 'react-router';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

/**
 * Public shell for marketing surfaces (landing, about). No sidebar and no auth
 * guard — these routes must render for signed-out visitors.
 *
 * Nav and footer arrive in Task 2.2, which also strips AboutPage's bespoke
 * header so this shell owns the chrome for both routes.
 */
export function MarketingShell() {
  return (
    <div className="min-h-screen bg-[var(--m-bg)] text-[var(--m-text)]">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
}
