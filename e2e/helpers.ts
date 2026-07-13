import type { Page } from '@playwright/test';

// Benign console noise to ignore. Keep this list SMALL and justify each entry.
const ALLOWED_CONSOLE = [
  // /capacity fetches live SKU rates from prices.azure.com; the app has a
  // graceful fallback (CU_RATE_PER_HOUR) so a failed/blocked fetch does not
  // break rendering, but it may log. Network egress is often blocked in CI.
  /prices\.azure\.com/,
  /Failed to (fetch|load resource)/,
];

export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (ALLOWED_CONSOLE.some((re) => re.test(text))) return;
    errors.push(text);
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}
