/**
 * Axios instance configured for the multi-tenant accounting API.
 *
 * Interceptors automatically inject:
 *  - Authorization: Bearer <token>
 *  - X-Tenant-ID: <uuid>
 *  - X-Company-ID: <uuid>
 *
 * On 401 responses the auth state is cleared and the user is
 * redirected to the login page.
 */
import axios from 'axios'
import router from '../router'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
})

// ── Request interceptor ─────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Auth token
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Multi-tenant context headers
        const tenantId = localStorage.getItem('current_tenant_id')
        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId
        }

        const companyId = localStorage.getItem('current_company_id')
        if (companyId) {
            config.headers['X-Company-ID'] = companyId
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// ── Response interceptor ────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear all auth / context data
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            localStorage.removeItem('current_tenant_id')
            localStorage.removeItem('current_company_id')

            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                router.push({ name: 'login' })
            }
        }
        return Promise.reject(error)
    }
)

export default api
