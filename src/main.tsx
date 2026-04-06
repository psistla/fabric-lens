import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider, msalInstance } from '@/auth/AuthProvider';
import { App } from './App';
import './index.css';

// When MSAL redirects the popup back to this origin after authentication,
// the URL contains an auth code (?code= or #code=). In that case we must
// handle the response and close the popup immediately — without rendering
// the full app — so the parent window can receive the token and continue.
if (window.opener && msalInstance && /[?#]code=/.test(window.location.href)) {
  void msalInstance
    .initialize()
    .then(() => msalInstance.handleRedirectPromise())
    .finally(() => window.close());
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>,
  );
}
