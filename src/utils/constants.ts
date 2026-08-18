// ---------------------------------------------------------------------------
// Shared constants — single source of truth for values used across the app
// ---------------------------------------------------------------------------

import type { CSSProperties } from 'react';

// -- Fabric API --

/** Default Fabric REST API base URL (overridden by VITE_FABRIC_API_BASE). */
export const DEFAULT_FABRIC_API_BASE = 'https://api.fabric.microsoft.com/v1';

/** OAuth scopes for core Fabric API calls (workspaces, items, capacities). */
export const CORE_SCOPES = ['https://api.fabric.microsoft.com/.default'];

/** OAuth scopes for Fabric Admin APIs (requires incremental consent). */
export const ADMIN_SCOPES = ['https://api.fabric.microsoft.com/Tenant.Read.All'];

// -- Graph API --

/** OAuth scopes required for Microsoft Graph API calls (group membership). */
export const GRAPH_SCOPES = ['https://graph.microsoft.com/GroupMember.Read.All'];

/** Default Microsoft Graph API base URL. */
export const DEFAULT_GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

// -- Power BI Admin API --

/** Base URL for the Power BI Admin REST API. Used by widelyShared and (future) activityEvents. */
export const POWERBI_ADMIN_API_BASE = 'https://api.powerbi.com/v1.0/myorg';

/** OAuth scopes for Power BI Admin API calls (different resource from Fabric API).
 *  MSAL will fire acquireTokenPopup automatically on first use if not yet consented. */
export const POWERBI_SCOPES = ['https://analysis.windows.net/powerbi/api/.default'];

// -- Ghost workspaces --

/**
 * Number of days of inactivity after which a workspace is considered inactive/stale.
 * Must stay comfortably below ACTIVITY_LOG_LOOKBACK_DAYS: at the lookback value the
 * feature goes binary (every ghost reads the same number) and loses its ranking.
 */
export const GHOST_WORKSPACE_THRESHOLD_DAYS = 14;

/**
 * Number of days to look back when fetching activity events from the Power BI activity log.
 * The API requires start/end within the same UTC day, so each day is a separate request.
 *
 * 28 is the platform maximum: Get Activity Events documents "within the last 28 days", so no
 * larger window exists and no longer inactivity figure can be reported. Costs ~29 requests per
 * scan out of the 200/hr admin budget.
 */
export const ACTIVITY_LOG_LOOKBACK_DAYS = 28;

// -- Rate limiting --

/** Admin API rate limit (requests per hour). */
export const ADMIN_RATE_LIMIT = 200;

/** Default wait time (ms) when a 429 response has no Retry-After header. */
export const DEFAULT_RETRY_AFTER_MS = 5000;

/** Request count threshold at which to warn about approaching the admin rate limit (90% of 200). */
export const ADMIN_RATE_WARNING_THRESHOLD = 180;

/** Maximum number of retry attempts on a 429 response before throwing. */
export const MAX_RETRY_COUNT = 3;

/** Base delay (ms) for exponential backoff on 429 retries. */
export const BASE_RETRY_DELAY_MS = 1000;

/** Maximum delay (ms) cap for exponential backoff on 429 retries. */
export const MAX_RETRY_DELAY_MS = 30000;

/** Delay (ms) between mock progress updates in demo mode. */
export const DEMO_PROGRESS_DELAY_MS = 80;

// -- UI timing --

/** Search input debounce delay (ms). */
export const SEARCH_DEBOUNCE_MS = 300;

/** Toast auto-dismiss duration (ms). */
export const TOAST_DISMISS_MS = 5000;

// -- Charts --

/** Shared chart color palette (Meridian-aligned sequence, cobalt/cyan brand-led). */
export const CHART_COLORS = [
  '#2563EB', '#06B6D4', '#60A5FA', '#B45309', '#15803D',
  '#7C3AED', '#DB2777', '#EA580C', '#0891B2', '#FBBF24',
  '#868E96', '#22D3EE',
] as const;

/** Color map for workspace roles (used in Security page charts and badges). */
export const ROLE_COLORS: Record<string, string> = {
  Admin: '#DC2626',
  Member: '#2563EB',
  Contributor: '#15803D',
  Viewer: '#495057',
};

/** Default fallback color for unknown chart categories. */
export const CHART_FALLBACK_COLOR = '#495057';

// -- Item types --

/**
 * Maps a Fabric item type to an `--item-*` color token suffix (see index.css
 * for the light/dark values). Related workloads share a token by family, one
 * family per Fabric workload group. Every member of `KnownItemType` is mapped;
 * 'default' (neutral gray) is reserved for the open union's long tail — item
 * types Microsoft adds after this list was written.
 *
 * Families are grouped, not per-type: the badge renders the type name, so color
 * carries the workload grouping rather than the identity. A per-type palette
 * would need 51 hues that stay distinguishable AND pass contrast on both
 * themes, for no added information.
 */
const ITEM_TYPE_TOKENS: Record<string, string> = {
  // Power BI
  Report: 'report',
  PaginatedReport: 'report',
  Dashboard: 'dashboard',
  SemanticModel: 'semantic-model',
  Datamart: 'semantic-model',
  // Data engineering
  Lakehouse: 'lakehouse',
  Notebook: 'notebook',
  SparkJobDefinition: 'notebook',
  Environment: 'notebook',
  // Data integration
  DataPipeline: 'pipeline',
  Pipeline: 'pipeline',
  Dataflow: 'pipeline',
  CopyJob: 'pipeline',
  MountedDataFactory: 'pipeline',
  ApacheAirflowJob: 'pipeline',
  DataBuildToolJob: 'pipeline',
  // Warehouse / databases / mirroring
  Warehouse: 'warehouse',
  WarehouseSnapshot: 'warehouse',
  SQLEndpoint: 'warehouse',
  SQLDatabase: 'warehouse',
  MirroredWarehouse: 'warehouse',
  MirroredDatabase: 'warehouse',
  MirroredAzureDatabricksCatalog: 'warehouse',
  MirroredCatalog: 'warehouse',
  SnowflakeDatabase: 'warehouse',
  CosmosDBDatabase: 'warehouse',
  AzureDatabricksStorage: 'warehouse',
  // Real-time intelligence
  Eventhouse: 'rti',
  Eventstream: 'rti',
  KQLDatabase: 'rti',
  KQLQueryset: 'rti',
  KQLDashboard: 'rti',
  Reflex: 'rti',
  EventSchemaSet: 'rti',
  // AI / data science
  DataAgent: 'ai',
  MLExperiment: 'ai',
  MLModel: 'ai',
  GraphModel: 'ai',
  GraphQuerySet: 'ai',
  AnomalyDetector: 'ai',
  // Industry solutions / digital twin
  DigitalTwinBuilder: 'industry',
  DigitalTwinBuilderFlow: 'industry',
  Ontology: 'industry',
  Map: 'industry',
  // Developer surfaces and org apps
  GraphQLApi: 'platform',
  UserDataFunction: 'platform',
  AppBackend: 'platform',
  VariableLibrary: 'platform',
  OrgApp: 'platform',
  OrgAppAudience: 'platform',
  OperationsAgent: 'platform',
};

/** Color token suffix for a Fabric item type; 'default' for unmapped types. */
export function itemTypeToken(type: string): string {
  return ITEM_TYPE_TOKENS[type] ?? 'default';
}

/** Shared Recharts tooltip style object (dark themed, uses design tokens). */
export const CHART_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'var(--m-neutral-900, #16191D)',
  border: '1px solid var(--m-neutral-700, #343A40)',
  borderRadius: 'var(--m-radius-md, 8px)',
  fontSize: '12px',
  color: 'var(--m-neutral-0, #FFFFFF)',
};

// -- Governance --

/** Health check IDs classified as critical severity in governance panels. */
export const CRITICAL_HEALTH_CHECKS = ['capacity', 'description', 'workspaceIdentity'] as const;

// -- Health scoring --

/** Default naming convention regex for workspace health checks. */
export const DEFAULT_NAMING_PATTERN = /^[A-Z][a-zA-Z0-9]+([-_ ][A-Za-z0-9]+)*$/;

/** Default naming pattern as a string (for display in Settings UI). */
export const DEFAULT_NAMING_PATTERN_STRING = '^[A-Z][a-zA-Z0-9]+([-_ ][A-Za-z0-9]+)*$';

/** Point values for each health check (name → maxPoints). */
export const HEALTH_SCORE_WEIGHTS = {
  description: 10,
  capacity: 15,
  domain: 10,
  workspaceIdentity: 25, // merged: SPN configuration enables both identity and Git integration
  naming: 10,
  activeItems: 10,
  dataLayer: 10,
  reasonableCount: 10,
  tagCoverage: 10,
} as const;

/** Total possible health score points. */
export const HEALTH_SCORE_MAX =
  Object.values(HEALTH_SCORE_WEIGHTS).reduce((a, b) => a + b, 0);

/** Grade boundaries — minimum percentage for each grade. */
export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 65,
  D: 50,
} as const;

/** Health grade hex colors — used for Recharts <Cell fill> where CSS vars cannot be used. */
export const HEALTH_GRADE_COLORS = {
  A: '#15803D',
  B: '#4F46E5',
  C: '#B45309',
  D: '#C2410C',
  F: '#B91C1C',
} as const;

/** Maximum item count before a workspace is flagged as oversized. */
export const MAX_REASONABLE_ITEM_COUNT = 100;

// -- Security --

/** Number of Admin-role assignments before flagging a user as over-permissioned. */
export const ADMIN_ROLE_WARNING_THRESHOLD = 5;

/** Admin assignments percentage threshold — above this is flagged as unhealthy role distribution. */
export const ADMIN_ASSIGNMENT_PCT_THRESHOLD = 30;

/** Number of group members to show before "Show all" link. */
export const GROUP_EXPAND_INITIAL_COUNT = 10;

// -- Capacity pricing --

/** Base rate per Capacity Unit per hour (USD). All SKU rates derive from this. */
export const CU_RATE_PER_HOUR = 0.18;

/** Hours in an average month (365 days / 12), for 24/7 run-rate estimates. */
export const HOURS_PER_MONTH = 730;


// -- Principal types --

/**
 * Color map for principal types (used in Security page badges and charts).
 * Reviewed for the cobalt/cyan rebrand: Group's indigo is kept as-is, it
 * reads distinctly from both the new cobalt primary and the violet
 * ServicePrincipal entries. Revisit only if an in-context pass says otherwise.
 */
export const PRINCIPAL_TYPE_COLORS: Record<string, string> = {
  User: '#495057',
  Group: '#4F46E5',
  ServicePrincipal: '#7C3AED',
  ServicePrincipalProfile: '#7C3AED',
};

// -- Demo mode --

/** sessionStorage key used to track whether the user has visited the Security page in demo mode. */
export const DEMO_SECURITY_VISITED_KEY = 'security_visited';

// -- Demo identity --

/** UPN of the demo persona used for "My workspaces" filtering in demo mode. Alice is Admin on 16/35 demo workspaces. */
export const DEMO_USER_UPN = 'alice@contoso.com';

/** Display name of the demo persona. */
export const DEMO_USER_NAME = 'Alice Johnson';

// -- Session management --

/** Idle timeout (ms) before the session is expired and the user is logged out. */
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/** Warning threshold (ms) before idle timeout to optionally notify the user. */
export const SESSION_WARNING_MS = 5 * 60 * 1000; // 5 minutes

// -- Input validation --

/** GUID validation regex (RFC 4122, case-insensitive). Used to validate API
 *  path parameters before interpolation to prevent path traversal attacks. */
export const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// -- API error messages --

/** Sanitized user-facing messages keyed by HTTP status code. */
export const HTTP_ERROR_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  400: 'Invalid request. Please try refreshing the page.',
  401: 'Authentication expired. Please sign in again.',
  403: "You don't have permission for this operation. Fabric Admin role may be required.",
  404: 'Resource not found. It may have been deleted or moved.',
  429: 'API rate limit reached. Please wait a moment and try again.',
};

/** Fallback message for 5xx and any unmapped status codes. */
export const HTTP_ERROR_MESSAGE_SERVER =
  'Microsoft Fabric API is experiencing issues. Try again later.';

// -- Score ring --

/** Duration (ms) for the ScoreRing mount animation. */
export const SCORE_RING_ANIMATION_MS = 600;

/** Default diameter (px) for the ScoreRing component. */
export const SCORE_RING_DEFAULT_SIZE = 120;

/** Default stroke width (px) for the ScoreRing track and arc. */
export const SCORE_RING_STROKE_WIDTH = 8;

// -- Health Grid --

/** Tile size (px) for each workspace tile in the HealthGrid. */
export const HEALTH_GRID_TILE_SIZE = 36;

/** Gap (px) between tiles in the HealthGrid. */
export const HEALTH_GRID_GAP = 6;

/** Maximum tiles shown in grid mode when workspace count exceeds this threshold. */
export const HEALTH_GRID_MAX_TILES = 100;

/** Scale factor applied to a tile on hover. */
export const HEALTH_GRID_HOVER_SCALE = 1.15;

/** Per-tile entrance delay (ms), mirroring `--m-motion-stagger-step` in CSS. */
export const HEALTH_GRID_STAGGER_STEP_MS = 20;

/** Ceiling on the stagger so a 100-tile grid still finishes settling quickly. */
export const HEALTH_GRID_STAGGER_MAX_MS = 400;

// -- App metadata --

/** Application version. Injected from package.json at build time by vite `define`. */
export const APP_VERSION = __APP_VERSION__;

// -- Tenant Settings Risk --

/** Tenant settings that represent high-risk exposure when enabled. */
export const TENANT_SETTINGS_HIGH_RISK: string[] = [
  'PublishToWeb',
  'ExternalSharingEnabled',
  'AllowExternalDataSharing',
  'ExportToCsv',
  'ExportToExcel',
  'ExportToImage',
  'PrintDashboardsAndReports',
  'AllowServicePrincipalsCreateAndUseProfiles',
];

// Note: BlockResourceKeyAuthentication intentionally excluded — enabling it
// is a security-hardening control (positive signal), not a risk indicator.

/** Tenant settings that represent medium-risk exposure when enabled. */
export const TENANT_SETTINGS_MEDIUM_RISK: string[] = [
  'EmbedContent',
  'AllowServicePrincipalsUseReadonlyAdminApisEnabled',
  'ServicePrincipalAccess',
  'EnableFabricCopilot',
];

/** Deep link to the Fabric Admin Portal tenant settings page. */
export const FABRIC_ADMIN_PORTAL_SETTINGS_URL =
  'https://app.fabric.microsoft.com/admin-portal/tenantSettings';

// -- Domain governance --

/** Workspace count threshold below which an unassigned-domain count is worth flagging. */
export const DOMAIN_UNASSIGNED_WARNING_COUNT = 5;

// -- Benchmarks --

/** Synthetic median tenant health score (percentage 0–100). Label as "typical" — never "industry average". */
export const BENCHMARK_HEALTH_SCORE = 78;

/** Synthetic median security posture score. Label as "typical" — never "industry average". */
export const BENCHMARK_SECURITY_SCORE = 72;

// -- External links --

/** Public repository. Single source of truth for every GitHub link in the UI. */
export const GITHUB_URL = 'https://github.com/psistla/fabric-lens';

/** Issue tracker, used by the About page support links. */
export const GITHUB_ISSUES_URL = `${GITHUB_URL}/issues`;
