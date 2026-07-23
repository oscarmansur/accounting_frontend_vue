/**
 * Global context store for multi-tenant / multi-company state.
 *
 * Manages the active tenant, company, fiscal year, and accounting
 * period.  Persists selections in localStorage so the user's
 * context survives page reloads.
 */
import { defineStore } from 'pinia'
import api from '../services/api'

export const useContextStore = defineStore('context', {
    state: () => ({
        // Tenant
        currentTenantId: localStorage.getItem('current_tenant_id') || null,
        tenants: [],
        tenantRole: localStorage.getItem('tenant_role') || 'viewer',

        // Company
        currentCompanyId: localStorage.getItem('current_company_id') || null,
        companies: [],

        // Fiscal context
        fiscalYears: [],
        currentFiscalYearId: localStorage.getItem('current_fiscal_year_id') || null,
        currentPeriod: localStorage.getItem('current_period') || null,

        // Loading states
        loadingTenants: false,
        loadingCompanies: false,
        loadingFiscalYears: false
    }),

    getters: {
        currentTenant: (state) => state.tenants.find(t => t.id === state.currentTenantId),
        currentCompany: (state) => state.companies.find(c => c.id === state.currentCompanyId),
        currentFiscalYear: (state) => state.fiscalYears.find(fy => fy.id === state.currentFiscalYearId),
        hasTenant: (state) => !!state.currentTenantId,
        hasCompany: (state) => !!state.currentCompanyId,
        isContextReady: (state) => !!state.currentTenantId && !!state.currentCompanyId
    },

    actions: {
        /**
         * Load all tenants accessible by the current user.
         * Auto-selects the first tenant if none is selected.
         */
        async loadTenants() {
            this.loadingTenants = true
            try {
                const { useAuthStore } = await import('./auth')
                const authStore = useAuthStore()

                if (authStore.isSuperuser) {
                    const response = await api.get('/tenants')
                    this.tenants = response.data
                } else {
                    this.tenants = (authStore.user?.tenant_memberships || []).map(m => ({
                        id: m.tenant.id,
                        name: m.tenant.name,
                        is_active: m.tenant.is_active,
                        role: m.role
                    }))
                }

                // Auto-select first tenant if none selected
                if (!this.currentTenantId && this.tenants.length > 0) {
                    await this.switchTenant(this.tenants[0].id)
                } else if (this.currentTenantId) {
                    // Sync active tenant role
                    const activeMembership = authStore.user?.tenant_memberships?.find(m => m.tenant_id === this.currentTenantId)
                    this.tenantRole = authStore.isSuperuser ? 'owner' : (activeMembership ? activeMembership.role : 'viewer')
                    localStorage.setItem('tenant_role', this.tenantRole)

                    // Reload companies for current tenant
                    await this.loadCompanies()
                }
            } catch (error) {
                console.error('Failed to load tenants:', error)
                if (error.response?.status !== 403) {
                    throw error
                }
            } finally {
                this.loadingTenants = false
            }
        },

        /**
         * Switch to a different tenant. Reloads companies.
         */
        async switchTenant(tenantId) {
            this.currentTenantId = tenantId
            localStorage.setItem('current_tenant_id', tenantId)

            // Resolve and sync role for the new tenant
            const { useAuthStore } = await import('./auth')
            const authStore = useAuthStore()
            if (authStore.isSuperuser) {
                this.tenantRole = 'owner'
            } else {
                const membership = authStore.user?.tenant_memberships?.find(m => m.tenant_id === tenantId)
                this.tenantRole = membership ? membership.role : 'viewer'
            }
            localStorage.setItem('tenant_role', this.tenantRole)

            // Clear company selection
            this.currentCompanyId = null
            localStorage.removeItem('current_company_id')
            this.companies = []
            this.fiscalYears = []

            // Load companies in the new tenant
            await this.loadCompanies()
        },

        /**
         * Load companies for the current tenant.
         */
        async loadCompanies() {
            if (!this.currentTenantId) return

            this.loadingCompanies = true
            try {
                const response = await api.get('/companies/')
                this.companies = response.data

                // Auto-select first company if none selected
                if (!this.currentCompanyId && this.companies.length > 0) {
                    await this.switchCompany(this.companies[0].id)
                } else if (this.currentCompanyId) {
                    await this.loadFiscalYears()
                }
            } catch (error) {
                console.error('Failed to load companies:', error)
            } finally {
                this.loadingCompanies = false
            }
        },

        /**
         * Switch to a different company. Clears fiscal context.
         */
        async switchCompany(companyId) {
            this.currentCompanyId = companyId
            localStorage.setItem('current_company_id', companyId)

            // Clear fiscal selections
            this.currentFiscalYearId = null
            this.currentPeriod = null
            localStorage.removeItem('current_fiscal_year_id')
            localStorage.removeItem('current_period')
            this.fiscalYears = []

            await this.loadFiscalYears()
        },

        /**
         * Load fiscal years for the current company.
         */
        async loadFiscalYears() {
            // Fiscal years endpoint doesn't exist yet in the backend
            // We'll set a placeholder until it's available
            this.fiscalYears = []
        },

        /**
         * Set the active fiscal year.
         */
        setFiscalYear(fiscalYearId) {
            this.currentFiscalYearId = fiscalYearId
            localStorage.setItem('current_fiscal_year_id', fiscalYearId)
        },

        /**
         * Set the active accounting period (month number).
         */
        setPeriod(period) {
            this.currentPeriod = period
            localStorage.setItem('current_period', period)
        },

        /**
         * Clear all context (used on logout).
         */
        clearContext() {
            this.currentTenantId = null
            this.currentCompanyId = null
            this.currentFiscalYearId = null
            this.currentPeriod = null
            this.tenants = []
            this.companies = []
            this.fiscalYears = []
            this.tenantRole = 'viewer'

            localStorage.removeItem('current_tenant_id')
            localStorage.removeItem('current_company_id')
            localStorage.removeItem('current_fiscal_year_id')
            localStorage.removeItem('current_period')
            localStorage.removeItem('tenant_role')
        }
    }
})
