import { useState, useEffect, type ReactNode } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './msalConfig';

export const msalInstance = new PublicClientApplication(msalConfig);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
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

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
