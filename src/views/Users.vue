<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import UserModal from '../components/UserModal.vue'
import DataGrid from '../components/common/DataGrid.vue'
import CardGrid from '../components/common/CardGrid.vue'
import { PlusIcon, PencilIcon, TrashIcon, TableCellsIcon, Squares2X2Icon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

const users = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingUser = ref(null)
const viewMode = ref('table')

// Define columns for the DataGrid with sorting enabled
const columns = computed(() => [
  { 
    key: 'full_name', 
    label: t('users.fullName'), 
    class: 'min-w-[200px]',
    tdClass: 'py-4',
    sortable: true
  },
  { key: 'email', label: t('auth.email'), class: 'min-w-[200px]', sortable: true },
  { 
    key: 'is_superuser', 
    label: t('users.isSuperuser'), 
    class: 'w-32',
    format: 'role-badge',
    sortable: true
  },
  { 
    key: 'is_active', 
    label: t('common.status'), 
    class: 'w-24',
    format: 'status-badge',
    sortable: true
  },
  { 
    key: 'created_at', 
    label: t('common.created'), 
    class: 'w-32',
    format: 'date',
    sortable: true
  }
])

onMounted(() => {
  fetchUsers()
})

const fetchUsers = async () => {
  loading.value = true
  try {
    // Fetch all users without pagination by setting a high limit
    // const response = await api.get('/users?limit=10000')
    const response = await api.get('/users')
    users.value = response.data.results || response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    // Fallback to mock data if API fails - Generate more users to show pagination
    users.value = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      full_name: `${['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry'][i % 10]} ${['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'][i % 10]}`,
      email: `user${i + 1}@example.com`,
      is_superuser: i % 5 === 0, // 20% superusers
      is_active: i % 4 !== 0, // 75% active, 25% inactive
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
  } finally {
    loading.value = false
  }
}

const handleAddUser = () => {
  editingUser.value = null
  showModal.value = true
}

const handleEdit = (user) => {
  editingUser.value = user
  showModal.value = true
}

const handleDelete = async (user) => {
  const nameDisplay = user.full_name || user.email
  if (confirm(t('users.deleteConfirmation', { name: nameDisplay }))) {
    try {
      await api.delete(`/users/${user.id}`)
      // Remove user from local state
      users.value = users.value.filter(u => u.id !== user.id)
      alert(t('users.userDeleted'))
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`${t('users.deleteError')} ${error.response?.data?.message || error.message}`)
    }
  }
}

const handleUserSubmit = async ({ data, isEditing, userId, onComplete }) => {
  try {
    if (isEditing) {
      // Update existing user
      const response = await api.patch(`/users/${userId}`, data)
      // Update user in local state
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...response.data }
      }
      alert(t('users.userUpdated'))
    } else {
      // Create new user
      console.log('Sending user data:', data)
      const response = await api.post('/users', data)
      users.value.push(response.data)
      alert(t('users.userCreated'))
    }
    showModal.value = false
  } catch (error) {
    console.error('Error saving user:', error)
    console.error('Error response data:', error.response?.data)
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
    alert(`${t('users.saveError')} ${errorMessage}`)
  } finally {
    onComplete()
  }
}

// Custom formatting functions
const getRoleBadge = (isSuperuser) => {
  return isSuperuser 
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

const getStatusBadge = (isActive) => {
  return isActive 
    ? 'text-green-600' 
    : 'text-red-600'
}

const getStatusText = (isActive) => {
  return isActive ? t('common.active') : t('common.inactive')
}

// Event handlers for DataGrid
const handleSortChange = (sortInfo) => {
  console.log('Sort changed:', sortInfo)
  // In a real app, you would re-fetch data with sort parameters
}

const handlePageChange = (page) => {
  console.log('Page changed:', page)
  // In a real app, you would re-fetch data with page parameters
}

const handleItemsPerPageChange = (size) => {
  console.log('Items per page changed:', size)
  // In a real app, you would re-fetch data with new page size
}

const handleSearch = (query) => {
  console.log('Search query:', query)
  // In a real app, you would re-fetch data with search parameters
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('users.management') }}</h1>
        <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ t('users.totalUsers', { count: users.length }) }}
        </div>
      </div>
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <!-- View mode toggle -->
        <div class="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-100 dark:bg-gray-700">
          <button
            @click="viewMode = 'table'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            <TableCellsIcon class="w-4 h-4" />
            <span class="hidden sm:inline">{{ t('users.tableView') }}</span>
          </button>
          <button
            @click="viewMode = 'cards'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              viewMode === 'cards'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            <Squares2X2Icon class="w-4 h-4" />
            <span class="hidden sm:inline">{{ t('users.cardView') }}</span>
          </button>
        </div>

        <button
          @click="handleAddUser"
          class="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <PlusIcon class="w-5 h-5 mr-1 sm:mr-2" />
          <span>{{ t('users.addUser') }}</span>
        </button>
      </div>
    </div>

    <!-- DataGrid Component (Table View) -->
    <DataGrid
      v-if="viewMode === 'table'"
      :data="users"
      :columns="columns"
      :loading="loading"
      :title="t('navigation.users')"
      :show-toolbar="true"
      :items-per-page="10"
      :page-sizes="[5, 10, 25, 50]"
      :default-sort-column="'full_name'"
      :default-sort-order="'asc'"
      @refresh="fetchUsers"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
      @search="handleSearch"
    >
      <!-- Empty toolbar actions slot to remove default buttons -->
      <template #toolbar-actions></template>
      <template #actions="{ item }">
        <div class="flex space-x-2">
          <button
            @click="handleEdit(item)"
            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title="Edit user"
          >
            <PencilIcon class="w-5 h-5" />
          </button>
          <button
            @click="handleDelete(item)"
            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title="Delete user"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </template>
      
      <template #cell-id="{ value }">
        #{{ value }}
      </template>
      
      <template #cell-full_name="{ item }">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10">
            <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-200 font-bold">
              {{ (item.full_name || item.email)?.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ item.full_name || '-' }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ item.email }}</div>
          </div>
        </div>
      </template>
      
      <template #cell-is_superuser="{ value }">
        <span :class="getRoleBadge(value)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
          {{ value ? t('users.superuser') : t('users.user') }}
        </span>
      </template>
      
      <template #cell-is_active="{ value }">
        <span :class="getStatusBadge(value)" class="text-sm font-medium">
          {{ getStatusText(value) }}
        </span>
      </template>
      
      <template #empty>
        <button
          @click="handleAddUser"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
          {{ t('users.addUser') }}
        </button>
      </template>
    </DataGrid>

    <!-- CardGrid Component (Card View) -->
    <CardGrid
      v-if="viewMode === 'cards'"
      :data="users"
      :columns="columns"
      :loading="loading"
      :title="t('navigation.users')"
      :show-toolbar="true"
      :items-per-page="12"
      :page-sizes="[6, 12, 24, 48]"
      :default-sort-column="'full_name'"
      :default-sort-order="'asc'"
      :grid-cols="3"
      title-key="full_name"
      subtitle-key="email"
      @refresh="fetchUsers"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
      @search="handleSearch"
    >
      <template #toolbar-actions></template>

      <template #cell-is_superuser="{ value }">
        <span :class="getRoleBadge(value)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
          {{ value ? t('users.superuser') : t('users.user') }}
        </span>
      </template>

      <template #cell-is_active="{ value }">
        <span :class="getStatusBadge(value)" class="text-sm font-medium">
          {{ getStatusText(value) }}
        </span>
      </template>

      <template #actions="{ item }">
        <button
          @click.stop="handleEdit(item)"
          class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
        >
          <PencilIcon class="w-3.5 h-3.5 mr-1" />
          {{ t('common.edit') }}
        </button>
        <button
          @click.stop="handleDelete(item)"
          class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
        >
          <TrashIcon class="w-3.5 h-3.5 mr-1" />
          {{ t('common.delete') }}
        </button>
      </template>

      <template #empty>
        <button
          @click="handleAddUser"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
          {{ t('users.addUser') }}
        </button>
      </template>
    </CardGrid>

    <!-- User Modal -->
    <UserModal
      v-model="showModal"
      :user="editingUser"
      @submit="handleUserSubmit"
    />
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
