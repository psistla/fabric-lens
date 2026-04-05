import { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  ScanSearch,
  ExternalLink,
  Users,
  KeyRound,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  Bot,
  Download,
} from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useSecurityStore } from '@/store/securityStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useTenantSettingsStore } from '@/store/tenantSettingsStore';
import { useWidelySharedStore } from '@/store/widelySharedStore';
import { useActivityStore } from '@/store/activityStore';
import { ExportButton } from '@/components/shared/ExportButton';
import { SearchBar } from '@/components/shared/SearchBar';
import { GroupBadge, GroupExpansionRow } from '@/components/security/GroupExpansionRow';
import { EffectiveAccessCard } from '@/components/security/EffectiveAccessCard';
import { SecurityFindingsPanel } from '@/components/security/SecurityFindingsPanel';
import { TenantSettingsRiskPanel } from '@/components/security/TenantSettingsRiskPanel';
import { WidelySharedPanel } from '@/components/security/WidelySharedPanel';
import { GhostWorkspacesPanel } from '@/components/security/GhostWorkspacesPanel';
import { SecurityPostureCard } from '@/components/security/SecurityPostureCard';
import { SpnGovernancePanel } from '@/components/security/SpnGovernancePanel';
import { SpofWorkspacesPanel } from '@/components/security/SpofWorkspacesPanel';
import { AccessConcentrationChart } from '@/components/security/AccessConcentrationChart';
import { WorkspacePivotTable } from '@/components/security/WorkspacePivotTable';
import { deriveSecurityFindings, computeSecurityPosture } from '@/utils/securityFindings';
import { deriveRiskySettings } from '@/utils/tenantSettingRisks';
import { exportToCSV } from '@/utils/export';
import { isDemoMode } from '@/api/demo';
import type { PrincipalType, EffectiveAccessSummary } from '@/api/types/admin';
import {
  ROLE_COLORS,
  ADMIN_RATE_LIMIT,
  ADMIN_ROLE_WARNING_THRESHOLD,
} from '@/utils/constants';
import { computeEffectiveAccess, type UserSummary } from '@/utils/effectiveAccess';

type SortKey = 'displayName' | 'email' | 'assignmentCount';
type SortDir = 'asc' | 'desc';

const USERS_PER_PAGE = 25;
const ALL_ROLES = ['Admin', 'Member', 'Contributor', 'Viewer'] as const;

const ROLE_CHIP_STYLES: Record<string, { active: string; inactive: string }> = {
  Admin: {
    active: 'bg-[var(--m-error-bg)] text-[var(--m-error-text)] ring-1 ring-[var(--m-error)]/40',
    inactive: 'bg-[var(--m-surface)] text-[var(--m-text-secondary)]',
  },
  Member: {
    active: 'bg-[var(--m-primary-subtle)] text-[var(--m-primary)] ring-1 ring-[var(--m-primary)]/40',
    inactive: 'bg-[var(--m-surface)] text-[var(--m-text-secondary)]',
  },
  Contributor: {
    active: 'bg-[var(--m-accent-subtle)] text-[var(--m-accent)] ring-1 ring-[var(--m-accent)]/40',
    inactive: 'bg-[var(--m-surface)] text-[var(--m-text-secondary)]',
  },
  Viewer: {
    active: 'bg-[var(--m-success-bg)] text-[var(--m-success)] ring-1 ring-[var(--m-success)]/40',
    inactive: 'bg-[var(--m-surface)] text-[var(--m-text-secondary)]',
  },
};

const TYPE_ICONS: Record<PrincipalType, typeof Users> = {
  User: Users,
  Group: UsersRound,
  ServicePrincipal: Bot,
  ServicePrincipalProfile: Bot,
};

const TYPE_LABELS: Record<PrincipalType, string> = {
  User: 'User',
  Group: 'Group',
  ServicePrincipal: 'SPN',
  ServicePrincipalProfile: 'SPN Profile',
};

/** Returns page numbers to display, with ellipsis gaps for large ranges. */
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

// --- Consent card (shown when ADMIN_SCOPES not yet granted) ---

interface ConsentCardProps {
  onGrant: () => void;
  granting: boolean;
  error: string | null;
}

function AdminConsentCard({ onGrant, granting, error }: ConsentCardProps) {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--m-primary-subtle)]">
        <Shield className="h-8 w-8 text-[var(--m-primary)]" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--m-text)]">
        Security audit requires elevated permissions
      </h2>
      <p className="text-sm text-[var(--m-text-secondary)]">
        fabric-lens needs Fabric Admin API access to view cross-workspace role
        assignments.
      </p>
      <button
        onClick={onGrant}
        disabled={granting}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--m-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--m-primary-hover)] disabled:opacity-50"
      >
        {granting ? 'Requesting access...' : 'Grant Admin Access'}
      </button>
      {error && (
        <p className="text-sm text-[var(--m-error)]">{error}</p>
      )}
      <p className="text-xs text-[var(--m-text-tertiary)]">
        Note: your tenant admin may need to approve this request.
      </p>
    </div>
  );
}

// --- Non-admin card ---

function AdminRequiredCard() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--m-warning-bg)]">
        <Shield className="h-8 w-8 text-[var(--m-warning)]" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--m-text)]">
        Fabric Admin Role Required
      </h2>
      <p className="text-sm text-[var(--m-text-secondary)]">
        The Security page uses Admin APIs that require the Fabric Admin role. Ask
        your Microsoft 365 or Fabric administrator to assign this role.
      </p>
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] p-4 text-left">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
          Setup Steps
        </h3>
        <ol className="mt-2 space-y-1.5 text-sm text-[var(--m-text-secondary)]">
          <li>1. Go to the Microsoft 365 Admin Center</li>
          <li>2. Navigate to Roles &rarr; Fabric Administrator</li>
          <li>3. Add your account to the role assignment</li>
          <li>4. Wait ~15 minutes for the role to propagate</li>
          <li>5. Refresh this page</li>
        </ol>
      </div>
      <a
        href="https://learn.microsoft.com/en-us/fabric/admin/roles"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-[var(--m-primary)]"
      >
        Learn more about Fabric admin roles
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

// --- Main page ---

export function SecurityPage() {
  const navigate = useNavigate();
  const { checkAdminConsent, requestAdminConsent, hasAdminAccess } = useAuth();
  const {
    workspaceUsers,
    resolvedGroups,
    isAdmin,
    loading,
    error,
    scanProgress,
    checkAdminAccess,
    fetchAllWorkspaceUsers,
    resolveGroupCount,
    resolveGroupMembers,
  } = useSecurityStore();
  const {
    workspaces,
    fetchWorkspaces,
    loading: wsLoading,
  } = useWorkspaceStore();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    fetchTenantSettings,
  } = useTenantSettingsStore();
  const {
    artifacts,
    loading: widelySharedLoading,
    error: widelySharedError,
    fetchWidelySharedArtifacts,
  } = useWidelySharedStore();
  const {
    ghostWorkspaces,
    loading: ghostLoading,
    error: ghostError,
    fetchActivityEvents,
  } = useActivityStore();

  // Incremental consent: try silent token first, then show consent card if needed.
  const [consentChecked, setConsentChecked] = useState(isDemoMode);
  const [consentGranting, setConsentGranting] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) return;
    void checkAdminConsent().then((granted) => {
      setConsentChecked(true);
      if (granted && isAdmin === null) void checkAdminAccess();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (workspaces.length === 0) void fetchWorkspaces();
  }, [workspaces.length, fetchWorkspaces]);

  // In demo mode, trigger admin access check (bypasses auth entirely).
  useEffect(() => {
    if (isDemoMode && isAdmin === null) void checkAdminAccess();
  }, [isAdmin, checkAdminAccess]);

  const handleGrantConsent = useCallback(async () => {
    setConsentGranting(true);
    setConsentError(null);
    const granted = await requestAdminConsent();
    setConsentGranting(false);
    if (granted) {
      void checkAdminAccess();
    } else {
      setConsentError('Access was not granted. Your tenant admin may need to approve this request first.');
    }
  }, [requestAdminConsent, checkAdminAccess]);

  const handleScanAll = useCallback(() => {
    void fetchTenantSettings();
    void fetchWidelySharedArtifacts();
    void fetchActivityEvents(workspaces);
    const ids = workspaces.map((w) => w.id);
    void fetchAllWorkspaceUsers(ids);
  }, [workspaces, fetchAllWorkspaceUsers, fetchTenantSettings, fetchWidelySharedArtifacts, fetchActivityEvents]);

  const hasScanned = Object.keys(workspaceUsers).length > 0;

  // Aggregate user summaries (now includes principalType)
  const userSummaries = useMemo((): UserSummary[] => {
    const map = new Map<string, UserSummary>();
    for (const [wsId, users] of Object.entries(workspaceUsers)) {
      const wsName =
        workspaces.find((w) => w.id === wsId)?.displayName ?? wsId;
      for (const u of users) {
        const email = u.userDetails.userPrincipalName;
        const pType = u.userDetails.principalType ?? 'User';
        let summary = map.get(email);
        if (!summary) {
          summary = {
            displayName: u.userDetails.displayName,
            email,
            principalType: pType,
            assignments: [],
          };
          map.set(email, summary);
        }
        summary.assignments.push({
          workspaceId: wsId,
          workspaceName: wsName,
          role: u.workspaceAccessDetails.workspaceRole,
        });
      }
    }
    return [...map.values()].sort(
      (a, b) => b.assignments.length - a.assignments.length,
    );
  }, [workspaceUsers, workspaces]);

  // Pre-fetch group member counts once scan is done
  useEffect(() => {
    if (!hasScanned) return;
    const groups = userSummaries.filter((u) => u.principalType === 'Group');
    for (const g of groups) {
      void resolveGroupCount(g.email, g.displayName);
    }

    // In demo mode, auto-resolve all group members immediately
    if (isDemoMode) {
      for (const g of groups) {
        void resolveGroupMembers(g.email, g.displayName);
      }
    }
  }, [hasScanned, userSummaries, resolveGroupCount, resolveGroupMembers]);

  // Effective access summary
  const effectiveAccessSummary = useMemo((): EffectiveAccessSummary | null => {
    if (!hasScanned) return null;
    return computeEffectiveAccess(userSummaries, resolvedGroups);
  }, [hasScanned, userSummaries, resolvedGroups]);

  // Security findings (derived from scan data — no extra API calls)
  const securityFindings = useMemo(
    () => (hasScanned ? deriveSecurityFindings(userSummaries, resolvedGroups) : []),
    [hasScanned, userSummaries, resolvedGroups],
  );

  // Security posture score
  const securityPosture = useMemo(
    () => (hasScanned ? computeSecurityPosture(userSummaries, resolvedGroups) : null),
    [hasScanned, userSummaries, resolvedGroups],
  );

  const riskySettings = useMemo(
    () => deriveRiskySettings(settings),
    [settings],
  );

  // Over-permissioned users (Admin on 5+ workspaces)
  const overPermissioned = useMemo(
    () =>
      userSummaries.filter(
        (u) => u.principalType === 'User' && u.assignments.filter((a) => a.role === 'Admin').length >= ADMIN_ROLE_WARNING_THRESHOLD,
      ),
    [userSummaries],
  );

  // --- Expanded groups state ---
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroupExpansion = useCallback(
    (groupUpn: string, displayName: string) => {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        if (next.has(groupUpn)) {
          next.delete(groupUpn);
        } else {
          next.add(groupUpn);
          // Resolve members on first expand
          void resolveGroupMembers(groupUpn, displayName);
        }
        return next;
      });
    },
    [resolveGroupMembers],
  );

  // --- Export handlers ---
  const handleExport = useCallback(() => {
    const rows: Record<string, unknown>[] = [];
    for (const u of userSummaries) {
      const memberCount = u.principalType === 'Group'
        ? resolvedGroups[u.email]?.memberCount
        : undefined;
      for (const a of u.assignments) {
        rows.push({
          Type: TYPE_LABELS[u.principalType],
          User: u.principalType === 'Group' && memberCount != null
            ? `${u.displayName} (${memberCount} members)`
            : u.displayName,
          Email: u.email,
          Workspace: a.workspaceName,
          Role: a.role,
        });
      }
    }
    exportToCSV(rows, 'fabric-lens-security.csv');
  }, [userSummaries, resolvedGroups]);

  const handleExportEffectiveAccess = useCallback(() => {
    const rows: Record<string, unknown>[] = [];
    // Direct users
    for (const u of userSummaries) {
      if (u.principalType !== 'User') continue;
      for (const a of u.assignments) {
        rows.push({
          User: u.displayName,
          Email: u.email,
          Workspace: a.workspaceName,
          Role: a.role,
          AccessPath: 'Direct',
        });
      }
    }
    // Transitive via groups
    for (const u of userSummaries) {
      if (u.principalType !== 'Group') continue;
      const resolved = resolvedGroups[u.email];
      if (!resolved?.members) continue;
      for (const a of u.assignments) {
        for (const m of resolved.members) {
          rows.push({
            User: m.displayName,
            Email: m.userPrincipalName,
            Workspace: a.workspaceName,
            Role: a.role,
            AccessPath: `Via ${u.displayName}`,
          });
        }
      }
    }
    exportToCSV(rows, 'fabric-lens-effective-access.csv');
  }, [userSummaries, resolvedGroups]);

  // --- Search, filter, sort, pagination state ---

  const [pivotView, setPivotView] = useState<'users' | 'workspaces'>('users');
  const [search, setSearch] = useState('');
  const [activeRoles, setActiveRoles] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const toggleRole = useCallback((role: string) => {
    setActiveRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
    setCurrentPage(1);
  }, []);

  const clearRoleFilter = useCallback(() => {
    setActiveRoles(new Set());
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir('asc');
        return key;
      }
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return key;
    });
    setCurrentPage(1);
  }, []);

  // Pipeline: filter → sort → paginate
  const filteredUsers = useMemo(() => {
    let result = userSummaries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    if (activeRoles.size > 0) {
      result = result.filter((u) =>
        u.assignments.some((a) => activeRoles.has(a.role)),
      );
    }
    return result;
  }, [userSummaries, search, activeRoles]);

  const sortedUsers = useMemo(() => {
    if (!sortKey) return filteredUsers;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filteredUsers].sort((a, b) => {
      if (sortKey === 'assignmentCount') {
        return (a.assignments.length - b.assignments.length) * dir;
      }
      return a[sortKey].localeCompare(b[sortKey]) * dir;
    });
  }, [filteredUsers, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(
    () =>
      sortedUsers.slice(
        (safePage - 1) * USERS_PER_PAGE,
        safePage * USERS_PER_PAGE,
      ),
    [sortedUsers, safePage],
  );

  const summaryStats = useMemo(() => {
    const totalAssignments = userSummaries.reduce(
      (sum, u) => sum + u.assignments.length,
      0,
    );
    const roleCounts: Record<string, number> = {};
    for (const u of userSummaries) {
      for (const a of u.assignments) {
        roleCounts[a.role] = (roleCounts[a.role] ?? 0) + 1;
      }
    }
    return { totalUsers: userSummaries.length, totalAssignments, roleCounts };
  }, [userSummaries]);

  function renderSortIcon(key: SortKey) {
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 text-[var(--m-text-tertiary)]" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 text-[var(--m-primary)]" />
      : <ArrowDown className="h-3 w-3 text-[var(--m-primary)]" />;
  }

  // Checking consent / admin status
  if (!consentChecked || (isAdmin === null && (hasAdminAccess || isDemoMode)) || (loading && !scanProgress)) {
    return (
      <div className="space-y-4 p-6">
        <div className="m-skeleton h-7 w-40" />
        <div className="m-skeleton h-4 w-64" />
        <div className="m-skeleton h-48 rounded-xl" />
      </div>
    );
  }

  // Admin consent not yet granted — show incremental consent card
  if (!isDemoMode && !hasAdminAccess) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">
          Security
        </h1>
        <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
          Role assignments and access governance.
        </p>
        <AdminConsentCard
          onGrant={() => void handleGrantConsent()}
          granting={consentGranting}
          error={consentError}
        />
      </div>
    );
  }

  // Not admin (has consent but lacks Fabric Admin role)
  if (isAdmin === false) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">
          Security
        </h1>
        <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
          Role assignments and access governance.
        </p>
        <AdminRequiredCard />
      </div>
    );
  }

  // Admin view
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">
            Security
          </h1>
          <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
            Role assignments and access governance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasScanned && (
            <>
              <button
                onClick={handleExportEffectiveAccess}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--m-border)] px-3 py-1.5 text-xs font-semibold text-[var(--m-text-secondary)] transition-colors hover:bg-[var(--m-surface)]"
                title="Export effective access (includes group members)"
              >
                <Download className="h-3.5 w-3.5" />
                Effective Access
              </button>
              <ExportButton onClick={handleExport} label="Export CSV" />
            </>
          )}
          <button
            onClick={handleScanAll}
            disabled={loading || wsLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--m-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--m-primary-hover)] disabled:opacity-50"
          >
            <ScanSearch className="h-3.5 w-3.5" />
            {hasScanned ? 'Re-scan All' : 'Scan All'}
          </button>
        </div>
      </div>

      {/* Scan progress */}
      {scanProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--m-text-secondary)]">
            <span>
              Scanning workspace users... ({scanProgress.completed}/
              {scanProgress.total})
            </span>
            <span className="text-[10px] text-[var(--m-text-tertiary)]">
              Rate limit: {ADMIN_RATE_LIMIT} req/hr
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--m-surface)]">
            <div
              className="h-full rounded-full bg-[var(--m-primary)] transition-all"
              style={{
                width: `${(scanProgress.completed / scanProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--m-warning)] bg-[var(--m-warning-bg)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-[var(--m-warning-text)]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--m-warning)]" />
            Unable to complete security scan. Some workspaces may have been
            skipped.
          </div>
          <button
            onClick={handleScanAll}
            className="shrink-0 rounded-lg bg-[var(--m-warning-bg)] px-3 py-1 text-xs font-semibold text-[var(--m-warning-text)] ring-1 ring-[var(--m-warning)] transition-colors hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Pre-scan prompt */}
      {!hasScanned && !scanProgress && (
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-8 text-center">
          <ScanSearch className="mx-auto h-10 w-10 text-[var(--m-text-tertiary)]" />
          <p className="mt-3 text-sm text-[var(--m-text-secondary)]">
            Click <strong>Scan All</strong> to fetch user role assignments across
            all {workspaces.length} workspaces.
          </p>
          <p className="mt-1 text-xs text-[var(--m-text-tertiary)]">
            Admin APIs are rate-limited to {ADMIN_RATE_LIMIT} requests per hour.
          </p>
        </div>
      )}

      {/* Results */}
      {hasScanned && (
        <>
          {/* Security Posture Score */}
          {securityPosture && <SecurityPostureCard posture={securityPosture} />}

          {/* Security Findings Panel */}
          <SecurityFindingsPanel findings={securityFindings} />

          {/* Tenant Settings Risk Panel */}
          <TenantSettingsRiskPanel
            settings={riskySettings}
            loading={settingsLoading}
            error={settingsError}
            onRetry={fetchTenantSettings}
          />

          {/* Widely Shared Panel */}
          <WidelySharedPanel
            artifacts={artifacts}
            loading={widelySharedLoading}
            error={widelySharedError}
            onRetry={fetchWidelySharedArtifacts}
          />

          {/* Ghost Workspaces Panel */}
          <GhostWorkspacesPanel
            ghostWorkspaces={ghostWorkspaces}
            workspaces={workspaces}
            loading={ghostLoading}
            error={ghostError}
            onRetry={() => void fetchActivityEvents(workspaces)}
          />

          {/* SPOF Workspaces Panel */}
          <SpofWorkspacesPanel workspaceUsers={workspaceUsers} workspaces={workspaces} />

          {/* Effective Access Card */}
          {effectiveAccessSummary && (
            <EffectiveAccessCard summary={effectiveAccessSummary} />
          )}

          {/* SPN Governance Panel */}
          <SpnGovernancePanel userSummaries={userSummaries} />

          {/* Access Concentration Charts */}
          <AccessConcentrationChart
            workspaceUsers={workspaceUsers}
            userSummaries={userSummaries}
          />

          {/* Over-permissioned alert */}
          {overPermissioned.length > 0 && (
            <div className="rounded-xl border border-[var(--m-error)] bg-[var(--m-error-bg)] p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[var(--m-error)]" />
                <h3 className="text-sm font-semibold text-[var(--m-error-text)]">
                  Over-Permissioned Users
                </h3>
              </div>
              <p className="mt-1 text-xs text-[var(--m-error-text)]">
                {overPermissioned.length} user
                {overPermissioned.length > 1 ? 's' : ''} with Admin role on {ADMIN_ROLE_WARNING_THRESHOLD}+
                workspaces.
              </p>
              <ul className="mt-2 space-y-1">
                {overPermissioned.map((u) => {
                  const adminCount = u.assignments.filter(
                    (a) => a.role === 'Admin',
                  ).length;
                  return (
                    <li
                      key={u.email}
                      className="text-xs text-[var(--m-error-text)]"
                    >
                      <span className="font-medium">{u.displayName}</span>
                      {' — Admin on '}
                      {adminCount} workspaces
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* User / Workspace pivot table */}
          <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
              {/* Header with toggle */}
              <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
                <h2 className="text-sm font-medium text-[var(--m-text)]">
                  {pivotView === 'users' ? 'User Access Summary' : 'Workspace Risk View'}
                </h2>
                <div className="flex rounded-lg border border-[var(--m-border)] p-0.5 text-[11px] font-semibold">
                  <button
                    onClick={() => setPivotView('users')}
                    className={`rounded-md px-2.5 py-1 transition-colors ${
                      pivotView === 'users'
                        ? 'bg-[var(--m-primary)] text-white'
                        : 'text-[var(--m-text-secondary)] hover:text-[var(--m-text)]'
                    }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setPivotView('workspaces')}
                    className={`rounded-md px-2.5 py-1 transition-colors ${
                      pivotView === 'workspaces'
                        ? 'bg-[var(--m-primary)] text-white'
                        : 'text-[var(--m-text-secondary)] hover:text-[var(--m-text)]'
                    }`}
                  >
                    Workspaces
                  </button>
                </div>
              </div>

              {/* Workspace pivot */}
              {pivotView === 'workspaces' && (
                <WorkspacePivotTable
                  workspaceUsers={workspaceUsers}
                  workspaces={workspaces}
                />
              )}

              {/* User view: summary stats + table */}
              {pivotView === 'users' && (
              <>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 border-b border-[var(--m-border)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--m-text-tertiary)]" />
                  <div>
                    <p className="text-xs text-[var(--m-text-secondary)]">Principals</p>
                    <p className="text-sm font-semibold text-[var(--m-text)]">
                      {summaryStats.totalUsers}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[var(--m-text-tertiary)]" />
                  <div>
                    <p className="text-xs text-[var(--m-text-secondary)]">Assignments</p>
                    <p className="text-sm font-semibold text-[var(--m-text)]">
                      {summaryStats.totalAssignments}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[var(--m-text-secondary)]">By Role</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {ALL_ROLES.map((role) => (
                      <span key={role} className="flex items-center gap-1 text-xs">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: ROLE_COLORS[role] }}
                        />
                        <span className="text-[var(--m-text-secondary)]">
                          {summaryStats.roleCounts[role] ?? 0}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toolbar: search + role filter chips */}
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--m-border)] px-4 py-3">
                <div className="w-64">
                  <SearchBar
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search by name or email..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {ALL_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                        activeRoles.has(role)
                          ? ROLE_CHIP_STYLES[role].active
                          : ROLE_CHIP_STYLES[role].inactive
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                  {activeRoles.size > 0 && (
                    <button
                      onClick={clearRoleFilter}
                      className="ml-1 text-xs text-[var(--m-text-secondary)] hover:text-[var(--m-text)]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
                      <th className="w-16 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                        Type
                      </th>
                      <th
                        onClick={() => handleSort('displayName')}
                        className="cursor-pointer select-none px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)] transition-colors hover:text-[var(--m-text)]"
                      >
                        <span className="flex items-center gap-1.5">
                          Name {renderSortIcon('displayName')}
                        </span>
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        className="cursor-pointer select-none px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)] transition-colors hover:text-[var(--m-text)]"
                      >
                        <span className="flex items-center gap-1.5">
                          Email {renderSortIcon('email')}
                        </span>
                      </th>
                      <th
                        onClick={() => handleSort('assignmentCount')}
                        className="cursor-pointer select-none px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)] transition-colors hover:text-[var(--m-text)]"
                      >
                        <span className="flex items-center gap-1.5">
                          Workspaces &amp; Roles {renderSortIcon('assignmentCount')}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--m-border)]">
                    {paginatedUsers.map((u) => {
                      const TypeIcon = TYPE_ICONS[u.principalType];
                      const isGroup = u.principalType === 'Group';
                      const isExpanded = expandedGroups.has(u.email);
                      const resolved = isGroup ? resolvedGroups[u.email] : undefined;

                      return (
                        <GroupWrapper key={u.email}>
                          <tr
                            className={isGroup ? 'cursor-pointer transition-colors hover:bg-[var(--m-surface-hover)]' : ''}
                            onClick={isGroup ? () => toggleGroupExpansion(u.email, u.displayName) : undefined}
                          >
                            <td className="whitespace-nowrap px-4 py-2.5">
                              <div className="flex items-center gap-1" title={TYPE_LABELS[u.principalType]}>
                                <TypeIcon className="h-3.5 w-3.5 text-[var(--m-text-tertiary)]" />
                                <span className="text-[10px] text-[var(--m-text-tertiary)]">
                                  {TYPE_LABELS[u.principalType]}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 font-medium text-[var(--m-text)]">
                              <div className="flex items-center gap-2">
                                {u.displayName}
                                {isGroup && resolved && (
                                  <GroupBadge
                                    group={resolved}
                                    expanded={isExpanded}
                                    onToggle={() => toggleGroupExpansion(u.email, u.displayName)}
                                  />
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-[var(--m-text-secondary)]">
                              {u.email}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-wrap gap-1.5">
                                {u.assignments.map((a) => (
                                  <button
                                    key={`${a.workspaceId}-${a.role}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void navigate(
                                        `/workspaces/${a.workspaceId}`,
                                      );
                                    }}
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors hover:ring-1 ${
                                      a.role === 'Admin'
                                        ? 'bg-[var(--m-error-bg)] text-[var(--m-error-text)] hover:ring-[var(--m-error)]/40'
                                        : a.role === 'Member'
                                          ? 'bg-[var(--m-primary-subtle)] text-[var(--m-primary)] hover:ring-[var(--m-primary)]/40'
                                          : a.role === 'Contributor'
                                            ? 'bg-[var(--m-accent-subtle)] text-[var(--m-accent)] hover:ring-[var(--m-accent)]/40'
                                            : 'bg-[var(--m-success-bg)] text-[var(--m-success)] hover:ring-[var(--m-success)]/40'
                                    }`}
                                  >
                                    {a.workspaceName}
                                    <span className="opacity-60">{a.role}</span>
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                          {isGroup && isExpanded && resolved && (
                            <GroupExpansionRow
                              group={resolved}
                              onRetry={() => resolveGroupMembers(u.email, u.displayName)}
                            />
                          )}
                        </GroupWrapper>
                      );
                    })}
                    {sortedUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-12 text-center text-[var(--m-text-secondary)]"
                        >
                          No users match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer: pagination + count */}
              <div className="flex items-center justify-between border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2">
                <span className="text-xs text-[var(--m-text-secondary)]">
                  {sortedUsers.length > 0
                    ? `Showing ${(safePage - 1) * USERS_PER_PAGE + 1}\u2013${Math.min(safePage * USERS_PER_PAGE, sortedUsers.length)} of ${sortedUsers.length} principals`
                    : '0 principals'}
                  {sortedUsers.length !== userSummaries.length &&
                    ` (filtered from ${userSummaries.length})`}
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage(safePage - 1)}
                      className="rounded-lg p-1 text-[var(--m-text-secondary)] transition-colors hover:bg-[var(--m-surface-hover)] disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {getPageNumbers(safePage, totalPages).map((p, i) =>
                      p === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-1 text-xs text-[var(--m-text-tertiary)]"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                            p === safePage
                              ? 'bg-[var(--m-primary)] text-white'
                              : 'text-[var(--m-text-secondary)] hover:bg-[var(--m-surface-hover)]'
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage(safePage + 1)}
                      className="rounded-lg p-1 text-[var(--m-text-secondary)] transition-colors hover:bg-[var(--m-surface-hover)] disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              </>
              )}
            </div>
        </>
      )}
    </div>
  );
}

/** Wrapper to allow multiple <tr> elements per logical row (for group expansion). */
function GroupWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
