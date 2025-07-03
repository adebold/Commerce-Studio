/**
 * VARAi Commerce Studio - Website Pages Tests
 * 
 * This file contains tests for the public-facing website pages and user flows.
 */

const { test, expect } = require('@playwright/test');

// Test the homepage
test('Homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check page title
  await expect(page).toHaveTitle(/VARAi Commerce Studio/);
  
  // Check main sections exist
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
  
  // Check navigation links
  await expect(page.locator('nav a[href="features.html"]')).toBeVisible();
  await expect(page.locator('nav a[href="pricing.html"]')).toBeVisible();
  await expect(page.locator('nav a[href="signup/index.html"]')).toBeVisible();
  
  // Check hero section
  await expect(page.locator('section.hero h1')).toBeVisible();
  await expect(page.locator('section.hero .btn-secondary')).toBeVisible();
  
  // Check features section
  await expect(page.locator('h2:has-text("Powerful Features")')).toBeVisible();
  await expect(page.locator('.card')).toHaveCount(3);
});

// Test the signup/onboarding flow
test('Signup flow works correctly', async ({ page }) => {
  await page.goto('/signup/index.html');
  
  // Check page title
  await expect(page).toHaveTitle(/Get Started/);
  
  // Check progress indicator
  await expect(page.locator('.progress-indicator')).toBeVisible();
  
  // Fill out first step
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'Password123!');
  await page.fill('#confirm_password', 'Password123!');
  await page.click('.next-step');
  
  // Check second step is visible
  await expect(page.locator('#business_name')).toBeVisible();
  
  // Fill out second step
  await page.fill('#business_name', 'Test Optical');
  await page.selectOption('#business_type', 'independent_optician');
  await page.selectOption('#business_size', '2-5');
  await page.click('.next-step');
  
  // Check third step is visible
  await expect(page.locator('#platform_shopify')).toBeVisible();
  
  // Fill out third step
  await page.click('#platform_shopify');
  await page.click('#pos_square');
  await page.click('#feature_virtual_try_on');
  await page.click('#feature_recommendations');
  await page.click('.next-step');
  
  // Check fourth step is visible
  await expect(page.locator('#plan_professional')).toBeVisible();
  
  // Select plan
  await page.click('label[for="plan_professional"]');
  await page.click('.next-step');
  
  // Check fifth step is visible
  await expect(page.locator('#terms_agreement')).toBeVisible();
  
  // Check summary values
  await expect(page.locator('#summary_email')).toHaveText('test@example.com');
  await expect(page.locator('#summary_business_name')).toHaveText('Test Optical');
  await expect(page.locator('#summary_plan')).toHaveText('Professional');
  
  // Complete registration
  await page.check('#terms_agreement');
  await page.check('#marketing_consent');
  await page.click('button[type="submit"]');
  
  // Should redirect to completion page
  await expect(page).toHaveURL(/complete.html/);
  await expect(page.locator('h1:has-text("Registration Complete")')).toBeVisible();
});

// Test the dashboard
test('Dashboard loads correctly', async ({ page }) => {
  await page.goto('/dashboard/index.html');
  
  // Check page title
  await expect(page).toHaveTitle(/Dashboard/);
  
  // Check sidebar
  await expect(page.locator('.dashboard-sidebar')).toBeVisible();
  await expect(page.locator('.sidebar-nav-item')).toHaveCount(6);
  
  // Check main content
  await expect(page.locator('.dashboard-header')).toBeVisible();
  await expect(page.locator('.metric-card')).toHaveCount(4);
  await expect(page.locator('.dashboard-widget')).toHaveCount(4);
  
  // Test sidebar toggle
  await page.click('.sidebar-toggle');
  await expect(page.locator('.dashboard-sidebar')).toHaveClass(/collapsed/);
  
  // Test date range picker
  await page.click('.date-range-option[data-range="7d"]');
  await expect(page.locator('.date-range-option[data-range="7d"]')).toHaveClass(/active/);
});

// Test the virtual try-on demo
test('Virtual try-on demo works correctly', async ({ page }) => {
  await page.goto('/demos/virtual-try-on.html');
  
  // Check page title
  await expect(page).toHaveTitle(/Virtual Try-On Demo/);
  
  // Check main components
  await expect(page.locator('.webcam-container')).toBeVisible();
  await expect(page.locator('.frame-grid')).toBeVisible();
  
  // Test enabling camera
  await page.click('#enable-camera');
  await expect(page.locator('#demo-face')).toBeVisible();
  await expect(page.locator('#frame-overlay')).toBeVisible();
  
  // Test frame selection
  await page.click('.frame-item[data-frame="2"]');
  await expect(page.locator('.frame-item[data-frame="2"]')).toHaveClass(/active/);
  
  // Test taking photo
  await page.click('#take-photo');
  await expect(page.locator('#comparison-view')).toBeVisible();
  
  // Test filter tags
  await page.click('.filter-tag:has-text("Round")');
  await expect(page.locator('.filter-tag:has-text("Round")')).toHaveClass(/active/);
});

// Test responsive design
test('Website is responsive', async ({ page }) => {
  // Test on mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Mobile menu should be visible
  await expect(page.locator('.mobile-menu-toggle')).toBeVisible();
  
  // Test mobile menu toggle
  await page.click('.mobile-menu-toggle');
  await expect(page.locator('nav')).toHaveClass(/active/);
  
  // Test on tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/dashboard/index.html');
  
  // Dashboard should adapt to tablet size
  await expect(page.locator('.col-md-3')).toHaveCount(4);
  
  // Test on desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/demos/virtual-try-on.html');
  
  // Try-on interface should be side-by-side on desktop
  const webcamSection = await page.locator('.webcam-section').boundingBox();
  const framesSection = await page.locator('.frames-section').boundingBox();
  
  // Check that sections are side by side (webcam section is to the left of frames section)
  expect(webcamSection.x + webcamSection.width).toBeLessThanOrEqual(framesSection.x);
});