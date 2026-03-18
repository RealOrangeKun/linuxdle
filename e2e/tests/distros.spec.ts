import { test, expect } from '@playwright/test';

test('has title and can navigate', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Linuxdle/);

  await page.locator('text=[+] ./daily-distros').click();

  // The React component shows "_ > DAILY_DISTRO" title.
  await expect(page.locator('text=_ > DAILY_DISTRO').first()).toBeVisible();
});
