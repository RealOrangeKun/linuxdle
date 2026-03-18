import { test, expect } from '@playwright/test';

test('Homepage loads correctly and displays game modules', async ({ page }) => {
  await page.goto('/');

  // Check for main title
  await expect(page.locator('text=_ > LINUXDLE')).toBeVisible();
  
  // Check for the three daily games
  await expect(page.locator('text=[+] ./daily-commands')).toBeVisible();
  await expect(page.locator('text=[+] ./daily-distros')).toBeVisible();
  await expect(page.locator('text=[+] ./daily-desktop-environments')).toBeVisible();
});

test('Navigation to daily-commands works', async ({ page }) => {
  await page.goto('/');
  await page.locator('text=[+] ./daily-commands').click();
  // We expect URL to change or the page to show command related UI
  await expect(page).toHaveURL(/.*\/commands/);
});
