import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to login page
  await page.goto("/login");

  // Wait for page to load
  await page.waitForLoadState("domcontentloaded");

  // Fill in credentials
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 15000 });
  await emailInput.fill(process.env.TEST_USER_EMAIL!);

  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 15000 });
  await passwordInput.fill(process.env.TEST_USER_PASSWORD!);

  // Click login button
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible({ timeout: 15000 });
  await submitButton.click();

  // Wait for login success with increased timeout
  await page.waitForURL((url) => url.pathname.includes("/dashboard"), {
    timeout: 30000, // 30 seconds
  });

  console.log("✅ Login successful");

  // Save cookies and sessionStorage
  await page.context().storageState({ path: authFile });
});