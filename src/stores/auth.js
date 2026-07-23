/**
 * Authentication store.
 *
 * Handles login (OAuth2 password flow), profile fetching, role
 * checking, and session lifecycle.  The backend returns a simple
 * { access_token, token_type } on login; the user profile is
 * fetched separately via GET /users/me.
 */
import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('auth_token') || null,
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        loading: false,
        error: null,
        showWelcomeAnimation: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isSuperuser: (state) => state.user?.is_superuser === true,
        getUserRole: (state) => {
            if (state.user?.is_superuser) return 'owner'
            return localStorage.getItem('tenant_role') || 'viewer'
        },
        userName: (state) => state.user?.full_name || state.user?.email || ''
    },

    actions: {
        /**
         * Login using OAuth2 password flow.
         * The backend expects application/x-www-form-urlencoded with
         * `username` and `password` fields.
         */
        async login(email, password) {
            this.loading = true
            this.error = null
            try {
                // Build form data for OAuth2 password grant
                const formData = new URLSearchParams()
                formData.append('username', email)
                formData.append('password', password)

                const response = await api.post('/auth/login', formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })

                // Backend returns { access_token, token_type }
                const { access_token } = response.data
                console.log('[Auth] Login OK, token received:', !!access_token)

                if (!access_token) {
                    throw new Error('No access_token in response')
                }

                this.token = access_token
                localStorage.setItem('auth_token', access_token)

                // Fetch user profile (non-blocking — login still succeeds if this fails)
                try {
                    await this.fetchProfile()
                } catch (profileError) {
                    console.warn('[Auth] Profile fetch failed, using minimal user data:', profileError)
                    // Set minimal user data so the app can still work
                    this.user = { email, full_name: email, is_superuser: false, is_active: true }
                    localStorage.setItem('user', JSON.stringify(this.user))
                }

                return { success: true, user: this.user }
            } catch (error) {
                console.error('[Auth] Login failed:', error)
                this.error = error.response?.data?.detail || 'Login failed'
                throw error
            } finally {
                this.loading = false
            }
        },

        /**
         * Fetch the current user profile from /users/me.
         */
        async fetchProfile() {
            const response = await api.get('/users/me')
            console.log('[Auth] Profile fetched:', response.data)
            this.user = response.data
            localStorage.setItem('user', JSON.stringify(this.user))
        },

        /**
         * Update the current user profile (PATCH /users/me).
         */
        async updateProfile(userData) {
            this.loading = true
            this.error = null
            try {
                const response = await api.patch('/users/me', userData)
                console.log('[Auth] Profile updated:', response.data)
                this.user = response.data
                localStorage.setItem('user', JSON.stringify(this.user))
                return this.user
            } catch (error) {
                console.error('[Auth] Profile update failed:', error)
                this.error = error.response?.data?.detail || 'Profile update failed'
                throw error
            } finally {
                this.loading = false
            }
        },

        async register(userData) {
            this.loading = true
            this.error = null
            try {
                const response = await api.post('/auth/register', userData)
                return response.data
            } catch (error) {
                this.error = error.response?.data?.detail || 'Registration failed'
                throw error
            } finally {
                this.loading = false
            }
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            localStorage.removeItem('current_tenant_id')
            localStorage.removeItem('current_company_id')
        },

        checkAuth() {
            const storedToken = localStorage.getItem('auth_token')
            const storedUser = localStorage.getItem('user')

            if (storedToken && storedUser) {
                this.token = storedToken
                this.user = JSON.parse(storedUser)
            }
        },

        /**
         * Check if the user has one of the required roles.
         * Roles hierarchy: owner > admin > accountant > viewer
         */
        hasRole(requiredRoles) {
            if (this.isSuperuser) return true

            if (Array.isArray(requiredRoles)) {
                return requiredRoles.includes(this.getUserRole)
            }
            return this.getUserRole === requiredRoles
        },

        /**
         * Permission check based on role hierarchy level.
         */
        hasPermission(requiredRole) {
            if (this.isSuperuser) return true

            const hierarchy = ['viewer', 'accountant', 'admin', 'owner']
            const userLevel = hierarchy.indexOf(this.getUserRole)
            const requiredLevel = hierarchy.indexOf(requiredRole)
            return userLevel >= requiredLevel
        },

        refreshToken() {
            console.log('Token refresh not implemented')
        },

        setWelcomeAnimation(value) {
            this.showWelcomeAnimation = value
        }
    }
})