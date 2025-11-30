import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");
const indexedDBFile = path.join(__dirname, "../playwright/.auth/indexedDB.json");

setup("authenticate", async ({ page }) => {
  const base = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";
  const loginUrl = `${base}/login`;
  const email = process.env.TEST_USER_EMAIL ?? "test@example.com";
  const password = process.env.TEST_USER_PASSWORD ?? "password123";

  await page.goto(loginUrl);

  const emailField = page.getByTestId("email-input");
  const passwordField = page.getByTestId("password-input");
  await emailField.fill(email);
  await passwordField.fill(password);

  await page.getByTestId("sign-in-btn").click();

  // Wait for login success
  await page.waitForURL((url) => url.pathname.includes("/dashboard"));
  console.log("Login successful");

  // Save cookies and sessionStorage (default Playwright behavior)
  if (!fs.existsSync(path.dirname(authFile))) fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });

  // Save IndexedDB (firebaseLocalStorageDb/firebaseLocalStorage)
  const indexedDBData = await page.evaluate(async () => {
    const dbName = "firebaseLocalStorageDb";
    const storeName = "firebaseLocalStorage";
    const dbRequest = indexedDB.open(dbName);
    return await new Promise((resolve, reject) => {
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const allDataRequest = store.getAll();
        allDataRequest.onsuccess = () => resolve(allDataRequest.result);
        allDataRequest.onerror = () => reject(allDataRequest.error);
      };
      dbRequest.onerror = () => reject(dbRequest.error);
    });
  });
  fs.writeFileSync(indexedDBFile, JSON.stringify(indexedDBData, null, 2));
});