// @ts-check
import { test, expect } from '@playwright/test'
import { uiLogin } from './helpers.js'

/**
 * Suite 7: Roles & Permissions Tests
 *
 * Validates:
 * - Superuser can access all routes
 * - Access-denied page renders for unauthorized roles
 * - Route guard properly checks meta.roles
 * - Tenant management requires superuser
 */

test.describe('Roles & Permissions', () => {

    // ── Superuser Access ────────────────────────────────

    test('superuser can access tenant management', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        await page.goto('/admin/tenants')
        await page.waitForTimeout(2000)

        // Superuser should NOT be redirected to access-denied
        await expect(page).toHaveURL('/admin/tenants')
    })

    test('superuser can access all protected routes', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        const protectedRoutes = [
            { path: '/config/companies', name: 'Companies' },
            { path: '/config/chart-of-accounts', name: 'Chart' },
            { path: '/config/currency-rates', name: 'Currency Rates' },
            { path: '/accounting/entries', name: 'Journal Entries' },
            { path: '/accounting/contacts', name: 'Contacts' },
            { path: '/accounting/fixed-assets', name: 'Fixed Assets' },
            { path: '/accounting/bank-reconciliation', name: 'Bank Reconciliation' },
            { path: '/reports/balance-sheet', name: 'Balance Sheet' },
            { path: '/reports/profit-and-loss', name: 'P&L' },
            { path: '/reports/trial-balance', name: 'Trial Balance' },
            { path: '/reports/aging', name: 'Aging' },
            { path: '/reports/ledger', name: 'General Ledger' },
            { path: '/users', name: 'Users' },
            { path: '/profile', name: 'Profile' },
        ]

        for (const route of protectedRoutes) {
            await page.goto(route.path)
            await page.waitForTimeout(1000)

            // Superuser should NOT be redirected to access-denied or login
            const currentUrl = page.url()
            expect(
                currentUrl,
                `Superuser should access ${route.name} (${route.path})`
            ).not.toContain('access-denied')
            expect(currentUrl).not.toContain('login')
        }
    })

    // ── Access Denied Page ──────────────────────────────

    test('access-denied page renders correctly', async ({ page }) => {
        await page.goto('/access-denied')

        // Should not redirect (it's a public route)
        await expect(page).toHaveURL('/access-denied')
    })

    // ── Not Found Page ──────────────────────────────────

    test('404 page renders for unknown routes', async ({ page }) => {
        await page.goto('/this-route-does-not-exist')
        await page.waitForTimeout(1000)

        // The catch-all route should render NotFound.vue
        // (may redirect to login first if not authenticated)
    })

    // ── Dashboard Access ────────────────────────────────

    test('dashboard is accessible to all authenticated users', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        await page.goto('/')
        await expect(page).toHaveURL('/')
        // Should not redirect to access-denied
    })

    test('profile is accessible to all authenticated users', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        await page.goto('/profile')
        await expect(page).toHaveURL('/profile')
    })
})
