import type { PrincipalType, ResolvedGroup, EffectiveAccessSummary } from '@/api/types/admin';

export interface UserSummary {
  displayName: string;
  email: string;
  principalType: PrincipalType;
  assignments: { workspaceId: string; workspaceName: string; role: string }[];
}

export function computeEffectiveAccess(
  userSummaries: UserSummary[],
  resolvedGroups: Record<string, ResolvedGroup>,
): EffectiveAccessSummary {
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
  const groupsWithAdminRole = groups
    .filter((g) => g.assignments.some((a) => a.role === 'Admin'))
    .map((g) => g.displayName);

  return {
    directUsers: directUsers.length,
    groups: groups.length,
    transitiveUsers: totalTransitive,
    servicePrincipals: spns.length,
    uniqueUsers: allUniqueUpns.size,
    duplicates: Math.max(0, duplicates),
    groupsWithAdminRole,
  };
}
