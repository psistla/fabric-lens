# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest on `master` | ✅ |
| older commits | ❌ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email security reports to: [TBD — author's security contact email]

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- Acknowledgment: within 48 hours
- Assessment: within 7 days
- Fix (if confirmed): within 30 days for non-critical, 7 days for critical

## Scope

In scope:
- XSS vulnerabilities in the React SPA
- Authentication/authorization bypass
- Sensitive data exposure (tokens, tenant data)
- MSAL misconfiguration
- CSP bypass

Out of scope:
- Vulnerabilities in Microsoft Fabric REST APIs
- Vulnerabilities in Azure Static Web Apps platform
- Issues requiring physical access to the user's machine
- Social engineering attacks

## Security Architecture

fabric-lens is a client-side SPA with no backend. Key security properties:

- **Authentication:** MSAL.js v5 with PKCE (authorization code flow)
- **Token storage:** Browser sessionStorage (cleared on tab close)
- **API access:** Delegated permissions only — the app can never access
  more than the signed-in user can access directly
- **No secrets:** No client secrets, no API keys, no backend credentials.
  The app registration uses SPA redirect (public client).
- **CSP:** Strict Content Security Policy limiting script, style, and
  connect sources
- **Demo mode:** When no Azure credentials are configured, the app uses
  mock data with no network requests to Microsoft APIs
