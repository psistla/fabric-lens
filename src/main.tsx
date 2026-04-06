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
// Capture in a const so TypeScript's control-flow narrowing is preserved
// inside the promise chain callbacks (closures break if/&& narrowing).
const msalForPopup = msalInstance;
if (window.opener && msalForPopup && /[?#]code=/.test(window.location.href)) {
  void msalForPopup
    .initialize()
    .then(() => msalForPopup.handleRedirectPromise())
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
