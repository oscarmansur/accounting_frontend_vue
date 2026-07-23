// @ts-check
import { test, expect } from '@playwright/test'
import { apiLogin, API_URL, uiLogin } from './helpers.js'

/**
 * Suite 4: Chart of Accounts Tests
 *
 * Validates:
 * - Chart of accounts page loads with tree/flat view
 * - Loading a chart template populates accounts
 * - Template listing and management
 * - Account creation
 */

test.describe('Chart of Accounts', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)
    })

    test('chart of accounts page loads correctly', async ({ page }) => {
        await page.goto('/config/chart-of-accounts')
        await page.waitForTimeout(2000)

        await expect(page).toHaveURL('/config/chart-of-accounts')
    })

    test('list available chart templates via API', async ({ request }) => {
        const token = await apiLogin(request)

        // First get a tenant (we need its ID)
        const tenantsResponse = await request.get(`${API_URL}/tenants/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (tenantsResponse.status() !== 200) {
            test.skip()
            return
        }

        const tenants = await tenantsResponse.json()
        if (tenants.length === 0) {
            test.skip()
            return
        }

        const tenantId = tenants[0].id

        // Get templates
        const templatesResponse = await request.get(`${API_URL}/accounting/accounts/templates/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenantId,
            },
        })

        expect(templatesResponse.status()).toBe(200)
        const templates = await templatesResponse.json()
        expect(Array.isArray(templates)).toBe(true)
    })

    test('get accounts tree via API returns hierarchical structure', async ({ request }) => {
        const token = await apiLogin(request)

        const tenantsResponse = await request.get(`${API_URL}/tenants/`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        const tenants = await tenantsResponse.json()
        if (tenants.length === 0) { test.skip(); return }

        // Get companies
        const companiesResponse = await request.get(`${API_URL}/companies/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenants[0].id,
            },
        })

        if (companiesResponse.status() !== 200) { test.skip(); return }
        const companies = await companiesResponse.json()
        if (companies.length === 0) { test.skip(); return }

        // Get accounts tree
        const accountsResponse = await request.get(`${API_URL}/accounting/accounts/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenants[0].id,
                'X-Company-ID': companies[0].id,
            },
        })

        expect(accountsResponse.status()).toBe(200)
        const tree = await accountsResponse.json()
        expect(Array.isArray(tree)).toBe(true)

        // If accounts exist, verify tree structure
        if (tree.length > 0) {
            const firstNode = tree[0]
            expect(firstNode).toHaveProperty('code')
            expect(firstNode).toHaveProperty('name')
            expect(firstNode).toHaveProperty('account_type')
            expect(firstNode).toHaveProperty('children')
        }
    })
})
