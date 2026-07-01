/**
 * Chart of Accounts API service.
 */
import api from './api'

export default {
    /**
     * Get the chart of accounts as a hierarchical tree.
     */
    getTree() {
        return api.get('/accounting/accounts')
    },

    /**
     * Get all accounts as a flat list ordered by code.
     */
    getFlat() {
        return api.get('/accounting/accounts/flat')
    },

    /**
     * Create a new account.
     */
    create(data) {
        return api.post('/accounting/accounts', data)
    }
}
