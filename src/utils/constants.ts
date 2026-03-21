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

/** Shared chart color palette (Meridian-aligned sequence). */
export const CHART_COLORS = [
  '#4F46E5', '#B45309', '#818CF8', '#FBBF24', '#868E96',
  '#6366F1', '#D97706', '#15803D', '#0891B2', '#7C3AED',
  '#DB2777', '#EA580C',
] as const;

/** Color map for workspace roles (used in Security page charts and badges). */
export const ROLE_COLORS: Record<string, string> = {
  Admin: '#DC2626',
  Member: '#4F46E5',
  Contributor: '#15803D',
  Viewer: '#495057',
};

/** Default fallback color for unknown chart categories. */
export const CHART_FALLBACK_COLOR = '#495057';

/** Shared Recharts tooltip style object (dark themed, uses design tokens). */
export const CHART_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'var(--m-neutral-900, #16191D)',
  border: '1px solid var(--m-neutral-700, #343A40)',
  borderRadius: 'var(--m-radius-md, 8px)',
  fontSize: '12px',
  color: 'var(--m-neutral-0, #FFFFFF)',
};

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
  git: 15,
  naming: 10,
  activeItems: 10,
  dataLayer: 10,
  reasonableCount: 10,
  identity: 10,
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

/** Maximum item count before a workspace is flagged as oversized. */
export const MAX_REASONABLE_ITEM_COUNT = 100;

/** Default number of days after which items are considered stale. */
export const DEFAULT_STALE_THRESHOLD_DAYS = 90;

// -- Security --

/** Number of Admin-role assignments before flagging a user as over-permissioned. */
export const ADMIN_ROLE_WARNING_THRESHOLD = 5;

/** Number of group members to show before "Show all" link. */
export const GROUP_EXPAND_INITIAL_COUNT = 10;

// -- Capacity pricing --

/** Base rate per Capacity Unit per hour (USD). All SKU rates derive from this. */
export const CU_RATE_PER_HOUR = 0.18;


// -- Principal types --

/** Color map for principal types (used in Security page badges and charts). */
export const PRINCIPAL_TYPE_COLORS: Record<string, string> = {
  User: '#495057',
  Group: '#4F46E5',
  ServicePrincipal: '#7C3AED',
  ServicePrincipalProfile: '#7C3AED',
};

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

// -- App metadata --

/** Application version (mirrors package.json). */
export const APP_VERSION = '0.1.0';
