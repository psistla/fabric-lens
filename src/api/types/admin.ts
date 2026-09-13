import type { PrincipalType, GroupType } from './roleAssignment';

export type { PrincipalType };

export type WorkspaceRole = 'Admin' | 'Member' | 'Contributor' | 'Viewer';

export interface AdminWorkspace {
  id: string;
  name: string;
  type: string;
  state: string;
  capacityId?: string;
  domainId?: string;
}

export interface UserDetails {
  userPrincipalName: string | null;
  displayName: string;
  principalType?: PrincipalType;
}

export interface WorkspaceAccessDetails {
  workspaceRole: WorkspaceRole;
}

// Raw shape of GET /admin/workspaces/{id}/users; normalised to WorkspaceUser in admin.ts.
export interface WorkspaceAccessDetailsResponse {
  accessDetails?: {
    principal: {
      id: string;
      displayName: string;
      type: PrincipalType;
      userDetails?: { userPrincipalName: string };
      groupDetails?: { groupType: GroupType };
      servicePrincipalDetails?: { aadAppId: string };
    };
    workspaceAccessDetails: WorkspaceAccessDetails;
  }[];
}

export interface WorkspaceUser {
  id?: string;
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
