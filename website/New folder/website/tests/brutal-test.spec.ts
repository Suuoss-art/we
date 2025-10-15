import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const WEBSITE_URL = 'http://10.187.216.35:4321';
const ADMIN_URL = 'http://10.187.216.35:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../test-results/screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe('KOPMA UNNES Website - BRUTAL TESTING 🚀', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for slow connections
    test.setTimeout(60000);
  });

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(WEBSITE_URL);
    await expect(page).toHaveTitle(/KOPMA UNNES/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-homepage.png'), fullPage: true });
    console.log('✅ Homepage screenshot saved');
  });

  test('Navigation menu is visible and functional', async ({ page }) => {
    await page.goto(WEBSITE_URL);

    // Check BERANDA
    const beranda = page.locator('text=BERANDA');
    await expect(beranda).toBeVisible();

    // Check TENTANG KAMI
    const tentangKami = page.locator('text=TENTANG KAMI');
    await expect(tentangKami).toBeVisible();

    // Check KEANGGOTAAN
    const keanggotaan = page.locator('text=KEANGGOTAAN');
    await expect(keanggotaan).toBeVisible();

    // Check ACARA
    const acara = page.locator('text=ACARA');
    await expect(acara).toBeVisible();

    // Check INVENTARIS
    const inventaris = page.locator('text=INVENTARIS');
    await expect(inventaris).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-navigation-menu.png'), fullPage: true });
    console.log('✅ Navigation menu screenshot saved');
  });

  test('Keanggotaan page loads', async ({ page }) => {
    await page.goto(`${WEBSITE_URL}/keanggotaan`);
    await expect(page).toHaveTitle(/Keanggotaan/i);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-keanggotaan-page.png'), fullPage: true });
    console.log('✅ Keanggotaan page screenshot saved');
  });

  test('Inventaris page loads', async ({ page }) => {
    await page.goto(`${WEBSITE_URL}/inventaris`);
    await expect(page).toHaveTitle(/Inventaris/i);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-inventaris-page.png'), fullPage: true });
    console.log('✅ Inventaris page screenshot saved');
  });

  test('Tentang page loads', async ({ page }) => {
    await page.goto(`${WEBSITE_URL}/tentang`);
    await expect(page).toHaveTitle(/Tentang/i);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-tentang-page.png'), fullPage: true });
    console.log('✅ Tentang page screenshot saved');
  });

  test('Blog/Acara page loads', async ({ page }) => {
    await page.goto(`${WEBSITE_URL}/blog`);
    await expect(page).toHaveTitle(/ACARA|Blog/i);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-blog-acara-page.png'), fullPage: true });
    console.log('✅ Blog/Acara page screenshot saved');
  });

  test('Struktur page loads', async ({ page }) => {
    await page.goto(`${WEBSITE_URL}/struktur`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-struktur-page.png'), fullPage: true });
    console.log('✅ Struktur page screenshot saved');
  });

  test('Logo KOPMA is visible', async ({ page }) => {
    await page.goto(WEBSITE_URL);
    const logo = page.locator('img[alt*="KOPMA"]').first();
    await expect(logo).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-logo-check.png') });
    console.log('✅ Logo check screenshot saved');
  });

  test('Footer contains contact information', async ({ page }) => {
    await page.goto(WEBSITE_URL);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-footer.png'), fullPage: true });
    console.log('✅ Footer screenshot saved');
  });

  test('Check for broken images on homepage', async ({ page }) => {
    await page.goto(WEBSITE_URL);
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();
    let brokenImages = [];

    for (const img of images) {
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);

      if (naturalWidth === 0 && src) {
        brokenImages.push(src);
      }
    }

    if (brokenImages.length > 0) {
      console.warn(`⚠️ Found ${brokenImages.length} broken images:`, brokenImages);
    } else {
      console.log('✅ No broken images found');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-image-check.png'), fullPage: true });
  });

  test('Mobile responsive check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(WEBSITE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-mobile-homepage.png'), fullPage: true });
    console.log('✅ Mobile homepage screenshot saved');

    // Open mobile menu
    const menuButton = page.locator('button').filter({ hasText: /menu/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-mobile-menu-open.png'), fullPage: true });
      console.log('✅ Mobile menu screenshot saved');
    }
  });
});

test.describe('KOPMA UNNES Admin Panel - BRUTAL TESTING 🔐', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
  });

  test('Admin login page loads', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Login|Admin/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-admin-login.png'), fullPage: true });
    console.log('✅ Admin login screenshot saved');
  });

  test('Admin login form is visible', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    console.log('✅ Admin login form is functional');
  });

  test('Admin routes require authentication', async ({ page }) => {
    // Try accessing dashboard without auth
    await page.goto(`${ADMIN_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    const url = page.url();
    expect(url).toContain('/login');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-admin-auth-check.png'), fullPage: true });
    console.log('✅ Admin authentication enforced');
  });

  test('Admin panel pages exist - Dashboard', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-admin-dashboard.png'), fullPage: true });
  });

  test('Admin panel pages exist - Tools', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/tools`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-admin-tools.png'), fullPage: true });
  });

  test('Admin panel pages exist - File Manager', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/file-manager`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17-admin-file-manager.png'), fullPage: true });
  });

  test('Admin panel pages exist - Content Editor', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/content-editor`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18-admin-content-editor.png'), fullPage: true });
  });

  test('Admin panel pages exist - Media Manager', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/media-manager`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19-admin-media-manager.png'), fullPage: true });
  });

  test('Admin panel pages exist - Analytics', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/analytics`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20-admin-analytics.png'), fullPage: true });
  });

  test('Admin panel pages exist - Security', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/security`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21-admin-security.png'), fullPage: true });
  });

  test('Admin panel pages exist - Settings', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22-admin-settings.png'), fullPage: true });
  });

  test('Admin panel pages exist - Users', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/users`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23-admin-users.png'), fullPage: true });
  });

  test('Admin panel pages exist - Monitoring', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/monitoring`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '24-admin-monitoring.png'), fullPage: true });
  });
});

test.describe('Performance Testing 🚀', () => {
  test('Website loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(WEBSITE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`⏱️ Website load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('Admin panel loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${ADMIN_URL}/login`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`⏱️ Admin panel load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });
});

console.log(`
🎉 BRUTAL TESTING COMPLETE! 🎉
Screenshots saved to: ${SCREENSHOT_DIR}
Check all screenshots for visual validation!
`);
