import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const OUT = 'public/og-image.png';

// Manrope is self-hosted; setContent has no base URL, so the font has to be
// inlined rather than linked. Latin subset only — the card is English.
const MANROPE = readFileSync(
  'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
).toString('base64');

const HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Manrope';
    font-weight: 200 800;
    src: url(data:font/woff2;base64,${MANROPE}) format('woff2-variations');
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1200px;
    height: 630px;
    background: #fff;
    font-family: 'Manrope', sans-serif;
    color: #0D0F12;
    overflow: hidden;
    position: relative;
  }

  /* Cyan-side wash, so the clean-light card still reads as branded */
  body::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(900px 500px at 100% 0%, rgba(6,182,212,0.10), transparent 60%);
  }

  .container {
    position: relative;
    padding: 56px 64px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .header { display: flex; align-items: center; justify-content: space-between; }
  .logo-row { display: flex; align-items: center; gap: 14px; }

  .logo { width: 46px; height: 46px; display: block; }

  .logo-name { font-size: 18px; font-weight: 700; line-height: 1.2; }
  .logo-sub { font-size: 13px; color: #67707A; line-height: 1.3; }

  .oss-badge {
    background: #F8F9FA;
    border: 1px solid #E9ECEF;
    border-radius: 100px;
    padding: 8px 20px;
    font-size: 13px; font-weight: 600; color: #495057;
  }

  .heading {
    margin-top: 44px;
    font-size: 64px; font-weight: 800;
    line-height: 1.08; letter-spacing: -0.03em;
  }

  .gradient {
    background: linear-gradient(90deg, #2563EB, #06B6D4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .sub {
    margin-top: 18px;
    font-size: 19px; line-height: 1.5; color: #495057;
    max-width: 780px;
  }

  .grades-row { margin-top: 36px; display: flex; align-items: center; gap: 10px; }

  .grade {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 800; color: #fff;
  }

  .a { background: #15803D; }
  .b { background: #4F46E5; }
  .c { background: #B45309; }
  .d { background: #C2410C; }
  .f { background: #B91C1C; }

  .grades-label { margin-left: 10px; font-size: 15px; color: #67707A; }

  .stats {
    margin-top: auto;
    padding-top: 28px;
    border-top: 1px solid #E9ECEF;
    display: flex; gap: 52px;
  }

  .stat-value { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; }
  .stat-label { font-size: 13px; color: #67707A; margin-top: 3px; }
</style>
</head>
<body>
<div class="container">

  <div class="header">
    <div class="logo-row">
      <!-- Same mark as public/favicon.svg. Keep the two in sync by hand. -->
      <svg class="logo" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lens" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#2563EB"/>
            <stop offset="1" stop-color="#06B6D4"/>
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#lens)"/>
        <circle cx="16" cy="16" r="8.5" fill="none" stroke="#fff" stroke-width="4.5"/>
        <circle cx="16" cy="16" r="2.6" fill="#fff"/>
      </svg>
      <div>
        <div class="logo-name">fabric-lens</div>
        <div class="logo-sub">for Microsoft Fabric</div>
      </div>
    </div>
    <div class="oss-badge">Free &amp; Open Source</div>
  </div>

  <div class="heading">Know what your Fabric tenant<br>is <span class="gradient">actually doing</span></div>

  <div class="sub">
    Governance, security posture, and health intelligence. Runs entirely in your
    browser, so tenant data never passes through anyone else's servers.
  </div>

  <div class="grades-row">
    <div class="grade a">A</div>
    <div class="grade b">B</div>
    <div class="grade c">C</div>
    <div class="grade d">D</div>
    <div class="grade f">F</div>
    <div class="grades-label">Workspace health scores across your entire tenant</div>
  </div>

  <div class="stats">
    <div><div class="stat-value">35+</div><div class="stat-label">Workspaces</div></div>
    <div><div class="stat-value">9</div><div class="stat-label">Health checks</div></div>
    <div><div class="stat-value">3</div><div class="stat-label">Capacities</div></div>
    <div><div class="stat-value">200+</div><div class="stat-label">Items tracked</div></div>
  </div>

</div>
</body>
</html>`;

const browser = await chromium.launch();
// deviceScaleFactor stays 1: OG wants exactly 1200x630, no downscale step.
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(HTML);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUT });
await browser.close();
console.log('captured', OUT);
