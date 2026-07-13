import { test, expect } from '@playwright/test';
import { collectConsoleErrors } from './helpers';

test('report page renders all sections', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/report');
  await expect(page.getByText(/executive summary/i)).toBeVisible({ timeout: 15_000 });
  expect(errors, errors.join('\n')).toEqual([]);
});
