import { Link } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { useToastStore } from '@/components/shared/Toast';
import { GITHUB_URL } from '@/utils/constants';

/**
 * Top nav for the public marketing shell. No sidebar, no auth guard — this
 * renders for signed-out visitors, so every control has to work without a
 * session.
 */
export function MarketingNav() {
  const { isAuthenticated, login } = useAuth();
  const addToast = useToastStore((s) => s.addToast);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--m-border)] bg-[var(--m-bg)]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link to="/" className="m-display text-lg">
          fabric-<span className="m-gradient-text">lens</span>
        </Link>

        <div className="ml-auto flex items-center gap-5">
          <Link
            to="/about"
            className="hidden text-sm text-[var(--m-text-secondary)] transition-colors duration-[120ms] hover:text-[var(--m-text)] sm:inline"
          >
            About
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-[var(--m-text-secondary)] transition-colors duration-[120ms] hover:text-[var(--m-text)] sm:inline"
          >
            GitHub
          </a>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-semibold text-white [background-image:var(--m-gradient-brand)] transition-opacity duration-[120ms] hover:opacity-90"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <button
                onClick={() => {
                  login().catch(() => {
                    addToast(
                      'error',
                      'Sign-in failed. Check that your browser allows pop-ups for this site and try again.',
                    );
                  });
                }}
                className="text-sm font-medium text-[var(--m-text-secondary)] transition-colors duration-[120ms] hover:text-[var(--m-text)]"
              >
                Sign in
              </button>
              <Link
                to="/dashboard"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white [background-image:var(--m-gradient-brand)] transition-opacity duration-[120ms] hover:opacity-90"
              >
                Try the demo
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
