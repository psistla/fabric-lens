import { useState, useEffect } from 'react';
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
  Network,
} from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useUiStore } from '@/store/uiStore';
import { isDemoMode } from '@/api/demo';
import { msalInstance } from '@/auth/AuthProvider';
import {
  DEFAULT_FABRIC_API_BASE,
  DEFAULT_NAMING_PATTERN_STRING,
  DEFAULT_STALE_THRESHOLD_DAYS,
  HEALTH_SCORE_WEIGHTS,
  HEALTH_SCORE_MAX,
  APP_VERSION,
  GRAPH_SCOPES,
} from '@/utils/constants';

// --- Auth Status Section ---

function AuthStatusSection() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-5 py-3">
        <User className="h-4 w-4 text-[var(--text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          Authentication Status
        </h2>
      </div>
      <div className="divide-y divide-[var(--border-default)]">
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--text-secondary)]">
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
          <span className="text-sm text-[var(--text-secondary)]">
            User
          </span>
          <span className="text-sm text-[var(--text-primary)]">
            {isDemoMode
              ? 'Demo User'
              : user?.name || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--text-secondary)]">
            Email
          </span>
          <span className="text-sm text-[var(--text-primary)]">
            {isDemoMode
              ? 'demo@fabric-lens.local'
              : user?.email || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--text-secondary)]">
            Tenant ID
          </span>
          <span className="font-mono text-xs text-[var(--text-primary)]">
            {isDemoMode
              ? 'demo-tenant-00000'
              : user?.tenantId || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--text-secondary)]">
            API Base
          </span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            {import.meta.env.VITE_FABRIC_API_BASE || DEFAULT_FABRIC_API_BASE}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Microsoft Graph Section ---

function GraphStatusSection() {
  const [graphConnected, setGraphConnected] = useState<boolean | null>(null);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      setGraphConnected(true);
      return;
    }
    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
      setGraphConnected(false);
      return;
    }
    msalInstance
      .acquireTokenSilent({ scopes: GRAPH_SCOPES, account })
      .then(() => setGraphConnected(true))
      .catch(() => setGraphConnected(false));
  }, []);

  const handleGrant = async () => {
    setGranting(true);
    try {
      await msalInstance.acquireTokenPopup({ scopes: GRAPH_SCOPES });
      setGraphConnected(true);
    } catch {
      // User cancelled or consent denied
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-5 py-3">
        <Network className="h-4 w-4 text-[var(--text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          Microsoft Graph
        </h2>
      </div>
      <div className="divide-y divide-[var(--border-default)]">
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--text-secondary)]">
            Status
          </span>
          {isDemoMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Demo Mode
            </span>
          ) : graphConnected ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
              <XCircle className="h-3.5 w-3.5" />
              Not connected
            </span>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--text-secondary)]">
            Scope
          </span>
          <span className="font-mono text-xs text-[var(--text-primary)]">
            {GRAPH_SCOPES[0]}
          </span>
        </div>

        {!isDemoMode && !graphConnected && (
          <div className="px-5 py-3">
            <button
              onClick={() => void handleGrant()}
              disabled={granting}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              {granting ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        )}

        <div className="px-5 py-3">
          <p className="text-xs text-[var(--text-tertiary)]">
            Required for expanding group membership in Security Audit.
          </p>
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
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-5 py-3">
        <Heart className="h-4 w-4 text-[var(--text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          Health Score Configuration
        </h2>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Naming Convention Pattern
          </label>
          <input
            type="text"
            value={namingPattern}
            onChange={(e) => setNamingPattern(e.target.value)}
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 font-mono text-sm text-[var(--text-primary)]"
          />
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Regex pattern for workspace naming compliance ({HEALTH_SCORE_WEIGHTS.naming} pts).
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
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
            className="w-32 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Items not modified within this period are considered stale ({HEALTH_SCORE_WEIGHTS.activeItems} pts).
          </p>
        </div>

        <div className="rounded-md bg-[var(--surface-secondary)] p-3">
          <h3 className="mb-2 text-xs font-medium uppercase text-[var(--text-secondary)]">
            Scoring Breakdown ({HEALTH_SCORE_MAX} pts)
          </h3>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[var(--text-secondary)]">
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
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-5 py-3">
        <Monitor className="h-4 w-4 text-[var(--text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
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
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] hover:bg-[var(--surface-tertiary)]'
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
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-5 py-3">
        <Info className="h-4 w-4 text-[var(--text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          About
        </h2>
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-lg font-bold text-white">
            F
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Fabric Lens
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              v{APP_VERSION}
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          Governance, health intelligence, and inventory management for
          Microsoft Fabric tenants. Authenticates via Azure AD and calls Fabric
          REST APIs directly from the browser.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-md bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
            React 18
          </span>
          <span className="inline-flex rounded-md bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
            TypeScript
          </span>
          <span className="inline-flex rounded-md bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
            Vite
          </span>
          <span className="inline-flex rounded-md bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
            Tailwind CSS
          </span>
          <span className="inline-flex rounded-md bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
            Zustand
          </span>
          <span className="inline-flex rounded-md bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
            Recharts
          </span>
          <span className="inline-flex rounded-md bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
            MSAL.js
          </span>
        </div>

        <div className="flex gap-4 pt-1">
          <a
            href="https://github.com/fabric-lens/fabric-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--brand-primary)]"
          >
            GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://learn.microsoft.com/en-us/rest/api/fabric/core"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--brand-primary)]"
          >
            Fabric REST API
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)]">
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
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Application configuration and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AuthStatusSection />
          <GraphStatusSection />
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
