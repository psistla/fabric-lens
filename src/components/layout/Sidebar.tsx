import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FolderOpen,
  Gauge,
  Shield,
  Settings,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import * as demo from '@/api/demo';
import { DEMO_SECURITY_VISITED_KEY } from '@/utils/constants';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

const BASE_NAV_ITEMS: Omit<NavItem, 'badge'>[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Workspaces', path: '/workspaces', icon: FolderOpen },
  { label: 'Capacity', path: '/capacity', icon: Gauge },
  { label: 'Security', path: '/security', icon: Shield },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { pathname } = useLocation();
  const [securityVisited, setSecurityVisited] = useState(
    () => sessionStorage.getItem(DEMO_SECURITY_VISITED_KEY) === 'true',
  );

  // Mark security as visited when user navigates to /security
  useEffect(() => {
    if (pathname === '/security' && !securityVisited) {
      sessionStorage.setItem(DEMO_SECURITY_VISITED_KEY, 'true');
      setSecurityVisited(true);
    }
  }, [pathname, securityVisited]);

  // Auto-collapse sidebar on screens < 1024px
  useEffect(() => {
    function handleResize() {
      const isSmall = window.innerWidth < 1024;
      const current = useUiStore.getState().sidebarCollapsed;
      if (isSmall && !current) {
        toggleSidebar();
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navItems: NavItem[] = BASE_NAV_ITEMS.map((item) => ({
    ...item,
    badge:
      demo.isDemoMode &&
      !securityVisited &&
      pathname !== '/security' &&
      item.path === '/security'
        ? 'Try →'
        : undefined,
  }));

  return (
    <aside
      className={`hidden flex-col border-r border-[var(--m-border)] bg-[var(--m-bg)] transition-all duration-200 md:flex ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-[var(--m-border)] px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--m-primary)] text-sm font-bold text-white">
          F
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-[var(--m-text)]">
            fabric-lens
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-[120ms] ${
                isActive
                  ? 'bg-[var(--m-primary-subtle)] font-semibold text-[var(--m-primary)]'
                  : 'text-[var(--m-text-secondary)] hover:bg-[var(--m-surface-hover)] hover:text-[var(--m-text)]'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <span className="flex flex-1 items-center justify-between">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-[var(--m-primary)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* About / Help */}
      <div className="border-t border-[var(--m-border)] px-2 py-2">
        <NavLink
          to="/about"
          title={collapsed ? 'About' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-[120ms] ${
              isActive
                ? 'bg-[var(--m-primary-subtle)] font-semibold text-[var(--m-primary)]'
                : 'text-[var(--m-text-secondary)] hover:bg-[var(--m-surface-hover)] hover:text-[var(--m-text)]'
            } ${collapsed ? 'justify-center px-0' : ''}`
          }
        >
          <Info className="h-5 w-5 shrink-0" />
          {!collapsed && <span>About</span>}
        </NavLink>
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--m-border)] p-2">
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--m-text-tertiary)] transition-colors hover:bg-[var(--m-surface-hover)] hover:text-[var(--m-text-secondary)]"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
