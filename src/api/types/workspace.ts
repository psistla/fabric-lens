export type WorkspaceType = 'Personal' | 'Workspace';

export type WorkspaceState = 'Active' | 'Deleted' | 'Removing';

export interface OneLakeEndpoints {
  blobEndpoint: string;
  dfsEndpoint: string;
}

export interface WorkspaceIdentity {
  applicationId: string;
  servicePrincipalId: string;
}

export interface Workspace {
  id: string;
  displayName: string;
  description: string;
  type: WorkspaceType;
  state: WorkspaceState;
  capacityId?: string;
  domainId?: string;
  capacityAssignmentProgress?: string;
  capacityRegion?: string;
  workspaceIdentity?: WorkspaceIdentity;
  oneLakeEndpoints?: OneLakeEndpoints;
}
