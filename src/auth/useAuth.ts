import { useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus, InteractionRequiredAuthError } from '@azure/msal-browser';
import { fabricLoginRequest } from './msalConfig';
import { ADMIN_SCOPES, GRAPH_SCOPES, SESSION_IDLE_TIMEOUT_MS } from '@/utils/constants';
import { useToastStore } from '@/components/shared/Toast';

// Module-level timestamp shared across all useAuth instances.
let lastActivityAt = Date.now();

// Module-level admin consent state — persists across page navigations within
// the same session without requiring re-consent.
let _adminConsentGranted = false;

/** Reset the idle timeout clock. Pages should call this on meaningful user interactions. */
export function resetActivityTimer(): void {
  lastActivityAt = Date.now();
}

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
    await instance.loginPopup({
      ...fabricLoginRequest,
      redirectUri: `${window.location.origin}/auth.html`,
    });
    // Reload so stores re-initialise and fetch live tenant data.
    window.location.reload();
  }

  async function logout(): Promise<void> {
    await instance.logoutPopup({
      account: account,
    });
  }

  async function getToken(scopes: string[]): Promise<string> {
    if (!account) {
      throw new Error('No active account. Please sign in first.');
    }

    if (Date.now() - lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
      try {
        await logout();
      } catch {
        // Ignore logout errors — session is expired regardless.
      }
      useToastStore
        .getState()
        .addToast('error', 'Session expired due to inactivity. Please sign in again.');
      throw new Error('Session expired due to inactivity.');
    }

    try {
      const result = await instance.acquireTokenSilent({
        scopes,
        account,
      });
      return result.accessToken;
    } catch {
      const result = await instance.acquireTokenPopup({ scopes });
      return result.accessToken;
    }
  }

  async function getGraphToken(): Promise<string | null> {
    if (!account) return null;

    try {
      const result = await instance.acquireTokenSilent({
        scopes: GRAPH_SCOPES,
        account,
      });
      return result.accessToken;
    } catch (err) {
      // Only prompt via popup when interaction is explicitly required
      // (e.g. consent needed, MFA challenge). Silent-fail all other errors.
      if (err instanceof InteractionRequiredAuthError) {
        try {
          const result = await instance.acquireTokenPopup({
            scopes: GRAPH_SCOPES,
          });
          return result.accessToken;
        } catch {
          return null;
        }
      }
      return null;
    }
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
    getToken,
    getGraphToken,
    checkAdminConsent,
    requestAdminConsent,
    hasAdminAccess,
    isLoading,
  };
}
