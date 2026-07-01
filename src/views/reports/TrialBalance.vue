<script setup>
/**
 * Trial Balance (Balance de Comprobación)
 * Opening Balances → Period Flows → Closing Balances
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import reportsService from '@/services/reports'

const { t } = useI18n()

const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const report = ref(null)
const loading = ref(false)
const error = ref('')

const fetchReport = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await reportsService.getTrialBalance(startDate.value, endDate.value)
    report.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al generar el reporte'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('accounting.trialBalance') }}</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.trialBalanceSubtitle') }}</p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.fromDate') }}</label>
          <input v-model="startDate" type="date" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.toDate') }}</label>
          <input v-model="endDate" type="date" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <button
          @click="fetchReport"
          :disabled="loading"
          class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
        >
          {{ loading ? t('accounting.generating') : t('accounting.generateReport') }}
        </button>
      </div>
    </div>

    <div v-if="error" class="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">{{ error }}</div>

    <div v-if="loading" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
    </div>

    <template v-if="report && !loading">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th rowspan="2" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-r border-gray-200 dark:border-gray-600">{{ t('common.code') }}</th>
                <th rowspan="2" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-r border-gray-200 dark:border-gray-600">{{ t('accounting.account') }}</th>
                <th colspan="2" class="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase border-b border-r border-gray-200 dark:border-gray-600 bg-blue-50/50 dark:bg-blue-900/10">{{ t('accounting.openingBalance') }}</th>
                <th colspan="2" class="px-4 py-2 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase border-b border-r border-gray-200 dark:border-gray-600 bg-amber-50/50 dark:bg-amber-900/10">{{ t('accounting.movements') }}</th>
                <th colspan="2" class="px-4 py-2 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase border-b border-gray-200 dark:border-gray-600 bg-emerald-50/50 dark:bg-emerald-900/10">{{ t('accounting.closingBalance') }}</th>
              </tr>
              <tr class="text-xs text-gray-500 dark:text-gray-400">
                <th class="px-4 py-2 text-right border-b border-gray-200 dark:border-gray-600 bg-blue-50/30 dark:bg-blue-900/5">{{ t('accounting.debit') }}</th>
                <th class="px-4 py-2 text-right border-b border-r border-gray-200 dark:border-gray-600 bg-blue-50/30 dark:bg-blue-900/5">{{ t('accounting.credit') }}</th>
                <th class="px-4 py-2 text-right border-b border-gray-200 dark:border-gray-600 bg-amber-50/30 dark:bg-amber-900/5">{{ t('accounting.debit') }}</th>
                <th class="px-4 py-2 text-right border-b border-r border-gray-200 dark:border-gray-600 bg-amber-50/30 dark:bg-amber-900/5">{{ t('accounting.credit') }}</th>
                <th class="px-4 py-2 text-right border-b border-gray-200 dark:border-gray-600 bg-emerald-50/30 dark:bg-emerald-900/5">{{ t('accounting.debit') }}</th>
                <th class="px-4 py-2 text-right border-b border-gray-200 dark:border-gray-600 bg-emerald-50/30 dark:bg-emerald-900/5">{{ t('accounting.credit') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <tr v-for="row in report.rows" :key="row.account_id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 text-sm">
                <td class="px-4 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">{{ row.account_code }}</td>
                <td class="px-4 py-2.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">{{ row.account_name }}</td>
                <td class="px-4 py-2.5 text-right font-mono text-gray-600 dark:text-gray-400">{{ formatCurrency(row.opening_debit) }}</td>
                <td class="px-4 py-2.5 text-right font-mono text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">{{ formatCurrency(row.opening_credit) }}</td>
                <td class="px-4 py-2.5 text-right font-mono text-gray-600 dark:text-gray-400">{{ formatCurrency(row.period_debit) }}</td>
                <td class="px-4 py-2.5 text-right font-mono text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">{{ formatCurrency(row.period_credit) }}</td>
                <td class="px-4 py-2.5 text-right font-mono font-semibold text-gray-900 dark:text-white">{{ formatCurrency(row.closing_debit) }}</td>
                <td class="px-4 py-2.5 text-right font-mono font-semibold text-gray-900 dark:text-white">{{ formatCurrency(row.closing_credit) }}</td>
              </tr>
            </tbody>
            <!-- Totals -->
            <tfoot class="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 font-semibold text-sm">
              <tr>
                <td colspan="2" class="px-4 py-3 text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600">TOTALES</td>
                <td class="px-4 py-3 text-right font-mono text-blue-700 dark:text-blue-300">{{ formatCurrency(report.total_opening_debit) }}</td>
                <td class="px-4 py-3 text-right font-mono text-blue-700 dark:text-blue-300 border-r border-gray-200 dark:border-gray-600">{{ formatCurrency(report.total_opening_credit) }}</td>
                <td class="px-4 py-3 text-right font-mono text-amber-700 dark:text-amber-300">{{ formatCurrency(report.total_period_debit) }}</td>
                <td class="px-4 py-3 text-right font-mono text-amber-700 dark:text-amber-300 border-r border-gray-200 dark:border-gray-600">{{ formatCurrency(report.total_period_credit) }}</td>
                <td class="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-300">{{ formatCurrency(report.total_closing_debit) }}</td>
                <td class="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-300">{{ formatCurrency(report.total_closing_credit) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div v-if="report.rows.length === 0" class="px-6 py-12 text-center text-sm text-gray-400">
          {{ t('accounting.noMovements') }}
        </div>
      </div>
    </template>
  </div>
</template>
