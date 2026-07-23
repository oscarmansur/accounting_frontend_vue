/**
 * Currency rates API service.
 */
import api from './api'

export default {
    /**
     * List all exchange rates in the tenant.
     */
    list(params = {}) {
        return api.get('/accounting/currency-rates/', { params })
    },

    /**
     * Create or update a daily exchange rate.
     */
    create(data) {
        return api.post('/accounting/currency-rates/', data)
    },

    /**
     * Retrieve the latest rate for a currency pair (e.g. USD -> VES).
     */
    getLatest(fromCurrency, toCurrency) {
        return api.get('/accounting/currency-rates/latest', {
            params: {
                from_currency: fromCurrency,
                to_currency: toCurrency
            }
        })
    },

    /**
     * Delete an exchange rate record.
     */
    delete(id) {
        return api.delete(`/accounting/currency-rates/${id}`)
    }
}
