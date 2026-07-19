// Fabric item types. The authoritative enum lives in the Fabric Core REST API
// ("Items - List Items" > ItemType), which explicitly notes "additional item
// types may be added over time". So this is an OPEN union: KnownItemType gives
// autocomplete + documents the current GA catalogue, while `(string & {})` lets
// any type the API returns flow through without a code change. Display code
// (ItemTypeBadge, itemTypeToken) degrades unmapped types gracefully.
// Source: https://learn.microsoft.com/rest/api/fabric/core/items/list-items (2026-07)

export type KnownItemType =
  // Power BI
  | 'Dashboard'
  | 'Report'
  | 'SemanticModel'
  | 'PaginatedReport'
  | 'Datamart'
  // Data engineering
  | 'Lakehouse'
  | 'Notebook'
  | 'SparkJobDefinition'
  | 'Environment'
  // Data integration
  | 'DataPipeline'
  | 'Dataflow'
  | 'CopyJob'
  | 'MountedDataFactory'
  | 'ApacheAirflowJob'
  | 'DataBuildToolJob'
  // Data warehouse / databases / mirroring
  | 'Warehouse'
  | 'WarehouseSnapshot'
  | 'SQLEndpoint'
  | 'SQLDatabase'
  | 'MirroredWarehouse'
  | 'MirroredDatabase'
  | 'MirroredAzureDatabricksCatalog'
  | 'MirroredCatalog'
  | 'SnowflakeDatabase'
  | 'CosmosDBDatabase'
  | 'AzureDatabricksStorage'
  // Real-time intelligence
  | 'Eventhouse'
  | 'Eventstream'
  | 'KQLDatabase'
  | 'KQLQueryset'
  | 'KQLDashboard'
  | 'Reflex'
  | 'EventSchemaSet'
  | 'AnomalyDetector'
  // AI / data science
  | 'DataAgent'
  | 'MLExperiment'
  | 'MLModel'
  | 'GraphModel'
  | 'GraphQuerySet'
  | 'GraphQLApi'
  | 'UserDataFunction'
  // Digital twin / other workloads
  | 'DigitalTwinBuilder'
  | 'DigitalTwinBuilderFlow'
  | 'Map'
  | 'Ontology'
  | 'OperationsAgent'
  | 'VariableLibrary'
  | 'AppBackend'
  | 'OrgApp'
  | 'OrgAppAudience'
  // Legacy alias kept for existing demo data; not in the current API enum.
  | 'Pipeline';

export type FabricItemType = KnownItemType | (string & {});

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
