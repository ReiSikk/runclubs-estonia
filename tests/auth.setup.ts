import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Ensure auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  console.log("🔐 [Auth Setup] Starting authentication...");

  // Navigate to login page
  await page.goto("/login", { waitUntil: "networkidle", timeout: 60000 });

  // Wait for form to be ready
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 15000 });

  // Fill credentials
  await emailInput.fill(process.env.TEST_USER_EMAIL!);
  await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);

  // Click login button
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to dashboard
  await page.waitForURL((url) => url.pathname.includes("/dashboard"), {
    timeout: 60000,
  });

  console.log("✅ [Auth Setup] Successfully logged in");

  // Save auth state including IndexedDB
  await page.context().storageState({ path: authFile, indexedDB: true });

  console.log("✅ [Auth Setup] Auth state saved (with IndexedDB)");
});