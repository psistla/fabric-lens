import { useState, useEffect, type ReactNode } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './msalConfig';
import { isDemoMode } from '@/api/demo';

// In demo mode, MSAL is never initialized — no Azure AD required.
export const msalInstance = isDemoMode
  ? null
  : new PublicClientApplication(msalConfig);

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
