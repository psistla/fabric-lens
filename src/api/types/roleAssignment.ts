import type { WorkspaceRole } from './admin';

// -- Principal types (from Fabric Admin API enrichment) --

export type PrincipalType =
  | 'User'
  | 'Group'
  | 'ServicePrincipal'
  | 'ServicePrincipalProfile';

export type GroupType = 'SecurityGroup' | 'DistributionList' | 'M365Group';

export interface UserPrincipalDetails {
  userPrincipalName: string;
  email?: string;
}

export interface GroupPrincipalDetails {
  groupType: GroupType;
  mailEnabled: boolean;
  securityEnabled: boolean;
}

export interface ServicePrincipalDetails {
  appId: string;
  parentDisplayName?: string;
}

export interface Principal {
  id: string;
  displayName: string;
  type: PrincipalType;
  userDetails?: UserPrincipalDetails;
  groupDetails?: GroupPrincipalDetails;
  servicePrincipalDetails?: ServicePrincipalDetails;
}

export interface RoleAssignment {
  id: string;
  principal: Principal;
  role: WorkspaceRole;
}

// -- Graph API response types (group membership resolution) --

export interface GroupMember {
  id: string;
  displayName: string;
  userPrincipalName: string;
  jobTitle?: string;
}

export interface ResolvedGroup {
  groupId: string;
  displayName: string;
  groupType: GroupType;
  memberCount: number;
  members: GroupMember[];
  loading: boolean;
  error: string | null;
}

// -- Computed summary --

export interface EffectiveAccessSummary {
  directUsers: number;
  groups: number;
  servicePrincipals: number;
  transitiveUsers: number;
  uniqueUsers: number;
}

// -- Graph API OData response shapes --

export interface ODataPagedResponse<T> {
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: T[];
}

export interface GraphUser {
  id: string;
  displayName: string;
  userPrincipalName: string;
  jobTitle: string | null;
}
