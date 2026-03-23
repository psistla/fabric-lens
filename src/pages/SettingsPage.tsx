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
  ShieldCheck,
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
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-5 py-3">
        <User className="h-4 w-4 text-[var(--m-text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--m-text)]">
          Authentication Status
        </h2>
      </div>
      <div className="divide-y divide-[var(--m-border)]">
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--m-text-secondary)]">
            Status
          </span>
          {isDemoMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--m-accent-400)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-accent-900)]">
              Demo Mode
            </span>
          ) : isAuthenticated ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--m-success)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Authenticated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--m-error)]">
              <XCircle className="h-3.5 w-3.5" />
              Not Authenticated
            </span>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--m-text-secondary)]">
            User
          </span>
          <span className="text-sm text-[var(--m-text)]">
            {isDemoMode
              ? 'Demo User'
              : user?.name || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--m-text-secondary)]">
            Email
          </span>
          <span className="text-sm text-[var(--m-text)]">
            {isDemoMode
              ? 'demo@fabric-lens.com'
              : user?.email || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--m-text-secondary)]">
            Tenant ID
          </span>
          <span className="font-mono text-xs text-[var(--m-text)]">
            {isDemoMode
              ? 'demo-tenant-00000'
              : user?.tenantId || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[var(--m-text-secondary)]">
            API Base
          </span>
          <span className="font-mono text-xs text-[var(--m-text-secondary)]">
            {import.meta.env.VITE_FABRIC_API_BASE || DEFAULT_FABRIC_API_BASE}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Permissions Section ---

interface PermissionRow {
  label: string;
  description: string;
  granted: boolean | null; // null = checking
  onGrant?: () => void;
  granting?: boolean;
}

function PermissionStatusBadge({ granted }: { granted: boolean | null }) {
  if (isDemoMode) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--m-accent-400)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-accent-900)]">
        Demo Mode
      </span>
    );
  }
  if (granted === null) {
    return <span className="m-skeleton h-4 w-16 rounded" />;
  }
  return granted ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--m-success)]">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--m-warning)]">
      <XCircle className="h-3.5 w-3.5" />
      Not granted
    </span>
  );
}

function PermissionsSection() {
  const { hasAdminAccess, checkAdminConsent, requestAdminConsent } = useAuth();

  const [adminChecked, setAdminChecked] = useState(false);
  const [adminGranting, setAdminGranting] = useState(false);
  const [graphConnected, setGraphConnected] = useState<boolean | null>(null);
  const [graphGranting, setGraphGranting] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      setAdminChecked(true);
      setGraphConnected(true);
      return;
    }
    // Check admin consent silently
    void checkAdminConsent().then(() => setAdminChecked(true));

    // Check Graph consent silently
    const account = msalInstance!.getAllAccounts()[0];
    if (!account) {
      setGraphConnected(false);
      return;
    }
    msalInstance!
      .acquireTokenSilent({ scopes: GRAPH_SCOPES, account })
      .then(() => setGraphConnected(true))
      .catch(() => setGraphConnected(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGrantAdmin = async () => {
    setAdminGranting(true);
    await requestAdminConsent();
    setAdminChecked(true);
    setAdminGranting(false);
  };

  const handleGrantGraph = async () => {
    setGraphGranting(true);
    try {
      const account = msalInstance!.getAllAccounts()[0];
      await msalInstance!.acquireTokenPopup({ scopes: GRAPH_SCOPES, account });
      setGraphConnected(true);
    } catch {
      // User cancelled
    } finally {
      setGraphGranting(false);
    }
  };

  const rows: PermissionRow[] = [
    {
      label: 'Core APIs',
      description: 'Workspaces, items, capacities',
      granted: true, // Always granted — required scopes on login
    },
    {
      label: 'Admin APIs',
      description: 'Security audit — cross-workspace role assignments',
      granted: adminChecked ? hasAdminAccess : null,
      onGrant: () => void handleGrantAdmin(),
      granting: adminGranting,
    },
    {
      label: 'Microsoft Graph',
      description: 'Group membership expansion',
      granted: graphConnected,
      onGrant: () => void handleGrantGraph(),
      granting: graphGranting,
    },
  ];

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-5 py-3">
        <ShieldCheck className="h-4 w-4 text-[var(--m-text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--m-text)]">
          Permissions
        </h2>
      </div>
      <div className="divide-y divide-[var(--m-border)]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--m-text)]">{row.label}</p>
              <p className="text-xs text-[var(--m-text-tertiary)]">{row.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <PermissionStatusBadge granted={isDemoMode ? true : row.granted} />
              {!isDemoMode && row.granted === false && row.onGrant && (
                <button
                  onClick={row.onGrant}
                  disabled={row.granting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--m-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--m-primary-hover)] disabled:opacity-50"
                >
                  {row.granting ? 'Granting...' : 'Grant Access'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Health Config Section ---

function HealthConfigSection() {
  const [namingPattern, setNamingPattern] = useState(DEFAULT_NAMING_PATTERN_STRING);
  const [staleThreshold, setStaleThreshold] = useState(DEFAULT_STALE_THRESHOLD_DAYS);

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-5 py-3">
        <Heart className="h-4 w-4 text-[var(--m-text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--m-text)]">
          Health Score Configuration
        </h2>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--m-text-secondary)]">
            Naming Convention Pattern
          </label>
          <input
            type="text"
            value={namingPattern}
            onChange={(e) => setNamingPattern(e.target.value)}
            className="w-full rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-2 font-mono text-sm text-[var(--m-text)]"
          />
          <p className="mt-1 text-xs text-[var(--m-text-tertiary)]">
            Regex pattern for workspace naming compliance ({HEALTH_SCORE_WEIGHTS.naming} pts).
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--m-text-secondary)]">
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
            className="w-32 rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-2 text-sm text-[var(--m-text)]"
          />
          <p className="mt-1 text-xs text-[var(--m-text-tertiary)]">
            Items not modified within this period are considered stale (informational — does not affect health score).
          </p>
        </div>

        <div className="rounded-md bg-[var(--m-surface)] p-3">
          <h3 className="mb-2 text-xs font-medium uppercase text-[var(--m-text-secondary)]">
            Scoring Breakdown ({HEALTH_SCORE_MAX} pts)
          </h3>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[var(--m-text-secondary)]">
            {([
              ['Has description', HEALTH_SCORE_WEIGHTS.description],
              ['Assigned to capacity', HEALTH_SCORE_WEIGHTS.capacity],
              ['Assigned to domain', HEALTH_SCORE_WEIGHTS.domain],
              ['Workspace identity (SPN + Git)', HEALTH_SCORE_WEIGHTS.workspaceIdentity],
              ['Naming convention', HEALTH_SCORE_WEIGHTS.naming],
              ['Has active items', HEALTH_SCORE_WEIGHTS.activeItems],
              ['Data layer present', HEALTH_SCORE_WEIGHTS.dataLayer],
              ['Reasonable item count', HEALTH_SCORE_WEIGHTS.reasonableCount],
              ['Tag coverage (≥80%)', HEALTH_SCORE_WEIGHTS.tagCoverage],
            ] as [string, number][]).map(([label, pts]) => (
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
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-5 py-3">
        <Monitor className="h-4 w-4 text-[var(--m-text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--m-text)]">
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
                  ? 'border-[var(--m-primary)] bg-[var(--m-primary-subtle)] text-[var(--m-primary)]'
                  : 'border-[var(--m-border)] text-[var(--m-text-secondary)] hover:border-[var(--m-text-tertiary)] hover:bg-[var(--m-surface)]'
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
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-5 py-3">
        <Info className="h-4 w-4 text-[var(--m-text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--m-text)]">
          About
        </h2>
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--m-primary)] text-lg font-bold text-white">
            F
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--m-text)]">
              Fabric Lens
            </h3>
            <p className="text-xs text-[var(--m-text-secondary)]">
              v{APP_VERSION}
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--m-text-secondary)]">
          Governance, health intelligence, and inventory management for
          Microsoft Fabric tenants. Authenticates via Azure AD and calls Fabric
          REST APIs directly from the browser.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            React 19
          </span>
          <span className="inline-flex rounded-full bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            TypeScript
          </span>
          <span className="inline-flex rounded-full bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            Vite
          </span>
          <span className="inline-flex rounded-full bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            Tailwind CSS
          </span>
          <span className="inline-flex rounded-full bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            Zustand
          </span>
          <span className="inline-flex rounded-full bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            Recharts
          </span>
          <span className="inline-flex rounded-full bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            MSAL.js
          </span>
        </div>

        <div className="flex gap-4 pt-1">
          <a
            href="https://github.com/psistla/fabric-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--m-primary)]"
          >
            GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://learn.microsoft.com/en-us/rest/api/fabric/articles/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--m-primary)]"
          >
            Fabric REST API
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <p className="text-[11px] text-[var(--m-text-tertiary)]">
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
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
          Application configuration and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AuthStatusSection />
          <PermissionsSection />
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
