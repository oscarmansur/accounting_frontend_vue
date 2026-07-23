<template>
  <div 
    class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden" 
    :class="containerClass"
    role="table"
    aria-label="Data table"
  >
    <!-- Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <slot name="header">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ title }}</h3>
      </slot>
    </div>

    <!-- Toolbar -->
    <div v-if="showToolbar" class="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
        <!-- Search -->
        <div v-if="showSearch" class="relative rounded-md shadow-sm max-w-md flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm"
            :placeholder="searchPlaceholderTranslated"
            :aria-label="searchPlaceholderTranslated"
            @input="handleSearch"
            @keydown.enter="handleSearchEnter"
          />
        </div>
        
        <!-- Additional filters slot -->
        <slot name="filters"></slot>
      </div>
      
      <div class="flex flex-wrap gap-2 items-center">
        <slot name="toolbar-actions"></slot>
        
        <!-- Density Toggle -->
        <button
          v-if="showDensity"
          @click="toggleDensity"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :title="t('datagrid.toggleDensity')"
        >
          <svg v-if="density === 'compact'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <!-- Export -->
        <button
          v-if="showExport"
          @click="exportToCSV"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :title="t('datagrid.exportCsv')"
        >
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ t('datagrid.export') }}
        </button>

        <button
          v-if="showRefresh"
          @click="handleRefresh"
          :disabled="loading"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          :aria-label="loading ? t('datagrid.refreshingData') : t('datagrid.refreshData')"
        >
          <svg 
            :class="['h-4 w-4 mr-1', loading ? 'animate-spin' : '']" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ loading ? t('datagrid.loading') : t('datagrid.refresh') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ loadingTextTranslated }}</p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto" :class="{'max-h-[70vh]': stickyHeader}">
      <table 
        class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" 
        role="table"
        :aria-label="`${title || 'Data'} table`"
      >
        <thead class="bg-gray-50 dark:bg-gray-700" :class="{'sticky top-0 z-10 shadow-sm': stickyHeader}">
          <tr role="row">
            <!-- Select All Checkbox -->
            <th 
              v-if="selectable"
              scope="col"
              class="px-6 py-3 text-left w-4"
            >
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="toggleSelectAll"
                  :aria-label="t('datagrid.selectAll')"
                />
              </div>
            </th>

            <th
              v-for="column in translatedSortableColumns"
              :key="column.key"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
                column.class,
                column.sortable ? 'group' : ''
              ]"
              :aria-sort="getColumnSortState(column.key)"
              role="columnheader"
              tabindex="0"
              @click="column.sortable && toggleSort(column.key)"
              @keydown.enter.space.prevent="column.sortable && toggleSort(column.key)"
            >
              <div class="flex items-center justify-between">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="ml-1 flex flex-col" aria-hidden="true">
                  <svg 
                    :class="[
                      'h-3 w-3 transition-colors',
                      sortColumn === column.key && sortOrder === 'asc' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-300 dark:text-gray-600'
                    ]" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                  </svg>
                  <svg 
                    :class="[
                      'h-3 w-3 -mt-1 transition-colors',
                      sortColumn === column.key && sortOrder === 'desc' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-300 dark:text-gray-600'
                    ]" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </th>
            
            <th v-if="$slots.actions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {{ t('datagrid.actions') }}
            </th>
          </tr>
        </thead>
        
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr 
            v-for="(item, index) in paginatedData" 
            :key="getRowKey(item, index)" 
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            :class="{'bg-blue-50 dark:bg-blue-900/20': isSelected(item)}"
            role="row"
            @click="handleRowClick(item, index)"
          >
            <!-- Row Checkbox -->
            <td 
              v-if="selectable"
              class="px-6 py-4 whitespace-nowrap w-4"
              @click.stop
            >
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  :checked="isSelected(item)"
                  @change="toggleSelect(item)"
                  :aria-label="t('datagrid.selectRow')"
                />
              </div>
            </td>
            <td
              v-for="column in translatedColumns"
              :key="column.key"
              :class="[
                'whitespace-nowrap text-sm',
                column.tdClass || 'text-gray-900 dark:text-white',
                density === 'compact' ? 'px-6 py-2' : 'px-6 py-4'
              ]"
              role="cell"
            >
              <slot :name="`cell-${column.key}`" :item="item" :value="getValue(item, column.key)">
                {{ formatValue(getValue(item, column.key), column.format) }}
              </slot>
            </td>
            
            <td 
              v-if="$slots.actions" 
              class="whitespace-nowrap text-right text-sm font-medium"
              :class="density === 'compact' ? 'px-6 py-2' : 'px-6 py-4'"
            >
              <slot name="actions" :item="item"></slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-if="paginatedData.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33l-.08-.07a1 1 0 010-1.414l.08-.07A7.962 7.962 0 0112 9c2.34 0 4.47.881 6.08 2.33l.08.07a1 1 0 010 1.414l-.08.07z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ emptyTitleTranslated }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ emptyDescriptionTranslated }}</p>
        <div v-if="$slots.empty" class="mt-6">
          <slot name="empty"></slot>
        </div>
      </div>
    </div>

    <!-- Selection Info Footer (Optional, appears on top of Pagination) -->
    <div v-if="selectable && selectedItems.length > 0" class="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 flex justify-between items-center text-sm text-blue-700 dark:text-blue-300">
      <span>{{ t('datagrid.selectedCount', { count: selectedItems.length }, `${selectedItems.length} selected`) }}</span>
      <div class="space-x-4">
        <slot name="bulk-actions" :selected="selectedItems"></slot>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && displayTotalItems > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Left side: Items per page and showing info -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex items-center">
            <span class="text-sm text-gray-700 dark:text-gray-300 mr-2">{{ t('datagrid.rowsPerPage') }}</span>
            <select 
              v-model="localItemsPerPage" 
              class="block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 pl-3 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleItemsPerPageChange"
            >
              <option v-for="size in selectPageSizes" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>
          
          <div class="text-sm text-gray-700 dark:text-gray-300">
            {{ t('datagrid.showingResults', { start: startIndex + 1, end: Math.min(endIndex, displayTotalItems), total: displayTotalItems }) }}
          </div>
        </div>
        
        <!-- Right side: Pagination controls -->
        <div v-if="totalPages > 1" class="flex items-center space-x-2">
          <!-- First page -->
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="t('datagrid.firstPage')"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          
          <!-- Previous -->
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('datagrid.previous') }}
          </button>
          
          <!-- Page numbers -->
          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md min-w-[40px] text-center',
                page === currentPage
                  ? 'z-10 bg-blue-600 text-white border border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <!-- Next -->
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('datagrid.next') }}
          </button>
          
          <!-- Last page -->
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="t('datagrid.lastPage')"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          
          <!-- Jump to page -->
          <div class="flex items-center ml-2">
            <span class="text-sm text-gray-700 dark:text-gray-300 mr-2 hidden sm:inline">{{ t('datagrid.goTo') }}</span>
            <input
              type="number"
              min="1"
              :max="totalPages"
              class="w-16 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 px-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="t('datagrid.page')"
              @keyup.enter="jumpToPage"
              @blur="jumpToPage"
              ref="jumpInput"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // Core data
  title: {
    type: String,
    default: ''
  },
  data: {
    type: Array,
    default: () => [],
    required: true
  },
  columns: {
    type: Array,
    default: () => [],
    required: true,
    validator: (columns) => {
      return columns.every(col => col.key && col.label)
    }
  },
  
  // Display options
  containerClass: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  
  // Toolbar
  showToolbar: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showRefresh: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  
  // Pagination
  showPagination: {
    type: Boolean,
    default: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default: () => [5, 10, 25, 50, 100]
  },
  currentPage: {
    type: Number,
    default: 1
  },
  
  // Selection
  selectable: {
    type: Boolean,
    default: false
  },
  
  // Professional Features
  stickyHeader: {
    type: Boolean,
    default: false
  },
  showExport: {
    type: Boolean,
    default: false
  },
  showDensity: {
    type: Boolean,
    default: false
  },
  
  // Sorting
  defaultSortColumn: {
    type: String,
    default: ''
  },
  defaultSortOrder: {
    type: String,
    default: 'asc',
    validator: (value) => ['asc', 'desc'].includes(value)
  },
  
  // Empty state
  emptyTitle: {
    type: String,
    default: 'No data found'
  },
  emptyDescription: {
    type: String,
    default: 'Try adjusting your search or filter to find what you\'re looking for.'
  },
  
  // Server-side processing
  serverSide: {
    type: Boolean,
    default: false
  },
  totalItems: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'search', 
  'refresh', 
  'sort-change', 
  'page-change', 
  'items-per-page-change',
  'update:data',
  'selection-change',
  'row-click',
  'export'
])

// Reactive state
const searchQuery = ref('')
const currentPage = ref(1)
const localItemsPerPage = ref(props.itemsPerPage)
const sortColumn = ref(props.defaultSortColumn)
const sortOrder = ref(props.defaultSortOrder)
const jumpInput = ref(null)
const searchInput = ref(null)
const selectedItems = ref([])
const density = ref('normal')
const lastSelectedIndex = ref(-1) // For shift-click selection

// Translations
const loadingTextTranslated = computed(() => props.loadingText === 'Loading...' ? t('datagrid.loading') : props.loadingText)
const searchPlaceholderTranslated = computed(() => props.searchPlaceholder === 'Search...' ? t('datagrid.searchPlaceholder') : props.searchPlaceholder)
const emptyTitleTranslated = computed(() => props.emptyTitle === 'No data found' ? t('datagrid.noDataFound') : props.emptyTitle)
const emptyDescriptionTranslated = computed(() => props.emptyDescription === 'Try adjusting your search or filter to find what you\'re looking for.' ? t('datagrid.noDataDescription') : props.emptyDescription)

// Translated columns - translate labels that match common keys
const translatedColumns = computed(() => {
  return props.columns.map(column => ({
    ...column,
    label: translateColumnLabel(column.label)
  }))
})

const translateColumnLabel = (label) => {
  // Common column labels that should be translated
  const labelMap = {
    'ID': t('common.id', 'ID'),
    'User': t('users.user', 'User'),
    'Name': t('users.fullName', 'Name'),
    'Full Name': t('users.fullName', 'Full Name'),
    'Email': t('auth.email', 'Email'),
    'Phone Number': t('users.phoneNumber', 'Phone Number'),
    'Role': t('users.role', 'Role'),
    'Status': t('common.status', 'Status'),
    'Created': t('common.created', 'Created'),
    'Created At': t('common.createdAt', 'Created At'),
    'Actions': t('common.actions', 'Actions')
  }
  
  return labelMap[label] || label
}

// Computed properties
const sortableColumns = computed(() => {
  return props.columns.map(column => ({
    ...column,
    sortable: column.sortable !== false
  }))
})

const translatedSortableColumns = computed(() => {
  return translatedColumns.value.map(column => ({
    ...column,
    sortable: column.sortable !== false
  }))
})

const filteredData = computed(() => {
  // Asegurar que data sea siempre un array
  const dataArray = Array.isArray(props.data) ? props.data : []
  
  // For server-side processing, return raw data
  if (props.serverSide) return dataArray
  
  if (!searchQuery.value) return dataArray
  
  const query = searchQuery.value.toLowerCase()
  return dataArray.filter(item => {
    return props.columns.some(column => {
      // Skip columns explicitly marked as not searchable
      if (column.searchable === false) return false
      
      // If the column defines searchKeys, search in those nested paths
      if (column.searchKeys && Array.isArray(column.searchKeys)) {
        return column.searchKeys.some(sk => {
          const val = getValue(item, sk)
          return val != null && String(val).toLowerCase().includes(query)
        })
      }
      
      const value = getValue(item, column.key)
      return value != null && String(value).toLowerCase().includes(query)
    })
  })
})

const sortedData = computed(() => {
  // For server-side processing, sorting is handled by the server
  if (props.serverSide) return filteredData.value
  
  if (!sortColumn.value) return filteredData.value
  
  const activeColumn = props.columns.find(col => col.key === sortColumn.value)
  const sortKey = activeColumn?.sortKey || sortColumn.value
  
  return [...filteredData.value].sort((a, b) => {
    const aValue = getValue(a, sortKey)
    const bValue = getValue(b, sortKey)
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortOrder.value === 'asc' ? 1 : -1
    if (bValue == null) return sortOrder.value === 'asc' ? -1 : 1
    
    // Convert to comparable values
    const aComparable = typeof aValue === 'string' ? aValue.toLowerCase() : aValue
    const bComparable = typeof bValue === 'string' ? bValue.toLowerCase() : bValue
    
    if (aComparable < bComparable) return sortOrder.value === 'asc' ? -1 : 1
    if (aComparable > bComparable) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => {
  // For server-side processing, use the provided totalItems prop
  if (props.serverSide) {
    return Math.ceil(props.totalItems / localItemsPerPage.value)
  }
  return Math.ceil(sortedData.value.length / localItemsPerPage.value)
})

const selectPageSizes = computed(() => {
  const sizes = [...props.pageSizes]
  const val = Number(localItemsPerPage.value)
  if (val && !sizes.includes(val)) {
    sizes.push(val)
    sizes.sort((a, b) => a - b)
  }
  return sizes
})

const displayTotalItems = computed(() => {
  return props.serverSide ? props.totalItems : sortedData.value.length
})

const startIndex = computed(() => (currentPage.value - 1) * localItemsPerPage.value)

const endIndex = computed(() => startIndex.value + localItemsPerPage.value)

const paginatedData = computed(() => {
  // For server-side processing, the server already returns only the current page's data
  if (props.serverSide) return sortedData.value
  const start = startIndex.value
  const end = endIndex.value
  return sortedData.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const isAllSelected = computed(() => {
  if (paginatedData.value.length === 0) return false
  return paginatedData.value.every(item => isSelected(item))
})

const isIndeterminate = computed(() => {
  if (paginatedData.value.length === 0) return false
  const selectedInPage = paginatedData.value.filter(item => isSelected(item)).length
  return selectedInPage > 0 && selectedInPage < paginatedData.value.length
})

// Methods
const getValue = (item, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const toggleSort = (columnKey) => {
  if (sortColumn.value === columnKey) {
    // Toggle sort order
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // New column, default to ascending
    sortColumn.value = columnKey
    sortOrder.value = 'asc'
  }
  
  // Emit sort change event
  emit('sort-change', {
    column: sortColumn.value,
    order: sortOrder.value
  })
  
  // Reset to first page when sorting changes
  currentPage.value = 1
}

// Enhanced methods
const handleSearch = () => {
  emit('search', searchQuery.value)
  if (!props.serverSide) {
    currentPage.value = 1
  }
}

const handleSearchEnter = (event) => {
  event.preventDefault()
  handleSearch()
}

const handleRefresh = () => {
  emit('refresh')
}

const handleItemsPerPageChange = () => {
  emit('items-per-page-change', localItemsPerPage.value)
  currentPage.value = 1
}

const jumpToPage = (event) => {
  const page = parseInt(event.target.value)
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
  // Clear input after jumping
  if (event.target) {
    event.target.value = ''
  }
}

const getColumnSortState = (columnKey) => {
  if (sortColumn.value !== columnKey) return undefined
  return sortOrder.value === 'asc' ? 'ascending' : 'descending'
}

const getRowKey = (item, index) => {
  return item[props.rowKey] || `row-${index}`
}

const formatValue = (value, format) => {
  if (format === 'date') {
    return value ? new Date(value).toLocaleDateString() : '-'
  }
  if (format === 'datetime') {
    return value ? new Date(value).toLocaleString() : '-'
  }
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
  }
  if (format === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  return value ?? '-'
}

// Selection Methods
const isSelected = (item) => {
  const key = getRowKey(item)
  return selectedItems.value.some(selected => getRowKey(selected) === key)
}

const toggleSelect = (item) => {
  const key = getRowKey(item)
  const index = selectedItems.value.findIndex(selected => getRowKey(selected) === key)
  
  if (index === -1) {
    selectedItems.value.push(item)
  } else {
    selectedItems.value.splice(index, 1)
  }
  
  emit('selection-change', selectedItems.value)
}

const toggleSelectAll = (event) => {
  const isChecked = event.target.checked
  const pageItems = paginatedData.value
  
  if (isChecked) {
    // Add all items from current page that aren't already selected
    pageItems.forEach(item => {
      if (!isSelected(item)) {
        selectedItems.value.push(item)
      }
    })
  } else {
    // Remove all items from current page
    pageItems.forEach(item => {
      const key = getRowKey(item)
      const index = selectedItems.value.findIndex(selected => getRowKey(selected) === key)
      if (index !== -1) {
        selectedItems.value.splice(index, 1)
      }
    })
  }
  emit('selection-change', selectedItems.value)
}

const handleRowClick = (item, index, event) => {
  // If user clicked text selection, don't trigger row click
  if (window.getSelection().toString().length > 0) return

  emit('row-click', item)
}

// Density
const toggleDensity = () => {
  density.value = density.value === 'normal' ? 'compact' : 'normal'
}

// Export
const exportToCSV = () => {
  if (props.data.length === 0) return

  // Gather all columns
  const headers = props.columns.map(col => col.label)
  const keys = props.columns.map(col => col.key)
  
  // Format data
  const csvContent = [
    headers.join(','),
    ...sortedData.value.map(row => {
      return keys.map(key => {
        let value = getValue(row, key)
        
        // Handle strings with commas
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`
        }
        // Handle null/undef
        if (value === null || value === undefined) {
          value = ''
        }
        
        return value
      }).join(',')
    })
  ].join('\n')

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${props.title || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  emit('export')
}

// Watchers
watch(() => props.data, () => {
  if (!props.serverSide) {
    currentPage.value = 1
  }
})

watch(() => props.currentPage, (newPage) => {
  if (newPage !== currentPage.value) {
    currentPage.value = newPage
  }
}, { immediate: true })

watch(currentPage, (newPage) => {
  emit('page-change', newPage)
})

watch(() => props.itemsPerPage, (newLimit) => {
  if (newLimit !== localItemsPerPage.value) {
    localItemsPerPage.value = newLimit
  }
}, { immediate: true })

watch(localItemsPerPage, () => {
  if (!props.serverSide) {
    currentPage.value = 1
  }
})

// Keyboard navigation
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && event.target === jumpInput.value) {
    jumpToPage(event)
  }
}

// Focus management
const focusSearch = () => {
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

// Initialize with default sort if provided
if (props.defaultSortColumn) {
  sortColumn.value = props.defaultSortColumn
  sortOrder.value = props.defaultSortOrder
}

// Expose methods for parent components
defineExpose({
  // Pagination control
  resetPagination: () => {
    currentPage.value = 1
    localItemsPerPage.value = props.itemsPerPage
  },
  goToPage: (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  },
  
  // Sorting control
  setSort: (column, order = 'asc') => {
    sortColumn.value = column
    sortOrder.value = order
  },
  clearSort: () => {
    sortColumn.value = ''
    sortOrder.value = 'asc'
  },
  
  // Search control
  setSearch: (query) => {
    searchQuery.value = query
  },
  clearSearch: () => {
    searchQuery.value = ''
  },
  focusSearch,
  
  // Getters
  getCurrentPage: () => currentPage.value,
  getTotalPages: () => totalPages.value,
  getSortState: () => ({
    column: sortColumn.value,
    order: sortOrder.value
  }),
  getSearchQuery: () => searchQuery.value,
  getSortState: () => ({
    column: sortColumn.value,
    order: sortOrder.value
  }),
  getSearchQuery: () => searchQuery.value,
  getItemsPerPage: () => localItemsPerPage.value,
  getSelectedItems: () => selectedItems.value,
  clearSelection: () => { selectedItems.value = [] },
  exportToCSV
})
</script>