import type { PrincipalType, GroupType } from './roleAssignment';

export type WorkspaceRole = 'Admin' | 'Member' | 'Contributor' | 'Viewer';

export interface AdminWorkspace {
  id: string;
  name: string;
  type: string;
  state: string;
  capacityId?: string;
  domainId?: string;
}

export type PrincipalType = 'User' | 'Group' | 'ServicePrincipal';

export interface UserDetails {
  userPrincipalName: string;
  displayName: string;
  principalType?: PrincipalType;
}

export interface WorkspaceAccessDetails {
  workspaceRole: WorkspaceRole;
}

export interface WorkspaceUser {
  userDetails: UserDetails;
  workspaceAccessDetails: WorkspaceAccessDetails;
  principalType?: PrincipalType;
  groupDetails?: { groupType: GroupType };
  servicePrincipalDetails?: { aadAppId: string };
}

export interface GroupMember {
  displayName: string;
  userPrincipalName: string;
  jobTitle?: string;
}

export interface ResolvedGroup {
  groupId: string;
  displayName: string;
  memberCount: number | null;
  members: GroupMember[];
  loading: boolean;
  error: string | null;
}

export interface EffectiveAccessSummary {
  directUsers: number;
  groups: number;
  transitiveUsers: number;
  servicePrincipals: number;
  uniqueUsers: number;
  duplicates: number;
  groupsWithAdminRole: string[];
}

export type AdminResult<T> =
  | { success: true; data: T }
  | { success: false; reason: 'access_denied' | 'error'; message: string };
