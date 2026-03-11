import { useLocation } from 'react-router';
import { Sun, Moon, LogIn, LogOut, ChevronRight, FlaskConical } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useUiStore } from '@/store/uiStore';
import { isDemoMode } from '@/api/demo';

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
    <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
      {segments.map((segment, i) => (
        <span key={segment.path} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          <span
            className={
              i === segments.length - 1
                ? 'font-medium text-[var(--text-primary)]'
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
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeMenu]);

  // Close on Escape key
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-default)] bg-[var(--surface-primary)] px-4 md:px-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md p-2 text-[var(--text-tertiary)] transition-colors duration-[120ms] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-secondary)]"
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
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-[120ms] hover:bg-[var(--surface-tertiary)]"
          >
            {isDemoMode && !user ? (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-medium text-white">
                  <FlaskConical className="h-3.5 w-3.5" />
                </div>
                <span className="hidden text-[var(--text-secondary)] sm:inline">
                  Demo
                </span>
              </>
            ) : (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary)] text-xs font-medium text-white">
                  {initials ?? '?'}
                </div>
                {user && (
                  <span className="hidden max-w-[120px] truncate text-[var(--text-secondary)] sm:inline">
                    {user.name}
                  </span>
                )}
              </>
            )}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] py-1 shadow-lg"
            >
              {isDemoMode && !user ? (
                <>
                  <div className="border-b border-[var(--border-default)] px-3 py-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Demo Mode
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Exploring with sample data
                    </p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      void login();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--brand-primary)] transition-colors duration-[120ms] hover:bg-[var(--surface-tertiary)]"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in to tenant
                  </button>
                </>
              ) : (
                <>
                  {user && (
                    <div className="border-b border-[var(--border-default)] px-3 py-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
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
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors duration-[120ms] hover:bg-[var(--surface-tertiary)]"
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
