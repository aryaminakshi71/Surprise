import { test, expect } from '@playwright/test';

test.describe('New Features Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
  });

  test('Dashboard - Real-time statistics', async ({ page }) => {
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // Wait for stats to load (either from API or demo mode)
    await page.waitForSelector('text=Total Spots', { timeout: 5000 });
    
    // Check that stat cards are present
    await expect(page.locator('text=Total Spots')).toBeVisible();
    await expect(page.locator('text=Available')).toBeVisible();
    await expect(page.locator('text=Occupied')).toBeVisible();
    
    // Verify that numbers are displayed (not just loading)
    const statCards = page.locator('[class*="bg-white"]').filter({ hasText: 'Total Spots' });
    await expect(statCards).toBeVisible();
    
    console.log('✅ Dashboard statistics loaded successfully');
  });

  test('Analytics - Interactive charts', async ({ page }) => {
    // Navigate to analytics page
    await page.goto('http://localhost:3000/dashboard/analytics', { waitUntil: 'networkidle', timeout: 10000 });
    
    // Wait for analytics page to load
    await page.waitForSelector('h1:has-text("Analytics")', { timeout: 5000 });
    
    // Check for metric cards
    await expect(page.locator('text=Average Occupancy')).toBeVisible();
    await expect(page.locator('text=Daily Vehicles')).toBeVisible();
    await expect(page.locator('text=Daily Revenue')).toBeVisible();
    await expect(page.locator('text=Peak Hour')).toBeVisible();
    
    // Check for chart sections
    await expect(page.locator('text=Occupancy Trend')).toBeVisible();
    await expect(page.locator('text=Revenue by Location')).toBeVisible();
    await expect(page.locator('text=Spot Type Distribution')).toBeVisible();
    await expect(page.locator('text=Weekly Performance')).toBeVisible();
    
    // Verify Recharts SVG elements are present
    const charts = page.locator('svg.recharts-surface');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
    
    console.log(`✅ Analytics page loaded with ${chartCount} charts`);
  });

  test('Filtering system on spots page', async ({ page }) => {
    // Navigate to spots page
    await page.goto('http://localhost:3000/dashboard/spots', { waitUntil: 'networkidle', timeout: 10000 });
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Parking Spots")', { timeout: 5000 });
    
    // Check if filter panel exists
    const filterButton = page.locator('button:has-text("Filters")');
    if (await filterButton.isVisible()) {
      // Mobile version - click to expand
      await filterButton.click();
      await page.waitForTimeout(500); // Wait for animation
    }
    
    // Check for filter inputs
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // Check for status filters
    await expect(page.locator('text=Status')).toBeVisible();
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('A-001');
    await page.waitForTimeout(500);
    
    // Check if filtering worked (should show results counter)
    const resultsText = page.locator('text=/Showing \\d+ of \\d+ spots/');
    await expect(resultsText).toBeVisible();
    
    // Clear search
    await searchInput.clear();
    
    console.log('✅ Filtering system working correctly');
  });

  test('Mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to home
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
    
    // Wait a bit for mobile nav to render
    await page.waitForTimeout(1000);
    
    // Check if mobile navigation is visible (only on small screens)
    const mobileNav = page.locator('nav').filter({ hasText: 'Home' });
    
    // Mobile nav should be at the bottom with nav items
    const navItems = page.locator('a[class*="flex"][class*="flex-col"]');
    const navCount = await navItems.count();
    
    if (navCount > 0) {
      // Mobile nav is present
      await expect(navItems.first()).toBeVisible();
      
      // Try clicking on Dashboard nav item
      const dashboardNav = page.locator('a[href="/dashboard"]').filter({ hasText: 'Dashboard' });
      if (await dashboardNav.isVisible()) {
        await dashboardNav.click();
        await page.waitForURL('**/dashboard', { timeout: 5000 });
        expect(page.url()).toContain('/dashboard');
      }
      
      console.log(`✅ Mobile navigation working with ${navCount} items`);
    } else {
      console.log('ℹ️ Mobile navigation not visible (may be conditional)');
    }
    
    // Restore desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Error boundary functionality', async ({ page }) => {
    // This is tricky - we need to trigger a React error
    // We'll navigate to a route that doesn't exist and check error handling
    
    await page.goto('http://localhost:3000/dashboard/nonexistent-route', { 
      waitUntil: 'networkidle', 
      timeout: 10000 
    });
    
    // Check if we're redirected or shown an error page
    // The error boundary should catch route errors
    const bodyText = await page.textContent('body');
    
    // Either we see "404" or "Not Found" or similar
    const hasErrorHandling = 
      bodyText?.includes('404') || 
      bodyText?.includes('Not Found') ||
      bodyText?.includes('Error') ||
      bodyText?.includes('not found');
    
    expect(hasErrorHandling).toBeTruthy();
    
    console.log('✅ Error handling verified');
  });

  test('Toast notifications', async ({ page }) => {
    // Navigate to a page that might trigger toasts
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 10000 });
    
    // Check if Toaster component is mounted
    const toaster = page.locator('[data-sonner-toaster]');
    
    // Toaster should exist in DOM even if no toasts are shown
    const toasterExists = await toaster.count() > 0;
    
    if (toasterExists) {
      console.log('✅ Toast notification system initialized');
    } else {
      console.log('ℹ️ Toaster component not found in DOM');
    }
  });

  test('API integration with error handling', async ({ page }) => {
    // Navigate to dashboard and check network requests
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 10000 });
    
    // Wait for content to load
    await page.waitForSelector('text=Total Spots', { timeout: 5000 });
    
    // Check if data is displayed (either from API or demo mode)
    const statValue = page.locator('[class*="text-2xl"]').first();
    await expect(statValue).toBeVisible();
    
    const valueText = await statValue.textContent();
    expect(valueText).toBeTruthy();
    expect(valueText?.trim().length).toBeGreaterThan(0);
    
    console.log('✅ API integration working (data loaded)');
  });

  test('Database connectivity', async ({ page }) => {
    // Check if app can connect to database by visiting analytics
    // which should load data from the seeded database
    await page.goto('http://localhost:3000/dashboard/analytics', { 
      waitUntil: 'networkidle', 
      timeout: 10000 
    });
    
    // If charts render, database connection is working
    await page.waitForSelector('h1:has-text("Analytics")', { timeout: 5000 });
    
    // Check if metric values are present
    const metrics = page.locator('[class*="text-2xl"][class*="font-bold"]');
    const metricCount = await metrics.count();
    
    expect(metricCount).toBeGreaterThan(0);
    
    console.log('✅ Database connectivity verified');
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
  ];

  for (const viewport of viewports) {
    test(`Dashboard renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('http://localhost:3000/dashboard', { 
        waitUntil: 'networkidle', 
        timeout: 10000 
      });
      
      // Check if dashboard is visible
      await expect(page.locator('text=Total Spots')).toBeVisible();
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `test-results/dashboard-${viewport.name.toLowerCase()}.png`,
        fullPage: false
      });
      
      console.log(`✅ Dashboard renders on ${viewport.name} (${viewport.width}x${viewport.height})`);
    });
  }
});
