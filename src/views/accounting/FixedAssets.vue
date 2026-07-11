<script setup>
/**
 * Fixed Assets view - Register, view active assets and execute monthly depreciation.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import assetsService from '@/services/assets'
import accountingService from '@/services/accounting'
import AccountSelect from '@/components/accounting/AccountSelect.vue'
import StatsCard from '@/components/common/StatsCard.vue'

const { t } = useI18n()

// State
const assets = ref([])
const accounts = ref([])
const loading = ref(false)
const loadingAccounts = ref(false)
const submitting = ref(false)
const depreciating = ref(false)
const showCreateModal = ref(false)
const error = ref('')
const success = ref('')

// Form state
const newAsset = ref({
  code: '',
  name: '',
  purchase_date: new Date().toISOString().split('T')[0],
  purchase_value: 0,
  residual_value: 0,
  useful_life_months: 12,
  depreciation_account_id: null,
  expense_account_id: null
})

// Depreciation run state
const depreciationDate = ref(new Date().toISOString().split('T')[0])

// Stats
const totalAssetValue = computed(() => {
  return assets.value.reduce((acc, curr) => acc + parseFloat(curr.purchase_value || 0), 0)
})

const totalAccumDepreciation = computed(() => {
  return assets.value.reduce((acc, curr) => acc + parseFloat(curr.accumulated_depreciation || 0), 0)
})

const totalBookValue = computed(() => {
  return totalAssetValue.value - totalAccumDepreciation.value
})

// Columns
const columns = [
  { key: 'code', label: t('common.code') },
  { key: 'name', label: t('common.name') },
  { key: 'purchase_date', label: t('assets.purchaseDate') },
  { key: 'purchase_value', label: t('assets.purchaseValue') },
  { key: 'residual_value', label: t('assets.residualValue') },
  { key: 'useful_life_months', label: t('assets.usefulLife') },
  { key: 'accumulated_depreciation', label: t('assets.accumulatedDepr') },
  { key: 'book_value', label: t('assets.bookValue') }
]

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)
}

const fetchAssets = async () => {
  loading.value = true
  try {
    const response = await assetsService.list()
    assets.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al obtener activos fijos'
  } finally {
    loading.value = false
  }
}

const fetchAccounts = async () => {
  loadingAccounts.value = true
  try {
    const response = await accountingService.getFlat()
    accounts.value = response.data
  } catch (err) {
    console.error('Error fetching accounts:', err)
  } finally {
    loadingAccounts.value = false
  }
}

const handleCreateAsset = async () => {
  submitting.value = true
  error.value = ''
  success.value = ''
  try {
    const payload = {
      ...newAsset.value,
      purchase_value: parseFloat(newAsset.value.purchase_value),
      residual_value: parseFloat(newAsset.value.residual_value),
      useful_life_months: parseInt(newAsset.value.useful_life_months)
    }
    await assetsService.create(payload)
    success.value = t('assets.createdSuccess')
    showCreateModal.value = false
    await fetchAssets()
    // Reset form
    newAsset.value = {
      code: '',
      name: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_value: 0,
      residual_value: 0,
      useful_life_months: 12,
      depreciation_account_id: null,
      expense_account_id: null
    }
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al registrar el activo fijo'
  } finally {
    submitting.value = false
  }
}

const handleDepreciate = async () => {
  depreciating.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await assetsService.depreciateMonthly(depreciationDate.value)
    success.value = t('assets.depreciationSuccess', { count: response.data.length })
    await fetchAssets()
    setTimeout(() => success.value = '', 5000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al correr la depreciación'
  } finally {
    depreciating.value = false
  }
}

onMounted(() => {
  fetchAssets()
  fetchAccounts()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('nav.fixedAssets') }}</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('assets.description') }}</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showCreateModal = true"
          class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          {{ t('assets.createAsset') }}
        </button>
      </div>
    </div>

    <!-- Stats summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{{ t('assets.totalValue') }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">{{ formatCurrency(totalAssetValue) }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
          🏢
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{{ t('assets.totalAccumulated') }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">{{ formatCurrency(totalAccumDepreciation) }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600">
          📉
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{{ t('assets.bookValue') }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">{{ formatCurrency(totalBookValue) }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
          💼
        </div>
      </div>
    </div>

    <!-- Alert banners -->
    <div v-if="error" class="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex justify-between">
      <span>{{ error }}</span>
      <button @click="error = ''" class="font-bold">&times;</button>
    </div>
    <div v-if="success" class="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
      {{ success }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Assets Table/List -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th v-for="col in columns" :key="col.key" class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <tr v-for="asset in assets" :key="asset.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 text-sm">
                <td class="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">{{ asset.code }}</td>
                <td class="px-5 py-3.5 text-gray-900 dark:text-white font-medium">{{ asset.name }}</td>
                <td class="px-5 py-3.5 text-gray-500 dark:text-gray-400">{{ asset.purchase_date }}</td>
                <td class="px-5 py-3.5 font-mono text-right text-gray-900 dark:text-white">{{ formatCurrency(asset.purchase_value) }}</td>
                <td class="px-5 py-3.5 font-mono text-right text-gray-500 dark:text-gray-400">{{ formatCurrency(asset.residual_value) }}</td>
                <td class="px-5 py-3.5 text-right">{{ asset.useful_life_months }}m</td>
                <td class="px-5 py-3.5 font-mono text-right text-red-600 dark:text-red-400">{{ formatCurrency(asset.accumulated_depreciation) }}</td>
                <td class="px-5 py-3.5 font-mono text-right text-emerald-600 dark:text-emerald-400 font-semibold">{{ formatCurrency(parseFloat(asset.purchase_value) - parseFloat(asset.accumulated_depreciation)) }}</td>
              </tr>
              <tr v-if="assets.length === 0 && !loading">
                <td :colspan="columns.length" class="px-5 py-12 text-center text-gray-400">
                  {{ t('assets.noAssets') }}
                </td>
              </tr>
              <tr v-if="loading">
                <td :colspan="columns.length" class="px-5 py-12 text-center text-gray-400">
                  {{ t('common.loading') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Depreciation execution side panel -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ t('assets.depreciateTitle') }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {{ t('assets.depreciateDesc') }}
        </p>
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('assets.depreciateDate') }}</label>
          <input
            v-model="depreciationDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          @click="handleDepreciate"
          :disabled="depreciating || assets.length === 0"
          class="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-red-700 hover:to-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <svg v-if="depreciating" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          {{ t('assets.depreciateBtn') }}
        </button>
      </div>
    </div>

    <!-- Custom creation Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/50 overflow-y-auto">
        <div class="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 relative flex flex-col max-h-[90vh]">
          <!-- Title -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('assets.createAssetTitle') }}</h2>
            <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
          </div>

          <!-- Body Scrollable -->
          <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            <!-- Code -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('common.code') }} *</label>
                <input v-model="newAsset.code" type="text" placeholder="EQ-001" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <!-- Purchase Date -->
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('assets.purchaseDate') }} *</label>
                <input v-model="newAsset.purchase_date" type="date" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            <!-- Name -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('common.name') }} *</label>
              <input v-model="newAsset.name" type="text" placeholder="Computadora Portátil Dell" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <!-- Value & Residual & Life -->
            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('assets.purchaseValue') }} *</label>
                <input v-model="newAsset.purchase_value" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('assets.residualValue') }}</label>
                <input v-model="newAsset.residual_value" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('assets.usefulLifeMonths') }} *</label>
                <input v-model="newAsset.useful_life_months" type="number" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            <!-- Accounts mapping -->
            <div class="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
              <p class="text-xs text-gray-400 dark:text-gray-500 italic">{{ t('assets.accountsMappingNote') }}</p>
              <AccountSelect
                v-model="newAsset.depreciation_account_id"
                :accounts="accounts"
                :label="t('assets.depreciationAccount')"
                :placeholder="t('assets.selectDepreciationAccount')"
                only-selectable
              />
              <AccountSelect
                v-model="newAsset.expense_account_id"
                :accounts="accounts"
                :label="t('assets.expenseAccount')"
                :placeholder="t('assets.selectExpenseAccount')"
                only-selectable
              />
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              @click="showCreateModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="handleCreateAsset"
              :disabled="submitting || !newAsset.code || !newAsset.name || !newAsset.purchase_value"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <svg v-if="submitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
