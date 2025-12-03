import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");
const indexedDBFile = path.join(__dirname, "../playwright/.auth/indexedDB.json");

setup("authenticate", async ({ page }) => {
  // Increase timeout
  // setup.setTimeout(120000);
    // Ensure auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log("📁 [Auth Setup] Created auth directory:", authDir);
  }

  console.log("🔐 [Auth Setup] Starting authentication...");
  console.log("🔐 [Auth Setup] TEST_USER_EMAIL:", process.env.TEST_USER_EMAIL ? "✅ Set" : "❌ Missing");
  console.log("🔐 [Auth Setup] TEST_USER_PASSWORD:", process.env.TEST_USER_PASSWORD ? "✅ Set" : "❌ Missing");

  // Listen for console messages from the browser
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("[Firebase]") || text.includes("🔧") || text.includes("🔍") || text.includes("Error")) {
      console.log("🌐 [Browser]", text);
    }
  });

  // Listen for page errors
  page.on("pageerror", (err) => {
    console.log("❌ [Page Error]", err.message);
  });

  // Navigate to login page
  console.log("🔐 [Auth Setup] Navigating to /login...");
  await page.goto("/login", { waitUntil: "networkidle", timeout: 60000 });
  console.log("🔐 [Auth Setup] Current URL:", page.url());

  // Take screenshot of login page
  await page.screenshot({ path: "test-results/01-login-page.png", fullPage: true });

  // Wait for form to be ready
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 15000 });
  console.log("🔐 [Auth Setup] Email input found");

  // Fill email
  await emailInput.fill(process.env.TEST_USER_EMAIL!);
  console.log("🔐 [Auth Setup] Email filled");

  // Fill password
  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 15000 });
  await passwordInput.fill(process.env.TEST_USER_PASSWORD!);
  console.log("🔐 [Auth Setup] Password filled");

  // Take screenshot before clicking login
  await page.screenshot({ path: "test-results/02-before-login-click.png", fullPage: true });

  // Click login button
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible({ timeout: 15000 });
  await submitButton.click();
  console.log("🔐 [Auth Setup] Login button clicked");

  // Wait a bit for any response
  await page.waitForTimeout(5000);

  // Take screenshot after clicking login
  await page.screenshot({ path: "test-results/03-after-login-click.png", fullPage: true });
  console.log("🔐 [Auth Setup] Current URL after click:", page.url());

  // Check for error messages on the page
  const errorElement = page.locator('[data-testid="error-message"], .error, [role="alert"], .toast-error');
  const hasError = await errorElement.count() > 0;
  if (hasError) {
    const errorText = await errorElement.first().textContent();
    console.log("❌ [Auth Setup] Error on page:", errorText);
  }

  // Check for any toast messages
  const toastElement = page.locator('[data-testid="feedback-toast"]');
  const hasToast = await toastElement.count() > 0;
  if (hasToast) {
    const toastText = await toastElement.textContent();
    console.log("🔔 [Auth Setup] Toast message:", toastText);
  }

  // Try waiting for URL change with longer timeout
  try {
    await page.waitForURL((url) => url.pathname.includes("/dashboard"), {
      timeout: 60000,
    });
    console.log("✅ [Auth Setup] Successfully redirected to dashboard");
  } catch (error) {
    // Take final screenshot on failure
    await page.screenshot({ path: "test-results/04-login-failed.png", fullPage: true });
    
    // Log page content
    const bodyText = await page.locator("body").textContent();
    console.log("❌ [Auth Setup] Page content:", bodyText?.slice(0, 1000));
    console.log("❌ [Auth Setup] Final URL:", page.url());
    
    throw new Error(`Login failed. Final URL: ${page.url()}`);
  }

  // Save auth state
  await page.context().storageState({ path: authFile });
 console.log("✅ [Auth Setup] Auth state saved to:", authFile);

  // Save IndexedDB data for Firebase auth
  try {
    console.log("💾 [Auth Setup] Extracting IndexedDB data...");
    
    const indexedDBData = await page.evaluate(async () => {
      return new Promise<unknown[]>((resolve, reject) => {
        const dbName = "firebaseLocalStorageDb";
        const request = indexedDB.open(dbName);
        
        request.onerror = () => {
          console.log("Failed to open IndexedDB:", dbName);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          const db = request.result;
          const storeName = "firebaseLocalStorage";
          
          // Check if store exists
          if (!db.objectStoreNames.contains(storeName)) {
            console.log("Store not found:", storeName);
            console.log("Available stores:", Array.from(db.objectStoreNames));
            resolve([]);
            return;
          }
          
          const transaction = db.transaction(storeName, "readonly");
          const store = transaction.objectStore(storeName);
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const result = getAllRequest.result || [];
            console.log("IndexedDB data retrieved:", result.length, "items");
            resolve(result);
          };
          
          getAllRequest.onerror = () => {
            console.log("Failed to get IndexedDB data");
            reject(getAllRequest.error);
          };
        };
      });
    });

    if (indexedDBData && Array.isArray(indexedDBData) && indexedDBData.length > 0) {
      fs.writeFileSync(indexedDBFile, JSON.stringify(indexedDBData, null, 2));
      console.log("✅ [Auth Setup] IndexedDB saved to:", indexedDBFile);
      console.log("📊 [Auth Setup] IndexedDB entries:", indexedDBData.length);
    } else {
      console.log("⚠️ [Auth Setup] No IndexedDB data found to save");
      // Create empty array file to prevent file not found errors
      fs.writeFileSync(indexedDBFile, JSON.stringify([], null, 2));
      console.log("📝 [Auth Setup] Created empty IndexedDB file");
    }
  } catch (error) {
    console.error("❌ [Auth Setup] Failed to save IndexedDB:", error);
    // Create empty array file to prevent file not found errors
    fs.writeFileSync(indexedDBFile, JSON.stringify([], null, 2));
    console.log("📝 [Auth Setup] Created empty IndexedDB file as fallback");
  }

   // Verify files were created
  console.log("📁 [Auth Setup] Verifying saved files...");
  console.log("  - user.json exists:", fs.existsSync(authFile));
  console.log("  - indexedDB.json exists:", fs.existsSync(indexedDBFile));
  
  if (fs.existsSync(indexedDBFile)) {
    const stats = fs.statSync(indexedDBFile);
    console.log("  - indexedDB.json size:", stats.size, "bytes");
  }

});