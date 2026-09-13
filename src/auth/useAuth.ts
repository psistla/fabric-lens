import { useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { fabricLoginRequest } from './msalConfig';
import { ADMIN_SCOPES } from '@/utils/constants';

// Module-level admin consent state — persists across page navigations within
// the same session without requiring re-consent.
let _adminConsentGranted = false;

interface AuthUser {
  name: string;
  email: string;
  tenantId: string;
}

export function useAuth() {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const account = accounts[0] ?? null;

  const user: AuthUser | null = account
    ? {
        name: account.name ?? '',
        email: account.username,
        tenantId: account.tenantId,
      }
    : null;

  const isLoading = inProgress !== InteractionStatus.None;

  // Local state mirrors the module-level flag so components re-render after
  // consent is granted without navigating away.
  const [hasAdminAccess, setHasAdminAccess] = useState(_adminConsentGranted);

  async function login(): Promise<void> {
    // Use the current origin as the popup redirect URI so the popup and main
    // window share the same origin — required for MSAL's BroadcastChannel
    // handshake to work regardless of www vs non-www access.
    await instance.loginPopup({
      ...fabricLoginRequest,
      redirectUri: window.location.origin,
    });
    // Reload so stores re-initialise and fetch live tenant data.
    window.location.reload();
  }

  async function logout(): Promise<void> {
    // logoutPopup() opens a popup that redirects to postLogoutRedirectUri with
    // no auth code in the URL — our broadcastResponseToMainFrame gate doesn't
    // fire, so the popup loads the full app and never closes.
    // clearCache() clears local MSAL tokens without any popup or redirect,
    // then we reload so stores re-initialize in demo mode.
    await instance.clearCache();
    window.location.reload();
  }

  /**
   * Try to acquire an admin-scoped token silently (no popup).
   * Returns true if previously consented, false if consent is still required.
   */
  async function checkAdminConsent(): Promise<boolean> {
    if (_adminConsentGranted) return true;
    if (!account) return false;

    try {
      await instance.acquireTokenSilent({ scopes: ADMIN_SCOPES, account });
      _adminConsentGranted = true;
      setHasAdminAccess(true);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Request admin consent via popup. Returns true if the user granted access,
   * false if they cancelled or consent was denied.
   */
  async function requestAdminConsent(): Promise<boolean> {
    if (!account) return false;

    try {
      await instance.acquireTokenPopup({ scopes: ADMIN_SCOPES });
      _adminConsentGranted = true;
      setHasAdminAccess(true);
      return true;
    } catch {
      return false;
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAdminConsent,
    requestAdminConsent,
    hasAdminAccess,
    isLoading,
  };
}
