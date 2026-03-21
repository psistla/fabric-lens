import type { Configuration, PopupRequest } from '@azure/msal-browser';
import { LogLevel } from '@azure/msal-browser';
import { CORE_SCOPES, ADMIN_SCOPES, GRAPH_SCOPES } from '@/utils/constants';

// Re-export for callers that import scope constants from this module.
export { CORE_SCOPES, ADMIN_SCOPES, GRAPH_SCOPES };

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID as string;
// Fall back to 'common' for multi-tenant support when VITE_MSAL_TENANT_ID is
// unset, empty, or explicitly set to 'common'.
const tenantId = (import.meta.env.VITE_MSAL_TENANT_ID as string) || 'common';
const redirectUri = import.meta.env.VITE_MSAL_REDIRECT_URI as string;

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    // sessionStorage limits token exposure to the current tab/session.
    // Never use localStorage — tokens would persist across sessions.
    // Note: storeAuthStateInCookie was removed in MSAL v5; cookie storage
    // for auth state is no longer used by default.
    cacheLocation: 'sessionStorage',
    // PKCE is enabled by default in MSAL v5 for public clients (SPA).
    // No explicit config needed; listed here for documentation purposes.
  },
  system: {
    loggerOptions: {
      // Suppress verbose logs in production to avoid leaking token metadata.
      logLevel: import.meta.env.PROD ? LogLevel.Warning : LogLevel.Info,
      // Never log personally identifiable information or token values.
      piiLoggingEnabled: false,
    },
  },
};

export const fabricLoginRequest: PopupRequest = {
  scopes: [...CORE_SCOPES],
};
