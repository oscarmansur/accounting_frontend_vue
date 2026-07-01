<script setup>
/**
 * Balance Sheet (Balance General)
 * Hierarchical report: Assets = Liabilities + Equity
 */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import reportsService from '@/services/reports'

const { t } = useI18n()

const asOfDate = ref(new Date().toISOString().split('T')[0])
const report = ref(null)
const loading = ref(false)
const error = ref('')

const fetchReport = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await reportsService.getBalanceSheet(asOfDate.value)
    report.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al generar el reporte'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)

const sections = computed(() => {
  if (!report.value) return []
  return [
    { key: 'assets', label: t('accounting.assets'), icon: '📊', data: report.value.assets, total: report.value.total_assets, color: 'blue' },
    { key: 'liabilities', label: t('accounting.liabilities'), icon: '📋', data: report.value.liabilities, total: report.value.total_liabilities, color: 'red' },
    { key: 'equity', label: t('accounting.equity'), icon: '🏛️', data: report.value.equity, total: report.value.total_equity, color: 'purple' }
  ]
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('accounting.balanceSheet') }}</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.balanceSheetSubtitle') }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.asOfDate') }}</label>
          <input v-model="asOfDate" type="date" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" />
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

    <!-- Error -->
    <div v-if="error" class="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
    </div>

    <!-- Report -->
    <template v-if="report && !loading">
      <!-- Balance validation -->
      <div
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
        :class="report.is_balanced
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="report.is_balanced" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clip-rule="evenodd" />
        </svg>
        {{ report.is_balanced ? t('accounting.balanceEquation') : t('accounting.balanceUnequation') }}
      </div>

      <!-- Sections -->
      <div v-for="section in sections" :key="section.key" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Section header -->
        <div class="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ section.icon }}</span>
            <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">{{ section.label }}</h3>
          </div>
          <span class="text-lg font-bold font-mono" :class="`text-${section.color}-600 dark:text-${section.color}-400`">
            {{ formatCurrency(section.total) }}
          </span>
        </div>

        <!-- Accounts -->
        <table class="min-w-full">
          <thead>
            <tr class="text-xs text-gray-500 dark:text-gray-400 uppercase">
              <th class="px-6 py-2 text-left">{{ t('common.code') }}</th>
              <th class="px-6 py-2 text-left">{{ t('accounting.account') }}</th>
              <th class="px-6 py-2 text-right">{{ t('accounting.debit') }}</th>
              <th class="px-6 py-2 text-right">{{ t('accounting.credit') }}</th>
              <th class="px-6 py-2 text-right">{{ t('accounting.closingBalance') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <tr v-for="account in section.data" :key="account.account_id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
              <td class="px-6 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400">{{ account.account_code }}</td>
              <td class="px-6 py-2.5 text-sm text-gray-800 dark:text-gray-200">{{ account.account_name }}</td>
              <td class="px-6 py-2.5 text-sm text-right font-mono text-gray-600 dark:text-gray-400">{{ formatCurrency(account.debit_total) }}</td>
              <td class="px-6 py-2.5 text-sm text-right font-mono text-gray-600 dark:text-gray-400">{{ formatCurrency(account.credit_total) }}</td>
              <td class="px-6 py-2.5 text-sm text-right font-mono font-semibold text-gray-900 dark:text-white">{{ formatCurrency(account.balance) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="section.data.length === 0" class="px-6 py-8 text-center text-sm text-gray-400">
          {{ t('accounting.noMovements') }}
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.totalAssets') }}</p>
            <p class="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{{ formatCurrency(report.total_assets) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.totalLiabilities') }}</p>
            <p class="text-xl font-bold font-mono text-red-600 dark:text-red-400">{{ formatCurrency(report.total_liabilities) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.totalEquity') }}</p>
            <p class="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">{{ formatCurrency(report.total_equity) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
