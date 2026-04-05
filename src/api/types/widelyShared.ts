export interface WidelySharedArtifactSharer {
  displayName: string;
  emailAddress: string;
  identifier: string;
  graphId: string;
  principalType: 'None' | 'User' | 'Group' | 'App';
}

export interface WidelySharedArtifact {
  artifactId: string;
  displayName: string;
  artifactType: 'Report' | 'PaginatedReport' | 'Dashboard' | 'Dataset' | 'Dataflow';
  accessRight: string;
  shareType: string;
  sharer?: WidelySharedArtifactSharer; // optional — API may omit for system-generated or migrated links
}

export interface WidelySharedResponse {
  artifactAccessEntities: WidelySharedArtifact[];
  continuationToken?: string;
  continuationUri?: string;
}
