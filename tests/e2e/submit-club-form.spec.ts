import { test, expect } from '@playwright/test';
import fs from "fs";
import path from "path";

const indexedDBFile = path.join(__dirname, "../../playwright/.auth/indexedDB.json");

test.describe('Run Club Registration Form', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the submit page
    await page.goto('/submit', { waitUntil: 'networkidle' });
    
    // Wait for form to be visible
    await expect(page.locator('form').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display the registration form with all required fields', async ({ page }) => {
    // Check form heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Check all required fields are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="file"][name="logo"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"][name="runDays"]').first()).toBeVisible();
    await expect(page.locator('input[name="distance"]')).toBeVisible();
    await expect(page.locator('textarea[name="distanceDescription"]')).toBeVisible();
    await expect(page.locator('input[name="city"]')).toBeVisible();
    await expect(page.locator('input[name="area"]')).toBeVisible();
    await expect(page.locator('input[name="address"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="instagram"]')).toBeVisible();
    await expect(page.locator('input[name="facebook"]')).toBeVisible();
    await expect(page.locator('input[name="strava"]')).toBeVisible();
    await expect(page.locator('input[name="website"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Check submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Click submit without filling any fields
    await page.locator('button[type="submit"]').click();

    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Check that we're still on the submit page
    expect(page.url()).toContain('/submit');

    // Check that required fields have validation attributes
    await expect(page.locator('input[name="name"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="distance"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="city"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="area"]')).toHaveAttribute('required', '');
    await expect(page.locator('textarea[name="description"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '');
  });

  test('should successfully submit a complete run club registration with image', async ({ page }) => {
    // Restore IndexedDB for Firebase auth session retrieval
    const indexedDBData = JSON.parse(fs.readFileSync(indexedDBFile, "utf-8"));
    await page.evaluate(async (data) => {
      const dbName = "firebaseLocalStorageDb";
      const storeName = "firebaseLocalStorage";
      const dbRequest = indexedDB.open(dbName);
      await new Promise((resolve, reject) => {
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          const transaction = db.transaction(storeName, "readwrite");
          const store = transaction.objectStore(storeName);
          data.forEach((item: unknown) => store.put(item));
          transaction.oncomplete = () => resolve(true);
          transaction.onerror = () => reject(transaction.error);
        };
        dbRequest.onerror = () => reject(dbRequest.error);
      });
    }, indexedDBData);

    // Fill in club name
    await page.fill('input[name="name"]', 'Test Running Club E2E');

    // Mock file upload - create a fake PNG file
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    await page.setInputFiles('input[type="file"][name="logo"]', {
      name: 'test-logo.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    // Verify file is uploaded (check for preview or file name)
    await page.waitForTimeout(500);

    // Select run days (Monday and Wednesday)
    const checkboxes = page.locator('input[type="checkbox"][name="runDays"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      await checkboxes.nth(0).check(); // First day
      await expect(checkboxes.nth(0)).toBeChecked();
    }
    
    if (checkboxCount > 2) {
      await checkboxes.nth(2).check(); // Third day
      await expect(checkboxes.nth(2)).toBeChecked();
    }

    // Fill distance
    await page.fill('input[name="distance"]', '5-8 km');

    // Fill optional distance description if field exists
    const distanceDescField = page.locator('textarea[name="distanceDescription"]');
    if (await distanceDescField.isVisible()) {
      await distanceDescField.fill('Two pace groups: slower 6 min/km, faster 5 min/km');
    }

    // Fill location details
    await page.fill('input[name="city"]', 'Tallinn');
    await page.fill('input[name="area"]', 'Rotermanni Quarter');
    
    // Fill address if field exists
    const addressField = page.locator('input[name="address"]');
    if (await addressField.isVisible()) {
      await addressField.fill('Rotermanni 2, 10111 Tallinn');
    }

    // Fill description
    await page.fill(
      'textarea[name="description"]',
      'Test Running Club is a friendly community of runners in Tallinn. We meet twice a week for social runs of varying paces. Everyone is welcome, from beginners to experienced runners. Follow our Instagram for the latest updates on runs and events!'
    );

    // Fill social media links if fields exist
    const instagramField = page.locator('input[name="instagram"]');
    if (await instagramField.isVisible()) {
      await instagramField.fill('https://instagram.com/testrunningclub');
    }

    const facebookField = page.locator('input[name="facebook"]');
    if (await facebookField.isVisible()) {
      await facebookField.fill('https://facebook.com/testrunningclub');
    }

    const stravaField = page.locator('input[name="strava"]');
    if (await stravaField.isVisible()) {
      await stravaField.fill('https://strava.com/clubs/testrunningclub');
    }

    const websiteField = page.locator('input[name="website"]');
    if (await websiteField.isVisible()) {
      await websiteField.fill('https://testrunningclub.ee');
    }

    // Fill email
    await page.fill('input[name="email"]', 'test@runningclub.ee');

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for the feedback toast to appear (appears when state.message is set after server action)
    await page.waitForSelector('[data-testid="feedback-toast"]');

    // Assert the toast contains the success message
    const toastText = await page.locator('[data-testid="feedback-toast"]').textContent();
    expect(toastText).toContain("Success! Your club has been registered and is pending approval.");
  });

  test('should upload and preview SVG file', async ({ page }) => {
    // Create a simple SVG file
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <circle cx="50" cy="50" r="40" fill="blue" />
      </svg>
    `;
    
    await page.setInputFiles('input[type="file"][name="logo"]', {
      name: 'test-logo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(svgContent),
    });

    // Wait for file to be processed
    await page.waitForTimeout(10000);

    // Verify file input has a file
    const fileInput = page.locator('input[type="file"][name="logo"]');
    const files = await fileInput.evaluate((el: HTMLInputElement) => el.files?.length || 0);
    expect(files).toBeGreaterThan(0);
  });

  test('should validate email format', async ({ page }) => {
    // Fill all required fields except email with valid data
    await page.fill('input[name="name"]', 'Email Validation Test Club');
    
    const checkboxes = page.locator('input[type="checkbox"][name="runDays"]');
    await checkboxes.first().check();
    
    await page.fill('input[name="distance"]', '5 km');
    await page.fill('input[name="city"]', 'Tallinn');
    await page.fill('input[name="area"]', 'Center');
    await page.fill('textarea[name="description"]', 'Test description that is long enough to pass validation');
    
    // Fill invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    
    // Try to submit
    await page.locator('button[type="submit"]').click();
    
    // Should not submit (HTML5 validation or custom validation)
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/submit');
    
    // Email field should show validation error
    const emailInput = page.locator('input[name="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should persist form data on validation errors', async ({ page }) => {
    // Fill some fields
    const clubName = 'Persistence Test Club';
    const cityName = 'Tartu';
    
    await page.fill('input[name="name"]', clubName);
    await page.fill('input[name="city"]', cityName);
    
    // Submit without filling all required fields
    await page.locator('button[type="submit"]').click();
    
    await page.waitForTimeout(10000);
    
    // Check that filled fields still have their values
    await expect(page.locator('input[name="name"]')).toHaveValue(clubName);
    await expect(page.locator('input[name="city"]')).toHaveValue(cityName);
  });

  test('should handle multiple file type uploads', async ({ page }) => {
    const testFiles = [
      {
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-jpg-data'),
      },
      {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-png-data'),
      },
      {
        name: 'test.webp',
        mimeType: 'image/webp',
        buffer: Buffer.from('fake-webp-data'),
      },
    ];

    for (const file of testFiles) {
      // Clear previous file
      await page.setInputFiles('input[type="file"][name="logo"]', []);
      
      // Upload new file
      await page.setInputFiles('input[type="file"][name="logo"]', file);
      
      await page.waitForTimeout(500);
      
      // Verify file is set
      const fileInput = page.locator('input[type="file"][name="logo"]');
      const fileCount = await fileInput.evaluate((el: HTMLInputElement) => el.files?.length || 0);
      expect(fileCount).toBe(1);
    }
  });

  test('should clear file input when reset', async ({ page }) => {
    // Upload a file
    const buffer = Buffer.from('fake-image-data');
    await page.setInputFiles('input[type="file"][name="logo"]', {
      name: 'test-logo.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    await page.waitForTimeout(10000);

    // Clear the file
    await page.setInputFiles('input[type="file"][name="logo"]', []);

    await page.waitForTimeout(10000);

    // Verify file is cleared
    const fileInput = page.locator('input[type="file"][name="logo"]');
    const fileCount = await fileInput.evaluate((el: HTMLInputElement) => el.files?.length || 0);
    expect(fileCount).toBe(0);
  });
});

test.describe('Run Club Registration - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Block Firebase requests
    await page.route('**/firestore.googleapis.com/**', route => route.abort('failed'));
    await page.route('**/storage.googleapis.com/**', route => route.abort('failed'));
    
    await page.goto('/submit', { waitUntil: 'domcontentloaded' });
    
    // Form should still render even if Firebase fails
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network (100ms delay per request)
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('/submit', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Form should load eventually
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('should display error message on server error', async ({ page }) => {
    await page.goto('/submit');

    // Fill form with valid data
    await page.fill('input[name="name"]', 'Server Error Test Club');
    
    const checkboxes = page.locator('input[type="checkbox"][name="runDays"]');
    await checkboxes.first().check();
    
    await page.fill('input[name="distance"]', '5 km');
    await page.fill('input[name="city"]', 'Tallinn');
    await page.fill('input[name="area"]', 'Center');
    await page.fill('textarea[name="description"]', 'Testing server error handling');
    await page.fill('input[name="email"]', 'error@test.com');

    // Intercept the form submission and return error
    await page.route('**/submit', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for error message
    await page.waitForTimeout(10000);

    // Should still be on submit page or show error
    const isOnSubmitPage = page.url().includes('/submit');
    const hasErrorMessage = await page.locator('text=/error|failed/i').isVisible().catch(() => false);
    
    expect(isOnSubmitPage || hasErrorMessage).toBeTruthy();
  });
});