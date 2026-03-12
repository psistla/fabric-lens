import type { Workspace } from './types/workspace';
import type { Item } from './types/item';
import type { Capacity } from './types/capacity';
import type { WorkspaceUser, GroupMember, ResolvedGroup } from './types/admin';

export const isDemoMode =
  !import.meta.env.VITE_MSAL_CLIENT_ID ||
  import.meta.env.VITE_MSAL_CLIENT_ID === 'demo';

export const mockCapacities: Capacity[] = [
  { id: 'cap-1', displayName: 'Production F64', sku: 'F64', region: 'West US', state: 'Active' },
  { id: 'cap-2', displayName: 'Dev F8', sku: 'F8', region: 'East US', state: 'Active' },
  { id: 'cap-3', displayName: 'Analytics F32', sku: 'F32', region: 'North Europe', state: 'Active' },
];

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    displayName: 'Sales Analytics',
    description: 'Sales team dashboards and data pipelines',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    domainId: 'domain-1',
    oneLakeEndpoints: {
      blobEndpoint: 'https://onelake.blob.fabric.microsoft.com/sales-analytics',
      dfsEndpoint: 'https://onelake.dfs.fabric.microsoft.com/sales-analytics',
    },
    workspaceIdentity: {
      applicationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      servicePrincipalId: 'sp-001-sales-analytics',
    },
  },
  {
    id: 'ws-2',
    displayName: 'Finance Reporting',
    description: 'Financial reports and budgeting models',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
  },
  {
    id: 'ws-3',
    displayName: 'Engineering Metrics',
    description: 'CI/CD pipelines and engineering KPIs',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
    workspaceIdentity: {
      applicationId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      servicePrincipalId: 'sp-002-eng-metrics',
    },
  },
  {
    id: 'ws-4',
    displayName: 'Marketing Insights',
    description: 'Campaign analytics and customer segmentation',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-3',
    capacityRegion: 'North Europe',
  },
  {
    id: 'ws-5',
    displayName: 'HR Dashboard',
    description: '',
    type: 'Workspace',
    state: 'Active',
  },
  {
    id: 'ws-6',
    displayName: 'My Workspace',
    description: 'Personal workspace',
    type: 'Personal',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
  },
  {
    id: 'ws-7',
    displayName: 'Legacy Reports',
    description: 'Deprecated workspace scheduled for removal',
    type: 'Workspace',
    state: 'Removing',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
  },
  {
    id: 'ws-8',
    displayName: 'Customer Support',
    description: 'Support ticket analytics and SLA tracking',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
    domainId: 'domain-2',
    workspaceIdentity: {
      applicationId: 'c3d4e5f6-a7b8-9012-cdef-234567890123',
      servicePrincipalId: 'sp-003-support',
    },
  },
  {
    id: 'ws-9',
    displayName: 'Data Science Lab',
    description: 'ML experimentation and model development',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-3',
    capacityRegion: 'North Europe',
  },
  {
    id: 'ws-10',
    displayName: 'Supply Chain',
    description: 'Logistics and inventory optimization',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    domainId: 'domain-1',
  },
  {
    id: 'ws-11',
    displayName: 'Executive Dashboards',
    description: 'C-suite KPI tracking and board reports',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    workspaceIdentity: {
      applicationId: 'd4e5f6a7-b8c9-0123-defa-345678901234',
      servicePrincipalId: 'sp-004-exec',
    },
  },
  {
    id: 'ws-12',
    displayName: 'Product Analytics',
    description: 'User behavior and product usage metrics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
  },
  {
    id: 'ws-13',
    displayName: 'Compliance Monitoring',
    description: 'Regulatory compliance and audit trails',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-3',
    capacityRegion: 'North Europe',
    domainId: 'domain-3',
  },
  {
    id: 'ws-14',
    displayName: 'Dev Sandbox',
    description: 'Developer testing workspace',
    type: 'Personal',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
  },
  {
    id: 'ws-15',
    displayName: 'IoT Telemetry',
    description: '',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
  },
];

const itemsMap: Record<string, Item[]> = {
  'ws-1': [
    { id: 'item-1', displayName: 'Sales Lakehouse', description: 'Central data store for sales data', type: 'Lakehouse', workspaceId: 'ws-1' },
    { id: 'item-2', displayName: 'Daily ETL', description: 'Daily ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-1' },
    { id: 'item-3', displayName: 'Revenue Report', description: 'Monthly revenue dashboard', type: 'Report', workspaceId: 'ws-1' },
    { id: 'item-4', displayName: 'Sales Model', description: 'Semantic model for sales data', type: 'SemanticModel', workspaceId: 'ws-1' },
    { id: 'item-5', displayName: 'Forecast Notebook', description: 'ML-based sales forecasting', type: 'Notebook', workspaceId: 'ws-1' },
    { id: 'item-6', displayName: 'Sales Dashboard', description: 'Executive overview', type: 'Dashboard', workspaceId: 'ws-1' },
    { id: 'item-7', displayName: 'SQL Endpoint', description: 'Analytics SQL endpoint', type: 'SQLEndpoint', workspaceId: 'ws-1' },
    { id: 'item-8', displayName: 'Churn Pipeline', description: 'Customer churn prediction', type: 'Pipeline', workspaceId: 'ws-1' },
  ],
  'ws-2': [
    { id: 'item-20', displayName: 'Finance Warehouse', description: 'Financial data warehouse', type: 'Warehouse', workspaceId: 'ws-2' },
    { id: 'item-21', displayName: 'Budget Report', description: 'Quarterly budget report', type: 'Report', workspaceId: 'ws-2' },
    { id: 'item-22', displayName: 'P&L Dashboard', description: 'Profit and loss overview', type: 'Dashboard', workspaceId: 'ws-2' },
    { id: 'item-23', displayName: 'Finance Model', description: 'Core semantic model', type: 'SemanticModel', workspaceId: 'ws-2' },
  ],
  'ws-3': [
    { id: 'item-30', displayName: 'CI/CD Metrics', description: 'Build and deploy tracking', type: 'Report', workspaceId: 'ws-3' },
    { id: 'item-31', displayName: 'Eng Notebook', description: 'Data exploration notebook', type: 'Notebook', workspaceId: 'ws-3' },
    { id: 'item-32', displayName: 'KQL Logs', description: 'Application log analytics', type: 'KQLDatabase', workspaceId: 'ws-3' },
  ],
  'ws-4': [
    { id: 'item-40', displayName: 'Campaign Analytics', description: 'Marketing campaign performance', type: 'Report', workspaceId: 'ws-4' },
    { id: 'item-41', displayName: 'Segment Dataflow', description: 'Customer segmentation flow', type: 'Dataflow', workspaceId: 'ws-4' },
  ],
  'ws-5': [],
  'ws-6': [
    { id: 'item-60', displayName: 'Scratch Notebook', description: 'Quick experiments', type: 'Notebook', workspaceId: 'ws-6' },
  ],
  'ws-7': [
    { id: 'item-70', displayName: 'Old Report', description: 'Legacy monthly report', type: 'PaginatedReport', workspaceId: 'ws-7' },
  ],
  'ws-8': [
    { id: 'item-80', displayName: 'Tickets Lakehouse', description: 'Support ticket data store', type: 'Lakehouse', workspaceId: 'ws-8' },
    { id: 'item-81', displayName: 'SLA Report', description: 'SLA compliance dashboard', type: 'Report', workspaceId: 'ws-8' },
    { id: 'item-82', displayName: 'Ticket ETL', description: 'Zendesk ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-8' },
    { id: 'item-83', displayName: 'Support Model', description: 'Ticket classification model', type: 'SemanticModel', workspaceId: 'ws-8' },
    { id: 'item-84', displayName: 'CSAT Dashboard', description: 'Customer satisfaction overview', type: 'Dashboard', workspaceId: 'ws-8' },
  ],
  'ws-9': [
    { id: 'item-90', displayName: 'ML Experiments', description: 'Model training experiments', type: 'MLExperiment', workspaceId: 'ws-9' },
    { id: 'item-91', displayName: 'Feature Notebook', description: 'Feature engineering', type: 'Notebook', workspaceId: 'ws-9' },
    { id: 'item-92', displayName: 'Prediction Model', description: 'Production ML model', type: 'MLModel', workspaceId: 'ws-9' },
    { id: 'item-93', displayName: 'Training Data', description: 'ML training dataset', type: 'Lakehouse', workspaceId: 'ws-9' },
    { id: 'item-94', displayName: 'Model Report', description: 'Model performance metrics', type: 'Report', workspaceId: 'ws-9' },
    { id: 'item-95', displayName: 'Eval Notebook', description: 'Model evaluation', type: 'Notebook', workspaceId: 'ws-9' },
  ],
  'ws-10': [
    { id: 'item-100', displayName: 'Inventory Warehouse', description: 'Inventory data warehouse', type: 'Warehouse', workspaceId: 'ws-10' },
    { id: 'item-101', displayName: 'Logistics Report', description: 'Shipping and delivery tracking', type: 'Report', workspaceId: 'ws-10' },
    { id: 'item-102', displayName: 'Demand Forecast', description: 'Demand prediction pipeline', type: 'Pipeline', workspaceId: 'ws-10' },
    { id: 'item-103', displayName: 'Supply Dashboard', description: 'Supply chain overview', type: 'Dashboard', workspaceId: 'ws-10' },
  ],
  'ws-11': [
    { id: 'item-110', displayName: 'CEO Dashboard', description: 'Executive KPI dashboard', type: 'Dashboard', workspaceId: 'ws-11' },
    { id: 'item-111', displayName: 'Board Report', description: 'Quarterly board report', type: 'PaginatedReport', workspaceId: 'ws-11' },
    { id: 'item-112', displayName: 'KPI Model', description: 'Cross-functional KPI model', type: 'SemanticModel', workspaceId: 'ws-11' },
    { id: 'item-113', displayName: 'Revenue Dataflow', description: 'Revenue consolidation', type: 'Dataflow', workspaceId: 'ws-11' },
    { id: 'item-114', displayName: 'Exec SQL', description: 'Executive analytics endpoint', type: 'SQLEndpoint', workspaceId: 'ws-11' },
  ],
  'ws-12': [
    { id: 'item-120', displayName: 'Usage Report', description: 'Product usage analytics', type: 'Report', workspaceId: 'ws-12' },
    { id: 'item-121', displayName: 'Funnel Dashboard', description: 'Conversion funnel', type: 'Dashboard', workspaceId: 'ws-12' },
    { id: 'item-122', displayName: 'Event Stream', description: 'User event ingestion', type: 'Eventstream', workspaceId: 'ws-12' },
    { id: 'item-123', displayName: 'Product Lakehouse', description: 'Product telemetry data', type: 'Lakehouse', workspaceId: 'ws-12' },
  ],
  'ws-13': [
    { id: 'item-130', displayName: 'Audit Logs', description: 'Compliance audit trail', type: 'KQLDatabase', workspaceId: 'ws-13' },
    { id: 'item-131', displayName: 'Compliance Report', description: 'Regulatory compliance status', type: 'Report', workspaceId: 'ws-13' },
    { id: 'item-132', displayName: 'Policy Dashboard', description: 'Policy violation tracking', type: 'Dashboard', workspaceId: 'ws-13' },
    { id: 'item-133', displayName: 'Audit Queries', description: 'Compliance KQL queries', type: 'KQLQueryset', workspaceId: 'ws-13' },
    { id: 'item-134', displayName: 'Mirror DB', description: 'Compliance database mirror', type: 'MirroredDatabase', workspaceId: 'ws-13' },
  ],
  'ws-14': [
    { id: 'item-140', displayName: 'Test Notebook', description: 'API testing notebook', type: 'Notebook', workspaceId: 'ws-14' },
    { id: 'item-141', displayName: 'Spark Job', description: 'Test Spark job definition', type: 'SparkJobDefinition', workspaceId: 'ws-14' },
  ],
  'ws-15': [
    { id: 'item-150', displayName: 'Sensor Data', description: 'IoT sensor ingestion', type: 'Eventstream', workspaceId: 'ws-15' },
    { id: 'item-151', displayName: 'Telemetry Lakehouse', description: 'Device telemetry store', type: 'Lakehouse', workspaceId: 'ws-15' },
    { id: 'item-152', displayName: 'Device Dashboard', description: 'IoT device monitoring', type: 'Dashboard', workspaceId: 'ws-15' },
    { id: 'item-153', displayName: 'Alert Pipeline', description: 'Anomaly detection pipeline', type: 'Pipeline', workspaceId: 'ws-15' },
    { id: 'item-154', displayName: 'Mirrored Warehouse', description: 'Warehouse mirror for IoT', type: 'MirroredWarehouse', workspaceId: 'ws-15' },
  ],
};

export function getMockWorkspaceItems(workspaceId: string): Item[] {
  return itemsMap[workspaceId] ?? [];
}

export function getAllMockItems(): Item[] {
  return Object.values(itemsMap).flat();
}

export function getMockAllWorkspaceItems(): Record<string, Item[]> {
  return { ...itemsMap };
}

// --- Mock admin / security data ---

const mockUsers = {
  alice: { userPrincipalName: 'alice@contoso.com', displayName: 'Alice Johnson' },
  bob: { userPrincipalName: 'bob@contoso.com', displayName: 'Bob Smith' },
  carol: { userPrincipalName: 'carol@contoso.com', displayName: 'Carol Williams' },
  dan: { userPrincipalName: 'dan@contoso.com', displayName: 'Dan Brown' },
  eve: { userPrincipalName: 'eve@contoso.com', displayName: 'Eve Martinez' },
  frank: { userPrincipalName: 'frank@contoso.com', displayName: 'Frank Lee' },
};

const mockWorkspaceUsersMap: Record<string, WorkspaceUser[]> = {
  'ws-1': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: mockUsers.dan, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-2': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.dan, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-3': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-4': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.eve, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-5': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.dan, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-6': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Member' } },
  ],
  'ws-7': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-8': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.dan, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-9': [
    { userDetails: mockUsers.bob, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-10': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.dan, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-11': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.eve, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-12': [
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Member' } },
  ],
  'ws-13': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve, workspaceAccessDetails: { workspaceRole: 'Member' } },
  ],
  'ws-14': [
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Admin' } },
  ],
  'ws-15': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
};

// --- Mock groups and service principals ---

const mockGroups: Record<string, { displayName: string; upn: string }> = {
  'grp-eng': { displayName: 'Engineering Team', upn: 'engineering-team@contoso.com' },
  'grp-analysts': { displayName: 'Data Analysts', upn: 'data-analysts@contoso.com' },
  'grp-admins': { displayName: 'Platform Admins', upn: 'platform-admins@contoso.com' },
};

const mockSPNs: Record<string, { displayName: string; upn: string }> = {
  'spn-etl': { displayName: 'ETL Service Account', upn: 'etl-service@contoso.com' },
  'spn-monitor': { displayName: 'Monitoring Bot', upn: 'monitoring-bot@contoso.com' },
};

const mockGroupMembers: Record<string, GroupMember[]> = {
  'grp-eng': [
    { displayName: 'Alice Johnson', userPrincipalName: 'alice@contoso.com', jobTitle: 'Lead Engineer' },
    { displayName: 'Bob Smith', userPrincipalName: 'bob@contoso.com', jobTitle: 'Senior Engineer' },
    { displayName: 'Carol Williams', userPrincipalName: 'carol@contoso.com', jobTitle: 'Data Engineer' },
    { displayName: 'Grace Kim', userPrincipalName: 'grace@contoso.com', jobTitle: 'Software Engineer' },
    { displayName: 'Hiro Tanaka', userPrincipalName: 'hiro@contoso.com', jobTitle: 'DevOps Engineer' },
    { displayName: 'Ivy Chen', userPrincipalName: 'ivy@contoso.com', jobTitle: 'Platform Engineer' },
    { displayName: 'Jake Wilson', userPrincipalName: 'jake@contoso.com', jobTitle: 'Backend Engineer' },
    { displayName: 'Kara Patel', userPrincipalName: 'kara@contoso.com', jobTitle: 'Frontend Engineer' },
    { displayName: 'Leo Garcia', userPrincipalName: 'leo@contoso.com', jobTitle: 'QA Engineer' },
    { displayName: 'Maya Singh', userPrincipalName: 'maya@contoso.com', jobTitle: 'ML Engineer' },
    { displayName: 'Nate Brown', userPrincipalName: 'nate@contoso.com', jobTitle: 'Data Engineer' },
    { displayName: 'Olivia Davis', userPrincipalName: 'olivia@contoso.com', jobTitle: 'Site Reliability Engineer' },
    { displayName: 'Paul Martinez', userPrincipalName: 'paul@contoso.com', jobTitle: 'Software Engineer' },
    { displayName: 'Quinn Taylor', userPrincipalName: 'quinn@contoso.com', jobTitle: 'Infrastructure Engineer' },
    { displayName: 'Rosa Hernandez', userPrincipalName: 'rosa@contoso.com', jobTitle: 'Security Engineer' },
  ],
  'grp-analysts': [
    { displayName: 'Dan Brown', userPrincipalName: 'dan@contoso.com', jobTitle: 'Senior Analyst' },
    { displayName: 'Eve Martinez', userPrincipalName: 'eve@contoso.com', jobTitle: 'Data Analyst' },
    { displayName: 'Frank Lee', userPrincipalName: 'frank@contoso.com', jobTitle: 'Business Analyst' },
    { displayName: 'Sara Adams', userPrincipalName: 'sara@contoso.com', jobTitle: 'Analytics Lead' },
    { displayName: 'Tom Baker', userPrincipalName: 'tom@contoso.com', jobTitle: 'BI Developer' },
    { displayName: 'Uma Patel', userPrincipalName: 'uma@contoso.com', jobTitle: 'Data Scientist' },
    { displayName: 'Vic Nguyen', userPrincipalName: 'vic@contoso.com', jobTitle: 'Reporting Analyst' },
    { displayName: 'Wendy Zhao', userPrincipalName: 'wendy@contoso.com', jobTitle: 'Data Analyst' },
    { displayName: 'Xavier Ross', userPrincipalName: 'xavier@contoso.com', jobTitle: 'Insights Analyst' },
    { displayName: 'Yara Osman', userPrincipalName: 'yara@contoso.com', jobTitle: 'Analytics Engineer' },
    { displayName: 'Zane Cooper', userPrincipalName: 'zane@contoso.com', jobTitle: 'Junior Analyst' },
    { displayName: 'Amy Fischer', userPrincipalName: 'amy@contoso.com', jobTitle: 'Data Analyst' },
  ],
  'grp-admins': [
    { displayName: 'Alice Johnson', userPrincipalName: 'alice@contoso.com', jobTitle: 'Lead Engineer' },
    { displayName: 'Bob Smith', userPrincipalName: 'bob@contoso.com', jobTitle: 'Senior Engineer' },
    { displayName: 'Rosa Hernandez', userPrincipalName: 'rosa@contoso.com', jobTitle: 'Security Engineer' },
  ],
};

// Add groups and SPNs to some workspace assignments
const groupAndSPNAssignments: Record<string, WorkspaceUser[]> = {
  'ws-1': [
    { userDetails: { ...mockGroups['grp-eng'], userPrincipalName: mockGroups['grp-eng'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: { ...mockSPNs['spn-etl'], userPrincipalName: mockSPNs['spn-etl'].upn, principalType: 'ServicePrincipal' }, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-2': [
    { userDetails: { ...mockGroups['grp-analysts'], userPrincipalName: mockGroups['grp-analysts'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-3': [
    { userDetails: { ...mockGroups['grp-eng'], userPrincipalName: mockGroups['grp-eng'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: { ...mockSPNs['spn-monitor'], userPrincipalName: mockSPNs['spn-monitor'].upn, principalType: 'ServicePrincipal' }, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-9': [
    { userDetails: { ...mockGroups['grp-analysts'], userPrincipalName: mockGroups['grp-analysts'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Member' } },
  ],
  'ws-11': [
    { userDetails: { ...mockGroups['grp-admins'], userPrincipalName: mockGroups['grp-admins'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Admin' } },
  ],
  'ws-13': [
    { userDetails: { ...mockSPNs['spn-monitor'], userPrincipalName: mockSPNs['spn-monitor'].upn, principalType: 'ServicePrincipal' }, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
};

// Tag existing users with principalType: 'User'
function tagUsersWithType(users: WorkspaceUser[]): WorkspaceUser[] {
  return users.map((u) => ({
    ...u,
    userDetails: { ...u.userDetails, principalType: u.userDetails.principalType ?? ('User' as const) },
  }));
}

export function getMockWorkspaceUsers(workspaceId: string): WorkspaceUser[] {
  const baseUsers = tagUsersWithType(mockWorkspaceUsersMap[workspaceId] ?? []);
  const extras = groupAndSPNAssignments[workspaceId] ?? [];
  return [...baseUsers, ...extras];
}

export function getMockAllWorkspaceUsers(): Record<string, WorkspaceUser[]> {
  const result: Record<string, WorkspaceUser[]> = {};
  for (const wsId of Object.keys(mockWorkspaceUsersMap)) {
    result[wsId] = getMockWorkspaceUsers(wsId);
  }
  return result;
}

export function getMockGroupMemberCount(groupUpn: string): number {
  const groupId = Object.entries(mockGroups).find(([, g]) => g.upn === groupUpn)?.[0];
  if (!groupId) return 0;
  return mockGroupMembers[groupId]?.length ?? 0;
}

export function getMockGroupMembers(groupUpn: string): GroupMember[] {
  const groupId = Object.entries(mockGroups).find(([, g]) => g.upn === groupUpn)?.[0];
  if (!groupId) return [];
  return mockGroupMembers[groupId] ?? [];
}

export function getMockResolvedGroup(groupUpn: string, displayName: string): ResolvedGroup {
  const members = getMockGroupMembers(groupUpn);
  return {
    groupId: groupUpn,
    displayName,
    memberCount: members.length,
    members,
    loading: false,
    error: null,
  };
}
