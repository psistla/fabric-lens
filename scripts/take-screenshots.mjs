import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';

const BASE = 'http://localhost:5173';
const DIR = 'docs/screenshots';
const WIDTH = 1440;
const HEIGHT = 900;

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  // Helper: navigate, wait for network idle, take screenshot
  async function capture(path, filename, setup) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0', timeout: 15000 });
    if (setup) await setup();
    await setTimeout(500); // let animations settle
    await page.screenshot({ path: `${DIR}/${filename}`, fullPage: false });
    console.log(`  ✓ ${filename}`);
  }

  console.log('Capturing screenshots...\n');

  // 1. Dashboard (light mode)
  await capture('/', 'dashboard.png');

  // 2. Workspaces
  await capture('/workspaces', 'workspaces.png');

  // 3. Capacity
  await capture('/capacity', 'capacity.png');

  // 4. Security — click Scan All to load data
  await capture('/security', 'security.png', async () => {
    const scanBtn = await page.$('button');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text?.includes('Scan All')) {
        await btn.click();
        await setTimeout(2000); // wait for mock scan to complete
        break;
      }
    }
  });

  // 5. Dashboard dark mode
  await capture('/', 'dashboard-dark.png', async () => {
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await setTimeout(300);
  });

  console.log('\nDone! Screenshots saved to docs/screenshots/');
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
