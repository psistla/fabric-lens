import { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Monitor,
  Heart,
  Info,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useUiStore } from '@/store/uiStore';
import { isDemoMode } from '@/api/demo';
import {
  DEFAULT_FABRIC_API_BASE,
  DEFAULT_NAMING_PATTERN_STRING,
  DEFAULT_STALE_THRESHOLD_DAYS,
  HEALTH_SCORE_WEIGHTS,
  HEALTH_SCORE_MAX,
  APP_VERSION,
} from '@/utils/constants';

// --- Auth Status Section ---

function AuthStatusSection() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <User className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Authentication Status
        </h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Status
          </span>
          {isDemoMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Demo Mode
            </span>
          ) : isAuthenticated ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Authenticated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
              <XCircle className="h-3.5 w-3.5" />
              Not Authenticated
            </span>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            User
          </span>
          <span className="text-sm text-slate-900 dark:text-slate-100">
            {isDemoMode
              ? 'Demo User'
              : user?.name || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Email
          </span>
          <span className="text-sm text-slate-900 dark:text-slate-100">
            {isDemoMode
              ? 'demo@fabric-lens.local'
              : user?.email || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Tenant ID
          </span>
          <span className="font-mono text-xs text-slate-900 dark:text-slate-100">
            {isDemoMode
              ? 'demo-tenant-00000'
              : user?.tenantId || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            API Base
          </span>
          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
            {import.meta.env.VITE_FABRIC_API_BASE || DEFAULT_FABRIC_API_BASE}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Health Config Section ---

function HealthConfigSection() {
  const [namingPattern, setNamingPattern] = useState(DEFAULT_NAMING_PATTERN_STRING);
  const [staleThreshold, setStaleThreshold] = useState(DEFAULT_STALE_THRESHOLD_DAYS);

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <Heart className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Health Score Configuration
        </h2>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Naming Convention Pattern
          </label>
          <input
            type="text"
            value={namingPattern}
            onChange={(e) => setNamingPattern(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Regex pattern for workspace naming compliance ({HEALTH_SCORE_WEIGHTS.naming} pts).
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Stale Threshold (days)
          </label>
          <input
            type="number"
            min={7}
            max={365}
            value={staleThreshold}
            onChange={(e) =>
              setStaleThreshold(
                Math.min(365, Math.max(7, Number(e.target.value))),
              )
            }
            className="w-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Items not modified within this period are considered stale ({HEALTH_SCORE_WEIGHTS.activeItems} pts).
          </p>
        </div>

        <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800/50">
          <h3 className="mb-2 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            Scoring Breakdown ({HEALTH_SCORE_MAX} pts)
          </h3>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            {([
              ['Has description', HEALTH_SCORE_WEIGHTS.description],
              ['Assigned to capacity', HEALTH_SCORE_WEIGHTS.capacity],
              ['Assigned to domain', HEALTH_SCORE_WEIGHTS.domain],
              ['Git integration', HEALTH_SCORE_WEIGHTS.git],
              ['Naming convention', HEALTH_SCORE_WEIGHTS.naming],
              ['No stale items', HEALTH_SCORE_WEIGHTS.activeItems],
              ['Data layer present', HEALTH_SCORE_WEIGHTS.dataLayer],
              ['Reasonable item count', HEALTH_SCORE_WEIGHTS.reasonableCount],
              ['Workspace identity (SPN)', HEALTH_SCORE_WEIGHTS.identity],
            ] as const).map(([label, pts]) => (
              <span key={label} className="contents">
                <span>{label}</span>
                <span className="text-right font-medium">{pts} pts</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Theme Section ---

function ThemeSection() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  const options: { value: 'light' | 'dark'; label: string; icon: typeof Sun }[] =
    [
      { value: 'light', label: 'Light', icon: Sun },
      { value: 'dark', label: 'Dark', icon: Moon },
    ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <Monitor className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Appearance
        </h2>
      </div>
      <div className="px-5 py-4">
        <div className="flex gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                theme === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-400'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800'
              }`}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- About Section ---

function AboutSection() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <Info className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
          About
        </h2>
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            F
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Fabric Lens
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              v{APP_VERSION}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Governance, health intelligence, and inventory management for
          Microsoft Fabric tenants. Authenticates via Azure AD and calls Fabric
          REST APIs directly from the browser.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            React 18
          </span>
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            TypeScript
          </span>
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Vite
          </span>
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Tailwind CSS
          </span>
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Zustand
          </span>
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Recharts
          </span>
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            MSAL.js
          </span>
        </div>

        <div className="flex gap-4 pt-1">
          <a
            href="https://github.com/fabric-lens/fabric-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://learn.microsoft.com/en-us/rest/api/fabric/core"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Fabric REST API
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          MIT License. Not affiliated with or endorsed by Microsoft.
        </p>
      </div>
    </div>
  );
}

// --- Main Settings Page ---

export function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Application configuration and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AuthStatusSection />
          <ThemeSection />
        </div>
        <div className="space-y-6">
          <HealthConfigSection />
          <AboutSection />
        </div>
      </div>
    </div>
  );
}
