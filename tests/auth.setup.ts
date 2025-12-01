import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  const debugToken = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI;
  
  // Inject the debug token into the browser context BEFORE navigating
  await page.addInitScript((token) => {
    if (token) {
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = token;
      console.log("🔧 [Playwright] App Check debug token injected");
    }
  }, debugToken);

  // Navigate to login page
  await page.goto("/login");

  // Wait for page to load
  await page.waitForLoadState("networkidle");

  // Fill in credentials
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for login success with increased timeout
  await page.waitForURL((url) => url.pathname.includes("/dashboard"), {
    timeout: 60000, // Increase timeout to 60 seconds
  });

  console.log("Login successful");

  // Save cookies and sessionStorage (default Playwright behavior)
  await page.context().storageState({ path: authFile });
});