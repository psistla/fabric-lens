import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Manrope is self-hosted; setContent has no base URL, so the font has to be
// inlined rather than linked. Latin subset only.
const MANROPE = readFileSync(
  'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
).toString('base64');

export const MANROPE_FACE = `@font-face {
    font-family: 'Manrope';
    font-weight: 200 800;
    src: url(data:font/woff2;base64,${MANROPE}) format('woff2-variations');
  }`;

/** Screenshot each { html, out, viewport, deviceScaleFactor? } on one browser. */
export async function renderPages(pages) {
  const browser = await chromium.launch();
  for (const { html, out, ...page } of pages) {
    const tab = await browser.newPage(page);
    await tab.setContent(html);
    await tab.evaluate(() => document.fonts.ready);
    await tab.screenshot({ path: out });
    console.log('captured', out);
  }
  await browser.close();
}
