// ---------------------------------------------------------------------------
// Shared constants — single source of truth for values used across the app
// ---------------------------------------------------------------------------

import type { CSSProperties } from 'react';

// -- Fabric API --

/** Default Fabric REST API base URL (overridden by VITE_FABRIC_API_BASE). */
export const DEFAULT_FABRIC_API_BASE = 'https://api.fabric.microsoft.com/v1';

/** OAuth scopes required for Fabric API calls. */
export const FABRIC_SCOPES = ['https://api.fabric.microsoft.com/.default'];

// -- Rate limiting --

/** Admin API rate limit (requests per hour). */
export const ADMIN_RATE_LIMIT = 200;

/** Default wait time (ms) when a 429 response has no Retry-After header. */
export const DEFAULT_RETRY_AFTER_MS = 5000;

/** Delay (ms) between mock progress updates in demo mode. */
export const DEMO_PROGRESS_DELAY_MS = 80;

// -- UI timing --

/** Search input debounce delay (ms). */
export const SEARCH_DEBOUNCE_MS = 300;

/** Toast auto-dismiss duration (ms). */
export const TOAST_DISMISS_MS = 5000;

// -- Charts --

/** Shared chart color palette (12 colors, wraps around for larger datasets). */
export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
  '#d946ef', '#84cc16',
] as const;

/** Color map for workspace roles (used in Security page charts and badges). */
export const ROLE_COLORS: Record<string, string> = {
  Admin: '#ef4444',
  Member: '#3b82f6',
  Contributor: '#f59e0b',
  Viewer: '#10b981',
};

/** Default fallback color for unknown chart categories. */
export const CHART_FALLBACK_COLOR = '#64748b';

/** Shared Recharts tooltip style object (dark themed). */
export const CHART_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'var(--color-slate-900, #0f172a)',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#e2e8f0',
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

// -- Capacity pricing --

/** Base rate per Capacity Unit per hour (USD). All SKU rates derive from this. */
export const CU_RATE_PER_HOUR = 0.18;

// -- App metadata --

/** Application version (mirrors package.json). */
export const APP_VERSION = '0.1.0';
