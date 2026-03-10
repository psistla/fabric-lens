export interface AdminWorkspace {
  id: string;
  name: string;
  type: string;
  state: string;
  capacityId?: string;
  domainId?: string;
}

export interface UserDetails {
  userPrincipalName: string;
  displayName: string;
}

export interface WorkspaceAccessDetails {
  workspaceRole: string;
}

export interface WorkspaceUser {
  userDetails: UserDetails;
  workspaceAccessDetails: WorkspaceAccessDetails;
}

export type AdminResult<T> =
  | { success: true; data: T }
  | { success: false; reason: 'access_denied' | 'error'; message: string };
