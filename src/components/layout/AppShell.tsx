import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  FolderOpen,
  Gauge,
  Shield,
  Settings,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '@/components/shared/Toast';
import { isDemoMode } from '@/api/demo';

interface Props {
  children: ReactNode;
}

const mobileNavItems = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Workspaces', path: '/workspaces', icon: FolderOpen },
  { label: 'Capacity', path: '/capacity', icon: Gauge },
  { label: 'Security', path: '/security', icon: Shield },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function AppShell({ children }: Props) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {isDemoMode && (
          <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1 text-xs font-semibold text-white">
            DEMO MODE — Exploring with sample data. Sign in to connect your Fabric tenant.
          </div>
        )}
        <Header />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom nav — visible below md */}
        <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white py-1.5 md:hidden dark:border-slate-800 dark:bg-slate-900">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                  isActive
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <ToastContainer />
    </div>
  );
}
