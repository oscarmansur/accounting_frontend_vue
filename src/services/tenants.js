/**
 * Tenant management API service.
 */
import api from './api'

export default {
    /**
     * List all tenants (superuser only).
     */
    list(skip = 0, limit = 50) {
        return api.get('/tenants', { params: { skip, limit } })
    },

    /**
     * Create a new tenant.
     */
    create(data) {
        return api.post('/tenants', data)
    }
}
