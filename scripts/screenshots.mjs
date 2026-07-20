import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/screenshots';
const BASE = 'http://localhost:5173';

const SHOTS = [
  { file: 'landing.png', path: '/', theme: 'light' },
  { file: 'dashboard.png', path: '/dashboard', theme: 'light' },
  { file: 'workspaces.png', path: '/workspaces', theme: 'light' },
  { file: 'capacity.png', path: '/capacity', theme: 'light' },
  { file: 'security.png', path: '/security', theme: 'light', scan: true },
  { file: 'dashboard-dark.png', path: '/dashboard', theme: 'dark' },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

for (const shot of SHOTS) {
  await page.goto(BASE + shot.path, { waitUntil: 'networkidle' });

  // Theme lives in the persisted ui store; set it before the app paints so we
  // never screenshot a mid-transition frame.
  await page.evaluate((theme) => {
    const raw = localStorage.getItem('fabric-lens-ui');
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    parsed.state = { ...parsed.state, theme };
    localStorage.setItem('fabric-lens-ui', JSON.stringify(parsed));
  }, shot.theme);
  await page.reload({ waitUntil: 'networkidle' });

  if (shot.scan) {
    const scan = page.getByRole('button', { name: /^Scan All$/ }).last();
    await scan.click();
    await page.waitForTimeout(4000);
  }

  await page.waitForTimeout(1200); // let entrance animations settle
  await page.screenshot({ path: `${OUT}/${shot.file}` });
  console.log('captured', shot.file, shot.theme);
}

await browser.close();
