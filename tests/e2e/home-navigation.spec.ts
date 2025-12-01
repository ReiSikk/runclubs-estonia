// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://runclubs.ee/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Run Clubs Estonia/);
});

test('navigate to first available run club page - alternative', async ({ page }) => {
  // Navigate to home page
  await page.goto('/');

  // Wait for the page to fully load and clubs to render
  await page.waitForLoadState('networkidle');
  
  // Wait for at least one club to appear
  const clubLinks = page.getByTestId('club-link');
  await expect(clubLinks.first()).toBeVisible();

  const clubCount = await clubLinks.count();
  console.log(`Found ${clubCount} run clubs on the page`);

  // Verify at least one club exists
  expect(clubCount).toBeGreaterThan(0);

  // Click the first club link
  await Promise.all([
    page.waitForURL('**/runclubs/**', { timeout: 15000 }), // Wait for URL to change
    clubLinks.first().click(),
  ]);

  // Wait for navigation to complete
  await page.waitForLoadState('domcontentloaded');
  const currentUrl = page.url();
  console.log(`Current URL after navigation: ${currentUrl}`);

  // Verify we're on a single club page
  expect(page.url()).toContain('/runclubs/');
});
