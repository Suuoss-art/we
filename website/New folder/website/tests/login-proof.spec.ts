import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Login page shows form inputs - PROOF', async ({ page }) => {
  console.log('🔍 Testing login page at http://10.187.216.35:3000/login');

  await page.goto('http://10.187.216.35:3000/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take screenshot
  const screenshotPath = path.join(__dirname, '../LOGIN_PAGE_PROOF.png');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  console.log('✅ Screenshot saved to: LOGIN_PAGE_PROOF.png');

  // Check if form elements exist
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(submitButton).toBeVisible();

  console.log('\n✅ LOGIN FORM IS VISIBLE AND WORKING!');
  console.log('   ✓ Email input found');
  console.log('   ✓ Password input found');
  console.log('   ✓ Submit button found');
});
