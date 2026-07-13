import { test, expect } from '@playwright/test';

// WorkspacesPage renders "Showing {filtered} of {total} workspaces" (approx copy).
// Assert against that count text, NOT row elements: DataTable rows are <tr> (not
// anchors) and the empty state renders one <tr>, so row counts mislead.
// SearchBar is <input type="text"> → role 'textbox' (NOT 'searchbox').

test('search filter narrows the workspace list', async ({ page }) => {
  await page.goto('/workspaces');
  const count = page.getByText(/showing\s+\d+\s+of\s+\d+\s+workspaces/i);
  await expect(count).toBeVisible();
  const search = page.getByPlaceholder(/search/i);
  await search.fill('zzzznomatch');
  await expect(page.getByText(/showing\s+0\s+of\s+\d+\s+workspaces/i)).toBeVisible();
  await search.fill('');
  await expect(count).toBeVisible();
});

test('My Workspaces toggle changes the shown count', async ({ page }) => {
  await page.goto('/workspaces');
  const toggle = page.getByRole('button', { name: /my workspaces/i });
  await expect(toggle).toBeVisible();
  const countText = page.getByText(/showing\s+\d+\s+of\s+\d+\s+workspaces/i);
  const before = await countText.textContent();
  await toggle.click();
  // Demo persona (alice@contoso.com) owns a subset — the "Showing N" text changes.
  await expect(countText).not.toHaveText(before ?? '');
});
