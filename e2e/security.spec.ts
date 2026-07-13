import { test, expect } from '@playwright/test';
import { collectConsoleErrors } from './helpers';

test('security scan populates posture and findings panels', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/security');
  // Pre-scan state renders TWO "Scan All" buttons (header + prompt card) —
  // .first() avoids a strict-mode multiple-match failure.
  await page.getByRole('button', { name: /scan all/i }).first().click();
  await expect(page.getByText(/posture|findings/i).first()).toBeVisible({ timeout: 15_000 });
  expect(errors, errors.join('\n')).toEqual([]);
});
