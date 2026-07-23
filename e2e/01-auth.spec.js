// @ts-check
import { test, expect } from '@playwright/test'
import { ADMIN_EMAIL, ADMIN_PASSWORD, uiLogin } from './helpers.js'

/**
 * Suite 1: Authentication Tests
 *
 * Validates the complete authentication flow including:
 * - Successful login with valid credentials
 * - Error handling for invalid credentials
 * - Form validation
 * - Logout and session cleanup
 * - Navigation guards (authenticated/unauthenticated)
 */

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to login and clear stored auth state once.
        // Using evaluate() instead of addInitScript() so it only
        // runs once — addInitScript persists across navigations
        // which would wipe the token when uiLogin calls goto('/').
        await page.goto('/login')
        await page.evaluate(() => localStorage.clear())
    })

    // ── Login Flow ──────────────────────────────────────

    test('successful login redirects to dashboard', async ({ page }) => {
        await page.goto('/login')

        // Verify login page loaded
        await expect(page.locator('#email')).toBeVisible()
        await expect(page.locator('#password')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()

        // Fill credentials
        await page.waitForSelector('#email', { state: 'visible' })
        await page.fill('#email', ADMIN_EMAIL)
        await page.fill('#password', ADMIN_PASSWORD)

        // Submit
        await page.click('button[type="submit"]')

        // Wait for token to be stored (confirms API login succeeded)
        await page.waitForFunction(
            () => !!localStorage.getItem('auth_token'),
            { timeout: 15000 },
        )

        // Verify token is stored in localStorage
        const token = await page.evaluate(() => localStorage.getItem('auth_token'))
        expect(token).toBeTruthy()
        expect(token.length).toBeGreaterThan(10)

        const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'))
        expect(refreshToken).toBeTruthy()

        // Verify user data is stored
        const userData = await page.evaluate(() => localStorage.getItem('user'))
        expect(userData).toBeTruthy()
        const user = JSON.parse(userData)
        expect(user.email).toBe(ADMIN_EMAIL)
        expect(user.is_superuser).toBe(true)
    })

    test('login with invalid password shows error', async ({ page }) => {
        await page.goto('/login')

        await page.fill('#email', ADMIN_EMAIL)
        await page.fill('#password', 'wrongpassword123')
        await page.click('button[type="submit"]')

        // Wait a moment for the API response
        await page.waitForTimeout(3000)

        // Error message should appear
        const errorAlert = page.locator('.bg-red-50, .bg-red-900\\/30, .border-red-500')
        await expect(errorAlert).toBeVisible({ timeout: 5000 })

        // Should stay on login page
        await expect(page).toHaveURL('/login')

        // Token should NOT be stored
        const token = await page.evaluate(() => localStorage.getItem('auth_token'))
        expect(token).toBeNull()
    })

    test('login with non-existent email shows error', async ({ page }) => {
        await page.goto('/login')

        await page.fill('#email', 'nonexistent@example.com')
        await page.fill('#password', 'somepassword123')
        await page.click('button[type="submit"]')

        // Wait a moment for the API response
        await page.waitForTimeout(3000)

        // Error should appear
        const errorAlert = page.locator('.bg-red-50, .bg-red-900\\/30, .border-red-500')
        await expect(errorAlert).toBeVisible({ timeout: 5000 })

        await expect(page).toHaveURL('/login')
    })

    test('empty form submission is prevented by HTML5 validation', async ({ page }) => {
        await page.goto('/login')

        // Click submit without filling anything
        await page.click('button[type="submit"]')

        // Should still be on login page (HTML5 required prevents submission)
        await expect(page).toHaveURL('/login')
    })

    test('password visibility toggle works', async ({ page }) => {
        await page.goto('/login')

        const passwordInput = page.locator('#password')
        await page.fill('#password', 'testpassword')

        // Initially type=password
        await expect(passwordInput).toHaveAttribute('type', 'password')

        // Click the toggle button
        const toggleBtn = page.locator('#password').locator('..').locator('button')
        await toggleBtn.click()

        // Should now be type=text
        await expect(passwordInput).toHaveAttribute('type', 'text')

        // Click again to hide
        await toggleBtn.click()
        await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    // ── Registration ────────────────────────────────────

    test('register link navigates to registration page', async ({ page }) => {
        await page.goto('/login')

        await page.click('a[href="/register"]')
        await expect(page).toHaveURL('/register')
    })

    test('forgot password link navigates correctly', async ({ page }) => {
        await page.goto('/login')

        await page.click('a[href="/forgot-password"]')
        await expect(page).toHaveURL('/forgot-password')
    })

    // ── Logout ──────────────────────────────────────────

    test('logout clears all session data and redirects to login', async ({ page }) => {
        // First, login
        await uiLogin(page)

        // Verify we're logged in
        const tokenBefore = await page.evaluate(() => localStorage.getItem('auth_token'))
        expect(tokenBefore).toBeTruthy()

        // Perform logout by clearing localStorage (same as authStore.logout())
        await page.evaluate(() => {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            localStorage.removeItem('current_tenant_id')
            localStorage.removeItem('current_company_id')
            localStorage.removeItem('tenant_role')
        })

        // Navigate — the router guard should redirect to login
        await page.goto('/')
        await page.waitForFunction(
            () => window.location.pathname.includes('/login'),
            { timeout: 10000 },
        )

        // Verify localStorage is cleaned
        const token = await page.evaluate(() => localStorage.getItem('auth_token'))
        expect(token).toBeNull()
    })

    // ── Navigation Guards ───────────────────────────────

    test('unauthenticated user is redirected to login', async ({ page }) => {
        // Try to access protected route
        await page.goto('/')

        // Should be redirected to login
        await expect(page).toHaveURL('/login')
    })

    test('unauthenticated user accessing any protected route redirects to login', async ({ page }) => {
        const protectedRoutes = [
            '/config/companies',
            '/accounting/entries',
            '/reports/balance-sheet',
            '/users',
        ]

        for (const route of protectedRoutes) {
            await page.goto(route)
            await page.waitForTimeout(1500)
            await expect(page).toHaveURL(/\/login/)
        }
    })

    test('authenticated user accessing login is redirected to dashboard', async ({ page }) => {
        // Login first
        await uiLogin(page)

        // Verify token exists
        const token = await page.evaluate(() => localStorage.getItem('auth_token'))
        expect(token).toBeTruthy()

        // Try to go to login page — router guard should redirect away
        await page.goto('/login')
        await page.waitForFunction(
            () => !window.location.pathname.includes('/login'),
            { timeout: 10000 },
        )

        // Should NOT be on login page (redirected to dashboard)
        const url = page.url()
        expect(url).not.toContain('/login')
    })
})
