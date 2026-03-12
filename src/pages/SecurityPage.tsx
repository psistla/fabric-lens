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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useSecurityStore } from '@/store/securityStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ExportButton } from '@/components/shared/ExportButton';
import { SearchBar } from '@/components/shared/SearchBar';
import { GroupBadge, GroupExpansionRow } from '@/components/security/GroupExpansionRow';
import { EffectiveAccessCard } from '@/components/security/EffectiveAccessCard';
import { exportToCSV } from '@/utils/export';
import { isDemoMode } from '@/api/demo';
import type { PrincipalType, EffectiveAccessSummary } from '@/api/types/admin';
import {
  ROLE_COLORS,
  CHART_FALLBACK_COLOR,
  CHART_TOOLTIP_STYLE,
  ADMIN_RATE_LIMIT,
  ADMIN_ROLE_WARNING_THRESHOLD,
} from '@/utils/constants';

// --- Types for aggregated view ---

interface UserSummary {
  displayName: string;
  email: string;
  principalType: PrincipalType;
  assignments: { workspaceId: string; workspaceName: string; role: string }[];
}

type SortKey = 'displayName' | 'email' | 'assignmentCount';
type SortDir = 'asc' | 'desc';

const USERS_PER_PAGE = 25;
const ALL_ROLES = ['Admin', 'Member', 'Contributor', 'Viewer'] as const;

const ROLE_CHIP_STYLES: Record<string, { active: string; inactive: string }> = {
  Admin: {
    active: 'bg-red-100 text-red-700 ring-1 ring-red-300 dark:bg-red-900/40 dark:text-red-400 dark:ring-red-700',
    inactive: 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]',
  },
  Member: {
    active: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-700',
    inactive: 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]',
  },
  Contributor: {
    active: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-700',
    inactive: 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]',
  },
  Viewer: {
    active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-400 dark:ring-emerald-700',
    inactive: 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]',
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

// --- Non-admin card ---

function AdminRequiredCard() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
        <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Fabric Admin Role Required
      </h2>
      <p className="text-sm text-[var(--text-secondary)]">
        The Security page uses Admin APIs that require the Fabric Admin role. Ask
        your Microsoft 365 or Fabric administrator to assign this role.
      </p>
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 text-left">
        <h3 className="text-xs font-medium uppercase text-[var(--text-secondary)]">
          Setup Steps
        </h3>
        <ol className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
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
        className="inline-flex items-center gap-1 text-sm text-[var(--brand-primary)]"
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

  useEffect(() => {
    if (isAdmin === null) void checkAdminAccess();
    if (workspaces.length === 0) void fetchWorkspaces();
  }, [isAdmin, checkAdminAccess, workspaces.length, fetchWorkspaces]);

  const handleScanAll = useCallback(() => {
    const ids = workspaces.map((w) => w.id);
    void fetchAllWorkspaceUsers(ids);
  }, [workspaces, fetchAllWorkspaceUsers]);

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

    const directUsers = userSummaries.filter((u) => u.principalType === 'User');
    const groups = userSummaries.filter((u) => u.principalType === 'Group');
    const spns = userSummaries.filter((u) => u.principalType === 'ServicePrincipal');

    // Collect all transitive user UPNs from resolved groups
    const allTransitiveUpns = new Set<string>();
    let totalTransitive = 0;
    for (const g of groups) {
      const resolved = resolvedGroups[g.email];
      if (resolved?.members) {
        for (const m of resolved.members) {
          allTransitiveUpns.add(m.userPrincipalName);
        }
        totalTransitive += resolved.members.length;
      }
    }

    // Unique users = direct users + transitive users (deduplicated)
    const allUniqueUpns = new Set<string>();
    for (const u of directUsers) allUniqueUpns.add(u.email);
    for (const upn of allTransitiveUpns) allUniqueUpns.add(upn);

    const duplicates = directUsers.length + totalTransitive - allUniqueUpns.size;

    // Groups with Admin role
    const groupsWithAdmin = groups
      .filter((g) => g.assignments.some((a) => a.role === 'Admin'))
      .map((g) => g.displayName);

    return {
      directUsers: directUsers.length,
      groups: groups.length,
      transitiveUsers: totalTransitive,
      servicePrincipals: spns.length,
      uniqueUsers: allUniqueUpns.size,
      duplicates: Math.max(0, duplicates),
      groupsWithAdminRole: groupsWithAdmin,
    };
  }, [hasScanned, userSummaries, resolvedGroups]);

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

  // Role distribution data
  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const users of Object.values(workspaceUsers)) {
      for (const u of users) {
        const role = u.workspaceAccessDetails.workspaceRole;
        counts[role] = (counts[role] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);
  }, [workspaceUsers]);

  // --- Search, filter, sort, pagination state ---

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
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 text-[var(--text-tertiary)]" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 text-[var(--brand-primary)]" />
      : <ArrowDown className="h-3 w-3 text-[var(--brand-primary)]" />;
  }

  // Still checking admin status
  if (isAdmin === null || (loading && !scanProgress)) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-7 w-40 animate-pulse rounded bg-[var(--surface-secondary)]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[var(--surface-secondary)]" />
        <div className="h-48 animate-pulse rounded-lg bg-[var(--surface-secondary)]" />
      </div>
    );
  }

  // Not admin
  if (isAdmin === false) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Security
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
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
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Security
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Role assignments and access governance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasScanned && (
            <>
              <button
                onClick={handleExportEffectiveAccess}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)]"
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
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
          >
            <ScanSearch className="h-3.5 w-3.5" />
            {hasScanned ? 'Re-scan All' : 'Scan All'}
          </button>
        </div>
      </div>

      {/* Scan progress */}
      {scanProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Scanning workspace users... ({scanProgress.completed}/
              {scanProgress.total})
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)]">
              Rate limit: {ADMIN_RATE_LIMIT} req/hr
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-secondary)]">
            <div
              className="h-full rounded-full bg-[var(--brand-primary)] transition-all"
              style={{
                width: `${(scanProgress.completed / scanProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Unable to complete security scan. Some workspaces may have been
            skipped.
          </div>
          <button
            onClick={handleScanAll}
            className="shrink-0 rounded-md bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
          >
            Retry
          </button>
        </div>
      )}

      {/* Pre-scan prompt */}
      {!hasScanned && !scanProgress && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-8 text-center">
          <ScanSearch className="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Click <strong>Scan All</strong> to fetch user role assignments across
            all {workspaces.length} workspaces.
          </p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Admin APIs are rate-limited to {ADMIN_RATE_LIMIT} requests per hour.
          </p>
        </div>
      )}

      {/* Results */}
      {hasScanned && (
        <>
          {/* Effective Access Card */}
          {effectiveAccessSummary && (
            <EffectiveAccessCard summary={effectiveAccessSummary} />
          )}

          {/* Over-permissioned alert */}
          {overPermissioned.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Over-Permissioned Users
                </h3>
              </div>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400/80">
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
                      className="text-xs text-red-700 dark:text-red-400"
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

          {/* Role distribution chart + User access table */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Role distribution chart */}
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 lg:col-span-2">
              <h2 className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                Role Distribution
              </h2>
              {roleDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={roleDistribution}
                    margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                  >
                    <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(value?: number) => [
                        value ?? 0,
                        'Assignments',
                      ]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
                      {roleDistribution.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={ROLE_COLORS[entry.role] ?? CHART_FALLBACK_COLOR}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-[var(--text-tertiary)]">
                  No data
                </div>
              )}
            </div>

            {/* User access summary table */}
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] lg:col-span-3">
              {/* Header */}
              <h2 className="border-b border-[var(--border-default)] px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                User Access Summary
              </h2>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 border-b border-[var(--border-default)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--text-tertiary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Principals</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {summaryStats.totalUsers}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[var(--text-tertiary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Assignments</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {summaryStats.totalAssignments}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">By Role</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {ALL_ROLES.map((role) => (
                      <span key={role} className="flex items-center gap-1 text-xs">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: ROLE_COLORS[role] }}
                        />
                        <span className="text-[var(--text-secondary)]">
                          {summaryStats.roleCounts[role] ?? 0}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toolbar: search + role filter chips */}
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border-default)] px-4 py-3">
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
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
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
                      className="ml-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                    <tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]">
                      <th className="w-16 px-4 py-2 text-left text-xs font-medium uppercase text-[var(--text-secondary)]">
                        Type
                      </th>
                      <th
                        onClick={() => handleSort('displayName')}
                        className="cursor-pointer select-none px-4 py-2 text-left text-xs font-medium uppercase text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                      >
                        <span className="flex items-center gap-1.5">
                          Name {renderSortIcon('displayName')}
                        </span>
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        className="cursor-pointer select-none px-4 py-2 text-left text-xs font-medium uppercase text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                      >
                        <span className="flex items-center gap-1.5">
                          Email {renderSortIcon('email')}
                        </span>
                      </th>
                      <th
                        onClick={() => handleSort('assignmentCount')}
                        className="cursor-pointer select-none px-4 py-2 text-left text-xs font-medium uppercase text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                      >
                        <span className="flex items-center gap-1.5">
                          Workspaces &amp; Roles {renderSortIcon('assignmentCount')}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {paginatedUsers.map((u) => {
                      const TypeIcon = TYPE_ICONS[u.principalType];
                      const isGroup = u.principalType === 'Group';
                      const isExpanded = expandedGroups.has(u.email);
                      const resolved = isGroup ? resolvedGroups[u.email] : undefined;

                      return (
                        <GroupWrapper key={u.email}>
                          <tr
                            className={isGroup ? 'cursor-pointer transition-colors hover:bg-[var(--surface-tertiary)]' : ''}
                            onClick={isGroup ? () => toggleGroupExpansion(u.email, u.displayName) : undefined}
                          >
                            <td className="whitespace-nowrap px-4 py-2.5">
                              <div className="flex items-center gap-1" title={TYPE_LABELS[u.principalType]}>
                                <TypeIcon className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                                <span className="text-[10px] text-[var(--text-tertiary)]">
                                  {TYPE_LABELS[u.principalType]}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 font-medium text-[var(--text-primary)]">
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
                            <td className="whitespace-nowrap px-4 py-2.5 text-[var(--text-secondary)]">
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
                                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors hover:ring-1 ${
                                      a.role === 'Admin'
                                        ? 'bg-red-100 text-red-700 hover:ring-red-300 dark:bg-red-900/30 dark:text-red-400'
                                        : a.role === 'Member'
                                          ? 'bg-blue-100 text-blue-700 hover:ring-blue-300 dark:bg-blue-900/30 dark:text-blue-400'
                                          : a.role === 'Contributor'
                                            ? 'bg-amber-100 text-amber-700 hover:ring-amber-300 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'bg-emerald-100 text-emerald-700 hover:ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400'
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
                          className="px-4 py-12 text-center text-[var(--text-secondary)]"
                        >
                          No users match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer: pagination + count */}
              <div className="flex items-center justify-between border-t border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-2">
                <span className="text-xs text-[var(--text-secondary)]">
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
                      className="rounded-md p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-tertiary)] disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {getPageNumbers(safePage, totalPages).map((p, i) =>
                      p === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-1 text-xs text-[var(--text-tertiary)]"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
                            p === safePage
                              ? 'bg-[var(--brand-primary)] text-white'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]'
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage(safePage + 1)}
                      className="rounded-md p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-tertiary)] disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
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
