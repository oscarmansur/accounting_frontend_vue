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
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token
                    return api(originalRequest)
                }).catch(err => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
                try {
                    const res = await axios.post(
                        (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1') + '/auth/refresh',
                        { refresh_token: refreshToken }
                    )
                    const { access_token, refresh_token: newRefreshToken } = res.data
                    localStorage.setItem('auth_token', access_token)
                    if (newRefreshToken) {
                        localStorage.setItem('refresh_token', newRefreshToken)
                    }

                    api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token
                    originalRequest.headers['Authorization'] = 'Bearer ' + access_token

                    processQueue(null, access_token)
                    return api(originalRequest)
                } catch (refreshError) {
                    processQueue(refreshError, null)
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('user')
                    localStorage.removeItem('current_tenant_id')
                    localStorage.removeItem('current_company_id')

                    if (window.location.pathname !== '/login') {
                        router.push({ name: 'login' })
                    }
                    return Promise.reject(refreshError)
                } finally {
                    isRefreshing = false
                }
            }

            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            localStorage.removeItem('current_tenant_id')
            localStorage.removeItem('current_company_id')

            if (window.location.pathname !== '/login') {
                router.push({ name: 'login' })
            }
        }
        return Promise.reject(error)
    }
)

export default api
