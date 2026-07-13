/**
 * Chart of Accounts API service.
 */
import api from './api'

export default {
    /**
     * Get the chart of accounts as a hierarchical tree.
     */
    getTree() {
        return api.get('/accounting/accounts/')
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
        return api.post('/accounting/accounts/', data)
    },

    /**
     * Import a chart of accounts from a CSV file.
     */
    importCSV(file) {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/accounting/accounts/import-csv', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    /**
     * Get available chart templates from database.
     */
    getTemplates() {
        return api.get('/accounting/accounts/templates/')
    },

    /**
     * Load a database chart template by ID.
     */
    loadTemplate(templateId) {
        return api.post(`/accounting/accounts/load-template/${templateId}/`)
    },

    /**
     * Update an account's details.
     */
    updateAccount(accountId, data) {
        return api.patch(`/accounting/accounts/${accountId}`, data)
    },

    /**
     * Create a new empty template.
     */
    createTemplate(data) {
        return api.post('/accounting/accounts/templates/', data)
    },

    /**
     * Import a template from a CSV file.
     */
    importCSVTemplate(name, description, file) {
        const formData = new FormData()
        formData.append('name', name)
        if (description) formData.append('description', description)
        formData.append('file', file)
        return api.post('/accounting/accounts/templates/import-csv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    /**
     * Copy/clone an existing template.
     */
    copyTemplate(templateId, data) {
        return api.post(`/accounting/accounts/templates/${templateId}/copy/`, data)
    },

    /**
     * Delete a custom template.
     */
    deleteTemplate(templateId) {
        return api.delete(`/accounting/accounts/templates/${templateId}/`)
    },

    /**
     * Get accounts inside a template.
     */
    getTemplateAccounts(templateId) {
        return api.get(`/accounting/accounts/templates/${templateId}/accounts/`)
    },

    /**
     * Add a new account to a custom template.
     */
    addTemplateAccount(templateId, data) {
        return api.post(`/accounting/accounts/templates/${templateId}/accounts/`, data)
    },

    /**
     * Update an account inside a custom template.
     */
    updateTemplateAccount(templateId, accountId, data) {
        return api.patch(`/accounting/accounts/templates/${templateId}/accounts/${accountId}/`, data)
    },

    /**
     * Delete an account from a custom template.
     */
    deleteTemplateAccount(templateId, accountId) {
        return api.delete(`/accounting/accounts/templates/${templateId}/accounts/${accountId}/`)
    }
}
