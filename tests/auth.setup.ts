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
  await page.goto("/login", { waitUntil: "networkidle", timeout: 30000 });

  await page.screenshot({ path: 'login-debug.png' });
  console.log(await page.content());

  // Wait for form to be ready
  const emailInput = page.getByTestId("legacy-email-input");
  await expect(emailInput).toBeVisible({ timeout: 15000 });

  await emailInput.fill(process.env.TEST_USER_EMAIL!);
  await page.getByTestId('legacy-password-input').fill(process.env.TEST_USER_PASSWORD!);

  const submitButton = page.getByTestId("legacy-login-submit-button");
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();

  // Wait for redirect to dashboard
  await page.waitForURL((url) => url.pathname.includes("/dashboard"), {
    timeout: 60000,
  });

  console.log("✅ [Auth Setup] Successfully logged in");

  // Save auth state including IndexedDB
  await page.context().storageState({ path: authFile, indexedDB: true });

  console.log("✅ [Auth Setup] Auth state saved (with IndexedDB)");
});