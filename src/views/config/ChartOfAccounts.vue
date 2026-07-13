<script setup>
/**
 * Chart of Accounts — Collapsible tree view of the NIIF account hierarchy.
 * Supports searching, expanding/collapsing, and adding new accounts.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import accountingService from '@/services/accounting'
import AccountModal from '@/components/accounting/AccountModal.vue'
import { useContextStore } from '@/stores/context'
import DataGrid from '@/components/common/DataGrid.vue'

const { t } = useI18n()
const contextStore = useContextStore()

// Column definitions for DataGrid
const templateColumns = computed(() => [
  { key: 'name', label: t('accounting.templateName', 'Plantilla'), sortable: true },
  { key: 'description', label: t('accounting.description', 'Descripción'), sortable: true },
  { key: 'is_system', label: t('accounting.origin', 'Origen'), sortable: true }
])

const templateAccountColumns = computed(() => [
  { key: 'code', label: t('accounting.code', 'Código'), sortable: true },
  { key: 'name', label: t('accounting.name', 'Nombre'), sortable: true },
  { key: 'account_type', label: t('accounting.type', 'Tipo'), sortable: true },
  { key: 'is_selectable', label: t('accounting.selectable', 'Seleccionable'), sortable: true },
  { key: 'parent_code', label: t('accounting.parentCode', 'Cód. Padre'), sortable: true }
])

const tree = ref([])
const flatAccounts = ref([])
const loading = ref(false)
const searchQuery = ref('')
const expandedNodes = ref(new Set())
const showCreateModal = ref(false)
const error = ref('')
const success = ref('')

// Account type configuration
const accountTypes = {
  asset: { label: t('accounting.assets'), color: 'blue', icon: '📊' },
  liability: { label: t('accounting.liabilities'), color: 'red', icon: '📋' },
  equity: { label: t('accounting.equity'), color: 'purple', icon: '🏛️' },
  revenue: { label: t('accounting.revenue'), color: 'emerald', icon: '💰' },
  expense: { label: t('accounting.expenses'), color: 'amber', icon: '💸' }
}

const templates = ref([])
const loadingTemplates = ref(false)

const fetchTemplates = async () => {
  loadingTemplates.value = true
  try {
    const response = await accountingService.getTemplates()
    templates.value = response.data
  } catch (err) {
    console.error('Error fetching templates:', err)
  } finally {
    loadingTemplates.value = false
  }
}

const fetchTree = async () => {
  loading.value = true
  try {
    const [treeRes, flatRes] = await Promise.all([
      accountingService.getTree(),
      accountingService.getFlat()
    ])
    tree.value = treeRes.data
    flatAccounts.value = flatRes.data

    // Auto-expand first level
    tree.value.forEach(node => expandedNodes.value.add(node.id))

    // If no accounts, fetch templates for the onboarding
    if (tree.value.length === 0) {
      await fetchTemplates()
    }
  } catch (err) {
    error.value = t('accounting.errors.fetchChartOfAccounts')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Flatten tree for search
const flattenTree = (nodes, depth = 0) => {
  const result = []
  for (const node of nodes) {
    result.push({ ...node, depth })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

const allNodesFlat = computed(() => flattenTree(tree.value))

const filteredTree = computed(() => {
  if (!searchQuery.value) return tree.value

  const query = searchQuery.value.toLowerCase()
  const filterNodes = (nodes) => {
    return nodes.reduce((acc, node) => {
      const matchesSelf =
        node.code.toLowerCase().includes(query) ||
        node.name.toLowerCase().includes(query)

      const filteredChildren = node.children?.length
        ? filterNodes(node.children)
        : []

      if (matchesSelf || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren })
      }
      return acc
    }, [])
  }

  return filterNodes(tree.value)
})

const totalAccounts = computed(() => flatAccounts.value.length)
const selectableCount = computed(() => flatAccounts.value.filter(a => a.is_selectable).length)

const toggleNode = (nodeId) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const expandAll = () => {
  allNodesFlat.value.forEach(n => expandedNodes.value.add(n.id))
}

const collapseAll = () => {
  expandedNodes.value.clear()
}

const getTypeColor = (type) => {
  const colors = {
    asset: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    liability: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    equity: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    revenue: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    expense: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
  }
  return colors[type] || 'text-gray-600 bg-gray-50'
}

const handleCreateAccount = async ({ data, onComplete }) => {
  error.value = ''
  success.value = ''
  try {
    await accountingService.create({
      ...data,
      level: parseInt(data.level) || 1,
      is_selectable: data.is_selectable !== false
    })
    success.value = t('accounting.accountCreated')
    showCreateModal.value = false
    await fetchTree()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('accounting.errors.createAccount')
  } finally {
    onComplete()
  }
}

// Onboarding & CSV upload variables and handlers
const uploading = ref(false)
const loadingTemplate = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)

const handleTemplateLoad = async (templateName) => {
  error.value = ''
  success.value = ''
  loadingTemplate.value = true
  try {
    await accountingService.loadTemplate(templateName)
    success.value = t('accounting.importSuccess', 'Catálogo importado exitosamente.')
    await fetchTree()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('accounting.importError', 'Error al cargar plantilla.')
  } finally {
    loadingTemplate.value = false
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!file.name.endsWith('.csv')) {
    error.value = t('accounting.invalidFileType', 'Formato inválido. Por favor selecciona un archivo con extensión .csv')
    selectedFile.value = null
    return
  }
  selectedFile.value = file
  error.value = ''
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (!file) return
  if (!file.name.endsWith('.csv')) {
    error.value = t('accounting.invalidFileType', 'Formato inválido. Por favor selecciona un archivo con extensión .csv')
    selectedFile.value = null
    return
  }
  selectedFile.value = file
  error.value = ''
}

const handleCSVUpload = async () => {
  if (!selectedFile.value) return
  error.value = ''
  success.value = ''
  uploading.value = true
  try {
    await accountingService.importCSV(selectedFile.value)
    success.value = t('accounting.importSuccess', 'Catálogo importado exitosamente.')
    selectedFile.value = null
    await fetchTree()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('accounting.importError', 'Error al importar archivo.')
  } finally {
    uploading.value = false
  }
}

// Edit Account Modal State & Handlers
const showEditModal = ref(false)
const editingAccount = ref(null)
const editFormData = ref({ name: '', is_selectable: true })
const updating = ref(false)

const openEditModal = (account) => {
  editingAccount.value = account
  editFormData.value = {
    name: account.name,
    is_selectable: account.is_selectable
  }
  showEditModal.value = true
  error.value = ''
  success.value = ''
}

const closeEditModal = () => {
  if (!updating.value) {
    showEditModal.value = false
    editingAccount.value = null
  }
}

const handleEditSubmit = async () => {
  if (!editingAccount.value) return
  error.value = ''
  success.value = ''
  updating.value = true
  try {
    await accountingService.updateAccount(editingAccount.value.id, {
      name: editFormData.value.name,
      is_selectable: editFormData.value.is_selectable
    })
    success.value = t('accounting.accountUpdated', 'Cuenta actualizada exitosamente.')
    showEditModal.value = false
    editingAccount.value = null
    await fetchTree()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('accounting.errors.updateAccount', 'Error al actualizar la cuenta.')
  } finally {
    updating.value = false
  }
}
// Navigation tab
const activeTab = ref('active')

// Template CRUD States
const showCreateTemplateModal = ref(false)
const createTemplateForm = ref({ name: '', description: '' })
const isCreatingTemplate = ref(false)

const showImportTemplateModal = ref(false)
const importTemplateForm = ref({ name: '', description: '', file: null })
const isImportingTemplate = ref(false)

const showCopyTemplateModal = ref(false)
const copyTemplateSource = ref(null)
const copyTemplateForm = ref({ name: '', description: '' })
const isCopyingTemplate = ref(false)

const selectedTemplate = ref(null)
const templateAccounts = ref([])
const loadingTemplateAccounts = ref(false)

// Template Account CRUD States
const showTemplateAccountModal = ref(false)
const isEditingTemplateAccount = ref(false)
const editingTemplateAccountId = ref(null)
const templateAccountForm = ref({
  code: '',
  name: '',
  account_type: 'asset',
  is_selectable: true,
  parent_code: ''
})
const isSubmittingTemplateAccount = ref(false)

// Actions for template header
const openCreateTemplateModal = () => {
  createTemplateForm.value = { name: '', description: '' }
  showCreateTemplateModal.value = true
}

const handleCreateTemplate = async () => {
  isCreatingTemplate.value = true
  try {
    await accountingService.createTemplate(createTemplateForm.value)
    success.value = "Plantilla creada exitosamente."
    showCreateTemplateModal.value = false
    await fetchTemplates()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || "Error al crear la plantilla."
  } finally {
    isCreatingTemplate.value = false
  }
}

const openImportTemplateModal = () => {
  importTemplateForm.value = { name: '', description: '', file: null }
  showImportTemplateModal.value = true
}

const handleImportTemplateFileChange = (e) => {
  importTemplateForm.value.file = e.target.files[0]
}

const handleImportTemplate = async () => {
  if (!importTemplateForm.value.file) return
  isImportingTemplate.value = true
  try {
    await accountingService.importCSVTemplate(
      importTemplateForm.value.name,
      importTemplateForm.value.description,
      importTemplateForm.value.file
    )
    success.value = "Plantilla importada exitosamente."
    showImportTemplateModal.value = false
    await fetchTemplates()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || "Error al importar la plantilla."
  } finally {
    isImportingTemplate.value = false
  }
}

const openCopyTemplateModal = (tmpl) => {
  copyTemplateSource.value = tmpl
  copyTemplateForm.value = {
    name: `Copia de ${tmpl.name}`,
    description: tmpl.description || ''
  }
  showCopyTemplateModal.value = true
}

const handleCopyTemplate = async () => {
  if (!copyTemplateSource.value) return
  isCopyingTemplate.value = true
  try {
    await accountingService.copyTemplate(copyTemplateSource.value.id, copyTemplateForm.value)
    success.value = "Plantilla copiada exitosamente."
    showCopyTemplateModal.value = false
    await fetchTemplates()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || "Error al copiar la plantilla."
  } finally {
    isCopyingTemplate.value = false
  }
}

const handleDeleteTemplate = async (tmpl) => {
  if (!confirm(`¿Estás seguro de eliminar la plantilla "${tmpl.name}"?`)) return
  try {
    await accountingService.deleteTemplate(tmpl.id)
    success.value = "Plantilla eliminada exitosamente."
    await fetchTemplates()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || "Error al eliminar la plantilla."
  }
}

// Actions for template accounts
const selectTemplateForEdit = async (tmpl) => {
  selectedTemplate.value = tmpl
  await loadTemplateAccounts()
}

const closeTemplateAccountsEditor = () => {
  selectedTemplate.value = null
  templateAccounts.value = []
}

const loadTemplateAccounts = async () => {
  if (!selectedTemplate.value) return
  loadingTemplateAccounts.value = true
  try {
    const res = await accountingService.getTemplateAccounts(selectedTemplate.value.id)
    templateAccounts.value = res.data
  } catch (err) {
    error.value = "Error al cargar las cuentas de la plantilla."
  } finally {
    loadingTemplateAccounts.value = false
  }
}

const openAddTemplateAccount = () => {
  isEditingTemplateAccount.value = false
  editingTemplateAccountId.value = null
  templateAccountForm.value = {
    code: '',
    name: '',
    account_type: 'asset',
    is_selectable: true,
    parent_code: ''
  }
  showTemplateAccountModal.value = true
}

const openEditTemplateAccount = (acc) => {
  isEditingTemplateAccount.value = true
  editingTemplateAccountId.value = acc.id
  templateAccountForm.value = {
    code: acc.code,
    name: acc.name,
    account_type: acc.account_type,
    is_selectable: acc.is_selectable,
    parent_code: acc.parent_code || ''
  }
  showTemplateAccountModal.value = true
}

const handleTemplateAccountSubmit = async () => {
  if (!selectedTemplate.value) return
  isSubmittingTemplateAccount.value = true
  try {
    if (isEditingTemplateAccount.value) {
      await accountingService.updateTemplateAccount(
        selectedTemplate.value.id,
        editingTemplateAccountId.value,
        templateAccountForm.value
      )
      success.value = "Cuenta actualizada en la plantilla."
    } else {
      await accountingService.addTemplateAccount(
        selectedTemplate.value.id,
        templateAccountForm.value
      )
      success.value = "Cuenta agregada a la plantilla."
    }
    showTemplateAccountModal.value = false
    await loadTemplateAccounts()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || "Error al guardar la cuenta."
  } finally {
    isSubmittingTemplateAccount.value = false
  }
}

const handleDeleteTemplateAccount = async (acc) => {
  if (!selectedTemplate.value) return
  if (!confirm(`¿Estás seguro de eliminar la cuenta "${acc.code} - ${acc.name}" de la plantilla?`)) return
  try {
    await accountingService.deleteTemplateAccount(selectedTemplate.value.id, acc.id)
    success.value = "Cuenta eliminada de la plantilla."
    await loadTemplateAccounts()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || "Error al eliminar la cuenta."
  }
}
watch(() => contextStore.currentCompanyId, (newCompanyId) => {
  if (newCompanyId) {
    fetchTree()
  } else {
    tree.value = []
    flatAccounts.value = []
  }
})

onMounted(() => {
  if (contextStore.currentCompanyId) {
    fetchTree()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('accounting.chartOfAccounts', 'Plan de Cuentas') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ totalAccounts }} cuentas · {{ selectableCount }} seleccionables
        </p>
      </div>
      <button
        v-if="totalAccounts > 0"
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {{ t('accounting.newAccount') }}
      </button>
    </div>

    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          @click="activeTab = 'active'"
          :class="[
            activeTab === 'active'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
          class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200"
        >
          Plan de Cuentas Activo
        </button>
        <button
          @click="activeTab = 'templates'"
          :class="[
            activeTab === 'templates'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
          class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200"
        >
          Gestor de Plantillas
        </button>
      </nav>
    </div>

    <!-- Alerts -->
    <transition name="slide">
      <div v-if="error" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
        <span>{{ error }}</span>
        <button @click="error = ''" class="ml-auto">&times;</button>
      </div>
    </transition>
    <transition name="slide">
      <div v-if="success" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
        <span>{{ success }}</span>
      </div>
    </transition>

    <!-- Active Plan Tab Content -->
    <div v-if="activeTab === 'active'" class="space-y-6">
      <!-- Toolbar -->
    <div v-if="totalAccounts > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('accounting.searchAccountPlaceholder')"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <!-- Expand / Collapse -->
        <div class="flex gap-2">
          <button @click="expandAll" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {{ t('accounting.expandAll') }}
          </button>
          <button @click="collapseAll" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {{ t('accounting.collapseAll') }}
          </button>
          <button @click="fetchTree" :disabled="loading" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg :class="{ 'animate-spin': loading }" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading || loadingTemplate || uploading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <svg class="animate-spin h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
        {{ loadingTemplate ? t('accounting.loadingTemplateMsg', 'Cargando plantilla maestro...') : (uploading ? t('accounting.uploadingCsvMsg', 'Procesando archivo CSV...') : t('common.loading', 'Cargando...')) }}
      </p>
    </div>

    <!-- Onboarding State (when totalAccounts === 0) -->
    <div v-else-if="totalAccounts === 0" class="space-y-8 max-w-5xl mx-auto py-6">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('accounting.initializeChart') }}
        </h2>
        <p class="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm">
          {{ t('accounting.onboardingDesc') }}
        </p>
      </div>

      <!-- Option 1: Database Templates Table -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ t('accounting.dbTemplatesTitle', 'Plantillas de Planes de Cuentas en la Base de Datos') }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('accounting.dbTemplatesSubtitle', 'Selecciona una plantilla oficial o personalizada para inicializar tu catálogo.') }}
            </p>
          </div>
        </div>

        <DataGrid
          :data="templates"
          :columns="templateColumns"
          :loading="loadingTemplates"
          row-key="id"
          @refresh="fetchTemplates"
        >
          <template #cell-is_system="{ item }">
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="item.is_system 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'"
            >
              {{ item.is_system ? 'Sistema' : 'Organización' }}
            </span>
          </template>

          <template #actions="{ item }">
            <button
              @click="handleTemplateLoad(item.id)"
              :disabled="loadingTemplate || uploading"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              <span>Cargar Plantilla</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </template>
        </DataGrid>
      </div>

      <!-- Option 2: Upload CSV -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ t('accounting.ownCatalogTitle', '¿Tienes tu propio catálogo? Sube un Archivo CSV') }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('accounting.ownCatalogDesc', 'Sube un archivo .csv estructurado conteniendo las columnas: `code`, `name`, `type`, `is_selectable`.') }}
            </p>
          </div>
        </div>

        <div
          @dragover.prevent
          @drop.prevent="handleFileDrop"
          @click="triggerFileInput"
          class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/40 hover:bg-blue-50/10"
        >
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept=".csv"
            class="hidden"
          />
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('accounting.dragDropPlaceholder') }}
          </p>
          <span v-if="selectedFile" class="mt-2 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            {{ t('accounting.fileSelected', { name: selectedFile.name }) }}
          </span>
        </div>

        <div class="flex justify-end pt-2">
          <button
            @click="handleCSVUpload"
            :disabled="!selectedFile || uploading || loadingTemplate"
            class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="uploading" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ t('accounting.uploadingCsvMsg') }}
            </span>
            <span v-else>{{ t('accounting.uploadBtn') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tree -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Type groups -->
      <div v-for="typeGroup in ['asset', 'liability', 'equity', 'revenue', 'expense']" :key="typeGroup">
        <template v-if="filteredTree.filter(n => n.account_type === typeGroup).length > 0">
          <!-- Type header -->
          <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 z-10">
            <div class="flex items-center gap-2">
              <span class="text-base">{{ accountTypes[typeGroup]?.icon }}</span>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {{ accountTypes[typeGroup]?.label }}
              </span>
            </div>
          </div>

          <!-- Tree nodes -->
          <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <template v-for="node in filteredTree.filter(n => n.account_type === typeGroup)" :key="node.id">
              <TreeNode
                :node="node"
                :depth="0"
                :expanded-nodes="expandedNodes"
                :type-color-fn="getTypeColor"
                @toggle="toggleNode"
                @edit="openEditModal"
              />
            </template>
          </div>
        </template>
      </div>

      <!-- Empty (Search fallback) -->
      <div v-if="filteredTree.length === 0 && !loading" class="py-16 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
          No se encontraron cuentas con ese criterio
        </p>
      </div>
    </div>

    </div>

    <!-- Gestor de Plantillas View -->
    <div v-else-if="activeTab === 'templates'" class="space-y-6">
      
      <!-- Sub-view 1: Template Accounts Editor (if selectedTemplate is set) -->
      <div v-if="selectedTemplate" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <!-- Editor Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <button
              @click="closeTemplateAccountsEditor"
              class="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ t('accounting.editAccounts', 'Editar Cuentas') }}: {{ selectedTemplate.name }}
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ selectedTemplate.description || t('accounting.defaultTemplateDesc', 'Plantilla de catálogo contable.') }}
              </p>
            </div>
          </div>
          
          <button
            @click="openAddTemplateAccount"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ t('accounting.addAccount', 'Agregar Cuenta') }}</span>
          </button>
        </div>
        <!-- Accounts Table inside template -->
        <DataGrid
          :data="templateAccounts"
          :columns="templateAccountColumns"
          :loading="loadingTemplateAccounts"
          row-key="id"
          @refresh="loadTemplateAccounts"
          :show-search="true"
          :show-density="true"
          :show-export="false"
        >
          <template #cell-code="{ item }">
            <span class="font-mono font-semibold text-gray-900 dark:text-white">
              {{ item.code }}
            </span>
          </template>

          <template #cell-name="{ item }">
            <span :style="{ paddingLeft: `${(item.level - 1) * 16}px` }" class="inline-block font-medium text-gray-700 dark:text-gray-350">
              {{ item.name }}
            </span>
          </template>

          <template #cell-account_type="{ item }">
            <span
              class="px-2 py-0.5 rounded-full font-medium text-xs"
              :class="{
                'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300': item.account_type === 'asset',
                'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300': item.account_type === 'liability',
                'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300': item.account_type === 'equity',
                'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300': item.account_type === 'revenue',
                'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300': item.account_type === 'expense'
              }"
            >
              {{ t(`accounting.${item.account_type}s`, item.account_type) }}
            </span>
          </template>

          <template #cell-is_selectable="{ item }">
            <span :class="item.is_selectable ? 'text-emerald-600 font-medium' : 'text-gray-400'">
              {{ item.is_selectable ? 'Sí' : 'No' }}
            </span>
          </template>

          <template #cell-parent_code="{ item }">
            <span class="font-mono text-gray-400">
              {{ item.parent_code || '-' }}
            </span>
          </template>

          <template #actions="{ item }">
            <button
              @click="openEditTemplateAccount(item)"
              class="text-blue-600 hover:text-blue-950 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mr-3"
            >
              Editar
            </button>
            <button
              @click="handleDeleteTemplateAccount(item)"
              class="text-red-600 hover:text-red-950 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
            >
              Eliminar
            </button>
          </template>
        </DataGrid>
      </div>

      <!-- Sub-view 2: Master Templates Grid/List (default view) -->
      <div v-else class="space-y-6">
        <!-- Toolbar for templates -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ t('accounting.templatesDesc', 'Plantillas creadas en el Tenant o disponibles a nivel de sistema.') }}
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              @click="openCreateTemplateModal"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>{{ t('accounting.createEmptyTemplate', 'Crear Plantilla Vacía') }}</span>
            </button>
            <button
              @click="openImportTemplateModal"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{{ t('accounting.importFromCSV', 'Importar desde CSV') }}</span>
            </button>
          </div>
        </div>

        <DataGrid
          :data="templates"
          :columns="templateColumns"
          :loading="loadingTemplates"
          row-key="id"
          @refresh="fetchTemplates"
          :show-search="true"
          :show-density="true"
          :show-export="false"
        >
          <template #cell-is_system="{ item }">
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="item.is_system 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'"
            >
              {{ item.is_system ? 'Sistema' : 'Organización' }}
            </span>
          </template>

          <template #actions="{ item }">
            <button
              @click="selectTemplateForEdit(item)"
              v-if="!item.is_system"
              class="text-blue-600 hover:text-blue-950 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mr-3"
            >
              Editar Cuentas
            </button>
            <button
              @click="openCopyTemplateModal(item)"
              class="text-emerald-600 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium mr-3"
            >
              Copiar
            </button>
            <button
              @click="handleDeleteTemplate(item)"
              v-if="!item.is_system"
              class="text-red-600 hover:text-red-950 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
            >
              Eliminar
            </button>
          </template>
        </DataGrid>
      </div>
    </div>

    <!-- Create Modal -->
    <AccountModal
      v-model="showCreateModal"
      @submit="handleCreateAccount"
    />

    <!-- Edit Modal -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeEditModal">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black/40 dark:bg-black/60"></div>
          
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                Editar Cuenta Contable: {{ editingAccount?.code }}
              </h3>
              <button
                @click="closeEditModal"
                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleEditSubmit" class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('common.name') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="editFormData.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Is Selectable -->
              <div class="flex items-center">
                <input
                  id="edit_is_selectable"
                  v-model="editFormData.is_selectable"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                />
                <label for="edit_is_selectable" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {{ t('accounting.selectable') }}
                </label>
              </div>

              <!-- Footer Actions -->
              <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  @click="closeEditModal"
                  class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="updating || !editFormData.name"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  <svg v-if="updating" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardar cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
    <!-- Create Template Modal -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showCreateTemplateModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showCreateTemplateModal = false">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black/40 dark:bg-black/60"></div>
          
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('accounting.newTemplate', 'Nueva Plantilla') }}</h3>
              <button @click="showCreateTemplateModal = false" class="text-gray-400 hover:text-gray-500">&times;</button>
            </div>
            <form @submit.prevent="handleCreateTemplate" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.name') }}</label>
                <input v-model="createTemplateForm.name" type="text" required class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.description') }}</label>
                <textarea v-model="createTemplateForm.description" rows="3" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" @click="showCreateTemplateModal = false" class="px-4 py-2 border rounded-lg dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{{ t('common.cancel') }}</button>
                <button type="submit" :disabled="isCreatingTemplate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">{{ t('common.create') }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Import Template Modal -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showImportTemplateModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showImportTemplateModal = false">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black/40 dark:bg-black/60"></div>
          
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('accounting.importFromCSV', 'Importar desde CSV') }}</h3>
              <button @click="showImportTemplateModal = false" class="text-gray-400 hover:text-gray-500">&times;</button>
            </div>
            <form @submit.prevent="handleImportTemplate" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.name') }}</label>
                <input v-model="importTemplateForm.name" type="text" required class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.description') }}</label>
                <textarea v-model="importTemplateForm.description" rows="2" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.csvFile', 'Archivo CSV') }}</label>
                <input type="file" accept=".csv" required @change="handleImportTemplateFileChange" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" @click="showImportTemplateModal = false" class="px-4 py-2 border rounded-lg dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{{ t('common.cancel') }}</button>
                <button type="submit" :disabled="isImportingTemplate" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">{{ t('common.import', 'Importar') }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Copy Template Modal -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showCopyTemplateModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showCopyTemplateModal = false">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black/40 dark:bg-black/60"></div>
          
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('accounting.copyTemplate', 'Copiar Plantilla') }}</h3>
              <button @click="showCopyTemplateModal = false" class="text-gray-400 hover:text-gray-500">&times;</button>
            </div>
            <form @submit.prevent="handleCopyTemplate" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.name') }}</label>
                <input v-model="copyTemplateForm.name" type="text" required class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.description') }}</label>
                <textarea v-model="copyTemplateForm.description" rows="3" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" @click="showCopyTemplateModal = false" class="px-4 py-2 border rounded-lg dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{{ t('common.cancel') }}</button>
                <button type="submit" :disabled="isCopyingTemplate" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">{{ t('accounting.copy', 'Copiar') }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Template Account Create/Edit Modal -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showTemplateAccountModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showTemplateAccountModal = false">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black/40 dark:bg-black/60"></div>
          
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ isEditingTemplateAccount ? t('accounting.editTemplateAccount', 'Editar Cuenta de Plantilla') : t('accounting.addTemplateAccount', 'Agregar Cuenta a Plantilla') }}
              </h3>
              <button @click="showTemplateAccountModal = false" class="text-gray-400 hover:text-gray-500">&times;</button>
            </div>
            <form @submit.prevent="handleTemplateAccountSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.code', 'Código') }}</label>
                <input v-model="templateAccountForm.code" type="text" required placeholder="1.1.01.01.001" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.name') }}</label>
                <input v-model="templateAccountForm.name" type="text" required class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.type') }}</label>
                  <select v-model="templateAccountForm.account_type" required class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500">
                    <option value="asset">{{ t('accounting.asset', 'Activo') }}</option>
                    <option value="liability">{{ t('accounting.liability', 'Pasivo') }}</option>
                    <option value="equity">{{ t('accounting.equity', 'Patrimonio') }}</option>
                    <option value="revenue">{{ t('accounting.revenue', 'Ingreso') }}</option>
                    <option value="expense">{{ t('accounting.expense', 'Gasto') }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.parentCode', 'Cód. Padre') }} ({{ t('common.optional', 'Opcional') }})</label>
                  <input v-model="templateAccountForm.parent_code" type="text" placeholder="1.1.01" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div class="flex items-center">
                <input id="tmpl_acc_selectable" type="checkbox" v-model="templateAccountForm.is_selectable" class="h-4 w-4 rounded dark:bg-gray-700 focus:ring-blue-500" />
                <label for="tmpl_acc_selectable" class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ t('accounting.selectableHelp', 'Seleccionable (permite registrar transacciones)') }}</label>
              </div>
              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" @click="showTemplateAccountModal = false" class="px-4 py-2 border rounded-lg dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{{ t('common.cancel') }}</button>
                <button type="submit" :disabled="isSubmittingTemplateAccount" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">{{ t('common.save') }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<!-- Recursive TreeNode sub-component -->
<script>
import { h, defineComponent } from 'vue'

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: Object,
    depth: Number,
    expandedNodes: Object,
    typeColorFn: Function
  },
  emits: ['toggle', 'edit'],
  setup(props, { emit }) {
    return () => {
      const isExpanded = props.expandedNodes.has(props.node.id)
      const hasChildren = props.node.children?.length > 0
      const paddingLeft = `${(props.depth * 1.5) + 1}rem`

      const nodeRow = h('div', {
        class: [
          'flex items-center gap-2 py-2.5 px-4 cursor-pointer transition-colors duration-150',
          'hover:bg-gray-50 dark:hover:bg-gray-700/30',
          props.node.is_selectable ? '' : 'font-medium'
        ],
        style: { paddingLeft },
        onClick: () => hasChildren && emit('toggle', props.node.id)
      }, [
        // Expand/collapse chevron
        hasChildren
          ? h('svg', {
              class: ['w-4 h-4 transition-transform duration-200 flex-shrink-0 text-gray-400',
                isExpanded ? 'rotate-90' : ''],
              fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor'
            }, [
              h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5l7 7-7 7' })
            ])
          : h('span', { class: 'w-4 h-4 flex-shrink-0' }),

        // Code
        h('span', {
          class: 'text-xs font-mono px-1.5 py-0.5 rounded ' + (props.typeColorFn?.(props.node.account_type) || '')
        }, props.node.code),

        // Name
        h('span', {
          class: [
            'text-sm flex-1',
            props.node.is_selectable
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-gray-600 dark:text-gray-400 font-semibold'
          ]
        }, props.node.name),

        // Selectable badge
        !props.node.is_selectable && hasChildren
          ? h('span', { class: 'text-xs text-gray-400 dark:text-gray-500' }, `(${props.node.children.length})`)
          : null,

        props.node.is_selectable
          ? h('span', { class: 'w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0', title: 'Seleccionable' })
          : null,

        // Edit button (Pencil icon)
        h('button', {
          class: [
            'p-1 text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-colors flex-shrink-0 ml-1'
          ],
          title: 'Editar nombre',
          onClick: (e) => {
            e.stopPropagation()
            emit('edit', props.node)
          }
        }, [
          h('svg', {
            class: 'w-3.5 h-3.5',
            fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor'
          }, [
            h('path', {
              'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
              d: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
            })
          ])
        ])
      ])

      const childNodes = isExpanded && hasChildren
        ? props.node.children.map(child =>
            h(TreeNode, {
              key: child.id,
              node: child,
              depth: props.depth + 1,
              expandedNodes: props.expandedNodes,
              typeColorFn: props.typeColorFn,
              onToggle: (id) => emit('toggle', id),
              onEdit: (node) => emit('edit', node)
            })
          )
        : []

      return h('div', [nodeRow, ...childNodes])
    }
  }
})

export default { components: { TreeNode } }
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
