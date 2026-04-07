import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/auth/AuthProvider';
import { App } from './App';
import './index.css';

// MSAL browser v5 uses BroadcastChannel (not URL polling) for popup auth.
// When the popup lands back on this origin with an auth code, it must call
// broadcastResponseToMainFrame() which reads the `state` parameter from the
// URL, opens the matching BroadcastChannel the parent is listening on, posts
// the auth payload, and calls window.close(). Without this the parent times
// out after 60 s. We detect the popup context early so the full React app
// never mounts in the popup window.
//
// NOTE: Do NOT check window.opener here — Azure AD's login page sets
// Cross-Origin-Opener-Policy headers that clear window.opener before our
// code runs. broadcastResponseToMainFrame() handles popup vs redirect
// distinction internally via the MSAL state parameter.
if (/[?#&](?:code|error)=/.test(window.location.href)) {
  import('@azure/msal-browser/redirect-bridge')
    .then(({ broadcastResponseToMainFrame }) => broadcastResponseToMainFrame())
    .catch(() => window.close());
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
