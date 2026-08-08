import { Link } from 'react-router';
import { GITHUB_URL } from '@/utils/constants';

/**
 * Footer for the public marketing shell.
 *
 * The privacy line states what is architecturally true today: fabric-lens is a
 * client-side SPA that calls Fabric APIs straight from the browser, so tenant
 * data never reaches a server of ours.
 */
export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--m-border)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <span className="m-display text-base">
            fabric-<span className="m-gradient-text">lens</span>
          </span>
          <p className="mt-2 text-sm text-[var(--m-text-secondary)]">
            Runs entirely in your browser. Tenant data is read directly from the
            Fabric APIs and never passes through our servers.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <Link
            to="/about"
            className="text-[var(--m-text-secondary)] transition-colors duration-[120ms] hover:text-[var(--m-text)]"
          >
            About
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--m-text-secondary)] transition-colors duration-[120ms] hover:text-[var(--m-text)]"
          >
            Source on GitHub
          </a>
          <span className="text-[var(--m-text-tertiary)]">MIT licensed</span>
        </nav>
      </div>
    </footer>
  );
}
