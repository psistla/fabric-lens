import type { Workspace } from './types/workspace';
import type { Item } from './types/item';
import type { Capacity } from './types/capacity';
import type { WorkspaceUser, GroupMember, ResolvedGroup } from './types/admin';
import type { TenantSetting } from './types/tenantSettings';
import type { WidelySharedArtifact } from './types/widelyShared';
import type { ActivityEvent } from './types/activityEvents';

export const isDemoMode =
  !import.meta.env.VITE_MSAL_CLIENT_ID ||
  import.meta.env.VITE_MSAL_CLIENT_ID === 'demo';

export const mockCapacities: Capacity[] = [
  { id: 'cap-1', displayName: 'Production F64', sku: 'F64', region: 'West US', state: 'Active' },
  { id: 'cap-2', displayName: 'Dev F8', sku: 'F8', region: 'East US', state: 'Active' },
  { id: 'cap-3', displayName: 'Analytics F32', sku: 'F32', region: 'North Europe', state: 'Active' },
];

export const mockWorkspaces: Workspace[] = [
  // --- Grade A workspaces (10 total) ---
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
    domainId: 'domain-3',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0009-0000-000000000009',
      servicePrincipalId: 'sp-006-datasci',
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
    domainId: 'domain-2',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0012-0000-000000000012',
      servicePrincipalId: 'sp-007-product',
    },
  },
  {
    id: 'ws-15',
    displayName: 'IoT Telemetry',
    description: 'IoT device telemetry processing and real-time analytics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0015-0000-000000000015',
      servicePrincipalId: 'sp-008-iot',
    },
  },
  {
    id: 'ws-16',
    displayName: 'Data Platform Hub',
    description: 'Central enterprise data platform with master data management',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    domainId: 'domain-1',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0016-0000-000000000016',
      servicePrincipalId: 'sp-010-platform',
    },
  },
  {
    id: 'ws-17',
    displayName: 'Risk Analytics',
    description: 'Enterprise risk management and regulatory reporting',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    domainId: 'domain-2',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0017-0000-000000000017',
      servicePrincipalId: 'sp-011-risk',
    },
  },
  {
    id: 'ws-18',
    displayName: 'Customer Intelligence',
    description: 'Customer 360 platform with churn prediction and segmentation',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-3',
    capacityRegion: 'North Europe',
    domainId: 'domain-1',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0018-0000-000000000018',
      servicePrincipalId: 'sp-012-custintel',
    },
  },
  {
    id: 'ws-19',
    displayName: 'Operations Excellence',
    description: 'Operational KPIs, process efficiency and workforce analytics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
    domainId: 'domain-2',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0019-0000-000000000019',
      servicePrincipalId: 'sp-013-ops',
    },
  },
  {
    id: 'ws-20',
    displayName: 'Finance Data Warehouse',
    description: 'Enterprise financial data warehouse for consolidated P&L and forecasting',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    domainId: 'domain-2',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0020-0000-000000000020',
      servicePrincipalId: 'sp-014-fin-dw',
    },
  },
  // --- Grade B workspaces (9 total) ---
  {
    id: 'ws-2',
    displayName: 'Finance Reporting',
    description: 'Financial reports and budgeting models',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0002-0000-000000000002',
      servicePrincipalId: 'sp-005-finance',
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
    domainId: 'domain-1',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0004-0000-000000000004',
      servicePrincipalId: 'sp-marketing',
    },
  },
  {
    id: 'ws-11',
    displayName: 'Executive Dashboards',
    description: 'C-suite KPI tracking and board reports',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    domainId: 'domain-1',
    workspaceIdentity: {
      applicationId: 'd4e5f6a7-b8c9-0123-defa-345678901234',
      servicePrincipalId: 'sp-004-exec',
    },
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
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0013-0000-000000000013',
      servicePrincipalId: 'sp-compliance',
    },
  },
  {
    id: 'ws-21',
    displayName: 'Digital Transformation',
    description: 'Digital initiative tracking and transformation metrics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0021-0000-000000000021',
      servicePrincipalId: 'sp-015-dx',
    },
  },
  {
    id: 'ws-22',
    displayName: 'Legal Compliance',
    description: 'Legal analytics, contract management and compliance reporting',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0022-0000-000000000022',
      servicePrincipalId: 'sp-016-legal',
    },
  },
  {
    id: 'ws-23',
    displayName: 'Strategic Planning',
    description: 'Long-range planning, scenario modeling and initiative tracking',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-3',
    capacityRegion: 'North Europe',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0023-0000-000000000023',
      servicePrincipalId: 'sp-017-strategy',
    },
  },
  {
    id: 'ws-24',
    displayName: 'Treasury Analytics',
    description: 'Cash flow management, FX exposure and liquidity forecasting',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0024-0000-000000000024',
      servicePrincipalId: 'sp-018-treasury',
    },
  },
  {
    id: 'ws-25',
    displayName: 'Customer Experience',
    description: 'CSAT and NPS tracking with customer journey analytics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
    domainId: 'domain-1',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0025-0000-000000000025',
      servicePrincipalId: 'sp-019-cx',
    },
  },
  // --- Grade C workspaces (9 total) ---
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
    id: 'ws-14',
    displayName: 'Dev Sandbox',
    description: 'Developer testing workspace',
    type: 'Personal',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
    workspaceIdentity: {
      applicationId: 'e5f6a7b8-0000-0014-0000-000000000014',
      servicePrincipalId: 'sp-dev-sandbox',
    },
  },
  {
    id: 'ws-26',
    displayName: 'Supplier Analytics',
    description: 'Supplier performance scorecards and spend analytics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-3',
    capacityRegion: 'North Europe',
    domainId: 'domain-1',
  },
  {
    id: 'ws-27',
    displayName: 'Workforce Analytics',
    description: 'Headcount planning, attrition modeling and HR metrics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
    domainId: 'domain-3',
  },
  {
    id: 'ws-28',
    displayName: 'Quality Management',
    description: 'Product quality metrics, defect tracking and SLA compliance',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    domainId: 'domain-2',
  },
  {
    id: 'ws-29',
    displayName: 'Retail Analytics',
    description: 'Store performance, inventory turnover and POS analytics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-3',
    capacityRegion: 'North Europe',
    domainId: 'domain-1',
  },
  {
    id: 'ws-30',
    displayName: 'Claims Processing',
    description: 'Insurance claims intake, triage and settlement analytics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-1',
    capacityRegion: 'West US',
    domainId: 'domain-2',
  },
  {
    id: 'ws-31',
    displayName: 'Vendor Management',
    description: 'Vendor risk scoring, contract compliance and payment analytics',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
    domainId: 'domain-3',
  },
  // --- Grade D workspaces (4 total) ---
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
    id: 'ws-32',
    displayName: 'Field Operations',
    description: 'Field service data — migration to Operations Excellence in progress',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-2',
    capacityRegion: 'East US',
  },
  {
    id: 'ws-33',
    displayName: 'Partner Analytics',
    description: 'Partner portal data — governance handoff pending',
    type: 'Workspace',
    state: 'Active',
    capacityId: 'cap-3',
    capacityRegion: 'North Europe',
  },
  // --- Grade F workspaces (3 total) ---
  {
    id: 'ws-5',
    displayName: 'HR Dashboard',
    description: '',
    type: 'Workspace',
    state: 'Active',
  },
  {
    id: 'ws-34',
    displayName: 'Temp Workspace',
    description: '',
    type: 'Personal',
    state: 'Active',
  },
  {
    id: 'ws-35',
    displayName: 'Archive Q3 2024',
    description: '',
    type: 'Workspace',
    state: 'Active',
  },
];

// --- Mock tags ---
const TAG_PRODUCTION = { id: 'a1b2c3d4-e5f6-7890-abcd-000000000001', displayName: 'Production' };
const TAG_PII        = { id: 'a1b2c3d4-e5f6-7890-abcd-000000000002', displayName: 'PII' };
const TAG_FINANCE    = { id: 'a1b2c3d4-e5f6-7890-abcd-000000000003', displayName: 'Finance' };
const TAG_APPROVED   = { id: 'a1b2c3d4-e5f6-7890-abcd-000000000004', displayName: 'Approved' };
const TAG_CERTIFIED  = { id: 'a1b2c3d4-e5f6-7890-abcd-000000000005', displayName: 'Certified' };
const TAG_CONFIDENTIAL = { id: 'a1b2c3d4-e5f6-7890-abcd-000000000006', displayName: 'Confidential' };
const TAG_ENTERPRISE = { id: 'a1b2c3d4-e5f6-7890-abcd-000000000007', displayName: 'Enterprise' };

const itemsMap: Record<string, Item[]> = {
  // --- Grade A workspaces ---

  // ws-1: 6/8 = 75% tagged → half tag pts. Total: 105/110 = 95% → A
  'ws-1': [
    { id: 'item-1', displayName: 'Sales Lakehouse', description: 'Central data store for sales data', type: 'Lakehouse', workspaceId: 'ws-1', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-2', displayName: 'Daily ETL', description: 'Daily ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-1', tags: [TAG_PRODUCTION] },
    { id: 'item-3', displayName: 'Revenue Report', description: 'Monthly revenue dashboard', type: 'Report', workspaceId: 'ws-1', tags: [TAG_FINANCE, TAG_APPROVED] },
    { id: 'item-4', displayName: 'Sales Model', description: 'Semantic model for sales data', type: 'SemanticModel', workspaceId: 'ws-1', tags: [TAG_FINANCE] },
    { id: 'item-5', displayName: 'Forecast Notebook', description: 'ML-based sales forecasting', type: 'Notebook', workspaceId: 'ws-1', tags: [TAG_APPROVED] },
    { id: 'item-6', displayName: 'Sales Dashboard', description: 'Executive overview', type: 'Dashboard', workspaceId: 'ws-1', tags: [TAG_CERTIFIED] },
    { id: 'item-7', displayName: 'SQL Endpoint', description: 'Analytics SQL endpoint', type: 'SQLEndpoint', workspaceId: 'ws-1' },
    { id: 'item-8', displayName: 'Churn Pipeline', description: 'Customer churn prediction', type: 'Pipeline', workspaceId: 'ws-1' },
  ],

  // ws-8: 4/5 = 80% tagged → full tag pts. Total: 110/110 = 100% → A
  'ws-8': [
    { id: 'item-80', displayName: 'Tickets Lakehouse', description: 'Support ticket data store', type: 'Lakehouse', workspaceId: 'ws-8', tags: [TAG_PRODUCTION, TAG_PII] },
    { id: 'item-81', displayName: 'SLA Report', description: 'SLA compliance dashboard', type: 'Report', workspaceId: 'ws-8', tags: [TAG_APPROVED] },
    { id: 'item-82', displayName: 'Ticket ETL', description: 'Zendesk ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-8', tags: [TAG_PRODUCTION] },
    { id: 'item-83', displayName: 'Support Model', description: 'Ticket classification model', type: 'SemanticModel', workspaceId: 'ws-8', tags: [TAG_CERTIFIED] },
    { id: 'item-84', displayName: 'CSAT Dashboard', description: 'Customer satisfaction overview', type: 'Dashboard', workspaceId: 'ws-8' },
  ],

  // ws-9: 1/6 = 17% tagged → 0 pts. Total: 100/110 = 91% → A (has domain + identity)
  'ws-9': [
    { id: 'item-90', displayName: 'ML Experiments', description: 'Model training experiments', type: 'MLExperiment', workspaceId: 'ws-9', tags: [TAG_APPROVED] },
    { id: 'item-91', displayName: 'Feature Notebook', description: 'Feature engineering', type: 'Notebook', workspaceId: 'ws-9' },
    { id: 'item-92', displayName: 'Prediction Model', description: 'Production ML model', type: 'MLModel', workspaceId: 'ws-9' },
    { id: 'item-93', displayName: 'Training Data', description: 'ML training dataset', type: 'Lakehouse', workspaceId: 'ws-9' },
    { id: 'item-94', displayName: 'Model Report', description: 'Model performance metrics', type: 'Report', workspaceId: 'ws-9' },
    { id: 'item-95', displayName: 'Eval Notebook', description: 'Model evaluation', type: 'Notebook', workspaceId: 'ws-9' },
  ],

  // ws-12: 1/4 = 25% tagged → 0 pts. Total: 100/110 = 91% → A (has domain + identity)
  'ws-12': [
    { id: 'item-120', displayName: 'Usage Report', description: 'Product usage analytics', type: 'Report', workspaceId: 'ws-12', tags: [TAG_APPROVED] },
    { id: 'item-121', displayName: 'Funnel Dashboard', description: 'Conversion funnel', type: 'Dashboard', workspaceId: 'ws-12' },
    { id: 'item-122', displayName: 'Event Stream', description: 'User event ingestion', type: 'Eventstream', workspaceId: 'ws-12' },
    { id: 'item-123', displayName: 'Product Lakehouse', description: 'Product telemetry data', type: 'Lakehouse', workspaceId: 'ws-12' },
  ],

  // ws-15: 0/5 = 0% tagged. Total: 90/110 = 82% → B... wait needs re-check
  // description(10) + capacity(15) + no domain(0) + git(15) + naming(10) + items(10) + dataLayer(10) + reasonable(10) + identity(10) + tags(0) = 90/110 = 82% → B
  // Actually want A. Let me make 5/5 tagged → full pts → 100/110 = 91% → A
  'ws-15': [
    { id: 'item-150', displayName: 'Sensor Data', description: 'IoT sensor ingestion', type: 'Eventstream', workspaceId: 'ws-15', tags: [TAG_PRODUCTION] },
    { id: 'item-151', displayName: 'Telemetry Lakehouse', description: 'Device telemetry store', type: 'Lakehouse', workspaceId: 'ws-15', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-152', displayName: 'Device Dashboard', description: 'IoT device monitoring', type: 'Dashboard', workspaceId: 'ws-15', tags: [TAG_APPROVED] },
    { id: 'item-153', displayName: 'Alert Pipeline', description: 'Anomaly detection pipeline', type: 'Pipeline', workspaceId: 'ws-15', tags: [TAG_CERTIFIED] },
    { id: 'item-154', displayName: 'Mirrored Warehouse', description: 'Warehouse mirror for IoT', type: 'MirroredWarehouse', workspaceId: 'ws-15', tags: [TAG_PRODUCTION] },
  ],

  // ws-16 (Data Platform Hub - A): 11/12 = 92% tagged → full pts. Total: 110/110 → A
  'ws-16': [
    { id: 'item-16-0', displayName: 'Master Lakehouse', description: 'Enterprise master data store', type: 'Lakehouse', workspaceId: 'ws-16', tags: [TAG_PRODUCTION, TAG_ENTERPRISE, TAG_CERTIFIED] },
    { id: 'item-16-1', displayName: 'Master Warehouse', description: 'Consolidated enterprise warehouse', type: 'Warehouse', workspaceId: 'ws-16', tags: [TAG_PRODUCTION, TAG_ENTERPRISE] },
    { id: 'item-16-2', displayName: 'Ingestion Notebook', description: 'Multi-source data ingestion', type: 'Notebook', workspaceId: 'ws-16', tags: [TAG_PRODUCTION] },
    { id: 'item-16-3', displayName: 'Master ETL', description: 'Enterprise ETL orchestration', type: 'DataPipeline', workspaceId: 'ws-16', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-16-4', displayName: 'Data Quality Pipeline', description: 'Automated data quality checks', type: 'Pipeline', workspaceId: 'ws-16', tags: [TAG_PRODUCTION] },
    { id: 'item-16-5', displayName: 'Enterprise Model', description: 'Unified semantic model', type: 'SemanticModel', workspaceId: 'ws-16', tags: [TAG_ENTERPRISE, TAG_CERTIFIED] },
    { id: 'item-16-6', displayName: 'Data Quality Report', description: 'Data quality scorecard', type: 'Report', workspaceId: 'ws-16', tags: [TAG_APPROVED] },
    { id: 'item-16-7', displayName: 'Platform Overview', description: 'Platform health dashboard', type: 'Dashboard', workspaceId: 'ws-16', tags: [TAG_ENTERPRISE] },
    { id: 'item-16-8', displayName: 'Master SQL', description: 'Enterprise analytics endpoint', type: 'SQLEndpoint', workspaceId: 'ws-16', tags: [TAG_PRODUCTION] },
    { id: 'item-16-9', displayName: 'ETL Spark Job', description: 'Distributed ETL processing', type: 'SparkJobDefinition', workspaceId: 'ws-16', tags: [TAG_PRODUCTION] },
    { id: 'item-16-10', displayName: 'Audit Logs DB', description: 'Platform audit log store', type: 'KQLDatabase', workspaceId: 'ws-16', tags: [TAG_PRODUCTION] },
    { id: 'item-16-11', displayName: 'Replicated DB', description: 'DR replica database', type: 'MirroredDatabase', workspaceId: 'ws-16' },
  ],

  // ws-17 (Risk Analytics - A): 8/10 = 80% tagged → full pts. Total: 110/110 → A
  'ws-17': [
    { id: 'item-17-0', displayName: 'Risk Warehouse', description: 'Enterprise risk data warehouse', type: 'Warehouse', workspaceId: 'ws-17', tags: [TAG_PRODUCTION, TAG_CONFIDENTIAL] },
    { id: 'item-17-1', displayName: 'Risk Overview', description: 'Risk dashboard for executives', type: 'Report', workspaceId: 'ws-17', tags: [TAG_APPROVED, TAG_CONFIDENTIAL] },
    { id: 'item-17-2', displayName: 'Risk Model', description: 'Enterprise risk semantic model', type: 'SemanticModel', workspaceId: 'ws-17', tags: [TAG_CERTIFIED] },
    { id: 'item-17-3', displayName: 'Risk Dashboard', description: 'Real-time risk indicators', type: 'Dashboard', workspaceId: 'ws-17', tags: [TAG_APPROVED] },
    { id: 'item-17-4', displayName: 'Risk ETL', description: 'Risk data ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-17', tags: [TAG_PRODUCTION] },
    { id: 'item-17-5', displayName: 'Risk Analysis Notebook', description: 'Scenario analysis notebook', type: 'Notebook', workspaceId: 'ws-17', tags: [TAG_CERTIFIED] },
    { id: 'item-17-6', displayName: 'Regulatory Report', description: 'Regulatory compliance report', type: 'PaginatedReport', workspaceId: 'ws-17', tags: [TAG_APPROVED, TAG_CONFIDENTIAL] },
    { id: 'item-17-7', displayName: 'Risk Queries', description: 'Risk analysis KQL queries', type: 'KQLQueryset', workspaceId: 'ws-17', tags: [TAG_CERTIFIED] },
    { id: 'item-17-8', displayName: 'Risk Mirror', description: 'Risk data warehouse mirror', type: 'MirroredWarehouse', workspaceId: 'ws-17' },
    { id: 'item-17-9', displayName: 'Risk Dataflow', description: 'Risk factor aggregation', type: 'Dataflow', workspaceId: 'ws-17' },
  ],

  // ws-18 (Customer Intelligence - A): 12/14 = 86% tagged → full pts. Total: 110/110 → A
  'ws-18': [
    { id: 'item-18-0', displayName: 'Customer Lakehouse', description: 'Customer 360 data store', type: 'Lakehouse', workspaceId: 'ws-18', tags: [TAG_PRODUCTION, TAG_PII, TAG_CERTIFIED] },
    { id: 'item-18-1', displayName: 'Customer Events', description: 'Real-time customer event stream', type: 'Eventstream', workspaceId: 'ws-18', tags: [TAG_PRODUCTION, TAG_PII] },
    { id: 'item-18-2', displayName: 'Segmentation Notebook', description: 'RFM segmentation analysis', type: 'Notebook', workspaceId: 'ws-18', tags: [TAG_CERTIFIED] },
    { id: 'item-18-3', displayName: 'Churn Analysis', description: 'Customer churn model notebook', type: 'Notebook', workspaceId: 'ws-18', tags: [TAG_APPROVED] },
    { id: 'item-18-4', displayName: 'Customer 360 Report', description: 'Unified customer view', type: 'Report', workspaceId: 'ws-18', tags: [TAG_PRODUCTION, TAG_PII] },
    { id: 'item-18-5', displayName: 'CX Dashboard', description: 'Customer experience overview', type: 'Dashboard', workspaceId: 'ws-18', tags: [TAG_APPROVED] },
    { id: 'item-18-6', displayName: 'Customer Model', description: 'Customer semantic model', type: 'SemanticModel', workspaceId: 'ws-18', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-18-7', displayName: 'Customer ETL', description: 'CRM data ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-18', tags: [TAG_PRODUCTION] },
    { id: 'item-18-8', displayName: 'Churn Experiment', description: 'Churn model experiments', type: 'MLExperiment', workspaceId: 'ws-18', tags: [TAG_CERTIFIED] },
    { id: 'item-18-9', displayName: 'Churn Model', description: 'Production churn prediction model', type: 'MLModel', workspaceId: 'ws-18', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-18-10', displayName: 'Customer Events DB', description: 'Event analytics database', type: 'KQLDatabase', workspaceId: 'ws-18', tags: [TAG_PRODUCTION] },
    { id: 'item-18-11', displayName: 'Retention Report', description: 'Customer retention analysis', type: 'Report', workspaceId: 'ws-18', tags: [TAG_APPROVED] },
    { id: 'item-18-12', displayName: 'Customer Pipeline', description: 'Customer data refresh pipeline', type: 'Pipeline', workspaceId: 'ws-18' },
    { id: 'item-18-13', displayName: 'Customer SQL', description: 'Customer analytics SQL endpoint', type: 'SQLEndpoint', workspaceId: 'ws-18' },
  ],

  // ws-19 (Operations Excellence - A): 8/9 = 89% tagged → full pts. Total: 110/110 → A
  'ws-19': [
    { id: 'item-19-0', displayName: 'Ops Warehouse', description: 'Operational data warehouse', type: 'Warehouse', workspaceId: 'ws-19', tags: [TAG_PRODUCTION, TAG_ENTERPRISE] },
    { id: 'item-19-1', displayName: 'Ops KPI Report', description: 'Operational KPI dashboard', type: 'Report', workspaceId: 'ws-19', tags: [TAG_APPROVED] },
    { id: 'item-19-2', displayName: 'Operations Dashboard', description: 'Real-time operations view', type: 'Dashboard', workspaceId: 'ws-19', tags: [TAG_ENTERPRISE, TAG_CERTIFIED] },
    { id: 'item-19-3', displayName: 'Operations Model', description: 'Operational semantic model', type: 'SemanticModel', workspaceId: 'ws-19', tags: [TAG_PRODUCTION] },
    { id: 'item-19-4', displayName: 'Ops ETL', description: 'Operational data ingestion', type: 'DataPipeline', workspaceId: 'ws-19', tags: [TAG_PRODUCTION] },
    { id: 'item-19-5', displayName: 'Ops Analysis', description: 'Process efficiency analysis', type: 'Notebook', workspaceId: 'ws-19', tags: [TAG_APPROVED] },
    { id: 'item-19-6', displayName: 'Monthly Ops Report', description: 'Monthly operational summary', type: 'PaginatedReport', workspaceId: 'ws-19', tags: [TAG_APPROVED, TAG_ENTERPRISE] },
    { id: 'item-19-7', displayName: 'Ops Spark Job', description: 'Large-scale ops data processing', type: 'SparkJobDefinition', workspaceId: 'ws-19', tags: [TAG_PRODUCTION] },
    { id: 'item-19-8', displayName: 'Ops Dataflow', description: 'Operational data aggregation', type: 'Dataflow', workspaceId: 'ws-19' },
  ],

  // ws-20 (Finance Data Warehouse - A): 10/10 = 100% tagged → full pts. Total: 110/110 → A
  'ws-20': [
    { id: 'item-20-0', displayName: 'Finance Lakehouse', description: 'Financial data lake', type: 'Lakehouse', workspaceId: 'ws-20', tags: [TAG_PRODUCTION, TAG_FINANCE, TAG_CONFIDENTIAL] },
    { id: 'item-20-1', displayName: 'Finance DW', description: 'Consolidated financial warehouse', type: 'Warehouse', workspaceId: 'ws-20', tags: [TAG_PRODUCTION, TAG_FINANCE, TAG_CERTIFIED] },
    { id: 'item-20-2', displayName: 'Finance ETL', description: 'ERP data ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-20', tags: [TAG_PRODUCTION, TAG_FINANCE] },
    { id: 'item-20-3', displayName: 'Finance Model', description: 'Enterprise financial semantic model', type: 'SemanticModel', workspaceId: 'ws-20', tags: [TAG_FINANCE, TAG_CERTIFIED] },
    { id: 'item-20-4', displayName: 'P&L Report', description: 'Consolidated profit and loss', type: 'Report', workspaceId: 'ws-20', tags: [TAG_FINANCE, TAG_CONFIDENTIAL, TAG_APPROVED] },
    { id: 'item-20-5', displayName: 'Balance Sheet', description: 'Consolidated balance sheet', type: 'Report', workspaceId: 'ws-20', tags: [TAG_FINANCE, TAG_APPROVED] },
    { id: 'item-20-6', displayName: 'Finance Dashboard', description: 'CFO financial overview', type: 'Dashboard', workspaceId: 'ws-20', tags: [TAG_FINANCE, TAG_APPROVED] },
    { id: 'item-20-7', displayName: 'Regulatory Report', description: 'Financial regulatory filing', type: 'PaginatedReport', workspaceId: 'ws-20', tags: [TAG_FINANCE, TAG_CONFIDENTIAL, TAG_CERTIFIED] },
    { id: 'item-20-8', displayName: 'Forecast Notebook', description: 'Financial forecasting model', type: 'Notebook', workspaceId: 'ws-20', tags: [TAG_FINANCE] },
    { id: 'item-20-9', displayName: 'Finance SQL', description: 'Financial analytics SQL endpoint', type: 'SQLEndpoint', workspaceId: 'ws-20', tags: [TAG_PRODUCTION, TAG_FINANCE] },
  ],

  // --- Grade B workspaces ---

  // ws-2 (Finance Reporting - B): 1/4 = 25% tagged → 0 pts.
  // description(10)+capacity(15)+no domain(0)+git(15)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+identity(10)+tags(0) = 90/110 = 82% → B
  'ws-2': [
    { id: 'item-20a', displayName: 'Finance Warehouse', description: 'Financial data warehouse', type: 'Warehouse', workspaceId: 'ws-2', tags: [TAG_FINANCE] },
    { id: 'item-21', displayName: 'Budget Report', description: 'Quarterly budget report', type: 'Report', workspaceId: 'ws-2' },
    { id: 'item-22', displayName: 'P&L Dashboard', description: 'Profit and loss overview', type: 'Dashboard', workspaceId: 'ws-2' },
    { id: 'item-23', displayName: 'Finance Model', description: 'Core semantic model', type: 'SemanticModel', workspaceId: 'ws-2' },
  ],

  // ws-4 (Marketing Insights - B): 0/2 = 0% tagged → 0 pts.
  // description(10)+capacity(15)+domain(10)+git(15)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+identity(10)+tags(0) = 90/110 = 82% → B
  'ws-4': [
    { id: 'item-40', displayName: 'Campaign Analytics', description: 'Marketing campaign performance', type: 'Report', workspaceId: 'ws-4' },
    { id: 'item-41', displayName: 'Segment Dataflow', description: 'Customer segmentation flow', type: 'Dataflow', workspaceId: 'ws-4' },
  ],

  // ws-11 (Executive Dashboards - B): 3/5 = 60% tagged → half pts (5).
  // description(10)+capacity(15)+domain(10)+git(15)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+identity(10)+tags(5) = 95/110 = 86% → B
  'ws-11': [
    { id: 'item-110', displayName: 'CEO Dashboard', description: 'Executive KPI dashboard', type: 'Dashboard', workspaceId: 'ws-11', tags: [TAG_APPROVED, TAG_CERTIFIED] },
    { id: 'item-111', displayName: 'Board Report', description: 'Quarterly board report', type: 'PaginatedReport', workspaceId: 'ws-11', tags: [TAG_APPROVED] },
    { id: 'item-112', displayName: 'KPI Model', description: 'Cross-functional KPI model', type: 'SemanticModel', workspaceId: 'ws-11', tags: [TAG_CERTIFIED] },
    { id: 'item-113', displayName: 'Revenue Dataflow', description: 'Revenue consolidation', type: 'Dataflow', workspaceId: 'ws-11' },
    { id: 'item-114', displayName: 'Exec SQL', description: 'Executive analytics endpoint', type: 'SQLEndpoint', workspaceId: 'ws-11' },
  ],

  // ws-13 (Compliance Monitoring - B): 3/5 = 60% tagged → half pts (5).
  // description(10)+capacity(15)+domain(10)+git(15)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+identity(10)+tags(5) = 95/110 = 86% → B
  'ws-13': [
    { id: 'item-130', displayName: 'Audit Logs', description: 'Compliance audit trail', type: 'KQLDatabase', workspaceId: 'ws-13', tags: [TAG_PII, TAG_CERTIFIED] },
    { id: 'item-131', displayName: 'Compliance Report', description: 'Regulatory compliance status', type: 'Report', workspaceId: 'ws-13', tags: [TAG_APPROVED] },
    { id: 'item-132', displayName: 'Policy Dashboard', description: 'Policy violation tracking', type: 'Dashboard', workspaceId: 'ws-13', tags: [TAG_CERTIFIED] },
    { id: 'item-133', displayName: 'Audit Queries', description: 'Compliance KQL queries', type: 'KQLQueryset', workspaceId: 'ws-13' },
    { id: 'item-134', displayName: 'Mirror DB', description: 'Compliance database mirror', type: 'MirroredDatabase', workspaceId: 'ws-13' },
  ],

  // ws-21 (Digital Transformation - B): 6/11 = 55% tagged → half pts (5).
  // description(10)+capacity(15)+no domain(0)+git(15)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+identity(10)+tags(5) = 95/110 = 86% → B
  'ws-21': [
    { id: 'item-21-0', displayName: 'DX Warehouse', description: 'Transformation initiative warehouse', type: 'Warehouse', workspaceId: 'ws-21', tags: [TAG_ENTERPRISE] },
    { id: 'item-21-1', displayName: 'DX Lakehouse', description: 'Digital transformation data lake', type: 'Lakehouse', workspaceId: 'ws-21', tags: [TAG_PRODUCTION] },
    { id: 'item-21-2', displayName: 'DX Analysis', description: 'Transformation maturity analysis', type: 'Notebook', workspaceId: 'ws-21', tags: [TAG_ENTERPRISE] },
    { id: 'item-21-3', displayName: 'DX Progress Report', description: 'Initiative progress tracking', type: 'Report', workspaceId: 'ws-21', tags: [TAG_APPROVED] },
    { id: 'item-21-4', displayName: 'Transformation Dashboard', description: 'DX executive view', type: 'Dashboard', workspaceId: 'ws-21', tags: [TAG_ENTERPRISE] },
    { id: 'item-21-5', displayName: 'DX ETL', description: 'Transformation data ingestion', type: 'DataPipeline', workspaceId: 'ws-21', tags: [TAG_PRODUCTION] },
    { id: 'item-21-6', displayName: 'DX Model', description: 'Transformation semantic model', type: 'SemanticModel', workspaceId: 'ws-21' },
    { id: 'item-21-7', displayName: 'DX Spark Job', description: 'Large-scale transformation processing', type: 'SparkJobDefinition', workspaceId: 'ws-21' },
    { id: 'item-21-8', displayName: 'DX Mirror', description: 'DX data warehouse mirror', type: 'MirroredWarehouse', workspaceId: 'ws-21' },
    { id: 'item-21-9', displayName: 'DX Events', description: 'Transformation milestone events', type: 'Eventstream', workspaceId: 'ws-21' },
    { id: 'item-21-10', displayName: 'DX Logs', description: 'Transformation audit log store', type: 'KQLDatabase', workspaceId: 'ws-21' },
  ],

  // ws-22 (Legal Compliance - B): 0/8 = 0% tagged → 0 pts.
  // description(10)+capacity(15)+no domain(0)+git(15)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+identity(10)+tags(0) = 90/110 = 82% → B
  'ws-22': [
    { id: 'item-22-0', displayName: 'Legal Lakehouse', description: 'Legal document and case data store', type: 'Lakehouse', workspaceId: 'ws-22' },
    { id: 'item-22-1', displayName: 'Compliance Status', description: 'Legal compliance status report', type: 'Report', workspaceId: 'ws-22' },
    { id: 'item-22-2', displayName: 'Legal Overview', description: 'Legal risk dashboard', type: 'Dashboard', workspaceId: 'ws-22' },
    { id: 'item-22-3', displayName: 'Compliance Model', description: 'Legal compliance semantic model', type: 'SemanticModel', workspaceId: 'ws-22' },
    { id: 'item-22-4', displayName: 'Legal Audit Report', description: 'Audit findings report', type: 'PaginatedReport', workspaceId: 'ws-22' },
    { id: 'item-22-5', displayName: 'Contract ETL', description: 'Contract management ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-22' },
    { id: 'item-22-6', displayName: 'Legal SQL', description: 'Legal analytics SQL endpoint', type: 'SQLEndpoint', workspaceId: 'ws-22' },
    { id: 'item-22-7', displayName: 'Case Analysis', description: 'Legal case pattern analysis', type: 'Notebook', workspaceId: 'ws-22' },
  ],

  // ws-23 (Strategic Planning - B): 0/7 = 0% tagged → 0 pts.
  // description(10)+capacity(15)+no domain(0)+git(15)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+identity(10)+tags(0) = 90/110 = 82% → B
  'ws-23': [
    { id: 'item-23-0', displayName: 'Strategy Warehouse', description: 'Strategic planning data warehouse', type: 'Warehouse', workspaceId: 'ws-23' },
    { id: 'item-23-1', displayName: 'Initiatives Report', description: 'Strategic initiatives tracker', type: 'Report', workspaceId: 'ws-23' },
    { id: 'item-23-2', displayName: 'Strategy Model', description: 'Strategic planning semantic model', type: 'SemanticModel', workspaceId: 'ws-23' },
    { id: 'item-23-3', displayName: 'Executive Strategy', description: 'Strategy dashboard for C-suite', type: 'Dashboard', workspaceId: 'ws-23' },
    { id: 'item-23-4', displayName: 'Scenario Analysis', description: 'Strategic scenario modeling notebook', type: 'Notebook', workspaceId: 'ws-23' },
    { id: 'item-23-5', displayName: 'Planning Dataflow', description: 'Planning data aggregation flow', type: 'Dataflow', workspaceId: 'ws-23' },
    { id: 'item-23-6', displayName: 'OKR Report', description: 'Objectives and key results tracker', type: 'PaginatedReport', workspaceId: 'ws-23' },
  ],

  // ws-24 (Treasury Analytics - B): 4/8 = 50% tagged → half pts (5).
  // description(10)+capacity(15)+no domain(0)+git(15)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+identity(10)+tags(5) = 95/110 = 86% → B
  'ws-24': [
    { id: 'item-24-0', displayName: 'Treasury Warehouse', description: 'Treasury financial data warehouse', type: 'Warehouse', workspaceId: 'ws-24', tags: [TAG_FINANCE, TAG_CONFIDENTIAL] },
    { id: 'item-24-1', displayName: 'Cash Flow Report', description: 'Cash flow analysis', type: 'Report', workspaceId: 'ws-24', tags: [TAG_FINANCE, TAG_APPROVED] },
    { id: 'item-24-2', displayName: 'Treasury Report', description: 'Monthly treasury summary', type: 'PaginatedReport', workspaceId: 'ws-24', tags: [TAG_FINANCE, TAG_CONFIDENTIAL] },
    { id: 'item-24-3', displayName: 'Treasury Model', description: 'Treasury semantic model', type: 'SemanticModel', workspaceId: 'ws-24', tags: [TAG_FINANCE] },
    { id: 'item-24-4', displayName: 'Treasury Dashboard', description: 'Liquidity and FX overview', type: 'Dashboard', workspaceId: 'ws-24' },
    { id: 'item-24-5', displayName: 'Treasury Spark', description: 'FX exposure calculation job', type: 'SparkJobDefinition', workspaceId: 'ws-24' },
    { id: 'item-24-6', displayName: 'Treasury Dataflow', description: 'Banking system data aggregation', type: 'Dataflow', workspaceId: 'ws-24' },
    { id: 'item-24-7', displayName: 'Treasury Queries', description: 'Liquidity analysis KQL queries', type: 'KQLQueryset', workspaceId: 'ws-24' },
  ],

  // ws-25 (Customer Experience - B): 3/6 = 50% tagged → half pts (5). No data layer.
  // description(10)+capacity(15)+domain(10)+git(15)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+identity(10)+tags(5) = 95/110 = 86% → B
  'ws-25': [
    { id: 'item-25-0', displayName: 'CSAT Report', description: 'Customer satisfaction analysis', type: 'Report', workspaceId: 'ws-25', tags: [TAG_APPROVED, TAG_PII] },
    { id: 'item-25-1', displayName: 'Customer Journey', description: 'Customer journey dashboard', type: 'Dashboard', workspaceId: 'ws-25', tags: [TAG_APPROVED] },
    { id: 'item-25-2', displayName: 'CX Model', description: 'Customer experience semantic model', type: 'SemanticModel', workspaceId: 'ws-25', tags: [TAG_CERTIFIED] },
    { id: 'item-25-3', displayName: 'Survey Dataflow', description: 'Survey response aggregation', type: 'Dataflow', workspaceId: 'ws-25' },
    { id: 'item-25-4', displayName: 'CX Queries', description: 'NPS analysis KQL queries', type: 'KQLQueryset', workspaceId: 'ws-25' },
    { id: 'item-25-5', displayName: 'Satisfaction Report', description: 'Monthly satisfaction summary', type: 'PaginatedReport', workspaceId: 'ws-25' },
  ],

  // --- Grade C workspaces ---

  // ws-3 (Engineering Metrics - C): 0/3 = 0% tagged → 0 pts.
  // description(10)+capacity(15)+no domain(0)+git(15)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+identity(10)+tags(0) = 80/110 = 73% → C
  'ws-3': [
    { id: 'item-30', displayName: 'CI/CD Metrics', description: 'Build and deploy tracking', type: 'Report', workspaceId: 'ws-3' },
    { id: 'item-31', displayName: 'Eng Notebook', description: 'Data exploration notebook', type: 'Notebook', workspaceId: 'ws-3' },
    { id: 'item-32', displayName: 'KQL Logs', description: 'Application log analytics', type: 'KQLDatabase', workspaceId: 'ws-3' },
  ],

  // ws-10 (Supply Chain - C): 2/4 = 50% tagged → half pts (5).
  // description(10)+capacity(15)+domain(10)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(5) = 80/110 = 73% → C
  'ws-10': [
    { id: 'item-100', displayName: 'Inventory Warehouse', description: 'Inventory data warehouse', type: 'Warehouse', workspaceId: 'ws-10', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-101', displayName: 'Logistics Report', description: 'Shipping and delivery tracking', type: 'Report', workspaceId: 'ws-10', tags: [TAG_APPROVED] },
    { id: 'item-102', displayName: 'Demand Forecast', description: 'Demand prediction pipeline', type: 'Pipeline', workspaceId: 'ws-10' },
    { id: 'item-103', displayName: 'Supply Dashboard', description: 'Supply chain overview', type: 'Dashboard', workspaceId: 'ws-10' },
  ],

  // ws-14 (Dev Sandbox - C): 0/2 = 0% tagged → 0 pts.
  // description(10)+capacity(15)+no domain(0)+git(15)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+identity(10)+tags(0) = 80/110 = 73% → C
  'ws-14': [
    { id: 'item-140', displayName: 'Test Notebook', description: 'API testing notebook', type: 'Notebook', workspaceId: 'ws-14' },
    { id: 'item-141', displayName: 'Spark Job', description: 'Test Spark job definition', type: 'SparkJobDefinition', workspaceId: 'ws-14' },
  ],

  // ws-26 (Supplier Analytics - C): 4/5 = 80% tagged → full pts (10).
  // description(10)+capacity(15)+domain(10)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(10) = 85/110 = 77% → C
  'ws-26': [
    { id: 'item-26-0', displayName: 'Supplier Lakehouse', description: 'Supplier master data store', type: 'Lakehouse', workspaceId: 'ws-26', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-26-1', displayName: 'Supplier Scorecard', description: 'Supplier performance report', type: 'Report', workspaceId: 'ws-26', tags: [TAG_APPROVED] },
    { id: 'item-26-2', displayName: 'Supplier Model', description: 'Supplier semantic model', type: 'SemanticModel', workspaceId: 'ws-26', tags: [TAG_CERTIFIED] },
    { id: 'item-26-3', displayName: 'Supplier Dashboard', description: 'Supplier risk overview', type: 'Dashboard', workspaceId: 'ws-26', tags: [TAG_APPROVED] },
    { id: 'item-26-4', displayName: 'Supplier ETL', description: 'Supplier data ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-26' },
  ],

  // ws-27 (Workforce Analytics - C): 3/6 = 50% tagged → half pts (5).
  // description(10)+capacity(15)+domain(10)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(5) = 80/110 = 73% → C
  'ws-27': [
    { id: 'item-27-0', displayName: 'HR Data Warehouse', description: 'Workforce data warehouse', type: 'Warehouse', workspaceId: 'ws-27', tags: [TAG_PII, TAG_CONFIDENTIAL] },
    { id: 'item-27-1', displayName: 'Headcount Report', description: 'Headcount and attrition report', type: 'Report', workspaceId: 'ws-27', tags: [TAG_APPROVED] },
    { id: 'item-27-2', displayName: 'Workforce Model', description: 'HR semantic model', type: 'SemanticModel', workspaceId: 'ws-27', tags: [TAG_CERTIFIED] },
    { id: 'item-27-3', displayName: 'HR Dashboard', description: 'People analytics dashboard', type: 'Dashboard', workspaceId: 'ws-27' },
    { id: 'item-27-4', displayName: 'HR Dataflow', description: 'HRIS data aggregation', type: 'Dataflow', workspaceId: 'ws-27' },
    { id: 'item-27-5', displayName: 'Attrition Analysis', description: 'Attrition prediction notebook', type: 'Notebook', workspaceId: 'ws-27' },
  ],

  // ws-28 (Quality Management - C): 3/5 = 60% tagged → half pts (5).
  // description(10)+capacity(15)+domain(10)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(5) = 80/110 = 73% → C
  'ws-28': [
    { id: 'item-28-0', displayName: 'Quality Lakehouse', description: 'Product quality data store', type: 'Lakehouse', workspaceId: 'ws-28', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-28-1', displayName: 'Quality Metrics', description: 'Defect and quality report', type: 'Report', workspaceId: 'ws-28', tags: [TAG_APPROVED] },
    { id: 'item-28-2', displayName: 'QA Dashboard', description: 'Quality assurance overview', type: 'Dashboard', workspaceId: 'ws-28', tags: [TAG_APPROVED] },
    { id: 'item-28-3', displayName: 'Quality Model', description: 'Quality semantic model', type: 'SemanticModel', workspaceId: 'ws-28' },
    { id: 'item-28-4', displayName: 'Quality Queries', description: 'Defect analysis KQL queries', type: 'KQLQueryset', workspaceId: 'ws-28' },
  ],

  // ws-29 (Retail Analytics - C): 2/8 = 25% tagged → 0 pts.
  // description(10)+capacity(15)+domain(10)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(0) = 75/110 = 68% → C
  'ws-29': [
    { id: 'item-29-0', displayName: 'Retail Warehouse', description: 'Retail operations data warehouse', type: 'Warehouse', workspaceId: 'ws-29', tags: [TAG_PRODUCTION] },
    { id: 'item-29-1', displayName: 'Sales Performance', description: 'Store sales performance report', type: 'Report', workspaceId: 'ws-29', tags: [TAG_APPROVED] },
    { id: 'item-29-2', displayName: 'Retail Model', description: 'Retail semantic model', type: 'SemanticModel', workspaceId: 'ws-29' },
    { id: 'item-29-3', displayName: 'Retail Dashboard', description: 'Multi-store overview dashboard', type: 'Dashboard', workspaceId: 'ws-29' },
    { id: 'item-29-4', displayName: 'Retail Dataflow', description: 'POS data aggregation', type: 'Dataflow', workspaceId: 'ws-29' },
    { id: 'item-29-5', displayName: 'Demand Analysis', description: 'Demand forecasting notebook', type: 'Notebook', workspaceId: 'ws-29' },
    { id: 'item-29-6', displayName: 'POS ETL', description: 'Point-of-sale ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-29' },
    { id: 'item-29-7', displayName: 'Retail Mirror', description: 'Retail data warehouse mirror', type: 'MirroredDatabase', workspaceId: 'ws-29' },
  ],

  // ws-30 (Claims Processing - C): 1/4 = 25% tagged → 0 pts.
  // description(10)+capacity(15)+domain(10)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(0) = 75/110 = 68% → C
  'ws-30': [
    { id: 'item-30-0', displayName: 'Claims Lakehouse', description: 'Insurance claims data store', type: 'Lakehouse', workspaceId: 'ws-30', tags: [TAG_PII] },
    { id: 'item-30-1', displayName: 'Claims Report', description: 'Claims processing status report', type: 'Report', workspaceId: 'ws-30' },
    { id: 'item-30-2', displayName: 'Claims ETL', description: 'Claims intake pipeline', type: 'DataPipeline', workspaceId: 'ws-30' },
    { id: 'item-30-3', displayName: 'Claims Dashboard', description: 'Claims settlement overview', type: 'Dashboard', workspaceId: 'ws-30' },
    { id: 'item-30-4', displayName: 'Fraud Detection', description: 'ML-based fraud detection notebook', type: 'Notebook', workspaceId: 'ws-30' },
    { id: 'item-30-5', displayName: 'Claims Model', description: 'Claims processing semantic model', type: 'SemanticModel', workspaceId: 'ws-30' },
  ],

  // ws-31 (Vendor Management - C): 3/5 = 60% tagged → half pts (5).
  // description(10)+capacity(15)+domain(10)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(5) = 80/110 = 73% → C
  'ws-31': [
    { id: 'item-31-0', displayName: 'Vendor Warehouse', description: 'Vendor master data warehouse', type: 'Warehouse', workspaceId: 'ws-31', tags: [TAG_PRODUCTION, TAG_CERTIFIED] },
    { id: 'item-31-1', displayName: 'Vendor Scorecard', description: 'Vendor performance scorecard', type: 'Report', workspaceId: 'ws-31', tags: [TAG_APPROVED] },
    { id: 'item-31-2', displayName: 'Vendor Dashboard', description: 'Vendor risk and compliance view', type: 'Dashboard', workspaceId: 'ws-31', tags: [TAG_APPROVED] },
    { id: 'item-31-3', displayName: 'Vendor Model', description: 'Vendor semantic model', type: 'SemanticModel', workspaceId: 'ws-31' },
    { id: 'item-31-4', displayName: 'Vendor Dataflow', description: 'Vendor data aggregation', type: 'Dataflow', workspaceId: 'ws-31' },
  ],

  // --- Grade D workspaces ---

  // ws-6 (My Workspace - D): 0/1 = 0% tagged.
  // description(10)+capacity(15)+no domain(0)+no git(0)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+no identity(0)+tags(0) = 55/110 = 50% → D
  'ws-6': [
    { id: 'item-60', displayName: 'Scratch Notebook', description: 'Quick experiments', type: 'Notebook', workspaceId: 'ws-6' },
  ],

  // ws-7 (Legacy Reports - D): 0/1 = 0% tagged.
  // description(10)+capacity(15)+no domain(0)+no git(0)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+no identity(0)+tags(0) = 55/110 = 50% → D
  'ws-7': [
    { id: 'item-70', displayName: 'Old Report', description: 'Legacy monthly report', type: 'PaginatedReport', workspaceId: 'ws-7' },
  ],

  // ws-32 (Field Operations - D): 0/6 = 0% tagged.
  // description(10)+capacity(15)+no domain(0)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(0) = 65/110 = 59% → D
  'ws-32': [
    { id: 'item-32-0', displayName: 'Field Lakehouse', description: 'Field service raw data store', type: 'Lakehouse', workspaceId: 'ws-32' },
    { id: 'item-32-1', displayName: 'Field Report', description: 'Field technician activity report', type: 'Report', workspaceId: 'ws-32' },
    { id: 'item-32-2', displayName: 'Field Dashboard', description: 'Field operations overview', type: 'Dashboard', workspaceId: 'ws-32' },
    { id: 'item-32-3', displayName: 'Field Model', description: 'Field service semantic model', type: 'SemanticModel', workspaceId: 'ws-32' },
    { id: 'item-32-4', displayName: 'Field ETL', description: 'Field data ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-32' },
    { id: 'item-32-5', displayName: 'Field Notebook', description: 'Route optimization analysis', type: 'Notebook', workspaceId: 'ws-32' },
  ],

  // ws-33 (Partner Analytics - D): 0/6 = 0% tagged.
  // description(10)+capacity(15)+no domain(0)+no git(0)+naming(10)+items(10)+dataLayer(10)+reasonable(10)+no identity(0)+tags(0) = 65/110 = 59% → D
  'ws-33': [
    { id: 'item-33-0', displayName: 'Partner Lakehouse', description: 'Partner portal data store', type: 'Lakehouse', workspaceId: 'ws-33' },
    { id: 'item-33-1', displayName: 'Partner Report', description: 'Partner performance report', type: 'Report', workspaceId: 'ws-33' },
    { id: 'item-33-2', displayName: 'Partner Dashboard', description: 'Partner ecosystem overview', type: 'Dashboard', workspaceId: 'ws-33' },
    { id: 'item-33-3', displayName: 'Partner Model', description: 'Partner semantic model', type: 'SemanticModel', workspaceId: 'ws-33' },
    { id: 'item-33-4', displayName: 'Partner Dataflow', description: 'Partner data aggregation', type: 'Dataflow', workspaceId: 'ws-33' },
    { id: 'item-33-5', displayName: 'Partner ETL', description: 'Partner API ingestion pipeline', type: 'DataPipeline', workspaceId: 'ws-33' },
  ],

  // --- Grade F workspaces ---

  // ws-5 (HR Dashboard - F): no items → tag check skipped.
  // no description(0)+no capacity(0)+no domain(0)+no git(0)+naming(10)+no items(0)+no dataLayer(0)+reasonable(10)+no identity(0) = 20/100 = 20% → F
  'ws-5': [],

  // ws-34 (Temp Workspace - F): 0/2 tagged.
  // no description(0)+no capacity(0)+no domain(0)+no git(0)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+no identity(0)+tags(0) = 30/110 = 27% → F
  'ws-34': [
    { id: 'item-34-0', displayName: 'Draft Analysis', description: 'Work in progress analysis', type: 'Notebook', workspaceId: 'ws-34' },
    { id: 'item-34-1', displayName: 'Test Report', description: 'Exploratory test report', type: 'Report', workspaceId: 'ws-34' },
  ],

  // ws-35 (Archive Q3 2024 - F): 0/2 tagged.
  // no description(0)+no capacity(0)+no domain(0)+no git(0)+naming(10)+items(10)+no dataLayer(0)+reasonable(10)+no identity(0)+tags(0) = 30/110 = 27% → F
  'ws-35': [
    { id: 'item-35-0', displayName: 'Q3 2024 Report', description: 'Q3 quarterly business report', type: 'Report', workspaceId: 'ws-35' },
    { id: 'item-35-1', displayName: 'Q3 Summary', description: 'Q3 executive summary', type: 'PaginatedReport', workspaceId: 'ws-35' },
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
  bob:   { userPrincipalName: 'bob@contoso.com',   displayName: 'Bob Smith' },
  carol: { userPrincipalName: 'carol@contoso.com', displayName: 'Carol Williams' },
  dan:   { userPrincipalName: 'dan@contoso.com',   displayName: 'Dan Brown' },
  eve:   { userPrincipalName: 'eve@contoso.com',   displayName: 'Eve Martinez' },
  frank: { userPrincipalName: 'frank@contoso.com', displayName: 'Frank Lee' },
  grace: { userPrincipalName: 'grace@contoso.com', displayName: 'Grace Kim' },
  hiro:  { userPrincipalName: 'hiro@contoso.com',  displayName: 'Hiro Tanaka' },
};

// alice: Admin on 16 workspaces → over-permissioned
// bob:   Admin on 7 workspaces  → over-permissioned
// carol: Admin on 6 workspaces  → over-permissioned
// grace: Admin on 4 workspaces  → within threshold
// frank: Admin on 2 workspaces  → within threshold
// hiro:  Admin on 1 workspace   → within threshold
// dan:   Admin on 0 workspaces  → within threshold
// eve:   Admin on 0 workspaces  → within threshold

const mockWorkspaceUsersMap: Record<string, WorkspaceUser[]> = {
  // --- Existing workspaces ---
  'ws-1': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-2': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-3': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-4': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-5': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-6': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Member' } },
  ],
  'ws-7': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-8': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-9': [
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-10': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-11': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-12': [
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Member' } },
  ],
  'ws-13': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Member' } },
  ],
  'ws-14': [
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Admin' } },
  ],
  'ws-15': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  // --- New A workspaces ---
  'ws-16': [
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
    { userDetails: mockUsers.hiro,  workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-17': [
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-18': [
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.hiro,  workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-19': [
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-20': [
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  // --- New B workspaces ---
  'ws-21': [
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: mockUsers.hiro,  workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-22': [
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-23': [
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-24': [
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: mockUsers.hiro,  workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-25': [
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  // --- New C workspaces ---
  'ws-26': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-27': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: mockUsers.hiro,  workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-28': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.carol, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-29': [
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-30': [
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.bob,   workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-31': [
    { userDetails: mockUsers.alice, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: mockUsers.hiro,  workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  // --- New D workspaces ---
  'ws-32': [
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.dan,   workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-33': [
    { userDetails: mockUsers.grace, workspaceAccessDetails: { workspaceRole: 'Admin' } },
    { userDetails: mockUsers.eve,   workspaceAccessDetails: { workspaceRole: 'Member' } },
  ],
  // --- New F workspaces ---
  'ws-34': [
    { userDetails: mockUsers.hiro, workspaceAccessDetails: { workspaceRole: 'Admin' } },
  ],
  'ws-35': [
    { userDetails: mockUsers.frank, workspaceAccessDetails: { workspaceRole: 'Admin' } },
  ],
};

// --- Mock groups and service principals ---

const mockGroups: Record<string, { displayName: string; upn: string }> = {
  'grp-eng':      { displayName: 'Engineering Team',     upn: 'engineering-team@contoso.com' },
  'grp-analysts': { displayName: 'Data Analysts',        upn: 'data-analysts@contoso.com' },
  'grp-admins':   { displayName: 'Data Platform Admins', upn: 'platform-admins@contoso.com' },
  'grp-finance':  { displayName: 'Finance Analysts',     upn: 'finance-analysts@contoso.com' },
};

const mockSPNs: Record<string, { displayName: string; upn: string }> = {
  'spn-etl':     { displayName: 'ETL Service Account', upn: 'etl-service@contoso.com' },
  'spn-monitor': { displayName: 'Monitoring Bot',      upn: 'monitoring-bot@contoso.com' },
};

const mockGroupMembers: Record<string, GroupMember[]> = {
  'grp-eng': [
    { displayName: 'Alice Johnson',  userPrincipalName: 'alice@contoso.com', jobTitle: 'Lead Engineer' },
    { displayName: 'Bob Smith',      userPrincipalName: 'bob@contoso.com',   jobTitle: 'Senior Engineer' },
    { displayName: 'Carol Williams', userPrincipalName: 'carol@contoso.com', jobTitle: 'Data Engineer' },
    { displayName: 'Grace Kim',      userPrincipalName: 'grace@contoso.com', jobTitle: 'Software Engineer' },
    { displayName: 'Hiro Tanaka',    userPrincipalName: 'hiro@contoso.com',  jobTitle: 'DevOps Engineer' },
    { displayName: 'Ivy Chen',       userPrincipalName: 'ivy@contoso.com',   jobTitle: 'Platform Engineer' },
    { displayName: 'Jake Wilson',    userPrincipalName: 'jake@contoso.com',  jobTitle: 'Backend Engineer' },
    { displayName: 'Kara Patel',     userPrincipalName: 'kara@contoso.com',  jobTitle: 'Frontend Engineer' },
    { displayName: 'Leo Garcia',     userPrincipalName: 'leo@contoso.com',   jobTitle: 'QA Engineer' },
    { displayName: 'Maya Singh',     userPrincipalName: 'maya@contoso.com',  jobTitle: 'ML Engineer' },
    { displayName: 'Nate Brown',     userPrincipalName: 'nate@contoso.com',  jobTitle: 'Data Engineer' },
    { displayName: 'Olivia Davis',   userPrincipalName: 'olivia@contoso.com',jobTitle: 'Site Reliability Engineer' },
    { displayName: 'Paul Martinez',  userPrincipalName: 'paul@contoso.com',  jobTitle: 'Software Engineer' },
    { displayName: 'Quinn Taylor',   userPrincipalName: 'quinn@contoso.com', jobTitle: 'Infrastructure Engineer' },
    { displayName: 'Rosa Hernandez', userPrincipalName: 'rosa@contoso.com',  jobTitle: 'Security Engineer' },
  ],
  'grp-analysts': [
    { displayName: 'Dan Brown',   userPrincipalName: 'dan@contoso.com',   jobTitle: 'Senior Analyst' },
    { displayName: 'Eve Martinez',userPrincipalName: 'eve@contoso.com',   jobTitle: 'Data Analyst' },
    { displayName: 'Frank Lee',   userPrincipalName: 'frank@contoso.com', jobTitle: 'Business Analyst' },
    { displayName: 'Sara Adams',  userPrincipalName: 'sara@contoso.com',  jobTitle: 'Analytics Lead' },
    { displayName: 'Tom Baker',   userPrincipalName: 'tom@contoso.com',   jobTitle: 'BI Developer' },
    { displayName: 'Uma Patel',   userPrincipalName: 'uma@contoso.com',   jobTitle: 'Data Scientist' },
    { displayName: 'Vic Nguyen',  userPrincipalName: 'vic@contoso.com',   jobTitle: 'Reporting Analyst' },
    { displayName: 'Wendy Zhao',  userPrincipalName: 'wendy@contoso.com', jobTitle: 'Data Analyst' },
    { displayName: 'Xavier Ross', userPrincipalName: 'xavier@contoso.com',jobTitle: 'Insights Analyst' },
    { displayName: 'Yara Osman',  userPrincipalName: 'yara@contoso.com',  jobTitle: 'Analytics Engineer' },
    { displayName: 'Zane Cooper', userPrincipalName: 'zane@contoso.com',  jobTitle: 'Junior Analyst' },
    { displayName: 'Amy Fischer', userPrincipalName: 'amy@contoso.com',   jobTitle: 'Data Analyst' },
  ],
  'grp-admins': [
    { displayName: 'Alice Johnson',  userPrincipalName: 'alice@contoso.com', jobTitle: 'Lead Engineer' },
    { displayName: 'Bob Smith',      userPrincipalName: 'bob@contoso.com',   jobTitle: 'Senior Engineer' },
    { displayName: 'Rosa Hernandez', userPrincipalName: 'rosa@contoso.com',  jobTitle: 'Security Engineer' },
  ],
  'grp-finance': [
    { displayName: 'Carol Williams', userPrincipalName: 'carol@contoso.com', jobTitle: 'Financial Analyst' },
    { displayName: 'Dan Brown',      userPrincipalName: 'dan@contoso.com',   jobTitle: 'Senior Analyst' },
    { displayName: 'Eve Martinez',   userPrincipalName: 'eve@contoso.com',   jobTitle: 'Data Analyst' },
    { displayName: 'Sara Adams',     userPrincipalName: 'sara@contoso.com',  jobTitle: 'Finance Lead' },
    { displayName: 'Tom Baker',      userPrincipalName: 'tom@contoso.com',   jobTitle: 'BI Developer' },
    { displayName: 'Uma Patel',      userPrincipalName: 'uma@contoso.com',   jobTitle: 'FP&A Analyst' },
    { displayName: 'Vic Nguyen',     userPrincipalName: 'vic@contoso.com',   jobTitle: 'Reporting Analyst' },
  ],
};

// Add groups and SPNs to some workspace assignments
const groupAndSPNAssignments: Record<string, WorkspaceUser[]> = {
  'ws-1': [
    { userDetails: { ...mockGroups['grp-eng'],  userPrincipalName: mockGroups['grp-eng'].upn,  principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
    { userDetails: { ...mockSPNs['spn-etl'],    userPrincipalName: mockSPNs['spn-etl'].upn,    principalType: 'ServicePrincipal' }, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-2': [
    { userDetails: { ...mockGroups['grp-analysts'], userPrincipalName: mockGroups['grp-analysts'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
    { userDetails: { ...mockGroups['grp-finance'],  userPrincipalName: mockGroups['grp-finance'].upn,  principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-3': [
    { userDetails: { ...mockGroups['grp-eng'],     userPrincipalName: mockGroups['grp-eng'].upn,     principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: { ...mockSPNs['spn-monitor'],   userPrincipalName: mockSPNs['spn-monitor'].upn,   principalType: 'ServicePrincipal' }, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
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
  'ws-16': [
    { userDetails: { ...mockGroups['grp-eng'], userPrincipalName: mockGroups['grp-eng'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Member' } },
    { userDetails: { ...mockSPNs['spn-etl'],   userPrincipalName: mockSPNs['spn-etl'].upn,   principalType: 'ServicePrincipal' }, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-20': [
    { userDetails: { ...mockGroups['grp-finance'], userPrincipalName: mockGroups['grp-finance'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Contributor' } },
  ],
  'ws-22': [
    { userDetails: { ...mockGroups['grp-admins'], userPrincipalName: mockGroups['grp-admins'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
  ],
  'ws-26': [
    { userDetails: { ...mockGroups['grp-analysts'], userPrincipalName: mockGroups['grp-analysts'].upn, principalType: 'Group' }, workspaceAccessDetails: { workspaceRole: 'Viewer' } },
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

export function getMockTenantSettings(): TenantSetting[] {
  return [
    // --- High risk, enabled ---
    {
      settingName: 'PublishToWeb',
      enabled: true,
      tenantSettingGroup: 'Export and sharing settings',
      canSpecifySecurityGroups: false,
      enabledSecurityGroups: [],
    },
    {
      settingName: 'ExternalSharingEnabled',
      enabled: true,
      tenantSettingGroup: 'Export and sharing settings',
      canSpecifySecurityGroups: true,
      enabledSecurityGroups: [{ graphId: 'grp-001', name: 'External Partners' }],
    },
    {
      settingName: 'ExportToExcel',
      enabled: true,
      tenantSettingGroup: 'Export and sharing settings',
      canSpecifySecurityGroups: false,
      enabledSecurityGroups: [],
    },
    // --- Medium risk, enabled ---
    {
      settingName: 'EmbedContent',
      enabled: true,
      tenantSettingGroup: 'Integration settings',
      canSpecifySecurityGroups: false,
      enabledSecurityGroups: [],
    },
    {
      settingName: 'EnableFabricCopilot',
      enabled: true,
      tenantSettingGroup: 'Copilot and Azure OpenAI Service',
      canSpecifySecurityGroups: true,
      enabledSecurityGroups: [
        { graphId: 'grp-002', name: 'AI Pilot Group' },
        { graphId: 'grp-003', name: 'Data Science Team' },
      ],
    },
    {
      settingName: 'ServicePrincipalAccess',
      enabled: true,
      tenantSettingGroup: 'Developer settings',
      canSpecifySecurityGroups: false,
      enabledSecurityGroups: [],
    },
    // --- High risk, disabled ---
    {
      settingName: 'AllowExternalDataSharing',
      enabled: false,
      tenantSettingGroup: 'Export and sharing settings',
      canSpecifySecurityGroups: false,
      enabledSecurityGroups: [],
    },
    {
      settingName: 'ExportToCsv',
      enabled: false,
      tenantSettingGroup: 'Export and sharing settings',
      canSpecifySecurityGroups: false,
      enabledSecurityGroups: [],
    },
    {
      settingName: 'AllowServicePrincipalsCreateAndUseProfiles',
      enabled: false,
      tenantSettingGroup: 'Developer settings',
      canSpecifySecurityGroups: false,
      enabledSecurityGroups: [],
    },
    // --- Medium risk, disabled ---
    {
      settingName: 'AllowServicePrincipalsUseReadonlyAdminApisEnabled',
      enabled: false,
      tenantSettingGroup: 'Developer settings',
      canSpecifySecurityGroups: false,
      enabledSecurityGroups: [],
    },
  ];
}

export function getMockWidelySharedArtifacts(): WidelySharedArtifact[] {
  return [
    {
      artifactId: 'ws-art-001',
      displayName: 'Sales Executive Dashboard',
      artifactType: 'Report',
      accessRight: 'ReadWrite',
      shareType: 'Link',
      sharer: {
        displayName: 'Alex Johnson',
        emailAddress: 'alex.johnson@contoso.com',
        identifier: 'alex.johnson@contoso.com',
        graphId: 'usr-001',
        principalType: 'User',
      },
    },
    {
      artifactId: 'ws-art-002',
      displayName: 'Org Revenue Metrics',
      artifactType: 'Dashboard',
      accessRight: 'Read',
      shareType: 'Link',
      sharer: {
        displayName: 'Maria Garcia',
        emailAddress: 'maria.garcia@contoso.com',
        identifier: 'maria.garcia@contoso.com',
        graphId: 'usr-002',
        principalType: 'User',
      },
    },
    {
      artifactId: 'ws-art-003',
      displayName: 'Customer Data Model',
      artifactType: 'Dataset',
      accessRight: 'ReadWrite',
      shareType: 'Link',
      sharer: {
        displayName: 'James Wilson',
        emailAddress: 'james.wilson@contoso.com',
        identifier: 'james.wilson@contoso.com',
        graphId: 'usr-003',
        principalType: 'User',
      },
    },
    {
      artifactId: 'ws-art-004',
      displayName: 'Quarterly Financial Report',
      artifactType: 'PaginatedReport',
      accessRight: 'Read',
      shareType: 'Link',
      sharer: {
        displayName: 'Taylor Reed',
        emailAddress: 'taylor.reed@external.com',
        identifier: 'taylor.reed@external.com',
        graphId: 'usr-ext-001',
        principalType: 'User',
      },
    },
    {
      artifactId: 'ws-art-005',
      displayName: 'Marketing Attribution',
      artifactType: 'Report',
      accessRight: 'Read',
      shareType: 'Link',
      sharer: {
        displayName: 'Sarah Chen',
        emailAddress: 'sarah.chen@contoso.com',
        identifier: 'sarah.chen@contoso.com',
        graphId: 'usr-004',
        principalType: 'User',
      },
    },
    {
      artifactId: 'ws-art-006',
      displayName: 'Retail Sales Dataflow',
      artifactType: 'Dataflow',
      accessRight: 'Read',
      shareType: 'Link',
      sharer: {
        displayName: 'James Wilson',
        emailAddress: 'james.wilson@contoso.com',
        identifier: 'james.wilson@contoso.com',
        graphId: 'usr-003',
        principalType: 'User',
      },
    },
  ];
}

/**
 * Returns ~200 realistic mock activity events for demo mode.
 *
 * Ghost workspaces (Grade D — daysInactive 95-180):
 *   ws-6  (My Workspace), ws-7  (Legacy Reports),
 *   ws-32 (Field Operations), ws-33 (Partner Analytics)
 *
 * No-event workspaces (Grade F — 0 events, not visible in 30-day live lookback
 * but still ghost candidates because daysInactive is effectively ∞):
 *   ws-5  (HR Dashboard), ws-34 (Temp Workspace), ws-35 (Archive Q3 2024)
 *
 * Active workspaces (daysInactive 1-14, not ghosts): all remaining 28 workspaces.
 */
export function getMockWorkspaceActivity(): ActivityEvent[] {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  function daysAgo(n: number): string {
    return new Date(now - n * DAY_MS).toISOString();
  }

  const events: ActivityEvent[] = [
    // ------------------------------------------------------------------
    // Grade A workspaces — 6-10 events each, recent (1-7 days)
    // ------------------------------------------------------------------

    // ws-1: Sales Analytics (8 events)
    { id: 'evt-001', creationTime: daysAgo(1),  activity: 'ViewReport',      workspaceId: 'ws-1',  workspaceName: 'Sales Analytics',           userId: 'usr-001' },
    { id: 'evt-002', creationTime: daysAgo(1),  activity: 'RefreshDataset',  workspaceId: 'ws-1',  workspaceName: 'Sales Analytics',           userId: 'usr-002' },
    { id: 'evt-003', creationTime: daysAgo(2),  activity: 'ViewDashboard',   workspaceId: 'ws-1',  workspaceName: 'Sales Analytics',           userId: 'usr-003' },
    { id: 'evt-004', creationTime: daysAgo(2),  activity: 'EditDataset',     workspaceId: 'ws-1',  workspaceName: 'Sales Analytics',           userId: 'usr-001' },
    { id: 'evt-005', creationTime: daysAgo(3),  activity: 'RunPipeline',     workspaceId: 'ws-1',  workspaceName: 'Sales Analytics',           userId: 'usr-004' },
    { id: 'evt-006', creationTime: daysAgo(4),  activity: 'EditReport',      workspaceId: 'ws-1',  workspaceName: 'Sales Analytics',           userId: 'usr-002' },
    { id: 'evt-007', creationTime: daysAgo(5),  activity: 'ViewReport',      workspaceId: 'ws-1',  workspaceName: 'Sales Analytics',           userId: 'usr-005' },
    { id: 'evt-008', creationTime: daysAgo(6),  activity: 'RefreshDataset',  workspaceId: 'ws-1',  workspaceName: 'Sales Analytics',           userId: 'usr-001' },

    // ws-8: Customer Support (6 events)
    { id: 'evt-010', creationTime: daysAgo(1),  activity: 'ViewReport',      workspaceId: 'ws-8',  workspaceName: 'Customer Support',          userId: 'usr-003' },
    { id: 'evt-011', creationTime: daysAgo(2),  activity: 'ViewDashboard',   workspaceId: 'ws-8',  workspaceName: 'Customer Support',          userId: 'usr-006' },
    { id: 'evt-012', creationTime: daysAgo(2),  activity: 'RefreshDataset',  workspaceId: 'ws-8',  workspaceName: 'Customer Support',          userId: 'usr-002' },
    { id: 'evt-013', creationTime: daysAgo(4),  activity: 'EditReport',      workspaceId: 'ws-8',  workspaceName: 'Customer Support',          userId: 'usr-003' },
    { id: 'evt-014', creationTime: daysAgo(5),  activity: 'RunPipeline',     workspaceId: 'ws-8',  workspaceName: 'Customer Support',          userId: 'usr-004' },
    { id: 'evt-015', creationTime: daysAgo(7),  activity: 'ViewReport',      workspaceId: 'ws-8',  workspaceName: 'Customer Support',          userId: 'usr-007' },

    // ws-9: Data Science Lab (7 events)
    { id: 'evt-020', creationTime: daysAgo(1),  activity: 'CreateItem',      workspaceId: 'ws-9',  workspaceName: 'Data Science Lab',          userId: 'usr-001' },
    { id: 'evt-021', creationTime: daysAgo(1),  activity: 'EditDataset',     workspaceId: 'ws-9',  workspaceName: 'Data Science Lab',          userId: 'usr-005' },
    { id: 'evt-022', creationTime: daysAgo(2),  activity: 'RunPipeline',     workspaceId: 'ws-9',  workspaceName: 'Data Science Lab',          userId: 'usr-001' },
    { id: 'evt-023', creationTime: daysAgo(3),  activity: 'ViewReport',      workspaceId: 'ws-9',  workspaceName: 'Data Science Lab',          userId: 'usr-002' },
    { id: 'evt-024', creationTime: daysAgo(3),  activity: 'EditReport',      workspaceId: 'ws-9',  workspaceName: 'Data Science Lab',          userId: 'usr-005' },
    { id: 'evt-025', creationTime: daysAgo(5),  activity: 'RefreshDataset',  workspaceId: 'ws-9',  workspaceName: 'Data Science Lab',          userId: 'usr-003' },
    { id: 'evt-026', creationTime: daysAgo(7),  activity: 'ViewDashboard',   workspaceId: 'ws-9',  workspaceName: 'Data Science Lab',          userId: 'usr-006' },

    // ws-12: Product Analytics (6 events)
    { id: 'evt-030', creationTime: daysAgo(1),  activity: 'ViewDashboard',   workspaceId: 'ws-12', workspaceName: 'Product Analytics',         userId: 'usr-004' },
    { id: 'evt-031', creationTime: daysAgo(2),  activity: 'RefreshDataset',  workspaceId: 'ws-12', workspaceName: 'Product Analytics',         userId: 'usr-004' },
    { id: 'evt-032', creationTime: daysAgo(3),  activity: 'EditDataset',     workspaceId: 'ws-12', workspaceName: 'Product Analytics',         userId: 'usr-001' },
    { id: 'evt-033', creationTime: daysAgo(4),  activity: 'ViewReport',      workspaceId: 'ws-12', workspaceName: 'Product Analytics',         userId: 'usr-003' },
    { id: 'evt-034', creationTime: daysAgo(5),  activity: 'RunPipeline',     workspaceId: 'ws-12', workspaceName: 'Product Analytics',         userId: 'usr-002' },
    { id: 'evt-035', creationTime: daysAgo(7),  activity: 'EditReport',      workspaceId: 'ws-12', workspaceName: 'Product Analytics',         userId: 'usr-005' },

    // ws-15: IoT Telemetry (8 events)
    { id: 'evt-040', creationTime: daysAgo(1),  activity: 'RunPipeline',     workspaceId: 'ws-15', workspaceName: 'IoT Telemetry',             userId: 'usr-006' },
    { id: 'evt-041', creationTime: daysAgo(1),  activity: 'RefreshDataset',  workspaceId: 'ws-15', workspaceName: 'IoT Telemetry',             userId: 'usr-006' },
    { id: 'evt-042', creationTime: daysAgo(2),  activity: 'ViewDashboard',   workspaceId: 'ws-15', workspaceName: 'IoT Telemetry',             userId: 'usr-007' },
    { id: 'evt-043', creationTime: daysAgo(2),  activity: 'ViewReport',      workspaceId: 'ws-15', workspaceName: 'IoT Telemetry',             userId: 'usr-001' },
    { id: 'evt-044', creationTime: daysAgo(3),  activity: 'EditDataset',     workspaceId: 'ws-15', workspaceName: 'IoT Telemetry',             userId: 'usr-006' },
    { id: 'evt-045', creationTime: daysAgo(4),  activity: 'CreateItem',      workspaceId: 'ws-15', workspaceName: 'IoT Telemetry',             userId: 'usr-008' },
    { id: 'evt-046', creationTime: daysAgo(5),  activity: 'RunPipeline',     workspaceId: 'ws-15', workspaceName: 'IoT Telemetry',             userId: 'usr-006' },
    { id: 'evt-047', creationTime: daysAgo(6),  activity: 'RefreshDataset',  workspaceId: 'ws-15', workspaceName: 'IoT Telemetry',             userId: 'usr-006' },

    // ws-16: Data Platform Hub (10 events)
    { id: 'evt-050', creationTime: daysAgo(1),  activity: 'RunPipeline',     workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-008' },
    { id: 'evt-051', creationTime: daysAgo(1),  activity: 'RefreshDataset',  workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-008' },
    { id: 'evt-052', creationTime: daysAgo(2),  activity: 'ViewReport',      workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-002' },
    { id: 'evt-053', creationTime: daysAgo(2),  activity: 'EditDataset',     workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-008' },
    { id: 'evt-054', creationTime: daysAgo(3),  activity: 'RunPipeline',     workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-008' },
    { id: 'evt-055', creationTime: daysAgo(3),  activity: 'ViewDashboard',   workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-001' },
    { id: 'evt-056', creationTime: daysAgo(4),  activity: 'EditReport',      workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-003' },
    { id: 'evt-057', creationTime: daysAgo(5),  activity: 'CreateItem',      workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-008' },
    { id: 'evt-058', creationTime: daysAgo(6),  activity: 'RefreshDataset',  workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-008' },
    { id: 'evt-059', creationTime: daysAgo(7),  activity: 'RunPipeline',     workspaceId: 'ws-16', workspaceName: 'Data Platform Hub',         userId: 'usr-008' },

    // ws-17: Risk Analytics (7 events)
    { id: 'evt-060', creationTime: daysAgo(1),  activity: 'ViewReport',      workspaceId: 'ws-17', workspaceName: 'Risk Analytics',            userId: 'usr-004' },
    { id: 'evt-061', creationTime: daysAgo(2),  activity: 'ViewDashboard',   workspaceId: 'ws-17', workspaceName: 'Risk Analytics',            userId: 'usr-004' },
    { id: 'evt-062', creationTime: daysAgo(3),  activity: 'RefreshDataset',  workspaceId: 'ws-17', workspaceName: 'Risk Analytics',            userId: 'usr-007' },
    { id: 'evt-063', creationTime: daysAgo(3),  activity: 'EditDataset',     workspaceId: 'ws-17', workspaceName: 'Risk Analytics',            userId: 'usr-007' },
    { id: 'evt-064', creationTime: daysAgo(5),  activity: 'RunPipeline',     workspaceId: 'ws-17', workspaceName: 'Risk Analytics',            userId: 'usr-008' },
    { id: 'evt-065', creationTime: daysAgo(6),  activity: 'ViewReport',      workspaceId: 'ws-17', workspaceName: 'Risk Analytics',            userId: 'usr-002' },
    { id: 'evt-066', creationTime: daysAgo(7),  activity: 'EditReport',      workspaceId: 'ws-17', workspaceName: 'Risk Analytics',            userId: 'usr-004' },

    // ws-18: Customer Intelligence (6 events)
    { id: 'evt-070', creationTime: daysAgo(1),  activity: 'ViewDashboard',   workspaceId: 'ws-18', workspaceName: 'Customer Intelligence',     userId: 'usr-003' },
    { id: 'evt-071', creationTime: daysAgo(2),  activity: 'RefreshDataset',  workspaceId: 'ws-18', workspaceName: 'Customer Intelligence',     userId: 'usr-003' },
    { id: 'evt-072', creationTime: daysAgo(3),  activity: 'EditReport',      workspaceId: 'ws-18', workspaceName: 'Customer Intelligence',     userId: 'usr-005' },
    { id: 'evt-073', creationTime: daysAgo(4),  activity: 'RunPipeline',     workspaceId: 'ws-18', workspaceName: 'Customer Intelligence',     userId: 'usr-003' },
    { id: 'evt-074', creationTime: daysAgo(5),  activity: 'ViewReport',      workspaceId: 'ws-18', workspaceName: 'Customer Intelligence',     userId: 'usr-001' },
    { id: 'evt-075', creationTime: daysAgo(7),  activity: 'EditDataset',     workspaceId: 'ws-18', workspaceName: 'Customer Intelligence',     userId: 'usr-003' },

    // ws-19: Operations Excellence (7 events)
    { id: 'evt-080', creationTime: daysAgo(1),  activity: 'RunPipeline',     workspaceId: 'ws-19', workspaceName: 'Operations Excellence',     userId: 'usr-006' },
    { id: 'evt-081', creationTime: daysAgo(2),  activity: 'ViewDashboard',   workspaceId: 'ws-19', workspaceName: 'Operations Excellence',     userId: 'usr-004' },
    { id: 'evt-082', creationTime: daysAgo(2),  activity: 'RefreshDataset',  workspaceId: 'ws-19', workspaceName: 'Operations Excellence',     userId: 'usr-006' },
    { id: 'evt-083', creationTime: daysAgo(3),  activity: 'ViewReport',      workspaceId: 'ws-19', workspaceName: 'Operations Excellence',     userId: 'usr-002' },
    { id: 'evt-084', creationTime: daysAgo(5),  activity: 'EditDataset',     workspaceId: 'ws-19', workspaceName: 'Operations Excellence',     userId: 'usr-006' },
    { id: 'evt-085', creationTime: daysAgo(6),  activity: 'EditReport',      workspaceId: 'ws-19', workspaceName: 'Operations Excellence',     userId: 'usr-005' },
    { id: 'evt-086', creationTime: daysAgo(7),  activity: 'RunPipeline',     workspaceId: 'ws-19', workspaceName: 'Operations Excellence',     userId: 'usr-006' },

    // ws-20: Finance Data Warehouse (8 events)
    { id: 'evt-090', creationTime: daysAgo(1),  activity: 'ViewReport',      workspaceId: 'ws-20', workspaceName: 'Finance Data Warehouse',    userId: 'usr-007' },
    { id: 'evt-091', creationTime: daysAgo(1),  activity: 'RefreshDataset',  workspaceId: 'ws-20', workspaceName: 'Finance Data Warehouse',    userId: 'usr-008' },
    { id: 'evt-092', creationTime: daysAgo(2),  activity: 'RunPipeline',     workspaceId: 'ws-20', workspaceName: 'Finance Data Warehouse',    userId: 'usr-008' },
    { id: 'evt-093', creationTime: daysAgo(3),  activity: 'ViewDashboard',   workspaceId: 'ws-20', workspaceName: 'Finance Data Warehouse',    userId: 'usr-004' },
    { id: 'evt-094', creationTime: daysAgo(4),  activity: 'EditDataset',     workspaceId: 'ws-20', workspaceName: 'Finance Data Warehouse',    userId: 'usr-007' },
    { id: 'evt-095', creationTime: daysAgo(5),  activity: 'ViewReport',      workspaceId: 'ws-20', workspaceName: 'Finance Data Warehouse',    userId: 'usr-002' },
    { id: 'evt-096', creationTime: daysAgo(6),  activity: 'EditReport',      workspaceId: 'ws-20', workspaceName: 'Finance Data Warehouse',    userId: 'usr-007' },
    { id: 'evt-097', creationTime: daysAgo(7),  activity: 'RefreshDataset',  workspaceId: 'ws-20', workspaceName: 'Finance Data Warehouse',    userId: 'usr-008' },

    // ------------------------------------------------------------------
    // Grade B workspaces — 5-7 events each, recent (2-10 days)
    // ------------------------------------------------------------------

    // ws-2: Finance Reporting (6 events)
    { id: 'evt-100', creationTime: daysAgo(2),  activity: 'ViewReport',      workspaceId: 'ws-2',  workspaceName: 'Finance Reporting',         userId: 'usr-007' },
    { id: 'evt-101', creationTime: daysAgo(3),  activity: 'RefreshDataset',  workspaceId: 'ws-2',  workspaceName: 'Finance Reporting',         userId: 'usr-007' },
    { id: 'evt-102', creationTime: daysAgo(4),  activity: 'EditReport',      workspaceId: 'ws-2',  workspaceName: 'Finance Reporting',         userId: 'usr-004' },
    { id: 'evt-103', creationTime: daysAgo(5),  activity: 'ViewDashboard',   workspaceId: 'ws-2',  workspaceName: 'Finance Reporting',         userId: 'usr-002' },
    { id: 'evt-104', creationTime: daysAgo(7),  activity: 'EditDataset',     workspaceId: 'ws-2',  workspaceName: 'Finance Reporting',         userId: 'usr-007' },
    { id: 'evt-105', creationTime: daysAgo(9),  activity: 'RunPipeline',     workspaceId: 'ws-2',  workspaceName: 'Finance Reporting',         userId: 'usr-008' },

    // ws-4: Marketing Insights (5 events)
    { id: 'evt-110', creationTime: daysAgo(2),  activity: 'ViewDashboard',   workspaceId: 'ws-4',  workspaceName: 'Marketing Insights',        userId: 'usr-003' },
    { id: 'evt-111', creationTime: daysAgo(3),  activity: 'ViewReport',      workspaceId: 'ws-4',  workspaceName: 'Marketing Insights',        userId: 'usr-005' },
    { id: 'evt-112', creationTime: daysAgo(5),  activity: 'EditReport',      workspaceId: 'ws-4',  workspaceName: 'Marketing Insights',        userId: 'usr-003' },
    { id: 'evt-113', creationTime: daysAgo(7),  activity: 'RefreshDataset',  workspaceId: 'ws-4',  workspaceName: 'Marketing Insights',        userId: 'usr-005' },
    { id: 'evt-114', creationTime: daysAgo(10), activity: 'EditDataset',     workspaceId: 'ws-4',  workspaceName: 'Marketing Insights',        userId: 'usr-003' },

    // ws-11: Executive Dashboards (5 events)
    { id: 'evt-120', creationTime: daysAgo(3),  activity: 'ViewDashboard',   workspaceId: 'ws-11', workspaceName: 'Executive Dashboards',      userId: 'usr-001' },
    { id: 'evt-121', creationTime: daysAgo(4),  activity: 'ViewReport',      workspaceId: 'ws-11', workspaceName: 'Executive Dashboards',      userId: 'usr-002' },
    { id: 'evt-122', creationTime: daysAgo(6),  activity: 'RefreshDataset',  workspaceId: 'ws-11', workspaceName: 'Executive Dashboards',      userId: 'usr-008' },
    { id: 'evt-123', creationTime: daysAgo(8),  activity: 'EditReport',      workspaceId: 'ws-11', workspaceName: 'Executive Dashboards',      userId: 'usr-004' },
    { id: 'evt-124', creationTime: daysAgo(10), activity: 'ViewDashboard',   workspaceId: 'ws-11', workspaceName: 'Executive Dashboards',      userId: 'usr-006' },

    // ws-13: Compliance Monitoring (5 events)
    { id: 'evt-130', creationTime: daysAgo(3),  activity: 'ViewReport',      workspaceId: 'ws-13', workspaceName: 'Compliance Monitoring',     userId: 'usr-004' },
    { id: 'evt-131', creationTime: daysAgo(5),  activity: 'EditDataset',     workspaceId: 'ws-13', workspaceName: 'Compliance Monitoring',     userId: 'usr-004' },
    { id: 'evt-132', creationTime: daysAgo(7),  activity: 'RefreshDataset',  workspaceId: 'ws-13', workspaceName: 'Compliance Monitoring',     userId: 'usr-007' },
    { id: 'evt-133', creationTime: daysAgo(9),  activity: 'RunPipeline',     workspaceId: 'ws-13', workspaceName: 'Compliance Monitoring',     userId: 'usr-008' },
    { id: 'evt-134', creationTime: daysAgo(11), activity: 'ViewReport',      workspaceId: 'ws-13', workspaceName: 'Compliance Monitoring',     userId: 'usr-004' },

    // ws-21: Digital Transformation (5 events)
    { id: 'evt-140', creationTime: daysAgo(2),  activity: 'ViewReport',      workspaceId: 'ws-21', workspaceName: 'Digital Transformation',    userId: 'usr-002' },
    { id: 'evt-141', creationTime: daysAgo(4),  activity: 'EditReport',      workspaceId: 'ws-21', workspaceName: 'Digital Transformation',    userId: 'usr-005' },
    { id: 'evt-142', creationTime: daysAgo(6),  activity: 'ViewDashboard',   workspaceId: 'ws-21', workspaceName: 'Digital Transformation',    userId: 'usr-001' },
    { id: 'evt-143', creationTime: daysAgo(8),  activity: 'RefreshDataset',  workspaceId: 'ws-21', workspaceName: 'Digital Transformation',    userId: 'usr-003' },
    { id: 'evt-144', creationTime: daysAgo(10), activity: 'EditDataset',     workspaceId: 'ws-21', workspaceName: 'Digital Transformation',    userId: 'usr-002' },

    // ws-22: Legal Compliance (5 events)
    { id: 'evt-150', creationTime: daysAgo(3),  activity: 'ViewReport',      workspaceId: 'ws-22', workspaceName: 'Legal Compliance',          userId: 'usr-007' },
    { id: 'evt-151', creationTime: daysAgo(5),  activity: 'EditDataset',     workspaceId: 'ws-22', workspaceName: 'Legal Compliance',          userId: 'usr-004' },
    { id: 'evt-152', creationTime: daysAgo(7),  activity: 'RefreshDataset',  workspaceId: 'ws-22', workspaceName: 'Legal Compliance',          userId: 'usr-007' },
    { id: 'evt-153', creationTime: daysAgo(9),  activity: 'ViewDashboard',   workspaceId: 'ws-22', workspaceName: 'Legal Compliance',          userId: 'usr-002' },
    { id: 'evt-154', creationTime: daysAgo(12), activity: 'EditReport',      workspaceId: 'ws-22', workspaceName: 'Legal Compliance',          userId: 'usr-004' },

    // ws-23: Strategic Planning (5 events)
    { id: 'evt-160', creationTime: daysAgo(4),  activity: 'ViewReport',      workspaceId: 'ws-23', workspaceName: 'Strategic Planning',        userId: 'usr-001' },
    { id: 'evt-161', creationTime: daysAgo(6),  activity: 'EditReport',      workspaceId: 'ws-23', workspaceName: 'Strategic Planning',        userId: 'usr-005' },
    { id: 'evt-162', creationTime: daysAgo(8),  activity: 'ViewDashboard',   workspaceId: 'ws-23', workspaceName: 'Strategic Planning',        userId: 'usr-002' },
    { id: 'evt-163', creationTime: daysAgo(10), activity: 'RefreshDataset',  workspaceId: 'ws-23', workspaceName: 'Strategic Planning',        userId: 'usr-008' },
    { id: 'evt-164', creationTime: daysAgo(12), activity: 'EditDataset',     workspaceId: 'ws-23', workspaceName: 'Strategic Planning',        userId: 'usr-001' },

    // ws-24: Treasury Analytics (5 events)
    { id: 'evt-170', creationTime: daysAgo(3),  activity: 'ViewReport',      workspaceId: 'ws-24', workspaceName: 'Treasury Analytics',        userId: 'usr-007' },
    { id: 'evt-171', creationTime: daysAgo(5),  activity: 'RefreshDataset',  workspaceId: 'ws-24', workspaceName: 'Treasury Analytics',        userId: 'usr-007' },
    { id: 'evt-172', creationTime: daysAgo(7),  activity: 'ViewDashboard',   workspaceId: 'ws-24', workspaceName: 'Treasury Analytics',        userId: 'usr-004' },
    { id: 'evt-173', creationTime: daysAgo(9),  activity: 'EditDataset',     workspaceId: 'ws-24', workspaceName: 'Treasury Analytics',        userId: 'usr-007' },
    { id: 'evt-174', creationTime: daysAgo(11), activity: 'RunPipeline',     workspaceId: 'ws-24', workspaceName: 'Treasury Analytics',        userId: 'usr-008' },

    // ws-25: Customer Experience (5 events)
    { id: 'evt-180', creationTime: daysAgo(2),  activity: 'ViewDashboard',   workspaceId: 'ws-25', workspaceName: 'Customer Experience',       userId: 'usr-003' },
    { id: 'evt-181', creationTime: daysAgo(4),  activity: 'ViewReport',      workspaceId: 'ws-25', workspaceName: 'Customer Experience',       userId: 'usr-005' },
    { id: 'evt-182', creationTime: daysAgo(6),  activity: 'RefreshDataset',  workspaceId: 'ws-25', workspaceName: 'Customer Experience',       userId: 'usr-003' },
    { id: 'evt-183', creationTime: daysAgo(9),  activity: 'EditReport',      workspaceId: 'ws-25', workspaceName: 'Customer Experience',       userId: 'usr-005' },
    { id: 'evt-184', creationTime: daysAgo(12), activity: 'EditDataset',     workspaceId: 'ws-25', workspaceName: 'Customer Experience',       userId: 'usr-003' },

    // ------------------------------------------------------------------
    // Grade C workspaces — 3-5 events each, less recent (5-14 days)
    // ------------------------------------------------------------------

    // ws-3: Engineering Metrics (5 events)
    { id: 'evt-200', creationTime: daysAgo(5),  activity: 'ViewReport',      workspaceId: 'ws-3',  workspaceName: 'Engineering Metrics',       userId: 'usr-006' },
    { id: 'evt-201', creationTime: daysAgo(6),  activity: 'EditReport',      workspaceId: 'ws-3',  workspaceName: 'Engineering Metrics',       userId: 'usr-001' },
    { id: 'evt-202', creationTime: daysAgo(8),  activity: 'RefreshDataset',  workspaceId: 'ws-3',  workspaceName: 'Engineering Metrics',       userId: 'usr-006' },
    { id: 'evt-203', creationTime: daysAgo(11), activity: 'RunPipeline',     workspaceId: 'ws-3',  workspaceName: 'Engineering Metrics',       userId: 'usr-006' },
    { id: 'evt-204', creationTime: daysAgo(14), activity: 'ViewDashboard',   workspaceId: 'ws-3',  workspaceName: 'Engineering Metrics',       userId: 'usr-002' },

    // ws-10: Supply Chain (4 events)
    { id: 'evt-210', creationTime: daysAgo(6),  activity: 'ViewReport',      workspaceId: 'ws-10', workspaceName: 'Supply Chain',             userId: 'usr-005' },
    { id: 'evt-211', creationTime: daysAgo(8),  activity: 'RefreshDataset',  workspaceId: 'ws-10', workspaceName: 'Supply Chain',             userId: 'usr-004' },
    { id: 'evt-212', creationTime: daysAgo(11), activity: 'RunPipeline',     workspaceId: 'ws-10', workspaceName: 'Supply Chain',             userId: 'usr-005' },
    { id: 'evt-213', creationTime: daysAgo(14), activity: 'ViewDashboard',   workspaceId: 'ws-10', workspaceName: 'Supply Chain',             userId: 'usr-003' },

    // ws-14: Dev Sandbox (3 events)
    { id: 'evt-220', creationTime: daysAgo(7),  activity: 'CreateItem',      workspaceId: 'ws-14', workspaceName: 'Dev Sandbox',              userId: 'usr-006' },
    { id: 'evt-221', creationTime: daysAgo(10), activity: 'EditDataset',     workspaceId: 'ws-14', workspaceName: 'Dev Sandbox',              userId: 'usr-001' },
    { id: 'evt-222', creationTime: daysAgo(13), activity: 'ViewReport',      workspaceId: 'ws-14', workspaceName: 'Dev Sandbox',              userId: 'usr-006' },

    // ws-26: Supplier Analytics (4 events)
    { id: 'evt-230', creationTime: daysAgo(7),  activity: 'ViewReport',      workspaceId: 'ws-26', workspaceName: 'Supplier Analytics',       userId: 'usr-004' },
    { id: 'evt-231', creationTime: daysAgo(9),  activity: 'RefreshDataset',  workspaceId: 'ws-26', workspaceName: 'Supplier Analytics',       userId: 'usr-005' },
    { id: 'evt-232', creationTime: daysAgo(12), activity: 'EditReport',      workspaceId: 'ws-26', workspaceName: 'Supplier Analytics',       userId: 'usr-004' },
    { id: 'evt-233', creationTime: daysAgo(14), activity: 'RunPipeline',     workspaceId: 'ws-26', workspaceName: 'Supplier Analytics',       userId: 'usr-003' },

    // ws-27: Workforce Analytics (4 events)
    { id: 'evt-240', creationTime: daysAgo(8),  activity: 'ViewDashboard',   workspaceId: 'ws-27', workspaceName: 'Workforce Analytics',      userId: 'usr-002' },
    { id: 'evt-241', creationTime: daysAgo(9),  activity: 'ViewReport',      workspaceId: 'ws-27', workspaceName: 'Workforce Analytics',      userId: 'usr-005' },
    { id: 'evt-242', creationTime: daysAgo(12), activity: 'RefreshDataset',  workspaceId: 'ws-27', workspaceName: 'Workforce Analytics',      userId: 'usr-002' },
    { id: 'evt-243', creationTime: daysAgo(14), activity: 'EditDataset',     workspaceId: 'ws-27', workspaceName: 'Workforce Analytics',      userId: 'usr-003' },

    // ws-28: Quality Management (4 events)
    { id: 'evt-250', creationTime: daysAgo(6),  activity: 'ViewReport',      workspaceId: 'ws-28', workspaceName: 'Quality Management',       userId: 'usr-006' },
    { id: 'evt-251', creationTime: daysAgo(9),  activity: 'RefreshDataset',  workspaceId: 'ws-28', workspaceName: 'Quality Management',       userId: 'usr-007' },
    { id: 'evt-252', creationTime: daysAgo(11), activity: 'RunPipeline',     workspaceId: 'ws-28', workspaceName: 'Quality Management',       userId: 'usr-006' },
    { id: 'evt-253', creationTime: daysAgo(14), activity: 'ViewDashboard',   workspaceId: 'ws-28', workspaceName: 'Quality Management',       userId: 'usr-004' },

    // ws-29: Retail Analytics (4 events)
    { id: 'evt-260', creationTime: daysAgo(7),  activity: 'ViewReport',      workspaceId: 'ws-29', workspaceName: 'Retail Analytics',         userId: 'usr-005' },
    { id: 'evt-261', creationTime: daysAgo(9),  activity: 'EditReport',      workspaceId: 'ws-29', workspaceName: 'Retail Analytics',         userId: 'usr-003' },
    { id: 'evt-262', creationTime: daysAgo(11), activity: 'RefreshDataset',  workspaceId: 'ws-29', workspaceName: 'Retail Analytics',         userId: 'usr-005' },
    { id: 'evt-263', creationTime: daysAgo(13), activity: 'ViewDashboard',   workspaceId: 'ws-29', workspaceName: 'Retail Analytics',         userId: 'usr-001' },

    // ws-30: Claims Processing (4 events)
    { id: 'evt-270', creationTime: daysAgo(8),  activity: 'ViewReport',      workspaceId: 'ws-30', workspaceName: 'Claims Processing',        userId: 'usr-004' },
    { id: 'evt-271', creationTime: daysAgo(10), activity: 'RefreshDataset',  workspaceId: 'ws-30', workspaceName: 'Claims Processing',        userId: 'usr-004' },
    { id: 'evt-272', creationTime: daysAgo(12), activity: 'RunPipeline',     workspaceId: 'ws-30', workspaceName: 'Claims Processing',        userId: 'usr-007' },
    { id: 'evt-273', creationTime: daysAgo(14), activity: 'ViewDashboard',   workspaceId: 'ws-30', workspaceName: 'Claims Processing',        userId: 'usr-002' },

    // ws-31: Vendor Management (3 events)
    { id: 'evt-280', creationTime: daysAgo(9),  activity: 'ViewReport',      workspaceId: 'ws-31', workspaceName: 'Vendor Management',        userId: 'usr-005' },
    { id: 'evt-281', creationTime: daysAgo(11), activity: 'RefreshDataset',  workspaceId: 'ws-31', workspaceName: 'Vendor Management',        userId: 'usr-003' },
    { id: 'evt-282', creationTime: daysAgo(14), activity: 'EditDataset',     workspaceId: 'ws-31', workspaceName: 'Vendor Management',        userId: 'usr-005' },

    // ------------------------------------------------------------------
    // Grade D workspaces — GHOST: 2-3 events each, 95-180 days ago
    // ------------------------------------------------------------------

    // ws-6: My Workspace (last active 110 days ago → ghost)
    { id: 'evt-300', creationTime: daysAgo(95),  activity: 'ViewReport',     workspaceId: 'ws-6',  workspaceName: 'My Workspace',             userId: 'usr-002' },
    { id: 'evt-301', creationTime: daysAgo(108), activity: 'EditDataset',    workspaceId: 'ws-6',  workspaceName: 'My Workspace',             userId: 'usr-002' },
    { id: 'evt-302', creationTime: daysAgo(110), activity: 'ViewDashboard',  workspaceId: 'ws-6',  workspaceName: 'My Workspace',             userId: 'usr-002' },

    // ws-7: Legacy Reports (last active 145 days ago → ghost)
    { id: 'evt-310', creationTime: daysAgo(130), activity: 'ViewReport',     workspaceId: 'ws-7',  workspaceName: 'Legacy Reports',           userId: 'usr-001' },
    { id: 'evt-311', creationTime: daysAgo(142), activity: 'ViewDashboard',  workspaceId: 'ws-7',  workspaceName: 'Legacy Reports',           userId: 'usr-003' },
    { id: 'evt-312', creationTime: daysAgo(145), activity: 'RefreshDataset', workspaceId: 'ws-7',  workspaceName: 'Legacy Reports',           userId: 'usr-007' },

    // ws-32: Field Operations (last active 120 days ago → ghost)
    { id: 'evt-320', creationTime: daysAgo(105), activity: 'RunPipeline',    workspaceId: 'ws-32', workspaceName: 'Field Operations',         userId: 'usr-006' },
    { id: 'evt-321', creationTime: daysAgo(115), activity: 'ViewReport',     workspaceId: 'ws-32', workspaceName: 'Field Operations',         userId: 'usr-005' },
    { id: 'evt-322', creationTime: daysAgo(120), activity: 'EditDataset',    workspaceId: 'ws-32', workspaceName: 'Field Operations',         userId: 'usr-006' },

    // ws-33: Partner Analytics (last active 180 days ago → ghost)
    { id: 'evt-330', creationTime: daysAgo(165), activity: 'ViewReport',     workspaceId: 'ws-33', workspaceName: 'Partner Analytics',        userId: 'usr-003' },
    { id: 'evt-331', creationTime: daysAgo(172), activity: 'EditReport',     workspaceId: 'ws-33', workspaceName: 'Partner Analytics',        userId: 'usr-005' },
    { id: 'evt-332', creationTime: daysAgo(180), activity: 'RefreshDataset', workspaceId: 'ws-33', workspaceName: 'Partner Analytics',        userId: 'usr-004' },

    // ------------------------------------------------------------------
    // Grade F workspaces — NO EVENTS
    // ws-5  (HR Dashboard), ws-34 (Temp Workspace), ws-35 (Archive Q3 2024)
    // These have 0 events. In live mode (30-day lookback) they'd be invisible.
    // In demo mode deriveGhostWorkspaces sees them via the workspace list
    // (not via events), so they still surface as ghosts with daysInactive=∞.
    // ------------------------------------------------------------------
  ];

  return events;
}
