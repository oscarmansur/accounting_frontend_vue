<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="handleClose">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>
        
        <!-- Modal Card Container -->
        <div 
          class="relative bg-white dark:bg-gray-900 rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all duration-300 scale-100 printable-voucher"
        >
          <!-- Loading Overlay -->
          <div v-if="loading" class="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-10 flex items-center justify-center no-print">
            <div class="flex flex-col items-center gap-3">
              <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('common.loading', 'Cargando detalles...') }}
              </span>
            </div>
          </div>

          <!-- Header -->
          <div class="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between no-print">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ t('accounting.entryDetails', 'Detalles de Asiento Contable') }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ entry ? `${t('accounting.entry', 'Asiento')} #${entry.number}` : '' }}
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                @click="printVoucher" 
                class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                :title="t('common.print', 'Imprimir')"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm0-9V9a4 4 0 014-4h4a4 4 0 014 4v2" />
                </svg>
              </button>
              <button
                @click="handleClose"
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Printable Area Content -->
          <div class="p-8 space-y-6">
            <!-- Print-Only Header -->
            <div class="hidden print:block border-b border-gray-300 pb-4 mb-6">
              <div class="flex justify-between items-start">
                <div>
                  <h1 class="text-xl font-bold uppercase tracking-wider text-gray-900">Comprobante de Diario</h1>
                  <p class="text-sm text-gray-600">Asiento Contable #{{ entry?.number }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold">Fecha de Emisión: {{ new Date().toLocaleDateString() }}</p>
                </div>
              </div>
            </div>

            <!-- Alerts (Errors/Success) -->
            <div v-if="error" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm no-print">
              <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>{{ error }}</span>
            </div>
            <div v-if="success" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm no-print">
              <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span>{{ success }}</span>
            </div>

            <!-- Voucher Info Grid -->
            <div v-if="entry" class="grid grid-cols-2 md:grid-cols-4 gap-6 p-5 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {{ t('common.date', 'Fecha') }}
                </p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {{ entry.date }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {{ t('common.status', 'Estado') }}
                </p>
                <div class="mt-1">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    :class="entry.status === 'posted'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="entry.status === 'posted' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                    {{ entry.status === 'posted' ? t('accounting.posted', 'Asentado') : t('accounting.draft', 'Borrador') }}
                  </span>
                </div>
              </div>
              <div class="col-span-2">
                <p class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {{ t('common.description', 'Concepto') }}
                </p>
                <p class="text-sm text-gray-900 dark:text-white mt-1 break-words">
                  {{ entry.description || '-' }}
                </p>
              </div>
            </div>

            <!-- Items Table -->
            <div v-if="entry && entry.items && entry.items.length" class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead class="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[140px]">{{ t('accounting.accountCode', 'Código Cuenta') }}</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('accounting.accountName', 'Nombre Cuenta') }}</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('common.description', 'Detalle') }}</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">{{ t('accounting.contact', 'Tercero') }}</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[130px]">{{ t('accounting.debitLocal', 'Débito Bs') }}</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[130px]">{{ t('accounting.creditLocal', 'Crédito Bs') }}</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[110px]">{{ t('accounting.debitForeign', 'Débito USD') }}</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[110px]">{{ t('accounting.creditForeign', 'Crédito USD') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 font-normal">
                  <tr v-for="item in entry.items" :key="item.id" class="hover:bg-slate-50/40 dark:hover:bg-gray-800/10">
                    <td class="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-300">
                      {{ item.account?.code || '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300 max-w-[200px] truncate" :title="item.account?.name">
                      {{ item.account?.name || '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[220px] break-words">
                      {{ item.description || '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                      {{ item.contact?.name || '-' }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                      {{ parseFloat(item.debit_local) > 0 ? formatNumber(item.debit_local) : '-' }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                      {{ parseFloat(item.credit_local) > 0 ? formatNumber(item.credit_local) : '-' }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-gray-500 dark:text-gray-400">
                      {{ parseFloat(item.debit_foreign) > 0 ? formatNumber(item.debit_foreign) : '-' }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-gray-500 dark:text-gray-400">
                      {{ parseFloat(item.credit_foreign) > 0 ? formatNumber(item.credit_foreign) : '-' }}
                    </td>
                  </tr>
                </tbody>
                <!-- Footer Totals -->
                <tfoot class="bg-slate-50 dark:bg-gray-800/60 font-bold border-t-2 border-gray-300 dark:border-gray-700">
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-white" colspan="4">
                      {{ t('common.totals', 'Totales') }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                      {{ formatNumber(totalDebit) }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                      {{ formatNumber(totalCredit) }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-gray-700 dark:text-gray-300">
                      {{ formatNumber(totalDebitForeign) }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-gray-700 dark:text-gray-300">
                      {{ formatNumber(totalCreditForeign) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Print Signatures Section -->
            <div class="hidden print:grid grid-cols-3 gap-6 pt-16 mt-12 text-center text-xs">
              <div class="border-t border-gray-400 pt-2">
                <p class="font-semibold">Elaborado Por</p>
              </div>
              <div class="border-t border-gray-400 pt-2">
                <p class="font-semibold">Revisado Por</p>
              </div>
              <div class="border-t border-gray-400 pt-2">
                <p class="font-semibold">Aprobado Por</p>
              </div>
            </div>
          </div>

          <!-- Footer Actions Bar -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center no-print">
            <div>
              <!-- Balance Integrity Indicator -->
              <span 
                v-if="entry"
                class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Asiento Integrado y Cuadrado
              </span>
            </div>

            <div class="flex gap-3">
              <!-- Close -->
              <button
                type="button"
                @click="handleClose"
                class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                {{ t('common.close', 'Cerrar') }}
              </button>

              <!-- Quick Post (only for draft) -->
              <button
                v-if="entry && entry.status === 'draft' && authStore.hasPermission('accountant')"
                @click="postEntry"
                :disabled="isPostSubmitting"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm"
              >
                <svg v-if="isPostSubmitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ t('accounting.post', 'Asentar') }}
              </button>

              <!-- Quick Reverse (only for posted) -->
              <button
                v-if="entry && entry.status === 'posted' && authStore.hasPermission('admin')"
                @click="reverseEntry"
                :disabled="isReverseSubmitting"
                class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm"
              >
                <svg v-if="isReverseSubmitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ t('accounting.reverse', 'Reversar') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import entriesService from '@/services/entries'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  entryId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'post-success', 'reverse-success'])

// ── State ────────────────────────────────────────────────
const entry = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')

const isPostSubmitting = ref(false)
const isReverseSubmitting = ref(false)

// ── Computed Totals ──────────────────────────────────────
const totalDebit = computed(() => {
  if (!entry.value || !entry.value.items) return 0
  return entry.value.items.reduce((sum, item) => sum + (parseFloat(item.debit_local) || 0), 0)
})

const totalCredit = computed(() => {
  if (!entry.value || !entry.value.items) return 0
  return entry.value.items.reduce((sum, item) => sum + (parseFloat(item.credit_local) || 0), 0)
})

const totalDebitForeign = computed(() => {
  if (!entry.value || !entry.value.items) return 0
  return entry.value.items.reduce((sum, item) => sum + (parseFloat(item.debit_foreign) || 0), 0)
})

const totalCreditForeign = computed(() => {
  if (!entry.value || !entry.value.items) return 0
  return entry.value.items.reduce((sum, item) => sum + (parseFloat(item.credit_foreign) || 0), 0)
})

// ── Data Fetching ────────────────────────────────────────
const fetchDetails = async () => {
  if (!props.entryId) {
    entry.value = null
    return
  }
  loading.value = true
  error.value = ''
  try {
    const response = await entriesService.get(props.entryId)
    entry.value = response.data
  } catch (err) {
    console.error('Error loading entry details:', err)
    error.value = t('accounting.errorLoadingEntry', 'Error al cargar los detalles del asiento')
  } finally {
    loading.value = false
  }
}

// ── Watchers ─────────────────────────────────────────────
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchDetails()
  } else {
    entry.value = null
    error.value = ''
    success.value = ''
  }
})

watch(() => props.entryId, () => {
  if (props.modelValue) {
    fetchDetails()
  }
})

// ── Actions ──────────────────────────────────────────────
const handleClose = () => {
  if (!loading.value && !isPostSubmitting.value && !isReverseSubmitting.value) {
    emit('update:modelValue', false)
  }
}

const printVoucher = () => {
  window.print()
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}

const postEntry = async () => {
  if (!confirm(t('accounting.confirmPost', '¿Está seguro de que desea asentar este asiento?'))) return
  isPostSubmitting.value = true
  error.value = ''
  try {
    await entriesService.post(entry.value.id)
    success.value = t('accounting.entryPosted', 'Asiento asentado con éxito')
    emit('post-success', entry.value.id)
    await fetchDetails()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('common.error', 'Ocurrió un error al asentar')
  } finally {
    isPostSubmitting.value = false
  }
}

const reverseEntry = async () => {
  const dateStr = prompt(
    t('accounting.reversalDatePrompt', 'Ingrese la fecha para el asiento de reversión (YYYY-MM-DD):'),
    new Date().toISOString().split('T')[0]
  )
  if (!dateStr) return
  isReverseSubmitting.value = true
  error.value = ''
  try {
    await entriesService.reverse(entry.value.id, dateStr)
    success.value = t('accounting.entryReversed', 'Asiento reversado con éxito')
    emit('reverse-success', entry.value.id)
    await fetchDetails()
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('common.error', 'Ocurrió un error al reversar')
  } finally {
    isReverseSubmitting.value = false
  }
}
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  .printable-voucher, .printable-voucher * {
    visibility: visible;
  }
  .printable-voucher {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none !important;
    border: none !important;
    background: white !important;
    color: black !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>
