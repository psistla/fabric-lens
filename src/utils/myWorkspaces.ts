import type { WorkspaceUser } from '@/api/types/admin';

/**
 * Returns the set of workspace IDs where userEmail has an explicit role assignment.
 * Matching is case-insensitive by UPN. SPNs (identified by aadAppId) are excluded
 * since this is a personal filter for human users only.
 */
export function getMyWorkspaceIds(
  userEmail: string | null,
  workspaceUsers: Record<string, WorkspaceUser[]>,
): Set<string> {
  if (!userEmail) return new Set();
  const needle = userEmail.toLowerCase();
  const ids = new Set<string>();
  for (const [wsId, users] of Object.entries(workspaceUsers)) {
    if (!Array.isArray(users)) continue;
    for (const u of users) {
      const upn = u.userDetails.userPrincipalName;
      if (upn && upn.toLowerCase() === needle) {
        ids.add(wsId);
        break;
      }
    }
  }
  return ids;
}
