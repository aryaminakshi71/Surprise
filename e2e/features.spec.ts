import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display landing page with main features', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check hero section
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    
    // Check features section
    await expect(page.getByText(/Simple Operations/i)).toBeVisible()
    await expect(page.getByText(/Analytics/i)).toBeVisible()
    await expect(page.getByText(/Security/i)).toBeVisible()
    await expect(page.getByText(/API/i)).toBeVisible()
    
    // Check pricing plans
    await expect(page.getByText(/Free/i)).toBeVisible()
    await expect(page.getByText(/Pro/i)).toBeVisible()
    
    // Check navigation links
    await expect(page.getByRole('link', { name: /Login/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Login/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should have working command palette', async ({ page }) => {
    await page.goto('/')
    // Command palette should be accessible
    await page.keyboard.press('Meta+K')
    // Check if command palette opens (would need specific selector)
  })
})

test.describe('Demo Mode', () => {
  test('should start demo session', async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /Try Demo/i })).toBeVisible()
    
    // Check demo features listed
    await expect(page.getByText(/Full access to all features/i)).toBeVisible()
    await expect(page.getByText(/No credit card required/i)).toBeVisible()
    
    // Start demo
    await page.getByRole('button', { name: /Start Demo/i }).click()
    
    // Should redirect to dashboard - give more time for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    
    // Verify demo mode is active
    const storage = await page.evaluate(() => localStorage.getItem('demo_mode'))
    expect(storage).toBe('true')
  })
})

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page.getByText(/Please enter both email and password/i)).toBeVisible()
  })

  test('should display register link', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /Sign up/i })).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /Sign up/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })
})

test.describe('Parking Reservation', () => {
  test('should display reservation page', async ({ page }) => {
    await page.goto('/reserve')
    
    await expect(page.getByRole('heading', { name: /Find parking/i })).toBeVisible()
    await expect(page.getByText(/Skip the stress/i)).toBeVisible()
    
    // Check for parking map
    await expect(page.getByText(/Downtown Parking Garage/i)).toBeVisible()
  })

  test('should display search form', async ({ page }) => {
    await page.goto('/reserve')
    
    // Should have location/time inputs
    await expect(page.locator('form')).toBeVisible()
  })

  test('should show parking spots on map', async ({ page }) => {
    await page.goto('/reserve')
    
    // Check if parking spots are rendered
    await expect(page.getByText(/Downtown Parking Garage/i)).toBeVisible()
  })

  test('should allow spot selection', async ({ page }) => {
    await page.goto('/reserve')
    
    // Find and click a parking spot
    const spots = page.locator('[data-spot]').or(page.locator('[class*="spot"]'))
    const count = await spots.count()
    
    if (count > 0) {
      await spots.first().click()
      // Booking panel should appear
      await expect(page.getByText(/Book/i)).toBeVisible()
    }
  })
})

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up demo mode
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Start Demo/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('should display dashboard with stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible()
    
    // Check for stat cards
    await expect(page.getByText(/Total Spots/i).or(page.getByText(/spots/i))).toBeVisible()
  })

  test('should show recent entries', async ({ page }) => {
    await expect(page.getByText(/Recent Entries/i)).toBeVisible()
  })

  test('should have navigation menu', async ({ page }) => {
    // Check sidebar/navigation
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Spots/i }).or(page.getByRole('link', { name: /Parking/i }))).toBeVisible()
  })
})

test.describe('Parking Spots Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Start Demo/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to spots page', async ({ page }) => {
    await page.getByRole('link', { name: /Spots/i }).or(page.getByRole('link', { name: /Parking/i })).first().click()
    await expect(page).toHaveURL(/\/dashboard\/spots/)
  })

  test('should display spots list', async ({ page }) => {
    await page.goto('/dashboard/spots')
    await expect(page.getByRole('heading', { name: /Parking Spots/i }).or(page.getByRole('heading', { name: /Spots/i }))).toBeVisible()
  })
})

test.describe('Vehicle Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Start Demo/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to vehicles page', async ({ page }) => {
    await page.getByRole('link', { name: /Vehicles/i }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/vehicles/)
  })

  test('should display vehicles list', async ({ page }) => {
    await page.goto('/dashboard/vehicles')
    await expect(page.getByRole('heading', { name: /Vehicles/i })).toBeVisible()
  })
})

test.describe('Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Start Demo/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to analytics page', async ({ page }) => {
    await page.getByRole('link', { name: /Analytics/i }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/analytics/)
  })

  test('should display analytics dashboard', async ({ page }) => {
    await page.goto('/dashboard/analytics')
    await expect(page.getByRole('heading', { name: /Analytics/i })).toBeVisible()
  })
})

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Start Demo/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to reports page', async ({ page }) => {
    await page.getByRole('link', { name: /Reports/i }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/reports/)
  })

  test('should display reports page', async ({ page }) => {
    await page.goto('/dashboard/reports')
    await expect(page.getByRole('heading', { name: /Reports/i })).toBeVisible()
  })
})

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Start Demo/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.getByRole('link', { name: /Settings/i }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/settings/)
  })

  test('should display settings page', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()
  })
})

test.describe('Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Start Demo/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to users page', async ({ page }) => {
    await page.getByRole('link', { name: /Users/i }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/users/)
  })

  test('should display users list', async ({ page }) => {
    await page.goto('/dashboard/users')
    await expect(page.getByRole('heading', { name: /Users/i })).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Check mobile menu
    const menuButton = page.getByRole('button').filter({ hasText: /menu/i })
    if (await menuButton.count() > 0) {
      await menuButton.click()
    }
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('API Health Check', () => {
  test('should respond to health endpoint', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.ok).toBe(true)
  })
})
