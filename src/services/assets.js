/**
 * Fixed Assets API service.
 */
import api from './api'

export default {
    /**
     * List fixed assets for the current company.
     */
    list(skip = 0, limit = 50) {
        return api.get('/accounting/assets', { params: { skip, limit } })
    },

    /**
     * Register a new fixed asset.
     */
    create(data) {
        return api.post('/accounting/assets', data)
    },

    /**
     * Run monthly depreciation calculations and journal entries generation.
     * @param {string} date - Date for the depreciation entries (YYYY-MM-DD)
     */
    depreciateMonthly(date) {
        return api.post('/accounting/assets/depreciate-monthly', null, {
            params: { depreciation_date: date }
        })
    }
}
