import { useLocation } from 'react-router';
import { Sun, Moon, LogIn, LogOut, ChevronRight, FlaskConical } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useUiStore } from '@/store/uiStore';

import { useToastStore } from '@/components/shared/Toast';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/workspaces': 'Workspaces',
  '/capacity': 'Capacities',
  '/security': 'Security',
  '/settings': 'Settings',
};

function Breadcrumb() {
  const { pathname } = useLocation();

  const segments: { label: string; path: string }[] = [];

  if (pathname === '/') {
    segments.push({ label: 'Dashboard', path: '/' });
  } else {
    const parts = pathname.split('/').filter(Boolean);
    let currentPath = '';
    for (const part of parts) {
      currentPath += `/${part}`;
      const label = routeLabels[currentPath] ?? part;
      segments.push({ label, path: currentPath });
    }
  }

  return (
    <div className="flex items-center gap-1 text-sm text-[var(--m-text-secondary)]">
      {segments.map((segment, i) => (
        <span key={segment.path} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          <span
            className={
              i === segments.length - 1
                ? 'font-medium text-[var(--m-text)]'
                : ''
            }
          >
            {segment.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function Header() {
  const { user, login, logout } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeMenu]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, closeMenu]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--m-border)] bg-[var(--m-bg)] px-4 md:px-6">
      <Breadcrumb />

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-lg p-2 text-[var(--m-text-tertiary)] transition-colors hover:bg-[var(--m-surface-hover)] hover:text-[var(--m-text-secondary)]"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[var(--m-surface-hover)]"
          >
            {!user ? (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--m-accent-400)] text-xs font-semibold text-[var(--m-accent-900)]">
                  <FlaskConical className="h-3.5 w-3.5" />
                </div>
                <span className="hidden text-[var(--m-text-secondary)] sm:inline">
                  Demo
                </span>
              </>
            ) : (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--m-primary-600)] text-xs font-semibold text-white">
                  {initials ?? '?'}
                </div>
                {user && (
                  <span className="hidden max-w-[120px] truncate text-[var(--m-text-secondary)] sm:inline">
                    {user.name}
                  </span>
                )}
              </>
            )}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-[var(--m-z-dropdown)] mt-1 w-56 rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] py-1 shadow-[var(--m-shadow-lg)]"
            >
              {!user ? (
                <>
                  <div className="border-b border-[var(--m-border)] px-3 py-2">
                    <p className="text-sm font-medium text-[var(--m-text)]">
                      Demo Mode
                    </p>
                    <p className="text-xs text-[var(--m-text-tertiary)]">
                      Exploring with sample data
                    </p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      login().catch(() => {
                        addToast('error', 'Sign-in failed. Check that your browser allows pop-ups for this site and try again.');
                      });
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--m-primary)] transition-colors hover:bg-[var(--m-surface-hover)]"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in to tenant
                  </button>
                </>
              ) : (
                <>
                  {user && (
                    <div className="border-b border-[var(--m-border)] px-3 py-2">
                      <p className="text-sm font-medium text-[var(--m-text)]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[var(--m-text-tertiary)]">
                        {user.email}
                      </p>
                    </div>
                  )}
                  <button
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      void logout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--m-text-secondary)] transition-colors hover:bg-[var(--m-surface-hover)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
