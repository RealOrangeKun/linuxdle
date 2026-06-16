import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Automatically set the shutdown notification as seen in sessionStorage
    // to bypass the overlay dialog during E2E tests.
    await page.addInitScript(() => {
      sessionStorage.setItem('linuxdle_shutdown_notified', 'true');
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
