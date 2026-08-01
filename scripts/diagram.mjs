import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Manrope is self-hosted; setContent has no base URL, so inline the latin subset.
const MANROPE = readFileSync(
  'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
).toString('base64');

const THEMES = {
  light: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F8F9FA',
    border: '#E9ECEF',
    text: '#0D0F12',
    textSecondary: '#495057',
    textTertiary: '#67707A',
    wash: 'rgba(6,182,212,0.07)',
    voidBorder: '#DEE2E6',
  },
  dark: {
    bg: '#0D0F12',
    surface: '#16191D',
    surfaceMuted: '#121519',
    border: '#343A40',
    text: '#F1F3F5',
    textSecondary: '#ADB5BD',
    textTertiary: '#67707A',
    wash: 'rgba(6,182,212,0.10)',
    voidBorder: '#343A40',
  },
};

const html = (t) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @font-face {
    font-family: 'Manrope';
    font-weight: 200 800;
    src: url(data:font/woff2;base64,${MANROPE}) format('woff2-variations');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 520px;
    background: ${t.bg};
    font-family: 'Manrope', sans-serif;
    color: ${t.text};
    position: relative; overflow: hidden;
  }
  body::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(800px 420px at 88% 4%, ${t.wash}, transparent 62%);
  }
  .page { position: relative; padding: 44px 56px; height: 100%; display: flex; flex-direction: column; }

  .kicker { font-size: 12px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: #2563EB; }
  .title { margin-top: 10px; font-size: 30px; font-weight: 800; letter-spacing: -0.025em; }
  .title .accent {
    background: linear-gradient(90deg, #2563EB, #06B6D4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .flow { margin-top: 30px; margin-bottom: 26px; display: flex; align-items: stretch; gap: 0; }

  .card {
    background: ${t.surface};
    border: 1px solid ${t.border};
    border-radius: 14px;
    padding: 20px 22px;
    display: flex; flex-direction: column;
  }
  .card-you { width: 195px; justify-content: center; }
  .card-browser { flex: 1; border-color: #2563EB; border-width: 2px; }
  .card-fabric { width: 300px; }

  .card-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: ${t.textTertiary}; }
  .card-title { margin-top: 7px; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; }
  .card-note { margin-top: 5px; font-size: 13px; color: ${t.textSecondary}; line-height: 1.45; }

  .mark { width: 34px; height: 34px; margin-bottom: 12px; }

  .pills { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px; }
  .pill {
    background: ${t.surfaceMuted};
    border: 1px solid ${t.border};
    border-radius: 8px;
    padding: 7px 11px;
    font-size: 12.5px; font-weight: 600; color: ${t.textSecondary};
  }

  .arrow { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 132px; padding: 0 6px; }
  .arrow-line { width: 100%; height: 2px; background: linear-gradient(90deg, #2563EB, #06B6D4); position: relative; }
  .arrow-line::after {
    content: ''; position: absolute; right: -1px; top: -4px;
    border-left: 9px solid #06B6D4;
    border-top: 5px solid transparent; border-bottom: 5px solid transparent;
  }
  .arrow-cap { font-size: 11.5px; font-weight: 700; color: ${t.textSecondary}; text-align: center; line-height: 1.4; margin-bottom: 9px; }
  .arrow-sub { font-size: 11px; color: ${t.textTertiary}; text-align: center; margin-top: 9px; }

  .void {
    margin-top: auto;
    border: 1.5px dashed ${t.voidBorder};
    border-radius: 14px;
    padding: 16px 22px;
    display: flex; align-items: center; gap: 18px;
  }
  .void-title { font-size: 13px; font-weight: 800; letter-spacing: .02em; color: ${t.textTertiary}; text-transform: uppercase; white-space: nowrap; }
  .void-items { display: flex; flex-wrap: wrap; gap: 10px 20px; font-size: 14px; color: ${t.textSecondary}; }
  .void-items span { display: flex; align-items: center; gap: 7px; }
  .x { color: ${t.textTertiary}; font-weight: 700; }
</style></head>
<body><div class="page">

  <div class="kicker">Architecture</div>
  <div class="title">No backend. Your browser talks to Fabric <span class="accent">directly</span>.</div>

  <div class="flow">
    <div class="card card-you">
      <div class="card-label">Your identity</div>
      <div class="card-title">You</div>
      <div class="card-note">Sign in with your Entra ID work account</div>
    </div>

    <div class="arrow">
      <div class="arrow-cap">delegated<br>sign-in</div>
      <div class="arrow-line"></div>
      <div class="arrow-sub">MSAL.js</div>
    </div>

    <div class="card card-browser">
      <svg class="mark" viewBox="0 0 32 32" fill="none">
        <defs><linearGradient id="lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2563EB"/><stop offset="1" stop-color="#06B6D4"/>
        </linearGradient></defs>
        <rect width="32" height="32" rx="8" fill="url(#lens)"/>
        <circle cx="16" cy="16" r="8.5" fill="none" stroke="#fff" stroke-width="4.5"/>
        <circle cx="16" cy="16" r="2.6" fill="#fff"/>
      </svg>
      <div class="card-label">Runs in your browser</div>
      <div class="card-title">fabric-lens</div>
      <div class="card-note">Scores health, audits access, prices capacity. Results stay in memory.</div>
      <div class="pills">
        <div class="pill">React SPA</div>
        <div class="pill">Tokens in sessionStorage</div>
        <div class="pill">No persistence</div>
      </div>
    </div>

    <div class="arrow">
      <div class="arrow-cap">read-only<br>HTTPS</div>
      <div class="arrow-line"></div>
      <div class="arrow-sub">your own access</div>
    </div>

    <div class="card card-fabric">
      <div class="card-label">Your data, where it already lives</div>
      <div class="card-title">Your Fabric tenant</div>
      <div class="pills">
        <div class="pill">Fabric Core API</div>
        <div class="pill">Admin API</div>
        <div class="pill">ARM</div>
      </div>
    </div>
  </div>

  <div class="void">
    <div class="void-title">Nothing in between</div>
    <div class="void-items">
      <span><i class="x">✕</i> No server</span>
      <span><i class="x">✕</i> No database</span>
      <span><i class="x">✕</i> No telemetry</span>
      <span><i class="x">✕</i> No third party sees your tenant</span>
    </div>
  </div>

</div></body></html>`;

const browser = await chromium.launch();
for (const [name, tokens] of Object.entries(THEMES)) {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 520 },
    deviceScaleFactor: 2,
  });
  await page.setContent(html(tokens));
  await page.evaluate(() => document.fonts.ready);
  const out = `docs/architecture-${name}.png`;
  await page.screenshot({ path: out });
  console.log('captured', out);
}
await browser.close();
