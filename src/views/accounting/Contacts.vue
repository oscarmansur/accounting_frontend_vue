<script setup>
/**
 * Contacts view — CRUD management of Customers and Suppliers.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DataGrid from '@/components/common/DataGrid.vue'
import ContactModal from '@/components/ContactModal.vue'
import contactsService from '@/services/contacts'
import { UserPlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

// State
const contacts = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const selectedContact = ref(null)
const error = ref('')
const success = ref('')

// Fields configuration for FormModal
const columns = computed(() => [
  { key: 'tax_id', label: t('contacts.taxId'), sortable: true },
  { key: 'name', label: t('contacts.name'), sortable: true },
  { key: 'contact_type', label: t('contacts.classification'), sortable: true },
  { key: 'created_at', label: t('contacts.registeredAt'), sortable: true, format: 'date' }
])

const fetchContacts = async () => {
  loading.value = true
  try {
    const response = await contactsService.list()
    contacts.value = response.data
  } catch (err) {
    error.value = t('contacts.fetchError')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  selectedContact.value = {}
  showModal.value = true
}

const openEditModal = (contact) => {
  isEditing.value = true
  selectedContact.value = { ...contact }
  showModal.value = true
}

const handleFormSubmit = async ({ data, onComplete }) => {
  error.value = ''
  success.value = ''
  try {
    if (isEditing.value) {
      await contactsService.update(selectedContact.value.id, data)
      success.value = t('contacts.updatedSuccess')
    } else {
      await contactsService.create(data)
      success.value = t('contacts.createdSuccess')
    }
    showModal.value = false
    await fetchContacts()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('contacts.saveError')
  } finally {
    onComplete()
  }
}

const handleDeleteContact = async (id) => {
  if (!window.confirm(t('contacts.deleteConfirm'))) return
  error.value = ''
  success.value = ''
  try {
    await contactsService.delete(id)
    success.value = t('contacts.deletedSuccess')
    await fetchContacts()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('contacts.deleteError')
  }
}

const getClassificationLabel = (type) => {
  switch (type) {
    case 'customer': return t('contacts.customer')
    case 'supplier': return t('contacts.supplier')
    case 'both': return t('contacts.both')
    default: return type
  }
}

const getClassificationBadgeClass = (type) => {
  switch (type) {
    case 'customer':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    case 'supplier':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    case 'both':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }
}

onMounted(fetchContacts)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('contacts.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('contacts.description') }}
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        <UserPlusIcon class="w-5 h-5" />
        {{ t('contacts.newContact') }}
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
      :data="contacts"
      :columns="columns"
      :loading="loading"
      row-key="id"
      @refresh="fetchContacts"
    >
      <!-- Classification Badge slot -->
      <template #cell-contact_type="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getClassificationBadgeClass(value)"
        >
          {{ getClassificationLabel(value) }}
        </span>
      </template>

      <!-- Actions slot -->
      <template #actions="{ item }">
        <div class="flex items-center gap-2">
          <button
            @click="openEditModal(item)"
            class="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :title="t('contacts.editContact')"
          >
            <PencilIcon class="w-4 h-4" />
          </button>
          <button
            @click="handleDeleteContact(item.id)"
            class="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :title="t('common.delete')"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </template>
    </DataGrid>

    <!-- ContactModal -->
    <ContactModal
      v-model="showModal"
      :contact="selectedContact"
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
