import { test, expect } from '@playwright/test';

// The snapshots exist so crawlers and unfurl bots see content without running
// JS, so these assert the RAW response body via request (no browser boot). In
// production staticwebapp.config.json rewrites / and /about onto these files;
// vite preview does not apply SWA rewrites, hence the .html paths here.
const SNAPSHOTS = [
  { file: '/home.html', text: 'Know what your Fabric tenant is' },
  { file: '/about.html', text: 'About fabric-lens: Microsoft Fabric governance and tenant auditing' },
];

for (const { file, text } of SNAPSHOTS) {
  test(`${file} ships rendered HTML`, async ({ request }) => {
    const html = await (await request.get(file)).text();
    expect(html).toContain(text);
    expect(html).not.toContain('<div id="root"></div>');
  });
}

test('index.html stays an empty shell for the SPA fallback', async ({ request }) => {
  // Every authenticated route falls back to this file. If prerendered markup
  // ever lands here, /dashboard flashes the landing page before React boots.
  const html = await (await request.get('/index.html')).text();
  expect(html).toContain('<div id="root"></div>');
});
