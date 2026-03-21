export type FabricItemType =
  | 'Dashboard'
  | 'DataPipeline'
  | 'Dataflow'
  | 'Eventstream'
  | 'KQLDatabase'
  | 'KQLQueryset'
  | 'Lakehouse'
  | 'MLExperiment'
  | 'MLModel'
  | 'MirroredDatabase'
  | 'MirroredWarehouse'
  | 'Notebook'
  | 'PaginatedReport'
  | 'Pipeline'
  | 'Report'
  | 'SQLEndpoint'
  | 'SemanticModel'
  | 'SparkJobDefinition'
  | 'Warehouse';

export interface ItemTag {
  id: string;
  displayName?: string;
}

export interface Item {
  id: string;
  displayName: string;
  description: string;
  type: FabricItemType;
  workspaceId: string;
  folderId?: string;
  tags?: ItemTag[];
}
