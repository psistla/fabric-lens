# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in fabric-lens, please **do not open a public GitHub issue**. Instead, report it privately via GitHub's [Security Advisories](../../security/advisories/new) feature.

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations (optional)

You can expect an acknowledgement within 72 hours and a resolution timeline within 14 days for confirmed issues.

## Security Headers

The app is served with the following HTTP security headers (configured in `staticwebapp.config.json`):

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | Restricts resource loading to trusted origins; blocks inline scripts; limits framing to MSAL auth endpoints only |
| `X-Frame-Options` | `DENY` — prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` — prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disables camera, microphone, geolocation, payment, USB, and sensor APIs |
| `X-DNS-Prefetch-Control` | `off` |

## Authentication & Token Storage

- Authentication is handled via MSAL.js (Azure AD) using popup login with silent token refresh via hidden iframes.
- Access tokens are stored in `localStorage`. This is a known trade-off — tokens survive tab close for UX continuity. Mitigated by short token lifetimes enforced by Azure AD and the restrictive CSP blocking unauthorized script execution.
- No secrets, credentials, or tokens are ever committed to the repository. All configuration is provided via environment variables (`VITE_MSAL_*`).

## Demo Mode

When `VITE_MSAL_CLIENT_ID` is unset or set to `'demo'`, the app runs entirely on local mock data with no Azure AD authentication and no real API calls. Demo mode is safe to use publicly.

## Dependency Management

Dependencies should be audited regularly with `npm audit`. Consider enabling [Dependabot](https://docs.github.com/en/code-security/dependabot) for automated dependency update PRs.

## Supported Versions

This project is under active development. Only the latest version on the `master` branch receives security updates.
