<script setup>
/**
 * Aging Report (Antigüedad de Saldos)
 * Shows outstanding balances by contact in aging categories: 0-30, 31-60, 61-90, +90 days.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import reportsService from '@/services/reports'

const { t } = useI18n()

// State
const asOfDate = ref(new Date().toISOString().split('T')[0])
const reportType = ref('receivable') // 'receivable' or 'payable'
const report = ref(null)
const loading = ref(false)
const error = ref('')

const fetchReport = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await reportsService.getAgingReport(asOfDate.value, reportType.value)
    report.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al generar el reporte'
  } finally {
    loading.value = false
  }
}

const handleTypeChange = (type) => {
  reportType.value = type
  if (report.value) {
    fetchReport()
  }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('accounting.agingReport') }}</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.agingReportSubtitle') }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <!-- Date & Buttons -->
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.asOfDate') }}</label>
            <input
              v-model="asOfDate"
              type="date"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <!-- Type Switcher buttons -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.reportType') }}</label>
            <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-900">
              <button
                type="button"
                @click="handleTypeChange('receivable')"
                :class="[
                  reportType === 'receivable'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                ]"
                class="px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200"
              >
                {{ t('accounting.receivable') }}
              </button>
              <button
                type="button"
                @click="handleTypeChange('payable')"
                :class="[
                  reportType === 'payable'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                ]"
                class="px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200"
              >
                {{ t('accounting.payable') }}
              </button>
            </div>
          </div>
        </div>

        <button
          @click="fetchReport"
          :disabled="loading"
          class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
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

    <!-- Content -->
    <template v-if="report && !loading">
      <!-- Summary stats cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Bucket 0-30 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('accounting.agingBuckets.current') }}</p>
          <p class="mt-2 text-lg font-bold font-mono text-blue-600 dark:text-blue-400">{{ formatCurrency(report.total_current) }}</p>
        </div>

        <!-- Bucket 31-60 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('accounting.agingBuckets.days_31_60') }}</p>
          <p class="mt-2 text-lg font-bold font-mono text-amber-600 dark:text-amber-400">{{ formatCurrency(report.total_31_60) }}</p>
        </div>

        <!-- Bucket 61-90 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('accounting.agingBuckets.days_61_90') }}</p>
          <p class="mt-2 text-lg font-bold font-mono text-orange-600 dark:text-orange-400">{{ formatCurrency(report.total_61_90) }}</p>
        </div>

        <!-- Bucket +90 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('accounting.agingBuckets.over_90') }}</p>
          <p class="mt-2 text-lg font-bold font-mono text-red-600 dark:text-red-400">{{ formatCurrency(report.total_over_90) }}</p>
        </div>

        <!-- Grand Total -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-md text-white">
          <p class="text-xs font-semibold uppercase tracking-wider text-blue-100">{{ t('accounting.grandTotal') }}</p>
          <p class="mt-2 text-lg font-bold font-mono text-white">{{ formatCurrency(report.grand_total) }}</p>
        </div>
      </div>

      <!-- Main report table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr class="text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th class="px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{{ t('accounting.contact') }}</th>
                <th class="px-6 py-3 text-right font-semibold border-b border-gray-200 dark:border-gray-700">{{ t('accounting.agingBuckets.current') }}</th>
                <th class="px-6 py-3 text-right font-semibold border-b border-gray-200 dark:border-gray-700">{{ t('accounting.agingBuckets.days_31_60') }}</th>
                <th class="px-6 py-3 text-right font-semibold border-b border-gray-200 dark:border-gray-700">{{ t('accounting.agingBuckets.days_61_90') }}</th>
                <th class="px-6 py-3 text-right font-semibold border-b border-gray-200 dark:border-gray-700">{{ t('accounting.agingBuckets.over_90') }}</th>
                <th class="px-6 py-3 text-right font-semibold border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">{{ t('common.total') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
              <tr v-for="bucket in report.buckets" :key="bucket.contact_id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                <td class="px-6 py-3.5 text-gray-900 dark:text-white font-medium capitalize">{{ bucket.contact_name }}</td>
                <td class="px-6 py-3.5 text-right font-mono text-gray-600 dark:text-gray-400">{{ formatCurrency(bucket.current) }}</td>
                <td class="px-6 py-3.5 text-right font-mono text-gray-600 dark:text-gray-400">{{ formatCurrency(bucket.days_31_60) }}</td>
                <td class="px-6 py-3.5 text-right font-mono text-gray-600 dark:text-gray-400">{{ formatCurrency(bucket.days_61_90) }}</td>
                <td class="px-6 py-3.5 text-right font-mono text-gray-600 dark:text-gray-400">{{ formatCurrency(bucket.over_90) }}</td>
                <td class="px-6 py-3.5 text-right font-mono font-semibold text-gray-900 dark:text-white bg-gray-50/20 dark:bg-gray-700/10">{{ formatCurrency(bucket.total) }}</td>
              </tr>
            </tbody>
            <!-- Footer totals -->
            <tfoot class="bg-gray-50 dark:bg-gray-700/40 border-t border-gray-200 dark:border-gray-700 font-semibold text-sm">
              <tr>
                <td class="px-6 py-3 text-gray-900 dark:text-white uppercase">TOTALES</td>
                <td class="px-6 py-3 text-right font-mono text-blue-600 dark:text-blue-400">{{ formatCurrency(report.total_current) }}</td>
                <td class="px-6 py-3 text-right font-mono text-amber-600 dark:text-amber-400">{{ formatCurrency(report.total_31_60) }}</td>
                <td class="px-6 py-3 text-right font-mono text-orange-600 dark:text-orange-400">{{ formatCurrency(report.total_61_90) }}</td>
                <td class="px-6 py-3 text-right font-mono text-red-600 dark:text-red-400">{{ formatCurrency(report.total_over_90) }}</td>
                <td class="px-6 py-3 text-right font-mono text-indigo-600 dark:text-indigo-400 bg-gray-50/50 dark:bg-gray-700/30">{{ formatCurrency(report.grand_total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div v-if="report.buckets.length === 0" class="px-6 py-12 text-center text-sm text-gray-400">
          {{ t('accounting.noMovements') }}
        </div>
      </div>
    </template>
  </div>
</template>
