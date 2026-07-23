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
    },

    /**
     * List members of the active tenant.
     */
    listMembers() {
        return api.get('/tenants/members')
    },

    /**
     * Add/invite a user to the active tenant.
     */
    addMember(data) {
        return api.post('/tenants/members', data)
    },

    /**
     * Update a tenant member's role.
     */
    updateMember(membershipId, data) {
        return api.patch(`/tenants/members/${membershipId}`, data)
    },

    /**
     * Remove a member from the active tenant.
     */
    removeMember(membershipId) {
        return api.delete(`/tenants/members/${membershipId}`)
    }

}
