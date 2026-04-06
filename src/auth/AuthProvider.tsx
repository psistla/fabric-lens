import { useState, useEffect, type ReactNode } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './msalConfig';
import { isDemoMode } from '@/api/demo';

// In demo mode, MSAL is never initialized — no Azure AD required.
export const msalInstance = isDemoMode
  ? null
  : new PublicClientApplication(msalConfig);

/**
 * Returns true when the app should use mock data:
 * - Pure demo mode (no MSAL client ID configured), OR
 * - MSAL configured but no authenticated account yet.
 *
 * Stores use this instead of the static `isDemoMode` so that
 * unauthenticated visitors see demo data, and authenticated users
 * see their real tenant data after sign-in + page reload.
 */
export function isEffectiveDemoMode(): boolean {
  if (isDemoMode) return true;
  if (!msalInstance) return true;
  return msalInstance.getAllAccounts().length === 0;
}

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  // In demo mode, skip MSAL initialization entirely.
  const [isReady, setIsReady] = useState(isDemoMode);

  useEffect(() => {
    if (isDemoMode || !msalInstance) return;
    msalInstance.initialize().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-gray-500">Initializing...</div>
      </div>
    );
  }

  if (isDemoMode || !msalInstance) {
    return <>{children}</>;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
