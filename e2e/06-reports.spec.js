// @ts-check
import { test, expect } from '@playwright/test'
import { apiLogin, API_URL, uiLogin } from './helpers.js'

/**
 * Suite 6: Financial Reports Tests
 *
 * Validates:
 * - Balance Sheet generation and structure
 * - Profit & Loss statement
 * - Trial Balance with opening/closing balances
 * - General Ledger with line items
 * - Aging Report by contact
 * - Report UI pages load correctly
 */

test.describe('Financial Reports', () => {
    let token
    let tenantId
    let companyId

    test.beforeAll(async ({ request }) => {
        token = await apiLogin(request)

        const tenantsRes = await request.get(`${API_URL}/tenants/`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        const tenants = await tenantsRes.json()
        if (tenants.length === 0) return
        tenantId = tenants[0].id

        const companiesRes = await request.get(`${API_URL}/companies/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenantId,
            },
        })
        const companies = await companiesRes.json()
        if (companies.length > 0) companyId = companies[0].id
    })

    // ── API-Level Report Tests ──────────────────────────

    test('balance sheet API returns valid structure', async ({ request }) => {
        if (!companyId) { test.skip(); return }

        const res = await request.get(`${API_URL}/reports/balance-sheet?as_of_date=2026-07-23`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenantId,
                'X-Company-ID': companyId,
            },
        })

        expect(res.status()).toBe(200)
        const report = await res.json()

        // Validate structure
        expect(report).toHaveProperty('as_of_date')
        expect(report).toHaveProperty('assets')
        expect(report).toHaveProperty('liabilities')
        expect(report).toHaveProperty('equity')
        expect(report).toHaveProperty('total_assets')
        expect(report).toHaveProperty('total_liabilities')
        expect(report).toHaveProperty('total_equity')
        expect(report).toHaveProperty('is_balanced')
        expect(Array.isArray(report.assets)).toBe(true)
        expect(Array.isArray(report.liabilities)).toBe(true)
        expect(Array.isArray(report.equity)).toBe(true)
    })

    test('profit and loss API returns valid structure', async ({ request }) => {
        if (!companyId) { test.skip(); return }

        const res = await request.get(
            `${API_URL}/reports/profit-and-loss?start_date=2026-01-01&end_date=2026-12-31`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant-ID': tenantId,
                    'X-Company-ID': companyId,
                },
            }
        )

        expect(res.status()).toBe(200)
        const report = await res.json()

        expect(report).toHaveProperty('start_date')
        expect(report).toHaveProperty('end_date')
        expect(report).toHaveProperty('revenue')
        expect(report).toHaveProperty('expenses')
        expect(report).toHaveProperty('total_revenue')
        expect(report).toHaveProperty('total_expenses')
        expect(report).toHaveProperty('net_income')
    })

    test('trial balance API returns valid structure', async ({ request }) => {
        if (!companyId) { test.skip(); return }

        const res = await request.get(
            `${API_URL}/reports/trial-balance?start_date=2026-01-01&end_date=2026-12-31`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant-ID': tenantId,
                    'X-Company-ID': companyId,
                },
            }
        )

        expect(res.status()).toBe(200)
        const report = await res.json()

        expect(report).toHaveProperty('start_date')
        expect(report).toHaveProperty('end_date')
        expect(report).toHaveProperty('rows')
        expect(report).toHaveProperty('total_opening_debit')
        expect(report).toHaveProperty('total_closing_credit')
    })

    test('aging report API returns valid structure', async ({ request }) => {
        if (!companyId) { test.skip(); return }

        const res = await request.get(
            `${API_URL}/reports/aging?as_of_date=2026-07-23&report_type=receivable`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant-ID': tenantId,
                    'X-Company-ID': companyId,
                },
            }
        )

        expect(res.status()).toBe(200)
        const report = await res.json()

        expect(report).toHaveProperty('as_of_date')
        expect(report).toHaveProperty('report_type', 'receivable')
        expect(report).toHaveProperty('buckets')
        expect(report).toHaveProperty('grand_total')
    })

    test('general ledger API returns valid structure', async ({ request }) => {
        if (!companyId) { test.skip(); return }

        const res = await request.get(
            `${API_URL}/reports/ledger?start_date=2026-01-01&end_date=2026-12-31`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant-ID': tenantId,
                    'X-Company-ID': companyId,
                },
            }
        )

        expect(res.status()).toBe(200)
        const report = await res.json()

        expect(report).toHaveProperty('start_date')
        expect(report).toHaveProperty('end_date')
        expect(report).toHaveProperty('accounts')
        expect(Array.isArray(report.accounts)).toBe(true)
    })

    test('report requires date parameters', async ({ request }) => {
        if (!companyId) { test.skip(); return }

        // Missing required as_of_date
        const res = await request.get(`${API_URL}/reports/balance-sheet`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenantId,
                'X-Company-ID': companyId,
            },
        })

        expect(res.status()).toBe(422) // FastAPI validation error
    })

    // ── UI-Level Report Tests ───────────────────────────

    test('balance sheet page loads', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        await page.goto('/reports/balance-sheet')
        await page.waitForTimeout(2000)

        await expect(page).toHaveURL('/reports/balance-sheet')
    })

    test('profit and loss page loads', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        await page.goto('/reports/profit-and-loss')
        await page.waitForTimeout(2000)

        await expect(page).toHaveURL('/reports/profit-and-loss')
    })

    test('trial balance page loads', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        await page.goto('/reports/trial-balance')
        await page.waitForTimeout(2000)

        await expect(page).toHaveURL('/reports/trial-balance')
    })

    test('general ledger page loads', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        await page.goto('/reports/ledger')
        await page.waitForTimeout(2000)

        await expect(page).toHaveURL('/reports/ledger')
    })

    test('aging report page loads', async ({ page }) => {
        await uiLogin(page)
        await page.waitForTimeout(2000)

        await page.goto('/reports/aging')
        await page.waitForTimeout(2000)

        await expect(page).toHaveURL('/reports/aging')
    })
})
