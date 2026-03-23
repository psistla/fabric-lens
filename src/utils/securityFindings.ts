// ---------------------------------------------------------------------------
// Security findings — pure derivation from scan data, no API calls
// ---------------------------------------------------------------------------

import type { ResolvedGroup } from '@/api/types/admin';
import type { UserSummary } from '@/utils/effectiveAccess';
import {
  ADMIN_ROLE_WARNING_THRESHOLD,
  GRADE_THRESHOLDS,
  ADMIN_ASSIGNMENT_PCT_THRESHOLD,
} from '@/utils/constants';

export type FindingSeverity = 'critical' | 'warning' | 'info';

export interface SecurityFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  detail: string;
  /** Affected principal emails or workspace IDs, used for the expand list */
  affectedItems: { label: string; sublabel?: string }[];
}

interface WorkspaceAdminMap {
  [workspaceId: string]: { name: string; adminCount: number; hasAnyAdmin: boolean };
}

function buildWorkspaceAdminMap(
  userSummaries: UserSummary[],
): WorkspaceAdminMap {
  const map: WorkspaceAdminMap = {};

  for (const u of userSummaries) {
    for (const a of u.assignments) {
      if (!map[a.workspaceId]) {
        map[a.workspaceId] = { name: a.workspaceName, adminCount: 0, hasAnyAdmin: false };
      }
      if (a.role === 'Admin') {
        map[a.workspaceId].adminCount++;
        map[a.workspaceId].hasAnyAdmin = true;
      }
    }
  }
  return map;
}

export function deriveSecurityFindings(
  userSummaries: UserSummary[],
  resolvedGroups: Record<string, ResolvedGroup>,
): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const wsMap = buildWorkspaceAdminMap(userSummaries);

  // --- Critical: Workspaces with exactly 1 admin (SPOF) ---
  const spofWorkspaces = Object.values(wsMap).filter((ws) => ws.adminCount === 1);
  if (spofWorkspaces.length > 0) {
    findings.push({
      id: 'spof-single-admin',
      severity: 'critical',
      title: `${spofWorkspaces.length} workspace${spofWorkspaces.length > 1 ? 's' : ''} with a single admin`,
      detail: 'If this admin loses access, the workspace becomes unmanageable. Add a second admin.',
      affectedItems: spofWorkspaces.map((ws) => ({ label: ws.name })),
    });
  }

  // --- Critical: Workspaces with no admins ---
  const noAdminWorkspaces = Object.values(wsMap).filter((ws) => !ws.hasAnyAdmin);
  if (noAdminWorkspaces.length > 0) {
    findings.push({
      id: 'no-admin-workspace',
      severity: 'critical',
      title: `${noAdminWorkspaces.length} workspace${noAdminWorkspaces.length > 1 ? 's' : ''} with no admin assigned`,
      detail: 'Workspaces without an admin cannot be managed via the Fabric portal. Assign at least one admin.',
      affectedItems: noAdminWorkspaces.map((ws) => ({ label: ws.name })),
    });
  }

  // --- Critical: SPNs with Admin role ---
  const spnAdmins = userSummaries.filter(
    (u) =>
      (u.principalType === 'ServicePrincipal' || u.principalType === 'ServicePrincipalProfile') &&
      u.assignments.some((a) => a.role === 'Admin'),
  );
  if (spnAdmins.length > 0) {
    findings.push({
      id: 'spn-admin-role',
      severity: 'critical',
      title: `${spnAdmins.length} service principal${spnAdmins.length > 1 ? 's' : ''} with Admin role`,
      detail: 'Automated principals with Admin access have no MFA protection. Downgrade to Member or Contributor where possible.',
      affectedItems: spnAdmins.map((u) => ({
        label: u.displayName,
        sublabel: `Admin on ${u.assignments.filter((a) => a.role === 'Admin').length} workspace${u.assignments.filter((a) => a.role === 'Admin').length > 1 ? 's' : ''}`,
      })),
    });
  }

  // --- Warning: Over-permissioned users (Admin on ≥ threshold workspaces) ---
  const overPermissioned = userSummaries.filter(
    (u) =>
      u.principalType === 'User' &&
      u.assignments.filter((a) => a.role === 'Admin').length >= ADMIN_ROLE_WARNING_THRESHOLD,
  );
  if (overPermissioned.length > 0) {
    findings.push({
      id: 'over-permissioned-users',
      severity: 'warning',
      title: `${overPermissioned.length} user${overPermissioned.length > 1 ? 's' : ''} with Admin on ${ADMIN_ROLE_WARNING_THRESHOLD}+ workspaces`,
      detail: `Broad admin access increases blast radius if an account is compromised. Review and reduce to only required workspaces.`,
      affectedItems: overPermissioned.map((u) => ({
        label: u.displayName,
        sublabel: u.email,
      })),
    });
  }

  // --- Warning: Groups with Admin role and unresolved membership ---
  const unresolvedAdminGroups = userSummaries.filter(
    (u) =>
      u.principalType === 'Group' &&
      u.assignments.some((a) => a.role === 'Admin') &&
      !resolvedGroups[u.email]?.members?.length,
  );
  if (unresolvedAdminGroups.length > 0) {
    findings.push({
      id: 'unresolved-admin-groups',
      severity: 'warning',
      title: `${unresolvedAdminGroups.length} group${unresolvedAdminGroups.length > 1 ? 's' : ''} with Admin role — membership unknown`,
      detail: 'Expand these groups to verify who has effective admin access. Unknown group membership is an audit gap.',
      affectedItems: unresolvedAdminGroups.map((u) => ({
        label: u.displayName,
        sublabel: `Admin on ${u.assignments.filter((a) => a.role === 'Admin').length} workspace${u.assignments.filter((a) => a.role === 'Admin').length > 1 ? 's' : ''}`,
      })),
    });
  }

  // --- Warning: Workspaces with too many admins (> 5) ---
  const overAdministered = Object.values(wsMap).filter((ws) => ws.adminCount > 5);
  if (overAdministered.length > 0) {
    findings.push({
      id: 'over-administered-workspaces',
      severity: 'warning',
      title: `${overAdministered.length} workspace${overAdministered.length > 1 ? 's' : ''} with more than 5 admins`,
      detail: 'Excessive admins make access reviews impractical. Apply least-privilege and reduce to essential owners.',
      affectedItems: overAdministered.map((ws) => ({
        label: ws.name,
        sublabel: `${ws.adminCount} admins`,
      })),
    });
  }

  // --- Info: Any unresolved groups (any role) ---
  const unresolvedGroups = userSummaries.filter(
    (u) =>
      u.principalType === 'Group' &&
      !resolvedGroups[u.email]?.members?.length,
  );
  // Only emit info if there are unresolved groups not already flagged as warning above
  const unresolvedInfoOnly = unresolvedGroups.filter(
    (u) => !u.assignments.some((a) => a.role === 'Admin'),
  );
  if (unresolvedInfoOnly.length > 0) {
    findings.push({
      id: 'unresolved-groups',
      severity: 'info',
      title: `${unresolvedInfoOnly.length} group${unresolvedInfoOnly.length > 1 ? 's' : ''} with unexpanded membership`,
      detail: 'Expand groups in the table below to see effective member counts and verify least-privilege compliance.',
      affectedItems: unresolvedInfoOnly.map((u) => ({ label: u.displayName })),
    });
  }

  // Sort: critical → warning → info
  const order: Record<FindingSeverity, number> = { critical: 0, warning: 1, info: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return findings;
}

// ---------------------------------------------------------------------------
// Security Posture Score
// ---------------------------------------------------------------------------

export interface PostureCheck {
  id: string;
  label: string;
  earned: number;
  max: number;
  /** One-line status shown next to the check */
  status: string;
}

export interface SecurityPosture {
  score: number;
  grade: string;
  checks: PostureCheck[];
}

function postureGrade(score: number): string {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

export function computeSecurityPosture(
  userSummaries: UserSummary[],
  resolvedGroups: Record<string, ResolvedGroup>,
): SecurityPosture {
  const wsMap = buildWorkspaceAdminMap(userSummaries);
  const allWorkspaces = Object.values(wsMap);
  const totalWs = allWorkspaces.length;

  const checks: PostureCheck[] = [];

  // 1. No SPOF workspaces (25 pts) — partial by fraction of safe workspaces
  const spofCount = allWorkspaces.filter((ws) => ws.adminCount === 1).length;
  const safeWs = totalWs - spofCount;
  const spofEarned = totalWs > 0 ? Math.round(25 * (safeWs / totalWs)) : 25;
  checks.push({
    id: 'no-spof',
    label: 'Single-admin workspaces (SPOF)',
    earned: spofEarned,
    max: 25,
    status: spofCount === 0
      ? 'All workspaces have ≥2 admins'
      : `${spofCount} of ${totalWs} workspace${spofCount > 1 ? 's' : ''} at risk`,
  });

  // 2. No SPN admins (20 pts) — binary
  const spnAdmins = userSummaries.filter(
    (u) =>
      (u.principalType === 'ServicePrincipal' || u.principalType === 'ServicePrincipalProfile') &&
      u.assignments.some((a) => a.role === 'Admin'),
  );
  checks.push({
    id: 'no-spn-admin',
    label: 'Service principals with Admin role',
    earned: spnAdmins.length === 0 ? 20 : 0,
    max: 20,
    status: spnAdmins.length === 0
      ? 'No SPNs with Admin access'
      : `${spnAdmins.length} SPN${spnAdmins.length > 1 ? 's' : ''} with Admin access`,
  });

  // 3. No over-permissioned users (20 pts) — binary
  const overPermissioned = userSummaries.filter(
    (u) =>
      u.principalType === 'User' &&
      u.assignments.filter((a) => a.role === 'Admin').length >= ADMIN_ROLE_WARNING_THRESHOLD,
  );
  checks.push({
    id: 'no-over-permissioned',
    label: `Users with Admin on ${ADMIN_ROLE_WARNING_THRESHOLD}+ workspaces`,
    earned: overPermissioned.length === 0 ? 20 : 0,
    max: 20,
    status: overPermissioned.length === 0
      ? 'No over-permissioned users'
      : `${overPermissioned.length} user${overPermissioned.length > 1 ? 's' : ''} exceed threshold`,
  });

  // 4. Admin groups resolved (15 pts) — partial
  const adminGroups = userSummaries.filter(
    (u) => u.principalType === 'Group' && u.assignments.some((a) => a.role === 'Admin'),
  );
  const resolvedAdminGroups = adminGroups.filter((u) => resolvedGroups[u.email]?.members?.length);
  const groupEarned = adminGroups.length === 0
    ? 15
    : Math.round(15 * (resolvedAdminGroups.length / adminGroups.length));
  checks.push({
    id: 'admin-groups-resolved',
    label: 'Admin groups with verified membership',
    earned: groupEarned,
    max: 15,
    status: adminGroups.length === 0
      ? 'No groups with Admin role'
      : resolvedAdminGroups.length === adminGroups.length
        ? `All ${adminGroups.length} admin group${adminGroups.length > 1 ? 's' : ''} verified`
        : `${resolvedAdminGroups.length} of ${adminGroups.length} groups verified`,
  });

  // 5. Healthy admin/member ratio (10 pts) — binary
  const totalAssignments = userSummaries.reduce((sum, u) => sum + u.assignments.length, 0);
  const adminAssignments = userSummaries.reduce(
    (sum, u) => sum + u.assignments.filter((a) => a.role === 'Admin').length,
    0,
  );
  const adminPct = totalAssignments > 0 ? (adminAssignments / totalAssignments) * 100 : 0;
  const ratioHealthy = adminPct < ADMIN_ASSIGNMENT_PCT_THRESHOLD;
  checks.push({
    id: 'admin-ratio',
    label: 'Admin assignment ratio',
    earned: ratioHealthy ? 10 : 0,
    max: 10,
    status: `${Math.round(adminPct)}% of assignments are Admin${ratioHealthy ? ' (healthy)' : ` — target <${ADMIN_ASSIGNMENT_PCT_THRESHOLD}%`}`,
  });

  // 6. No admin-less workspaces (10 pts) — binary
  const noAdminWs = allWorkspaces.filter((ws) => !ws.hasAnyAdmin).length;
  checks.push({
    id: 'no-admin-less',
    label: 'Workspaces without any admin',
    earned: noAdminWs === 0 ? 10 : 0,
    max: 10,
    status: noAdminWs === 0
      ? 'All workspaces have at least 1 admin'
      : `${noAdminWs} workspace${noAdminWs > 1 ? 's' : ''} have no admin`,
  });

  const totalEarned = checks.reduce((sum, c) => sum + c.earned, 0);
  const totalMax = checks.reduce((sum, c) => sum + c.max, 0);
  const score = Math.round((totalEarned / totalMax) * 100);

  return { score, grade: postureGrade(score), checks };
}
