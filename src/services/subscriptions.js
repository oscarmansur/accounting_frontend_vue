/**
 * Subscription API service.
 */
import api from './api'

export default {
    /**
     * Get the active subscription for the current tenant.
     */
    getCurrent() {
        return api.get('/subscriptions/current')
    },

    /**
     * Update the subscription plan.
     * @param {Object} data { plan_type: "basic"|"pro"|"enterprise", status: "active"|"expired" }
     */
    update(data) {
        return api.post('/subscriptions/update', data)
    }
}
