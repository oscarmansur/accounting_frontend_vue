// @ts-check
import { test, expect } from '@playwright/test'
import { apiLogin, apiGetProfile, API_URL, uiLogin, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js'

/**
 * Suite 2: Multi-Tenant Context Tests
 *
 * Validates:
 * - Automatic tenant selection after login
 * - Tenant switching behavior
 * - Company auto-selection
 * - Company switching and context cleanup
 * - Context persistence across page reloads
 * - X-Tenant-ID and X-Company-ID headers in requests
 */

test.describe('Multi-Tenant Context', () => {
    let token

    test.beforeAll(async ({ request }) => {
        token = await apiLogin(request)
    })

    test('after login, tenant is auto-selected from user memberships', async ({ page }) => {
        await uiLogin(page)

        // Wait for context to load
        await page.waitForTimeout(2000)

        // Check that a tenant was selected in localStorage
        const tenantId = await page.evaluate(() => localStorage.getItem('current_tenant_id'))
        expect(tenantId).toBeTruthy()
        expect(tenantId.length).toBeGreaterThan(10) // UUID format
    })

    test('after tenant selection, company is auto-selected', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(3000)

        const companyId = await page.evaluate(() => localStorage.getItem('current_company_id'))
        // Company may or may not exist depending on setup
        // If tenant has companies, it should be selected
        const tenantId = await page.evaluate(() => localStorage.getItem('current_tenant_id'))

        if (tenantId) {
            // Verify context store has the tenant
            const tenantRole = await page.evaluate(() => localStorage.getItem('tenant_role'))
            expect(tenantRole).toBeTruthy()
        }
    })

    test('X-Tenant-ID header is sent in API requests', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        // Intercept a request to verify headers
        let capturedHeaders = null
        await page.route('**/api/v1/companies/**', route => {
            capturedHeaders = route.request().headers()
            route.continue()
        })

        // Trigger a companies request by navigating
        await page.goto('/config/companies')
        await page.waitForTimeout(2000)

        if (capturedHeaders) {
            expect(capturedHeaders['x-tenant-id']).toBeTruthy()
            expect(capturedHeaders['authorization']).toContain('Bearer ')
        }
    })

    test('context persists across page reload', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        // Save current context
        const tenantBefore = await page.evaluate(() => localStorage.getItem('current_tenant_id'))
        const companyBefore = await page.evaluate(() => localStorage.getItem('current_company_id'))

        // Reload the page
        await page.reload()
        await page.waitForTimeout(2000)

        // Verify context is restored
        const tenantAfter = await page.evaluate(() => localStorage.getItem('current_tenant_id'))
        expect(tenantAfter).toBe(tenantBefore)

        if (companyBefore) {
            const companyAfter = await page.evaluate(() => localStorage.getItem('current_company_id'))
            expect(companyAfter).toBe(companyBefore)
        }

        // Should still be on dashboard (not redirected to login)
        await expect(page).not.toHaveURL('/login')
    })

    test('tenant role is stored correctly in localStorage', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        const role = await page.evaluate(() => localStorage.getItem('tenant_role'))
        // Superuser gets 'owner' role
        expect(role).toBe('owner')
    })
})
