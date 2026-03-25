import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('./docs/screenshots', { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

async function capture(url, file, { wait = 1500, scanAll = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, wait));
  if (scanAll) {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Scan All'));
      btn?.click();
    });
    await new Promise(r => setTimeout(r, 3000));
  }
  await page.screenshot({ path: `./docs/screenshots/${file}`, type: 'png' });
  await page.close();
  console.log(`Captured ${file}`);
}

try {
  await capture('http://localhost:5173/', 'dashboard.png');
  await capture('http://localhost:5173/workspaces', 'workspaces.png');
  await capture('http://localhost:5173/capacity', 'capacity.png', { wait: 2500 });
  await capture('http://localhost:5173/security', 'security.png', { scanAll: true });

  // Dark mode dashboard
  const darkPage = await browser.newPage();
  await darkPage.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await darkPage.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await darkPage.evaluate(() => document.documentElement.classList.add('dark'));
  await new Promise(r => setTimeout(r, 500));
  await darkPage.screenshot({ path: './docs/screenshots/dashboard-dark.png', type: 'png' });
  await darkPage.close();
  console.log('Captured dashboard-dark.png');

} finally {
  await browser.close();
}
console.log('All screenshots done.');
