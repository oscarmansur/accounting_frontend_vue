/**
 * Journal Entries API service.
 */
import api from './api'

export default {
    /**
     * List journal entries with optional filters.
     */
    list({ skip = 0, limit = 50, status = null } = {}) {
        const params = { skip, limit }
        if (status) params.status_filter = status
        return api.get('/accounting/entries', { params })
    },

    /**
     * Get a single journal entry by ID (includes items).
     */
    get(entryId) {
        return api.get(`/accounting/entries/${entryId}`)
    },

    /**
     * Create a draft journal entry with line items.
     * @param {Object} data - { journal_id, date, description, items: [...] }
     */
    create(data) {
        return api.post('/accounting/entries', data)
    },

    /**
     * Post (approve) a draft journal entry.
     * Validates double-entry rule before posting.
     */
    post(entryId) {
        return api.post(`/accounting/entries/${entryId}/post`)
    },

    /**
     * Reverse a posted journal entry.
     */
    reverse(entryId, reversalDate) {
        return api.post(`/accounting/entries/${entryId}/reverse`, null, {
            params: { reversal_date: reversalDate }
        })
    },

    /**
     * Delete a draft journal entry.
     */
    delete(entryId) {
        return api.delete(`/accounting/entries/${entryId}`)
    }
}
