import { useEffect } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  FolderOpen,
  Gauge,
  Shield,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Workspaces', path: '/workspaces', icon: FolderOpen },
  { label: 'Capacity', path: '/capacity', icon: Gauge },
  { label: 'Security', path: '/security', icon: Shield },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

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

  return (
    <aside
      className={`hidden flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 md:flex ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          F
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
            end={item.path === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-200 p-2 dark:border-slate-800">
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
