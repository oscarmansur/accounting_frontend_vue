/**
 * Contacts API service.
 */
import api from './api'

export default {
    /**
     * List all contacts for the active company.
     * Supports skip, limit, and search parameters.
     */
    list(params = {}) {
        return api.get('/accounting/contacts/', { params })
    },

    /**
     * Get details of a single contact.
     */
    get(id) {
        return api.get(`/accounting/contacts/${id}`)
    },

    /**
     * Create a new contact.
     */
    create(data) {
        return api.post('/accounting/contacts/', data)
    },

    /**
     * Update an existing contact's details.
     */
    update(id, data) {
        return api.put(`/accounting/contacts/${id}`, data)
    },

    /**
     * Delete a contact.
     */
    delete(id) {
        return api.delete(`/accounting/contacts/${id}`)
    }
}
