// -- Principal types (from Fabric Admin API enrichment) --

export type PrincipalType =
  | 'User'
  | 'Group'
  | 'ServicePrincipal'
  | 'ServicePrincipalProfile';

export type GroupType = 'SecurityGroup' | 'DistributionList' | 'M365Group';

// -- Graph API response shapes (group membership resolution) --

export interface GroupMember {
  id: string;
  displayName: string;
  userPrincipalName: string;
  jobTitle?: string;
}

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
