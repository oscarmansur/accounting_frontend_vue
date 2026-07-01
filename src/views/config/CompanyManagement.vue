<script setup>
/**
 * Company Management — List and create companies within the current tenant.
 * Only visible for admin / owner roles.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DataGrid from '@/components/common/DataGrid.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useContextStore } from '@/stores/context'
import companiesService from '@/services/companies'

const { t } = useI18n()
const contextStore = useContextStore()

const companies = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showFiscalYearModal = ref(false)
const selectedCompanyId = ref(null)
const error = ref('')
const success = ref('')

const columns = [
  { key: 'tax_id', label: 'RIF / NIT', sortable: true },
  { key: 'legal_name', label: t('accounting.legalName'), sortable: true },
  { key: 'commercial_name', label: t('accounting.commercialName'), sortable: true },
  { key: 'is_active', label: t('common.status'), sortable: true },
  { key: 'created_at', label: t('common.created'), sortable: true, format: 'date' }
]

const companyFields = [
  { name: 'tax_id', label: 'RIF / NIT', type: 'text', required: true, placeholder: 'J-12345678-9' },
  { name: 'legal_name', label: t('accounting.legalName'), type: 'text', required: true, placeholder: t('accounting.legalNamePlaceholder') },
  { name: 'commercial_name', label: t('accounting.commercialName'), type: 'text', placeholder: t('accounting.commercialNamePlaceholder') }
]

const fiscalYearFields = [
  { name: 'year', label: t('accounting.year'), type: 'text', required: true, placeholder: '2026' },
  { name: 'start_date', label: t('accounting.startDate'), type: 'text', required: true, placeholder: '2026-01-01' },
  { name: 'end_date', label: t('accounting.endDate'), type: 'text', required: true, placeholder: '2026-12-31' }
]

const fetchCompanies = async () => {
  loading.value = true
  try {
    const response = await companiesService.list()
    companies.value = response.data
    // Also refresh context store
    contextStore.companies = response.data
  } catch (err) {
    error.value = 'Error al cargar empresas'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleCreateCompany = async ({ data }) => {
  try {
    await companiesService.create(data)
    success.value = t('accounting.companyCreated')
    showCreateModal.value = false
    await fetchCompanies()
    // Auto-dismiss success
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al crear empresa'
    throw err
  }
}

const openFiscalYearModal = (companyId) => {
  selectedCompanyId.value = companyId
  showFiscalYearModal.value = true
}

const handleCreateFiscalYear = async ({ data }) => {
  try {
    await companiesService.createFiscalYear(selectedCompanyId.value, {
      year: parseInt(data.year),
      start_date: data.start_date,
      end_date: data.end_date
    })
    success.value = t('accounting.fiscalYearCreated')
    showFiscalYearModal.value = false
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('accounting.fiscalYearError')
    throw err
  }
}

onMounted(fetchCompanies)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('accounting.companyManagement', 'Gestión de Empresas') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('accounting.companyManagementDesc', 'Administra las empresas dentro de tu organización') }}
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {{ t('accounting.createCompany', 'Nueva Empresa') }}
      </button>
    </div>

    <!-- Alerts -->
    <transition name="error-slide">
      <div v-if="error" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        <span>{{ error }}</span>
        <button @click="error = ''" class="ml-auto text-red-500 hover:text-red-700">&times;</button>
      </div>
    </transition>

    <transition name="error-slide">
      <div v-if="success" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
        <span>{{ success }}</span>
      </div>
    </transition>

    <!-- Companies Table -->
    <DataGrid
      :data="companies"
      :columns="columns"
      :loading="loading"
      row-key="id"
      @refresh="fetchCompanies"
    >
      <!-- Status cell -->
      <template #cell-is_active="{ value }">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="value
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="value ? 'bg-emerald-500' : 'bg-gray-400'"></span>
          {{ value ? t('common.active') : t('common.inactive') }}
        </span>
      </template>

      <!-- Actions -->
      <template #actions="{ item }">
        <button
          @click="openFiscalYearModal(item.id)"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
        >
          {{ t('accounting.addFiscalYear') }}
        </button>
      </template>
    </DataGrid>

    <!-- Create Company Modal -->
    <FormModal
      v-model="showCreateModal"
      :title="t('accounting.createCompany', 'Crear Empresa')"
      :fields="companyFields"
      :submit-button-text="t('common.create', 'Crear')"
      :cancel-button-text="t('common.cancel', 'Cancelar')"
      @submit="handleCreateCompany"
    />

    <!-- Create Fiscal Year Modal -->
    <FormModal
      v-model="showFiscalYearModal"
      :title="t('accounting.createFiscalYear')"
      :fields="fiscalYearFields"
      :submit-button-text="t('common.create')"
      :cancel-button-text="t('common.cancel', 'Cancelar')"
      @submit="handleCreateFiscalYear"
    />
  </div>
</template>

<style scoped>
.error-slide-enter-active, .error-slide-leave-active {
  transition: all 0.3s ease;
}
.error-slide-enter-from, .error-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
