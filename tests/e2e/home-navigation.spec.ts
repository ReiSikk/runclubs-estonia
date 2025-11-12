// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://runclubs.ee/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Run Clubs Estonia/);
});

test('navigate to first available run club page - alternative', async ({ page }) => {
  await page.goto('https://runclubs.ee/');

  // Wait for any club links to appear
  const clubLinks = page.getByTestId('club-link');
    
    // Verify at least one club exists
    await expect(clubLinks.first()).toBeVisible({ timeout: 10000 });

    // Click the first club link
  await clubLinks.first().click();

  // Wait for navigation
  await page.waitForURL(/\/runclubs\/.+/);

  // Verify we're on a single club page
  expect(page.url()).toMatch(/\/runclubs\/[^/]+$/);
  
  // Check that a heading exists (any club name)
  await expect(page.locator('h1, h2').first()).toBeVisible();
});
