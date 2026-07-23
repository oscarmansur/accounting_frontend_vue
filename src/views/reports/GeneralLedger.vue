<script setup>
/**
 * General Ledger (Libro Mayor) Report
 * Chronological view of all posted transactions per account.
 */
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import reportsService from '@/services/reports'
import accountingService from '@/services/accounting'
import AccountSelect from '@/components/accounting/AccountSelect.vue'
import JournalEntryDetailModal from '@/components/accounting/JournalEntryDetailModal.vue'

const { t } = useI18n()

// ── State ────────────────────────────────────────────────
const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const selectedAccountId = ref(null)

const accounts = ref([])
const report = ref(null)
const loading = ref(false)
const loadingAccounts = ref(false)
const error = ref('')

const selectedEntryId = ref(null)
const showDetailModal = ref(false)

// ── Lifecycle ───────────────────────────────────────────
onMounted(async () => {
  loadingAccounts.value = true
  try {
    const response = await accountingService.getFlat()
    accounts.value = response.data
  } catch (err) {
    console.error('Error loading accounts:', err)
  } finally {
    loadingAccounts.value = false
  }
})

// ── Actions ─────────────────────────────────────────────
const fetchReport = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await reportsService.getGeneralLedger(
      startDate.value,
      endDate.value,
      selectedAccountId.value ? [selectedAccountId.value] : null
    )
    report.value = response.data
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.detail || t('accounting.errorGeneratingReport')
  } finally {
    loading.value = false
  }
}

const viewEntryDetails = (entryId) => {
  selectedEntryId.value = entryId
  showDetailModal.value = true
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)

const accountTypeLabel = (type) => {
  const map = {
    asset: t('accounting.assets'),
    liability: t('accounting.liabilities'),
    equity: t('accounting.equity'),
    revenue: t('accounting.revenue'),
    expense: t('accounting.expenses')
  }
  return map[type] || type
}

const accountTypeBadgeClass = (type) => {
  const map = {
    asset: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    liability: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800',
    equity: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    revenue: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    expense: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  }
  return map[type] || 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200 dark:border-gray-800'
}

// ── Export CSV ──────────────────────────────────────────
const exportCSV = () => {
  if (!report.value || !report.value.accounts.length) return

  let csvContent = '\uFEFF' // UTF-8 BOM
  csvContent += `${t('accounting.generalLedger')}\n`
  csvContent += `${t('accounting.fromDate')}: ${startDate.value} | ${t('accounting.toDate')}: ${endDate.value}\n\n`

  report.value.accounts.forEach(acc => {
    csvContent += `${t('accounting.account')}:;${acc.account_code} - ${acc.account_name} (${accountTypeLabel(acc.account_type)})\n`
    csvContent += `${t('accounting.openingBalance')}:;${acc.opening_balance}\n`
    csvContent += `${t('common.date')};${t('accounting.journalEntries')};${t('common.description')};${t('accounting.debit')};${t('accounting.credit')};${t('accounting.runningBalance')}\n`

    acc.items.forEach(item => {
      csvContent += `${item.date};#${item.entry_number} (${item.journal_code});"${item.description.replace(/"/g, '""')}";${item.debit};${item.credit};${item.running_balance}\n`
    })

    csvContent += `${t('accounting.movements')}:;;;${acc.total_debit};${acc.total_credit};\n`
    csvContent += `${t('accounting.closingBalance')}:;;;;;${acc.closing_balance}\n\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `libro_mayor_${startDate.value}_${endDate.value}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const printReport = () => {
  window.print()
}

// ── Summary Cards calculations ──────────────────────────
const summary = computed(() => {
  if (!report.value || !report.value.accounts.length) return null
  
  let opening = 0
  let debits = 0
  let credits = 0
  let closing = 0

  report.value.accounts.forEach(acc => {
    opening += parseFloat(acc.opening_balance) || 0
    debits += parseFloat(acc.total_debit) || 0
    credits += parseFloat(acc.total_credit) || 0
    closing += parseFloat(acc.closing_balance) || 0
  })

  return { opening, debits, credits, closing }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('accounting.generalLedger') }}</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.generalLedgerSubtitle') }}</p>
      </div>
      <div class="flex items-center gap-2" v-if="report && report.accounts.length">
        <button
          @click="exportCSV"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ t('accounting.exportCsv') }}
        </button>
        <button
          @click="printReport"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm0-9V9a4 4 0 014-4h4a4 4 0 014 4v2" />
          </svg>
          {{ t('common.print', 'Imprimir') }}
        </button>
      </div>
    </div>

    <!-- Print Only Header -->
    <div class="hidden print:block border-b border-gray-300 pb-4 mb-6">
      <h1 class="text-2xl font-bold uppercase text-gray-900">{{ t('accounting.generalLedger') }}</h1>
      <p class="text-sm text-gray-600">{{ t('accounting.periodText') }}: {{ startDate }} {{ t('accounting.toDateLabel') }} {{ endDate }}</p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 no-print">
      <div class="flex flex-col md:flex-row md:items-end gap-4">
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.fromDate') }}</label>
          <input v-model="startDate" type="date" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.toDate') }}</label>
          <input v-model="endDate" type="date" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="w-full md:flex-1">
          <AccountSelect
            v-model="selectedAccountId"
            :accounts="accounts"
            :label="t('accounting.account')"
            :placeholder="t('accounting.allAccounts')"
            :disabled="loadingAccounts"
            only-selectable
          />
        </div>
        <div class="w-full md:w-auto">
          <button
            @click="fetchReport"
            :disabled="loading"
            class="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-all h-[38px] flex items-center justify-center cursor-pointer"
          >
            {{ loading ? t('accounting.generating') : t('accounting.generateReport') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm no-print">
      {{ error }}
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="flex justify-center py-16 no-print">
      <svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Empty State -->
    <div v-if="!report && !loading" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm no-print">
      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {{ t('accounting.generalLedger') }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm text-center">
        {{ t('accounting.generalLedgerEmptyState') }}
      </p>
    </div>

    <!-- Ledger Content -->
    <template v-if="report && !loading">
      <!-- Summary Widgets -->
      <div v-if="summary && !selectedAccountId" class="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('accounting.openingBalance') }} <span class="text-[10px] opacity-70">({{ t('accounting.net') }})</span>
          </span>
          <div class="text-lg font-bold text-gray-800 dark:text-white mt-1">{{ formatCurrency(summary.opening) }}</div>
        </div>
        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span class="text-xs text-blue-500">
            {{ t('accounting.debit') }} <span class="text-[10px] opacity-70">({{ t('accounting.periodText') }})</span>
          </span>
          <div class="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{{ formatCurrency(summary.debits) }}</div>
        </div>
        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span class="text-xs text-amber-500">
            {{ t('accounting.credit') }} <span class="text-[10px] opacity-70">({{ t('accounting.periodText') }})</span>
          </span>
          <div class="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{{ formatCurrency(summary.credits) }}</div>
        </div>
        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span class="text-xs text-emerald-500">
            {{ t('accounting.closingBalance') }} <span class="text-[10px] opacity-70">({{ t('accounting.net') }})</span>
          </span>
          <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ formatCurrency(summary.closing) }}</div>
        </div>
      </div>

      <!-- Accounts details loops -->
      <div v-if="report.accounts.length === 0" class="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
        {{ t('accounting.noMovements') }}
      </div>

      <div v-else class="space-y-8">
        <div
          v-for="acc in report.accounts"
          :key="acc.account_id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden break-inside-avoid"
        >
          <!-- Card Header -->
          <div class="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 text-xs font-semibold rounded-md border" :class="accountTypeBadgeClass(acc.account_type)">
                {{ accountTypeLabel(acc.account_type) }}
              </span>
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white">
                  <span class="font-mono text-gray-500 dark:text-gray-400 mr-2">{{ acc.account_code }}</span>
                  {{ acc.account_name }}
                </h3>
              </div>
            </div>
            
            <!-- Quick metrics bar -->
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <div class="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md">
                <span class="text-gray-500 dark:text-gray-400 font-medium">{{ t('accounting.openingBalance') }}:</span>
                <span class="font-mono font-semibold text-gray-800 dark:text-gray-200">{{ formatCurrency(acc.opening_balance) }}</span>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-gray-900 border border-blue-100 dark:border-gray-700 rounded-md">
                <span class="text-blue-600 dark:text-blue-400 font-medium">{{ t('accounting.debit') }}:</span>
                <span class="font-mono font-semibold text-blue-700 dark:text-blue-300">{{ formatCurrency(acc.total_debit) }}</span>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-gray-900 border border-amber-100 dark:border-gray-700 rounded-md">
                <span class="text-amber-600 dark:text-amber-400 font-medium">{{ t('accounting.credit') }}:</span>
                <span class="font-mono font-semibold text-amber-700 dark:text-amber-300">{{ formatCurrency(acc.total_credit) }}</span>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 rounded-md">
                <span class="text-emerald-600 dark:text-emerald-400 font-medium">{{ t('accounting.closingBalance') }}:</span>
                <span class="font-mono font-bold text-emerald-700 dark:text-emerald-300">{{ formatCurrency(acc.closing_balance) }}</span>
              </div>
            </div>
          </div>

          <!-- Transaction Items Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700/30">
                <tr class="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th class="px-6 py-3 w-32">{{ t('accounting.date') }}</th>
                  <th class="px-6 py-3 w-40">{{ t('accounting.journalEntries') }}</th>
                  <th class="px-6 py-3">{{ t('accounting.description') }}</th>
                  <th class="px-6 py-3 text-right w-36">{{ t('accounting.debit') }}</th>
                  <th class="px-6 py-3 text-right w-36">{{ t('accounting.credit') }}</th>
                  <th class="px-6 py-3 text-right w-36">{{ t('accounting.runningBalance') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                <!-- If empty items but non-zero opening balance -->
                <tr v-if="acc.items.length === 0" class="text-gray-500 italic">
                  <td colspan="6" class="px-6 py-4 text-center">
                    {{ t('accounting.noMovementsCarriedForward') }}
                  </td>
                </tr>

                <tr
                  v-for="item in acc.items"
                  :key="item.id"
                  class="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 text-gray-700 dark:text-gray-200"
                >
                  <td class="px-6 py-3.5 whitespace-nowrap font-mono text-xs w-32">{{ item.date }}</td>
                  <td class="px-6 py-3.5 whitespace-nowrap w-40">
                    <button
                      @click="viewEntryDetails(item.entry_id)"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-mono text-xs font-bold hover:underline text-left cursor-pointer"
                    >
                      #{{ item.entry_number }}
                    </button>
                    <span class="text-xs text-gray-400 ml-1.5 font-semibold">({{ item.journal_code }})</span>
                  </td>
                  <td class="px-6 py-3.5 break-words max-w-sm">{{ item.description }}</td>
                  <td class="px-6 py-3.5 text-right font-mono text-gray-500 dark:text-gray-400 w-36">
                    <span v-if="parseFloat(item.debit) > 0">{{ formatCurrency(item.debit) }}</span>
                    <span v-else class="text-gray-300 dark:text-gray-600 font-sans">-</span>
                  </td>
                  <td class="px-6 py-3.5 text-right font-mono text-gray-500 dark:text-gray-400 w-36">
                    <span v-if="parseFloat(item.credit) > 0">{{ formatCurrency(item.credit) }}</span>
                    <span v-else class="text-gray-300 dark:text-gray-600 font-sans">-</span>
                  </td>
                  <td class="px-6 py-3.5 text-right font-mono font-medium w-36" :class="parseFloat(item.running_balance) < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'">
                    {{ formatCurrency(item.running_balance) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- Detail Modal -->
    <JournalEntryDetailModal
      v-model="showDetailModal"
      :entry-id="selectedEntryId"
    />
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  .printable-voucher {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
}
</style>
