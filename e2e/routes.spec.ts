import { test, expect } from '@playwright/test';
import { collectConsoleErrors } from './helpers';

const ROUTES = [
  '/',
  '/workspaces',
  '/capacity',
  '/security',
  '/settings',
  '/report',
  '/about',
];

for (const route of ROUTES) {
  test(`route ${route} renders with no console errors`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(route);
    await expect(page.locator('body')).not.toBeEmpty();
    // domcontentloaded, NOT networkidle: /capacity keeps a live pricing fetch
    // open and networkidle can stall or flake on it.
    await page.waitForLoadState('domcontentloaded');
    expect(errors, `console errors on ${route}:\n${errors.join('\n')}`).toEqual([]);
  });
}

test('workspace detail renders from a workspace row', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/workspaces');
  // WorkspacesPage rows are DataTable <tr onClick> (programmatic navigate),
  // NOT anchors — so click the first data row to reach /workspaces/:id.
  await page.locator('tbody tr').first().click();
  await expect(page).toHaveURL(/\/workspaces\/.+/);
  expect(errors, errors.join('\n')).toEqual([]);
});
