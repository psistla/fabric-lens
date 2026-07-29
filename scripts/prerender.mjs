import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { writeFileSync } from 'node:fs';

// Snapshots the two PUBLIC routes into static HTML so crawlers and unfurl bots
// get real content instead of an empty <div id="root">. Runs after `vite build`
// against the freshly built dist.
//
// These are crawler payload, not a hydration contract: main.tsx uses createRoot
// (not hydrateRoot), so React clears #root and re-renders from scratch on boot.
// There is no markup to keep in sync and no mismatch to get wrong.
//
// dist/index.html is deliberately LEFT ALONE — it stays the clean SPA fallback
// for every authenticated route. staticwebapp.config.json rewrites / and /about
// to these two files instead. See scripts/og-image.mjs for the same
// launch-render-capture pattern.

const PORT = 4174;
const PAGES = [
  { path: '/', out: 'dist/home.html' },
  { path: '/about', out: 'dist/about.html' },
];

const server = await preview({
  preview: { port: PORT, strictPort: true, host: '127.0.0.1' },
});

const browser = await chromium.launch();
const ctx = await browser.newContext({
  // Pin both so the snapshot is deterministic. reducedMotion also settles the
  // entrance animations, which otherwise capture mid-fade at opacity 0.
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();

for (const { path, out } of PAGES) {
  await page.goto(`http://127.0.0.1:${PORT}${path}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#root h1');
  const html = await page.evaluate(() => document.documentElement.outerHTML);
  writeFileSync(out, `<!DOCTYPE html>\n${html}\n`);
  console.log('prerendered', path, '->', out);
}

await browser.close();
await server.close();
