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
    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
      {segments.map((segment, i) => (
        <span key={segment.path} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          <span
            className={
              i === segments.length - 1
                ? 'font-medium text-slate-900 dark:text-slate-100'
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isDemoMode && !user ? (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-medium text-white">
                  <FlaskConical className="h-3.5 w-3.5" />
                </div>
                <span className="hidden text-slate-700 sm:inline dark:text-slate-300">
                  Demo
                </span>
              </>
            ) : (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                  {initials ?? '?'}
                </div>
                {user && (
                  <span className="hidden max-w-[120px] truncate text-slate-700 sm:inline dark:text-slate-300">
                    {user.name}
                  </span>
                )}
              </>
            )}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              {isDemoMode && !user ? (
                <>
                  <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Demo Mode
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Exploring with sample data
                    </p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      void login();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-slate-100 dark:text-blue-400 dark:hover:bg-slate-700"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in to tenant
                  </button>
                </>
              ) : (
                <>
                  {user && (
                    <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
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
