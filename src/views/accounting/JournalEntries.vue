<script setup>
/**
 * Journal Entries — List, create, post, and reverse accounting entries.
 * The heart of the accounting module with real-time debit/credit validation.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DataGrid from '@/components/common/DataGrid.vue'
import AccountSelect from '@/components/accounting/AccountSelect.vue'
import entriesService from '@/services/entries'
import accountingService from '@/services/accounting'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

// ── State ────────────────────────────────────────────────
const entries = ref([])
const accounts = ref([])
const loading = ref(false)
const loadingAccounts = ref(false)
const statusFilter = ref('')
const showForm = ref(false)
const error = ref('')
const success = ref('')

// ── Form state ──────────────────────────────────────────
const formData = ref({
  date: new Date().toISOString().split('T')[0],
  description: '',
  journal_id: ''
})

const items = ref([
  createEmptyItem(),
  createEmptyItem()
])

const submitting = ref(false)

// ── Columns ─────────────────────────────────────────────
const columns = computed(() => [
  { key: 'number', label: '#', sortable: true },
  { key: 'date', label: t('common.date'), sortable: true, format: 'date' },
  { key: 'description', label: t('common.description'), sortable: true },
  { key: 'status', label: t('common.status'), sortable: true },
  { key: 'created_at', label: t('common.created'), sortable: true, format: 'datetime' }
])

// ── Computed ─────────────────────────────────────────────
const totalDebit = computed(() =>
  items.value.reduce((sum, item) => sum + (parseFloat(item.debit_local) || 0), 0)
)

const totalCredit = computed(() =>
  items.value.reduce((sum, item) => sum + (parseFloat(item.credit_local) || 0), 0)
)

const totalDebitForeign = computed(() =>
  items.value.reduce((sum, item) => sum + (parseFloat(item.debit_foreign) || 0), 0)
)

const totalCreditForeign = computed(() =>
  items.value.reduce((sum, item) => sum + (parseFloat(item.credit_foreign) || 0), 0)
)

const difference = computed(() => Math.abs(totalDebit.value - totalCredit.value))
const isBalanced = computed(() => difference.value < 0.01)

const canSubmit = computed(() =>
  formData.value.date &&
  items.value.length >= 2 &&
  items.value.every(i => i.account_id) &&
  (totalDebit.value > 0 || totalCredit.value > 0)
)

const selectableAccounts = computed(() =>
  accounts.value.filter(a => a.is_selectable)
)

// ── Helpers ─────────────────────────────────────────────
function createEmptyItem() {
  return {
    account_id: null,
    contact_id: null,
    description: '',
    debit_local: '0.00',
    credit_local: '0.00',
    debit_foreign: '0.00',
    credit_foreign: '0.00'
  }
}

// ── Data fetching ───────────────────────────────────────
const fetchEntries = async () => {
  loading.value = true
  try {
    const response = await entriesService.list({
      status: statusFilter.value || null
    })
    entries.value = response.data
  } catch (err) {
    error.value = 'Error al cargar asientos'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchAccounts = async () => {
  loadingAccounts.value = true
  try {
    const response = await accountingService.getFlat()
    accounts.value = response.data
  } catch (err) {
    console.error('Error loading accounts:', err)
  } finally {
    loadingAccounts.value = false
  }
}

// ── Actions ─────────────────────────────────────────────
const addLine = () => {
  items.value.push(createEmptyItem())
}

const removeLine = (index) => {
  if (items.value.length > 2) {
    items.value.splice(index, 1)
  }
}

const handleDebitInput = (index) => {
  // If debit is entered, clear credit
  if (parseFloat(items.value[index].debit_local) > 0) {
    items.value[index].credit_local = '0.00'
  }
}

const handleCreditInput = (index) => {
  // If credit is entered, clear debit
  if (parseFloat(items.value[index].credit_local) > 0) {
    items.value[index].debit_local = '0.00'
  }
}

const resetForm = () => {
  formData.value = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    journal_id: ''
  }
  items.value = [createEmptyItem(), createEmptyItem()]
}

const submitEntry = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  error.value = ''

  try {
    const payload = {
      date: formData.value.date,
      description: formData.value.description,
      journal_id: formData.value.journal_id || undefined,
      items: items.value
        .filter(i => i.account_id)
        .map(i => ({
          account_id: i.account_id,
          contact_id: i.contact_id || undefined,
          description: i.description,
          debit_local: parseFloat(i.debit_local) || 0,
          credit_local: parseFloat(i.credit_local) || 0,
          debit_foreign: parseFloat(i.debit_foreign) || 0,
          credit_foreign: parseFloat(i.credit_foreign) || 0
        }))
    }

    await entriesService.create(payload)
    success.value = t('accounting.entryCreated')
    showForm.value = false
    resetForm()
    await fetchEntries()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al crear el asiento'
  } finally {
    submitting.value = false
  }
}

const postEntry = async (entryId) => {
  if (!confirm(t('accounting.confirmPost'))) return

  try {
    await entriesService.post(entryId)
    success.value = t('accounting.entryPosted')
    await fetchEntries()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al asentar'
  }
}

const reverseEntry = async (entryId) => {
  const date = prompt(t('accounting.reversalDatePrompt'), new Date().toISOString().split('T')[0])
  if (!date) return

  try {
    await entriesService.reverse(entryId, date)
    success.value = t('accounting.entryReversed')
    await fetchEntries()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al reversar'
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}

watch(statusFilter, fetchEntries)
onMounted(() => {
  fetchEntries()
  fetchAccounts()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('accounting.journalEntries', 'Asientos Contables') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ entries.length }} asientos registrados
        </p>
      </div>
      <button
        @click="showForm = !showForm; if(showForm) fetchAccounts()"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-all duration-200"
        :class="showForm
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'" />
        </svg>
        {{ showForm ? t('common.cancel') : t('accounting.newEntry') }}
      </button>
    </div>

    <!-- Alerts -->
    <transition name="slide">
      <div v-if="error" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        <span class="flex-1">{{ error }}</span>
        <button @click="error = ''" class="text-red-500 hover:text-red-700 font-bold">&times;</button>
      </div>
    </transition>
    <transition name="slide">
      <div v-if="success" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
        <span>{{ success }}</span>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- ENTRY FORM                                        -->
    <!-- ═══════════════════════════════════════════════════ -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4 max-h-0"
      enter-to-class="opacity-100 translate-y-0 max-h-[2000px]"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Form Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('accounting.newEntryTitle') }}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('accounting.newEntryDesc') }}</p>
        </div>

        <!-- Header fields -->
        <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('accounting.dateRequired') }}</label>
            <input
              v-model="formData.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('common.description') }}</label>
            <input
              v-model="formData.description"
              type="text"
              placeholder="Concepto del asiento contable"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-[280px]">{{ t('accounting.account') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-[180px]">{{ t('common.description') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-[130px]">{{ t('accounting.debitBs') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-[130px]">{{ t('accounting.creditBs') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-[120px]">{{ t('accounting.debitUsd') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-[120px]">{{ t('accounting.creditUsd') }}</th>
                <th class="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <tr v-for="(item, index) in items" :key="index" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                <!-- Account -->
                <td class="px-4 py-2">
                  <AccountSelect
                    v-model="item.account_id"
                    :accounts="selectableAccounts"
                    placeholder="Seleccione..."
                    :only-selectable="true"
                  />
                </td>
                <!-- Description -->
                <td class="px-4 py-2">
                  <input
                    v-model="item.description"
                    type="text"
                    placeholder="Detalle..."
                    class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <!-- Debit Local -->
                <td class="px-4 py-2">
                  <input
                    v-model="item.debit_local"
                    type="number"
                    step="0.01"
                    min="0"
                    @input="handleDebitInput(index)"
                    class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-right text-sm text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <!-- Credit Local -->
                <td class="px-4 py-2">
                  <input
                    v-model="item.credit_local"
                    type="number"
                    step="0.01"
                    min="0"
                    @input="handleCreditInput(index)"
                    class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-right text-sm text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <!-- Debit Foreign -->
                <td class="px-4 py-2">
                  <input
                    v-model="item.debit_foreign"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-right text-sm text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <!-- Credit Foreign -->
                <td class="px-4 py-2">
                  <input
                    v-model="item.credit_foreign"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-right text-sm text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <!-- Remove -->
                <td class="px-4 py-2 text-center">
                  <button
                    v-if="items.length > 2"
                    @click="removeLine(index)"
                    class="text-red-400 hover:text-red-600 transition-colors p-1"
                    :title="t('accounting.removeLine')"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>

            <!-- Totals -->
            <tfoot class="border-t-2 border-gray-300 dark:border-gray-600">
              <tr class="font-semibold">
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" colspan="2">
                  <button
                    @click="addLine"
                    class="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                    </svg>
                    {{ t('accounting.addLine') }}
                  </button>
                </td>
                <td class="px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                  {{ formatCurrency(totalDebit) }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                  {{ formatCurrency(totalCredit) }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-sm text-gray-500 dark:text-gray-400">
                  {{ formatCurrency(totalDebitForeign) }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-sm text-gray-500 dark:text-gray-400">
                  {{ formatCurrency(totalCreditForeign) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Balance Indicator + Submit -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <!-- Balance status -->
          <div
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg"
            :class="isBalanced
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'"
          >
            <svg v-if="isBalanced" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm font-semibold">
                {{ isBalanced ? '✓ ' + t('accounting.balanced') : '⚠ ' + t('accounting.unbalanced') }}
              </p>
              <p v-if="!isBalanced" class="text-xs">
                Diferencia: {{ formatCurrency(difference) }} Bs
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="resetForm"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
            <button
              @click="submitEntry"
              :disabled="!canSubmit || submitting"
              class="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="submitting" class="flex items-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Guardando...
              </span>
              <span v-else>{{ t('accounting.createDraft') }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- ENTRIES LIST                                       -->
    <!-- ═══════════════════════════════════════════════════ -->
    <DataGrid
      :data="entries"
      :columns="columns"
      :loading="loading"
      row-key="id"
      @refresh="fetchEntries"
    >
      <!-- Status filter -->
      <template #filters>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{{ t('common.allStatuses') }}</option>
          <option value="draft">{{ t('accounting.draft') }}</option>
          <option value="posted">{{ t('accounting.posted') }}</option>
        </select>
      </template>

      <!-- Status badge cell -->
      <template #cell-status="{ value }">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          :class="value === 'posted'
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="value === 'posted' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
          {{ value === 'posted' ? t('accounting.posted') : t('accounting.draft') }}
        </span>
      </template>

      <!-- Actions -->
      <template #actions="{ item }">
        <div class="flex items-center gap-2 justify-end">
          <button
            v-if="item.status === 'draft' && authStore.hasPermission('accountant')"
            @click="postEntry(item.id)"
            class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 text-sm font-medium transition-colors"
            title="Asentar"
          >
            Asentar
          </button>
          <button
            v-if="item.status === 'posted' && authStore.hasPermission('admin')"
            @click="reverseEntry(item.id)"
            class="text-orange-600 dark:text-orange-400 hover:text-orange-800 text-sm font-medium transition-colors"
            title="Reversar"
          >
            Reversar
          </button>
        </div>
      </template>
    </DataGrid>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
