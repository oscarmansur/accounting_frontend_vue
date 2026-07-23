<script setup>
/**
 * CurrencyRates view - Manages daily exchange rates for the tenant.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DataGrid from '@/components/common/DataGrid.vue'
import RateModal from '@/components/RateModal.vue'
import currenciesService from '@/services/currencies'
import { CurrencyDollarIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

// State
const rates = ref([])
const loading = ref(false)
const showModal = ref(false)
const error = ref('')
const success = ref('')

const columns = computed(() => [
  { key: 'date', label: t('currencyRates.dateLabel'), sortable: true },
  { key: 'from_currency', label: t('currencyRates.fromCurrency'), sortable: true, tdClass: 'font-semibold' },
  { key: 'to_currency', label: t('currencyRates.toCurrency'), sortable: true, tdClass: 'font-semibold' },
  { key: 'rate', label: t('currencyRates.rate'), sortable: true, tdClass: 'font-mono text-right' },
  { key: 'created_at', label: t('currencyRates.created'), sortable: true, format: 'date' }
])

const fetchRates = async () => {
  loading.value = true
  try {
    const response = await currenciesService.list()
    rates.value = response.data
  } catch (err) {
    error.value = t('currencyRates.fetchError')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  showModal.value = true
}

const handleFormSubmit = async ({ data, onComplete }) => {
  error.value = ''
  success.value = ''
  try {
    const payload = {
      ...data,
      from_currency: data.from_currency.toUpperCase(),
      to_currency: data.to_currency.toUpperCase(),
      rate: parseFloat(data.rate)
    }
    await currenciesService.create(payload)
    success.value = t('currencyRates.createdSuccess')
    showModal.value = false
    await fetchRates()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('currencyRates.saveError')
  } finally {
    onComplete()
  }
}

const handleDeleteRate = async (id) => {
  if (!window.confirm(t('currencyRates.deleteConfirm'))) return
  error.value = ''
  success.value = ''
  try {
    await currenciesService.delete(id)
    success.value = t('currencyRates.deletedSuccess')
    await fetchRates()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('currencyRates.deleteError')
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(val || 0)
}

onMounted(fetchRates)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CurrencyDollarIcon class="w-7 h-7 text-indigo-500" />
          {{ t('currencyRates.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('currencyRates.description') }}
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        <PlusIcon class="w-5 h-5" />
        {{ t('currencyRates.newRate') }}
      </button>
    </div>

    <!-- Alert banners -->
    <transition name="fade">
      <div v-if="error" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        <span>{{ error }}</span>
        <button @click="error = ''" class="ml-auto text-red-500 hover:text-red-700">&times;</button>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="success" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
        <span>{{ success }}</span>
      </div>
    </transition>

    <!-- DataGrid -->
    <DataGrid
      :data="rates"
      :columns="columns"
      :loading="loading"
      row-key="id"
      @refresh="fetchRates"
    >
      <!-- Rate custom formatting -->
      <template #cell-rate="{ value }">
        <span class="font-mono font-medium text-gray-900 dark:text-white">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <!-- Actions slot -->
      <template #actions="{ item }">
        <div class="flex items-center gap-2">
          <button
            @click="handleDeleteRate(item.id)"
            class="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :title="t('common.delete')"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </template>
    </DataGrid>

    <!-- RateModal -->
    <RateModal
      v-model="showModal"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
