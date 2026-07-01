<script setup>
/**
 * Accounting Dashboard — overview of the current company's status.
 * Uses StatsCard component from the boilerplate and connects to the API.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import StatsCard from '../components/common/StatsCard.vue'
import { useContextStore } from '../stores/context'
import { useAuthStore } from '../stores/auth'
import accountingService from '../services/accounting'
import entriesService from '../services/entries'
import api from '../services/api'

const router = useRouter()
const { t, locale } = useI18n()
const contextStore = useContextStore()
const authStore = useAuthStore()

const stats = ref({
  totalAccounts: 0,
  totalEntries: 0,
  draftEntries: 0,
  postedEntries: 0
})

const loading = ref(false)
const recentEntries = ref([])

// ── Setup Wizard ────────────────────────────────────────
const setupStep = computed(() => {
  if (!contextStore.hasTenant) return 'tenant'
  if (!contextStore.hasCompany) return 'company'
  return 'done'
})
const newTenantName = ref('')
const setupLoading = ref(false)
const setupError = ref('')

const createTenant = async () => {
  if (!newTenantName.value.trim()) return
  setupLoading.value = true
  setupError.value = ''
  try {
    const response = await api.post('/tenants', { name: newTenantName.value.trim() })
    console.log('[Setup] Tenant created:', response.data)
    // Reload tenants — this will auto-select the new one
    await contextStore.loadTenants()
    newTenantName.value = ''
  } catch (err) {
    console.error('[Setup] Tenant creation failed:', err)
    setupError.value = err.response?.data?.detail || 'Error al crear el tenant'
  } finally {
    setupLoading.value = false
  }
}

onMounted(async () => {
  // Load context if needed
  if (authStore.isAuthenticated && !contextStore.hasTenant) {
    try {
      await contextStore.loadTenants()
    } catch (e) {
      console.warn('Could not load tenants:', e)
    }
  }

  if (contextStore.isContextReady) {
    fetchDashboardData()
  }
})

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const [accountsRes, entriesRes, draftsRes] = await Promise.allSettled([
      accountingService.getFlat(),
      entriesService.list({ limit: 10 }),
      entriesService.list({ status: 'draft', limit: 50 })
    ])

    if (accountsRes.status === 'fulfilled') {
      stats.value.totalAccounts = accountsRes.value.data.length
    }
    if (entriesRes.status === 'fulfilled') {
      recentEntries.value = entriesRes.value.data.slice(0, 5)
      stats.value.totalEntries = entriesRes.value.data.length
    }
    if (draftsRes.status === 'fulfilled') {
      stats.value.draftEntries = draftsRes.value.data.length
    }
    stats.value.postedEntries = stats.value.totalEntries - stats.value.draftEntries
  } catch (err) {
    console.error('Dashboard data error:', err)
  } finally {
    loading.value = false
  }
}

const companyName = computed(() => {
  const c = contextStore.currentCompany
  return c ? (c.commercial_name || c.legal_name) : t('common.noCompanySelected')
})

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const capitalizeEsWeekdayMonth = (dateStr) => {
  let out = capitalize(dateStr)
  out = out.replace(/(\sde\s)([^\s,]+)(\sde\s)/i, (match, p1, month, p3) => {
    return `${p1}${capitalize(month)}${p3}`
  })
  return out
}

const getCurrentDate = () => {
  const d = new Date()
  const loc = locale.value || 'es-MX'
  const base = d.toLocaleDateString(loc, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  if (loc.toLowerCase().startsWith('es')) {
    return capitalizeEsWeekdayMonth(base)
  }
  return base
}

const formatCurrency = (v) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0)

const goTo = (name) => router.push({ name })
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('dashboard.title', 'Panel de Control') }}
        </h1>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {{ companyName }} · {{ getCurrentDate() }}
        </p>
      </div>
    </div>

    <!-- Setup Wizard -->
    <div
      v-if="setupStep !== 'done' && authStore.isAuthenticated"
      class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm"
    >
      <!-- Step indicator -->
      <div class="flex items-center gap-3 mb-5">
        <div class="flex items-center gap-2">
          <div :class="setupStep === 'tenant' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'" class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors">
            <svg v-if="setupStep !== 'tenant'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            <span v-else>1</span>
          </div>
          <span class="text-sm font-medium" :class="setupStep === 'tenant' ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-600 dark:text-emerald-400'">{{ t('setup.organization') }}</span>
        </div>
        <div class="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
        <div class="flex items-center gap-2">
          <div :class="setupStep === 'company' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'" class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors">2</div>
          <span class="text-sm font-medium" :class="setupStep === 'company' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-400'">{{ t('setup.company') }}</span>
        </div>
      </div>

      <!-- Step 1: Create Tenant -->
      <div v-if="setupStep === 'tenant'">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('setup.step1Title') }}</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ t('setup.step1Desc') }}</p>

        <div v-if="setupError" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{{ setupError }}</div>

        <div class="mt-4 flex gap-3">
          <input
            v-model="newTenantName"
            type="text"
            :placeholder="t('setup.tenantPlaceholder')"
            class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            @keyup.enter="createTenant"
          />
          <button
            @click="createTenant"
            :disabled="setupLoading || !newTenantName.trim()"
            class="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <svg v-if="setupLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ t('setup.createOrganization') }}
          </button>
        </div>
      </div>

      <!-- Step 2: Create Company -->
      <div v-if="setupStep === 'company'">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('setup.step2Title') }}</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ t('setup.step2Desc', { name: contextStore.currentTenant?.name }) }}
        </p>
        <div class="mt-4">
          <button
            @click="goTo('companies')"
            class="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ t('setup.goToCreateCompany') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="contextStore.isContextReady" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        :title="t('dashboard.totalAccounts', 'Cuentas Contables')"
        :value="stats.totalAccounts"
        icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        icon-color="text-blue-600"
        :clickable="true"
        @click="goTo('chart-of-accounts')"
      />

      <StatsCard
        :title="t('dashboard.totalEntries', 'Asientos del Período')"
        :value="stats.totalEntries"
        icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        icon-color="text-emerald-600"
        :clickable="true"
        @click="goTo('journal-entries')"
      />

      <StatsCard
        :title="t('dashboard.draftEntries', 'Borradores Pendientes')"
        :value="stats.draftEntries"
        icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        icon-color="text-amber-600"
        :clickable="true"
        @click="goTo('journal-entries')"
      />

      <StatsCard
        :title="t('dashboard.postedEntries', 'Asientos Asentados')"
        :value="stats.postedEntries"
        icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        icon-color="text-purple-600"
        :clickable="true"
        @click="goTo('journal-entries')"
      />
    </div>

    <!-- Quick Actions -->
    <div v-if="contextStore.isContextReady" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {{ t('dashboard.quickActions', 'Acciones Rápidas') }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          @click="goTo('journal-entries')"
          class="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ t('dashboard.newEntry') }}
        </button>
        <button
          @click="goTo('chart-of-accounts')"
          class="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {{ t('dashboard.chartOfAccounts') }}
        </button>
        <button
          @click="goTo('balance-sheet')"
          class="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {{ t('dashboard.viewReports') }}
        </button>
        <button
          v-if="authStore.hasRole(['admin', 'owner']) || authStore.isSuperuser"
          @click="goTo('companies')"
          class="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ t('dashboard.configuration') }}
        </button>
      </div>
    </div>

    <!-- Recent Entries (uses DataGrid) -->
    <div v-if="contextStore.isContextReady && recentEntries.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ t('dashboard.recentEntries') }}</h3>
        <button @click="goTo('journal-entries')" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium transition-colors">
          {{ t('dashboard.viewAll') }}
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">#</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{{ t('common.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{{ t('common.description') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{{ t('common.status') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="entry in recentEntries" :key="entry.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-3 text-sm text-gray-900 dark:text-white font-mono">{{ entry.number }}</td>
              <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{{ new Date(entry.date).toLocaleDateString() }}</td>
              <td class="px-6 py-3 text-sm text-gray-800 dark:text-gray-200 max-w-xs truncate">{{ entry.description || '—' }}</td>
              <td class="px-6 py-3">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="entry.status === 'posted'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="entry.status === 'posted' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                  {{ entry.status === 'posted' ? t('accounting.posted') : t('accounting.draft') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Welcome (when no data yet) -->
    <div v-if="contextStore.isContextReady && stats.totalEntries === 0 && !loading" class="bg-gradient-to-r from-blue-500 to-indigo-600 shadow rounded-lg p-6 text-white">
      <h2 class="text-xl font-bold mb-2">
        {{ t('dashboard.welcome') }}
      </h2>
      <p class="text-blue-100">
        {{ t('dashboard.welcomeMessage') }}
      </p>
    </div>
  </div>
</template>
