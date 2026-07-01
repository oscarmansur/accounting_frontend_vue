<script setup>
/**
 * Profit & Loss Statement (Estado de Ganancias y Pérdidas)
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
    const response = await reportsService.getProfitAndLoss(startDate.value, endDate.value)
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
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('accounting.profitAndLoss') }}</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.profitAndLossSubtitle') }}</p>
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
      <!-- Revenue Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/10 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">💰</span>
            <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">{{ t('accounting.revenue') }}</h3>
          </div>
          <span class="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{{ formatCurrency(report.total_revenue) }}</span>
        </div>
        <table class="min-w-full">
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <tr v-for="account in report.revenue" :key="account.account_id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
              <td class="px-6 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 w-32">{{ account.account_code }}</td>
              <td class="px-6 py-2.5 text-sm text-gray-800 dark:text-gray-200">{{ account.account_name }}</td>
              <td class="px-6 py-2.5 text-sm text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 w-40">{{ formatCurrency(account.balance) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="report.revenue.length === 0" class="px-6 py-8 text-center text-sm text-gray-400">{{ t('accounting.noMovements') }}</div>
      </div>

      <!-- Expenses Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">💸</span>
            <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">{{ t('accounting.expenses') }}</h3>
          </div>
          <span class="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">{{ formatCurrency(report.total_expenses) }}</span>
        </div>
        <table class="min-w-full">
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <tr v-for="account in report.expenses" :key="account.account_id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
              <td class="px-6 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 w-32">{{ account.account_code }}</td>
              <td class="px-6 py-2.5 text-sm text-gray-800 dark:text-gray-200">{{ account.account_name }}</td>
              <td class="px-6 py-2.5 text-sm text-right font-mono font-semibold text-amber-600 dark:text-amber-400 w-40">{{ formatCurrency(account.balance) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="report.expenses.length === 0" class="px-6 py-8 text-center text-sm text-gray-400">{{ t('accounting.noMovements') }}</div>
      </div>

      <!-- Net Income -->
      <div class="rounded-xl p-6 border-2"
        :class="report.net_income >= 0
          ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700'
          : 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700'"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium" :class="report.net_income >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'">
              {{ report.net_income >= 0 ? t('accounting.netIncome') : t('accounting.netLoss') }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ startDate }} — {{ endDate }}
            </p>
          </div>
          <p class="text-3xl font-bold font-mono" :class="report.net_income >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
            {{ formatCurrency(Math.abs(report.net_income)) }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
