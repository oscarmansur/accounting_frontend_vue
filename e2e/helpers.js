/**
 * Shared constants and helpers for Playwright E2E tests.
 *
 * Contains:
 * - API and UI URLs
 * - Test credentials
 * - Reusable login/setup helpers
 * - Custom expect matchers
 */

// ── URLs ────────────────────────────────────────────────
export const API_URL = 'http://localhost:8000/api/v1'
export const APP_URL = 'http://localhost:5174'

// ── Test Credentials ────────────────────────────────────
// These match the FIRST_SUPERUSER configured in the backend .env
export const ADMIN_EMAIL = 'admin@example.com'
export const ADMIN_PASSWORD = 'admin123'

// ── API Helpers ─────────────────────────────────────────

/**
 * Login via API and return the access token.
 * Does NOT touch the browser — useful for API-level setup.
 */
export async function apiLogin(request, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
    const response = await request.post(`${API_URL}/auth/login`, {
        form: {
            username: email,
            password: password,
        },
    })

    if (response.status() !== 200) {
        const body = await response.text()
        throw new Error(`API login failed (${response.status()}): ${body}`)
    }

    const data = await response.json()
    return data.access_token
}

/**
 * Login via the UI — fills the form and submits.
 * Waits for navigation to the dashboard.
 */
export async function uiLogin(page, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
    await page.goto('/login')
    await page.waitForSelector('#email')

    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.click('button[type="submit"]')

    // Phase 1: Wait for the auth token to land in localStorage.
    // This confirms the API call succeeded, independent of the
    // welcome animation and router.push timing.
    await page.waitForFunction(
        () => !!localStorage.getItem('auth_token'),
        { timeout: 15000 },
    )

    // Phase 2: Navigate directly to the dashboard.
    // The Login.vue uses a 1200ms setTimeout + router.push with
    // context loading that can hang. Skip all that.
    await page.goto('/')
    await page.waitForTimeout(2000)
}

/**
 * Set auth context in localStorage so tests start authenticated.
 * Faster than going through the login UI for every test.
 */
export async function setAuthContext(page, token, user = null) {
    await page.addInitScript(({ token, user }) => {
        localStorage.setItem('auth_token', token)
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }
    }, { token, user })
}

/**
 * Get the current user profile via API.
 */
export async function apiGetProfile(request, token) {
    const response = await request.get(`${API_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response.json()
}

/**
 * Create a tenant via API and return its data.
 */
export async function apiCreateTenant(request, token, name) {
    const response = await request.post(`${API_URL}/tenants/`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        data: { name },
    })
    return response.json()
}

/**
 * Create a company within a tenant via API.
 */
export async function apiCreateCompany(request, token, tenantId, companyData) {
    const response = await request.post(`${API_URL}/companies/`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
        },
        data: companyData,
    })
    return response.json()
}

/**
 * Wait for the loading overlay to disappear.
 */
export async function waitForLoading(page) {
    const loader = page.locator('.loading-overlay, [data-loading]')
    if (await loader.isVisible({ timeout: 1000 }).catch(() => false)) {
        await loader.waitFor({ state: 'hidden', timeout: 15000 })
    }
}

/**
 * Get text content from a toast/notification.
 */
export async function getToastMessage(page) {
    const toast = page.locator('[role="alert"], .toast, .notification')
    await toast.waitFor({ state: 'visible', timeout: 5000 })
    return toast.textContent()
}
