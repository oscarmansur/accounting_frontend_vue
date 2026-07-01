<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Professional Data Table Demo</h1>
    
    <DataGrid
      title="User Management"
      :data="users"
      :columns="columns"
      :loading="loading"
      :items-per-page="10"
      :page-sizes="[5, 10, 25, 50]"
      selectable
      sticky-header
      show-export
      show-density
      :default-sort-column="'name'"
      :default-sort-order="'asc'"
      @search="handleSearch"
      @refresh="handleRefresh"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
      @selection-change="handleSelectionChange"
      @export="handleExport"
      @row-click="handleRowClick"
    >
      <template #toolbar-actions>
        <button
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </button>
      </template>

      <template #bulk-actions="{ selected }">
        <button 
          @click="deleteUsers(selected)" 
          class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete ({{ selected.length }})
        </button>
      </template>
      
      <template #cell-status="{ value }">
        <span :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          value === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        ]">
          {{ value }}
        </span>
      </template>
      
      <template #cell-actions="{ item }">
        <div class="flex space-x-2">
          <button
            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            @click.stop="editUser(item)"
          >
            Edit
          </button>
          <button
            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            @click.stop="deleteUser(item)"
          >
            Delete
          </button>
        </div>
      </template>
    </DataGrid>
    
    <!-- Sort info display -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Current Sort State</h3>
        <p class="text-gray-700 dark:text-gray-300">
          Sorting by: <span class="font-medium">{{ sortState.column || 'None' }}</span> 
          (<span class="font-medium">{{ sortState.order }}</span>)
        </p>
      </div>

      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Selection</h3>
        <p class="text-gray-700 dark:text-gray-300">
          Selected Items: <span class="font-medium">{{ selectedUsers.length }}</span>
        </p>
        <div v-if="selectedUsers.length > 0" class="mt-2 text-xs text-gray-500 dark:text-gray-400 max-h-20 overflow-y-auto">
          {{ selectedUsers.map(u => u.name).join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataGrid from '@/components/common/DataGrid.vue'

// Sample data
const users = ref([])
const loading = ref(false)
const sortState = ref({ column: '', order: 'asc' })
const selectedUsers = ref([])

// Columns configuration
const columns = [
  { 
    key: 'id', 
    label: 'ID', 
    sortable: true,
    class: 'w-16'
  },
  { 
    key: 'name', 
    label: 'Full Name', 
    sortable: true 
  },
  { 
    key: 'email', 
    label: 'Email', 
    sortable: true 
  },
  { 
    key: 'role', 
    label: 'Role', 
    sortable: true 
  },
  { 
    key: 'status', 
    label: 'Status', 
    sortable: true 
  },
  { 
    key: 'createdAt', 
    label: 'Created', 
    sortable: true,
    format: 'date'
  }
]

// Simulate API call
const loadUsers = async () => {
  loading.value = true
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate sample data
    users.value = Array.from({ length: 150 }, (_, i) => ({
      id: i + 1,
      name: `${['John', 'Jane', 'Bob', 'Alice', 'Charlie'][i % 5]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5]}`,
      email: `user${i + 1}@example.com`,
      role: ['Admin', 'Editor', 'Viewer'][i % 3],
      status: i % 3 === 0 ? 'active' : 'inactive',
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }))
  } finally {
    loading.value = false
  }
}

// Event handlers
const handleSearch = (query) => {
  console.log('Search query:', query)
}

const handleRefresh = () => {
  loadUsers()
}

const handleSortChange = (sortInfo) => {
  sortState.value = sortInfo
  console.log('Sort changed:', sortInfo)
}

const handlePageChange = (page) => {
  console.log('Page changed:', page)
}

const handleItemsPerPageChange = (size) => {
  console.log('Items per page changed:', size)
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
  console.log('Selection changed:', selection)
}

const handleExport = () => {
  console.log('Export triggered')
  // In a real app, you might want to fetch all data from server if it's server-side paginated
}

const handleRowClick = (item) => {
  console.log('Row clicked:', item)
  // Example: toggle selection or navigate to details
}

const editUser = (user) => {
  console.log('Edit user:', user)
}

const deleteUser = (user) => {
  if (confirm(`Delete user ${user.name}?`)) {
    users.value = users.value.filter(u => u.id !== user.id)
    // Also remove from selection if present
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
  }
}

const deleteUsers = (usersToDelete) => {
  if (confirm(`Are you sure you want to delete ${usersToDelete.length} users?`)) {
    const idsToDelete = new Set(usersToDelete.map(u => u.id))
    users.value = users.value.filter(u => !idsToDelete.has(u.id))
    selectedUsers.value = [] // Clear selection
  }
}

// Load data on mount
onMounted(() => {
  loadUsers()
})
</script>