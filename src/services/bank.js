/**
 * Bank reconciliation API service.
 */
import api from './api'

export default {
    /**
     * Upload a bank statement with its lines.
     */
    uploadStatement(data) {
        return api.post('/accounting/bank/statements', data)
    },

    /**
     * Run automatic bank reconciliation.
     * @param {string} bankAccountCode - The account code in the COA.
     */
    reconcile(bankAccountCode) {
        return api.post('/accounting/bank/reconcile', null, {
            params: { bank_account_code: bankAccountCode }
        })
    }
}
