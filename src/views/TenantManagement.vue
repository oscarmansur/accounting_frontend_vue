<script setup>
/**
 * TenantManagement - Manage Tenants (Superuser only).
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import tenantsService from '@/services/tenants'
import DataGrid from '@/components/common/DataGrid.vue'
import FormModal from '@/components/common/FormModal.vue'

const { t } = useI18n()

// State
const tenants = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const error = ref('')
const success = ref('')

const columns = [
  { key: 'name', label: t('tenants.name'), sortable: true },
  { key: 'schema_name', label: t('tenants.schemaName'), sortable: true },
  { key: 'is_active', label: t('common.status'), sortable: true },
  { key: 'created_at', label: t('common.created'), sortable: true, format: 'date' }
]

const tenantFields = [
  { name: 'name', label: t('tenants.name'), type: 'text', required: true, placeholder: t('tenants.namePlaceholder') }
]

const fetchTenants = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await tenantsService.list()
    tenants.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al cargar las organizaciones/tenants'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleCreateTenant = async ({ data }) => {
  error.value = ''
  success.value = ''
  try {
    await tenantsService.create(data)
    success.value = t('tenants.createdSuccess')
    showCreateModal.value = false
    await fetchTenants()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al crear la organización'
    throw err
  }
}

onMounted(fetchTenants)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('nav.tenants') }}</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('tenants.description') }}</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {{ t('tenants.createBtn') }}
      </button>
    </div>

    <!-- Alert banners -->
    <div v-if="error" class="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex justify-between">
      <span>{{ error }}</span>
      <button @click="error = ''" class="font-bold">&times;</button>
    </div>
    <div v-if="success" class="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
      {{ success }}
    </div>

    <!-- Tenants table -->
    <DataGrid
      :data="tenants"
      :columns="columns"
      :loading="loading"
      row-key="id"
      @refresh="fetchTenants"
    >
      <!-- Custom status badge -->
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
    </DataGrid>

    <!-- Create Tenant Modal -->
    <FormModal
      v-model="showCreateModal"
      :title="t('tenants.createTitle')"
      :fields="tenantFields"
      :submit-button-text="t('common.create')"
      :cancel-button-text="t('common.cancel')"
      @submit="handleCreateTenant"
    />
  </div>
</template>
