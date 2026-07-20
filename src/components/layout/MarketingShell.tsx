import { Outlet } from 'react-router';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ToastContainer } from '@/components/shared/Toast';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

/**
 * Public shell for marketing surfaces (landing, about). No sidebar and no auth
 * guard — these routes must render for signed-out visitors.
 *
 * ToastContainer is mounted here as well as in AppShell: the toast store is
 * global, but the renderer is not, so sign-in failures from the public nav
 * would otherwise never be shown.
 */
export function MarketingShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--m-bg)] text-[var(--m-text)]">
      <MarketingNav />
      <ErrorBoundary>
        <div className="flex-1">
          <Outlet />
        </div>
      </ErrorBoundary>
      <MarketingFooter />
      <ToastContainer />
    </div>
  );
}
