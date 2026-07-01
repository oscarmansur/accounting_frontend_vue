/**
 * Financial Reports API service.
 */
import api from './api'

export default {
    /**
     * Get Balance Sheet as of a specific date.
     */
    getBalanceSheet(asOfDate) {
        return api.get('/reports/balance-sheet', {
            params: { as_of_date: asOfDate }
        })
    },

    /**
     * Get Profit & Loss statement for a date range.
     */
    getProfitAndLoss(startDate, endDate) {
        return api.get('/reports/profit-and-loss', {
            params: { start_date: startDate, end_date: endDate }
        })
    },

    /**
     * Get Trial Balance for a date range.
     */
    getTrialBalance(startDate, endDate) {
        return api.get('/reports/trial-balance', {
            params: { start_date: startDate, end_date: endDate }
        })
    },

    /**
     * Get Aging Report (receivable or payable).
     */
    getAgingReport(asOfDate, reportType = 'receivable') {
        return api.get('/reports/aging', {
            params: { as_of_date: asOfDate, report_type: reportType }
        })
    }
}
