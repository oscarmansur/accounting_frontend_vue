/**
 * Company management API service.
 */
import api from './api'

export default {
    /**
     * List companies in the current tenant.
     */
    list(skip = 0, limit = 50) {
        return api.get('/companies/', { params: { skip, limit } })
    },

    /**
     * Create a new company (auto-initializes NIIF chart of accounts).
     */
    create(data) {
        return api.post('/companies/', data)
    },

    /**
     * Update an existing company.
     */
    update(companyId, data) {
        return api.patch(`/companies/${companyId}`, data)
    },

    /**
     * Soft-delete a company (sets is_active=False).
     */
    delete(companyId) {
        return api.delete(`/companies/${companyId}`)
    },

    /**
     * Create a fiscal year with 12 monthly periods.
     */
    createFiscalYear(companyId, data) {
        return api.post(`/companies/${companyId}/fiscal-years`, data)
    },

    /**
     * List all fiscal years for a company.
     */
    listFiscalYears(companyId) {
        return api.get(`/companies/${companyId}/fiscal-years`)
    }
}
