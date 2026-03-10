import type { Configuration, PopupRequest } from '@azure/msal-browser';
import { FABRIC_SCOPES } from '@/utils/constants';

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID as string;
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID as string;
const redirectUri = import.meta.env.VITE_MSAL_REDIRECT_URI as string;

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

export const fabricLoginRequest: PopupRequest = {
  scopes: [...FABRIC_SCOPES],
};
