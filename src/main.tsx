import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/auth/AuthProvider';
import { App } from './App';
import './index.css';

// When MSAL's loginPopup() redirects the popup back to this origin, the URL
// contains the auth code in the hash (#code=...). The parent window is
// actively polling popup.location.hash to read that code — do NOT run MSAL
// here (it clears the hash) and do NOT mount the React app. Just stay idle
// so the parent can read the hash, exchange it for tokens, and close the popup.
if (window.opener && /[?#]code=/.test(window.location.href)) {
  // Popup redirect target — intentionally empty.
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
