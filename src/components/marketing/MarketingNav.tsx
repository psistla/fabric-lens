import { Link } from 'react-router';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useToastStore } from '@/components/shared/Toast';
import { useUiStore } from '@/store/uiStore';
import { GITHUB_URL } from '@/utils/constants';

/**
 * Top nav for the public marketing shell. No sidebar, no auth guard — this
 * renders for signed-out visitors, so every control has to work without a
 * session.
 */
export function MarketingNav() {
  const { isAuthenticated, login } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

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

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg p-2 text-[var(--m-text-tertiary)] transition-colors duration-[120ms] hover:bg-[var(--m-surface-hover)] hover:text-[var(--m-text-secondary)]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="m-cta px-4 py-2"
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
                className="m-cta px-4 py-2"
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
