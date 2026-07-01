<template>
  <div 
    class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden" 
    :class="containerClass"
    role="region"
    aria-label="Card grid"
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
        
        <!-- Sort selector -->
        <div v-if="sortableFields.length > 0" class="flex items-center gap-2">
          <select
            v-model="sortColumn"
            class="block rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="handleSortChange"
          >
            <option value="">{{ t('cardgrid.sortBy') }}</option>
            <option v-for="col in sortableFields" :key="col.key" :value="col.key">
              {{ col.label }}
            </option>
          </select>
          <button
            v-if="sortColumn"
            @click="toggleSortOrder"
            class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            :title="sortOrder === 'asc' ? t('cardgrid.sortAsc') : t('cardgrid.sortDesc')"
          >
            <svg v-if="sortOrder === 'asc'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          </button>
        </div>
        
        <!-- Additional filters slot -->
        <slot name="filters"></slot>
      </div>
      
      <div class="flex flex-wrap gap-2 items-center">
        <slot name="toolbar-actions"></slot>
        
        <!-- Grid size toggle -->
        <div v-if="showGridToggle" class="inline-flex rounded-md shadow-sm" role="group">
          <button
            v-for="size in gridSizeOptions"
            :key="size.value"
            @click="activeGridCols = size.value"
            :class="[
              'inline-flex items-center px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors',
              activeGridCols === size.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600',
              size.value === gridSizeOptions[0].value ? 'rounded-l-md' : '',
              size.value === gridSizeOptions[gridSizeOptions.length - 1].value ? 'rounded-r-md' : ''
            ]"
            :title="size.label"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="size.value <= 2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else-if="size.value <= 3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm7 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zm7 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zM4 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm7 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zm7 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
            </svg>
          </button>
        </div>

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
    <div v-if="loading" class="text-center py-16 bg-white dark:bg-gray-800">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ loadingTextTranslated }}</p>
      </div>
    </div>

    <!-- Cards Grid -->
    <div v-else>
      <div 
        v-if="paginatedData.length > 0"
        class="p-4 sm:p-6 grid gap-4 sm:gap-6"
        :class="gridColsClass"
      >
        <div
          v-for="(item, index) in paginatedData"
          :key="getRowKey(item, index)"
          class="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-200 overflow-hidden"
          :class="[
            selectable && isSelected(item) ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-300 dark:hover:border-gray-500',
            cardClass
          ]"
          role="article"
          @click="handleCardClick(item, index)"
        >
          <!-- Selection checkbox -->
          <div 
            v-if="selectable"
            class="absolute top-3 right-3 z-10"
            @click.stop
          >
            <input 
              type="checkbox" 
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              :checked="isSelected(item)"
              @change="toggleSelect(item)"
              :aria-label="t('datagrid.selectRow')"
            />
          </div>

          <!-- Card Image slot -->
          <slot name="card-image" :item="item">
            <div v-if="imageKey && getValue(item, imageKey)" class="w-full h-48 overflow-hidden">
              <img 
                :src="getValue(item, imageKey)" 
                :alt="getValue(item, titleKey) || ''"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </slot>

          <!-- Card Content -->
          <div class="p-4 sm:p-5">
            <!-- Card Header (title + subtitle) -->
            <slot name="card-header" :item="item">
              <div class="mb-3">
                <h4 
                  v-if="titleKey"
                  class="text-base font-semibold text-gray-900 dark:text-white truncate"
                  :title="getValue(item, titleKey)"
                >
                  {{ getValue(item, titleKey) }}
                </h4>
                <p 
                  v-if="subtitleKey"
                  class="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate"
                  :title="getValue(item, subtitleKey)"
                >
                  {{ getValue(item, subtitleKey) }}
                </p>
              </div>
            </slot>

            <!-- Card Body - columns rendered as key/value pairs -->
            <slot name="card-body" :item="item" :columns="translatedColumns" :getValue="getValue" :formatValue="formatValue">
              <dl class="space-y-2">
                <div 
                  v-for="column in visibleCardColumns" 
                  :key="column.key"
                  class="flex items-center justify-between text-sm"
                >
                  <dt class="text-gray-500 dark:text-gray-400 truncate mr-2">{{ column.label }}</dt>
                  <dd class="font-medium text-gray-900 dark:text-white truncate text-right">
                    <slot :name="`cell-${column.key}`" :item="item" :value="getValue(item, column.key)">
                      {{ formatValue(getValue(item, column.key), column.format) }}
                    </slot>
                  </dd>
                </div>
              </dl>
            </slot>

            <!-- Card Footer / Actions -->
            <div v-if="$slots.actions || $slots['card-footer']" class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <slot name="card-footer" :item="item">
                <div class="flex items-center justify-end gap-2">
                  <slot name="actions" :item="item"></slot>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16 bg-white dark:bg-gray-800">
        <svg class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ emptyTitleTranslated }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ emptyDescriptionTranslated }}</p>
        <div v-if="$slots.empty" class="mt-6">
          <slot name="empty"></slot>
        </div>
      </div>
    </div>

    <!-- Selection Info Footer -->
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
            <span class="text-sm text-gray-700 dark:text-gray-300 mr-2">{{ t('cardgrid.cardsPerPage') }}</span>
            <select 
              v-model="localItemsPerPage" 
              class="block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 pl-3 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleItemsPerPageChange"
            >
              <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
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
import { ref, computed, watch } from 'vue'
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
  cardClass: {
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
  
  // Card-specific layout
  titleKey: {
    type: String,
    default: ''
  },
  subtitleKey: {
    type: String,
    default: ''
  },
  imageKey: {
    type: String,
    default: ''
  },
  excludeFromBody: {
    type: Array,
    default: () => []
  },
  
  // Grid columns (responsive)
  gridCols: {
    type: Number,
    default: 3,
    validator: (v) => [1, 2, 3, 4].includes(v)
  },
  showGridToggle: {
    type: Boolean,
    default: false
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
    default: 12
  },
  pageSizes: {
    type: Array,
    default: () => [6, 12, 24, 48, 96]
  },
  
  // Selection
  selectable: {
    type: Boolean,
    default: false
  },
  
  // Professional Features
  showExport: {
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
  'card-click',
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
const activeGridCols = ref(props.gridCols)

// Grid size options
const gridSizeOptions = [
  { value: 2, label: '2 columns' },
  { value: 3, label: '3 columns' },
  { value: 4, label: '4 columns' }
]

// Translations
const loadingTextTranslated = computed(() => props.loadingText === 'Loading...' ? t('datagrid.loading') : props.loadingText)
const searchPlaceholderTranslated = computed(() => props.searchPlaceholder === 'Search...' ? t('datagrid.searchPlaceholder') : props.searchPlaceholder)
const emptyTitleTranslated = computed(() => props.emptyTitle === 'No data found' ? t('datagrid.noDataFound') : props.emptyTitle)
const emptyDescriptionTranslated = computed(() => props.emptyDescription === 'Try adjusting your search or filter to find what you\'re looking for.' ? t('datagrid.noDataDescription') : props.emptyDescription)

// Translated columns
const translatedColumns = computed(() => {
  return props.columns.map(column => ({
    ...column,
    label: translateColumnLabel(column.label)
  }))
})

const translateColumnLabel = (label) => {
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

// Columns visible in card body (exclude title, subtitle, image keys)
const visibleCardColumns = computed(() => {
  const excludeKeys = new Set([
    props.titleKey,
    props.subtitleKey,
    props.imageKey,
    ...props.excludeFromBody
  ].filter(Boolean))
  
  return translatedColumns.value.filter(col => !excludeKeys.has(col.key))
})

// Sortable fields for the dropdown
const sortableFields = computed(() => {
  return translatedColumns.value.filter(col => col.sortable !== false)
})

// Grid responsive class
const gridColsClass = computed(() => {
  const cols = activeGridCols.value
  const map = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }
  return map[cols] || map[3]
})

// Computed data pipeline (same as DataGrid)
const filteredData = computed(() => {
  if (props.serverSide) return props.data
  
  if (!searchQuery.value) return props.data
  
  const query = searchQuery.value.toLowerCase()
  return props.data.filter(item => {
    return props.columns.some(column => {
      const value = getValue(item, column.key)
      return String(value).toLowerCase().includes(query)
    })
  })
})

const sortedData = computed(() => {
  if (props.serverSide) return filteredData.value
  
  if (!sortColumn.value) return filteredData.value
  
  return [...filteredData.value].sort((a, b) => {
    const aValue = getValue(a, sortColumn.value)
    const bValue = getValue(b, sortColumn.value)
    
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortOrder.value === 'asc' ? 1 : -1
    if (bValue == null) return sortOrder.value === 'asc' ? -1 : 1
    
    const aComparable = typeof aValue === 'string' ? aValue.toLowerCase() : aValue
    const bComparable = typeof bValue === 'string' ? bValue.toLowerCase() : bValue
    
    if (aComparable < bComparable) return sortOrder.value === 'asc' ? -1 : 1
    if (aComparable > bComparable) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => {
  if (props.serverSide) {
    return Math.ceil(props.totalItems / localItemsPerPage.value)
  }
  return Math.ceil(sortedData.value.length / localItemsPerPage.value)
})

const displayTotalItems = computed(() => {
  return props.serverSide ? props.totalItems : sortedData.value.length
})

const startIndex = computed(() => (currentPage.value - 1) * localItemsPerPage.value)

const endIndex = computed(() => startIndex.value + localItemsPerPage.value)

const paginatedData = computed(() => {
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

// Methods
const getValue = (item, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
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

const handleSortChange = () => {
  emit('sort-change', {
    column: sortColumn.value,
    order: sortOrder.value
  })
  currentPage.value = 1
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  handleSortChange()
}

const jumpToPage = (event) => {
  const page = parseInt(event.target.value)
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
  if (event.target) {
    event.target.value = ''
  }
}

const getRowKey = (item, index) => {
  return item[props.rowKey] || `card-${index}`
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

const handleCardClick = (item, index) => {
  if (window.getSelection().toString().length > 0) return
  emit('card-click', item)
}

// Export
const exportToCSV = () => {
  if (props.data.length === 0) return

  const headers = props.columns.map(col => col.label)
  const keys = props.columns.map(col => col.key)
  
  const csvContent = [
    headers.join(','),
    ...sortedData.value.map(row => {
      return keys.map(key => {
        let value = getValue(row, key)
        
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`
        }
        if (value === null || value === undefined) {
          value = ''
        }
        
        return value
      }).join(',')
    })
  ].join('\n')

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

watch(currentPage, (newPage) => {
  emit('page-change', newPage)
})

watch(localItemsPerPage, () => {
  if (!props.serverSide) {
    currentPage.value = 1
  }
})

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
  resetPagination: () => {
    currentPage.value = 1
    localItemsPerPage.value = props.itemsPerPage
  },
  goToPage: (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  },
  setSort: (column, order = 'asc') => {
    sortColumn.value = column
    sortOrder.value = order
  },
  clearSort: () => {
    sortColumn.value = ''
    sortOrder.value = 'asc'
  },
  setSearch: (query) => {
    searchQuery.value = query
  },
  clearSearch: () => {
    searchQuery.value = ''
  },
  focusSearch,
  getCurrentPage: () => currentPage.value,
  getTotalPages: () => totalPages.value,
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
