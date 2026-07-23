<template>
  <div class="relative" ref="switcherContainer">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggle"
      class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
             bg-white/10 hover:bg-white/20 dark:bg-gray-700/50 dark:hover:bg-gray-700
             border border-gray-200/30 dark:border-gray-600/50
             text-gray-700 dark:text-gray-200 text-sm font-medium
             focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      <!-- Company Icon -->
      <div class="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>

      <!-- Company Name -->
      <span class="max-w-[140px] truncate hidden sm:inline">
        {{ currentCompanyName }}
      </span>

      <!-- Chevron -->
      <svg
        class="w-4 h-4 transition-transform duration-200 flex-shrink-0"
        :class="{ 'rotate-180': isOpen }"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="transform opacity-0 scale-95 -translate-y-1"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed left-1/2 -translate-x-1/2 top-16 mt-2 w-[calc(100vw-2rem)] max-w-xs md:absolute md:right-0 md:left-auto md:translate-x-0 md:top-full md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {{ t('context.switchCompany') }}
          </p>
        </div>

        <!-- Search -->
        <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
          <div class="relative">
            <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="t('context.searchPlaceholder')"
              class="w-full pl-8 pr-8 py-2 border border-gray-200 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     placeholder-gray-400 text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-colors"
              @keydown.esc="clearSearch"
              @keydown.enter="selectFirstResult"
              @keydown.down.prevent="focusNext"
              @keydown.up.prevent="focusPrev"
            />
            <!-- Clear button -->
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Company List -->
        <div class="max-h-60 overflow-y-auto py-1" ref="listContainer">
          <button
            v-for="(company, index) in filteredCompanies"
            :key="company.id"
            :ref="el => setItemRef(el, index)"
            @click="selectCompany(company)"
            class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            :class="{
              'bg-blue-50 dark:bg-blue-900/20 border-l-3 border-blue-500': company.id === contextStore.currentCompanyId,
              'bg-gray-100 dark:bg-gray-700/30': focusedIndex === index && company.id !== contextStore.currentCompanyId
            }"
          >
            <!-- Initials Avatar -->
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              :class="company.id === contextStore.currentCompanyId
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
            >
              {{ getInitials(company.legal_name) }}
            </div>

            <!-- Company Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate"
                :class="company.id === contextStore.currentCompanyId
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-white'"
              >
                <!-- Highlight matching text -->
                <template v-if="searchQuery && highlightName(company)">
                  <span v-html="highlightName(company)"></span>
                </template>
                <template v-else>
                  {{ company.commercial_name || company.legal_name }}
                </template>
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                <template v-if="searchQuery && highlightTaxId(company)">
                  <span v-html="highlightTaxId(company)"></span>
                </template>
                <template v-else>
                  RIF: {{ company.tax_id }}
                </template>
              </p>
            </div>

            <!-- Check icon for active -->
            <svg
              v-if="company.id === contextStore.currentCompanyId"
              class="w-5 h-5 text-blue-500 flex-shrink-0"
              fill="currentColor" viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- No results -->
          <div v-if="filteredCompanies.length === 0 && searchQuery" class="px-4 py-6 text-center">
            <svg class="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {{ t('context.noResults') }}
            </p>
            <button @click="clearSearch" class="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {{ t('context.clearSearch') }}
            </button>
          </div>

          <!-- Empty state (no companies at all) -->
          <div v-if="companies.length === 0" class="px-4 py-6 text-center">
            <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {{ t('context.noCompanies') }}
            </p>
          </div>
        </div>

        <!-- Footer: result count -->
        <div v-if="companies.length > 0" class="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ searchQuery
              ? t('context.showingFiltered', { count: filteredCompanies.length, total: companies.length })
              : t('context.totalCompanies', { count: companies.length })
            }}
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContextStore } from '@/stores/context'

const { t } = useI18n()
const contextStore = useContextStore()

const isOpen = ref(false)
const searchQuery = ref('')
const focusedIndex = ref(-1)
const switcherContainer = ref(null)
const searchInput = ref(null)
const listContainer = ref(null)
const itemRefs = ref([])

// ── Computed ────────────────────────────────────────────

const companies = computed(() => contextStore.companies)

const currentCompanyName = computed(() => {
  const company = contextStore.currentCompany
  if (!company) return t('context.selectCompany')
  return company.commercial_name || company.legal_name
})

const filteredCompanies = computed(() => {
  if (!searchQuery.value.trim()) return companies.value

  const q = searchQuery.value.trim().toLowerCase()
  return companies.value.filter(c => {
    const name = (c.commercial_name || c.legal_name || '').toLowerCase()
    const legalName = (c.legal_name || '').toLowerCase()
    const taxId = (c.tax_id || '').toLowerCase()
    return name.includes(q) || legalName.includes(q) || taxId.includes(q)
  })
})

// ── Highlight helpers ───────────────────────────────────

const escapeHtml = (str) => str.replace(/[&<>"']/g, m => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[m]))

const highlightMatch = (text, query) => {
  if (!query || !text) return null
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return null
  const before = escapeHtml(text.slice(0, idx))
  const match = escapeHtml(text.slice(idx, idx + query.length))
  const after = escapeHtml(text.slice(idx + query.length))
  return `${before}<mark class="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded px-0.5">${match}</mark>${after}`
}

const highlightName = (company) => {
  const name = company.commercial_name || company.legal_name
  return highlightMatch(name, searchQuery.value.trim())
}

const highlightTaxId = (company) => {
  const result = highlightMatch(company.tax_id, searchQuery.value.trim())
  return result ? `RIF: ${result}` : null
}

// ── Helpers ─────────────────────────────────────────────

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const setItemRef = (el, index) => {
  if (el) itemRefs.value[index] = el
}

// ── Actions ─────────────────────────────────────────────

const toggle = () => {
  isOpen.value = !isOpen.value
}

const selectCompany = async (company) => {
  if (company.id !== contextStore.currentCompanyId) {
    await contextStore.switchCompany(company.id)
  }
  isOpen.value = false
  searchQuery.value = ''
  focusedIndex.value = -1
}

const clearSearch = () => {
  searchQuery.value = ''
  focusedIndex.value = -1
  searchInput.value?.focus()
}

const selectFirstResult = () => {
  const target = focusedIndex.value >= 0
    ? filteredCompanies.value[focusedIndex.value]
    : filteredCompanies.value[0]
  if (target) selectCompany(target)
}

const focusNext = () => {
  if (filteredCompanies.value.length === 0) return
  focusedIndex.value = (focusedIndex.value + 1) % filteredCompanies.value.length
  scrollToFocused()
}

const focusPrev = () => {
  if (filteredCompanies.value.length === 0) return
  focusedIndex.value = focusedIndex.value <= 0
    ? filteredCompanies.value.length - 1
    : focusedIndex.value - 1
  scrollToFocused()
}

const scrollToFocused = () => {
  nextTick(() => {
    const el = itemRefs.value[focusedIndex.value]
    if (el) el.scrollIntoView({ block: 'nearest' })
  })
}

// ── Watchers ────────────────────────────────────────────

watch(isOpen, (val) => {
  if (val) {
    searchQuery.value = ''
    focusedIndex.value = -1
    itemRefs.value = []
    nextTick(() => searchInput.value?.focus())
  }
})

watch(searchQuery, () => {
  focusedIndex.value = -1
})

// ── Click outside ───────────────────────────────────────

const handleClickOutside = (event) => {
  if (switcherContainer.value && !switcherContainer.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
