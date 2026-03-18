import { test, expect } from '@playwright/test';

test('has title and can navigate', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Linuxdle/);

  // Click the get started link.
  await page.locator('text=[+] ./daily-commands').click();

  // Expects page to have a heading with the name of API loading or elements showing the UI.
  // The React component shows "_ > DAILY_COMMAND" title.
  await expect(page.locator('text=_ > DAILY_COMMAND').first()).toBeVisible();
});
