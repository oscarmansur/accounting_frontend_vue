<script setup>
/**
 * BankReconciliation view - Upload statement lines and run reconciliation algorithm.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import bankService from '@/services/bank'
import accountingService from '@/services/accounting'
import AccountSelect from '@/components/accounting/AccountSelect.vue'

const { t } = useI18n()

// State
const accounts = ref([])
const loadingAccounts = ref(false)
const uploading = ref(false)
const reconciling = ref(false)
const error = ref('')
const success = ref('')

// Reconciliation result
const reconResult = ref(null)

// Form state for Statement
const statementDate = ref(new Date().toISOString().split('T')[0])
const statementRef = ref('')
const bankAccountCode = ref('') // Selected bank account code from COA
const selectedAccountObj = ref(null) // Object representing selected bank account

// Table lines for statement upload
const statementLines = ref([
  { date: new Date().toISOString().split('T')[0], reference: '', description: '', amount: 0 }
])

const addLine = () => {
  statementLines.value.push({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    amount: 0
  })
}

const removeLine = (index) => {
  if (statementLines.value.length > 1) {
    statementLines.value.splice(index, 1)
  }
}

const fetchAccounts = async () => {
  loadingAccounts.value = true
  try {
    const response = await accountingService.getFlat()
    // Filter only Asset accounts that are selectable (usually bank accounts start with asset prefix, e.g. level >= 2)
    accounts.value = response.data.filter(a => a.account_type === 'asset')
  } catch (err) {
    console.error('Error fetching accounts:', err)
  } finally {
    loadingAccounts.value = false
  }
}

// Watch for account change to assign bankAccountCode
const handleAccountChange = (id) => {
  const acc = accounts.value.find(a => a.id === id)
  if (acc) {
    bankAccountCode.value = acc.code
    selectedAccountObj.value = acc
  } else {
    bankAccountCode.value = ''
    selectedAccountObj.value = null
  }
}

const handleUpload = async () => {
  if (!statementRef.value || !bankAccountCode.value) {
    error.value = 'Referencia y cuenta bancaria son requeridas'
    return
  }
  uploading.value = true
  error.value = ''
  success.value = ''
  try {
    const payload = {
      date: statementDate.value,
      reference: statementRef.value,
      bank_account: bankAccountCode.value,
      lines: statementLines.value.map(l => ({
        ...l,
        amount: parseFloat(l.amount)
      }))
    }
    await bankService.uploadStatement(payload)
    success.value = t('bank.uploadSuccess')
    // Reset statement lines
    statementLines.value = [
      { date: new Date().toISOString().split('T')[0], reference: '', description: '', amount: 0 }
    ]
    statementRef.value = ''
    setTimeout(() => success.value = '', 4000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al subir el extracto bancario'
  } finally {
    uploading.value = false
  }
}

const handleReconcile = async () => {
  if (!bankAccountCode.value) {
    error.value = 'Seleccione una cuenta bancaria antes de conciliar'
    return
  }
  reconciling.value = true
  error.value = ''
  success.value = ''
  reconResult.value = null
  try {
    const response = await bankService.reconcile(bankAccountCode.value)
    reconResult.value = response.data
    success.value = t('bank.reconcileSuccess')
    setTimeout(() => success.value = '', 5000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al ejecutar la conciliación'
  } finally {
    reconciling.value = false
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)
}

onMounted(() => {
  fetchAccounts()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('nav.bankReconciliation') }}</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('bank.description') }}</p>
    </div>

    <!-- Alert banners -->
    <div v-if="error" class="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex justify-between">
      <span>{{ error }}</span>
      <button @click="error = ''" class="font-bold">&times;</button>
    </div>
    <div v-if="success" class="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
      {{ success }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Section 1: Upload Statement (left two columns) -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('bank.uploadTitle') }}</h2>
          
          <!-- Header inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('common.date') }}</label>
              <input
                v-model="statementDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{{ t('bank.reference') }}</label>
              <input
                v-model="statementRef"
                type="text"
                placeholder="EXT-001"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="space-y-0.5">
              <AccountSelect
                :model-value="selectedAccountObj?.id"
                @update:model-value="handleAccountChange"
                :accounts="accounts"
                :label="t('bank.bankAccount')"
                :placeholder="t('bank.selectBankAccount')"
                only-selectable
              />
            </div>
          </div>

          <!-- Dynamic statement lines table -->
          <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
            <table class="min-w-full">
              <thead class="bg-gray-50 dark:bg-gray-700/30">
                <tr class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th class="px-4 py-2.5 text-left w-32">{{ t('common.date') }}</th>
                  <th class="px-4 py-2.5 text-left w-36">{{ t('bank.lineRef') }}</th>
                  <th class="px-4 py-2.5 text-left">{{ t('common.description') }}</th>
                  <th class="px-4 py-2.5 text-right w-36">{{ t('bank.amount') }}</th>
                  <th class="px-4 py-2.5 text-center w-12"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                <tr v-for="(line, index) in statementLines" :key="index" class="text-sm">
                  <td class="px-3 py-2">
                    <input
                      v-model="line.date"
                      type="date"
                      class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="line.reference"
                      type="text"
                      placeholder="Ref..."
                      class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="line.description"
                      type="text"
                      placeholder="Descripción..."
                      class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="line.amount"
                      type="number"
                      step="0.01"
                      class="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs text-right font-mono"
                    />
                  </td>
                  <td class="px-3 py-2 text-center">
                    <button
                      @click="removeLine(index)"
                      :disabled="statementLines.length === 1"
                      class="text-red-500 hover:text-red-700 disabled:opacity-30 text-lg leading-none"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center">
            <button
              @click="addLine"
              type="button"
              class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              + {{ t('bank.addLine') }}
            </button>

            <button
              @click="handleUpload"
              :disabled="uploading"
              class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <svg v-if="uploading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ t('bank.uploadBtn') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Section 2: Reconcile Trigger & Results (right column) -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ t('bank.reconcileTitle') }}</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {{ t('bank.reconcileDesc') }}
          </p>

          <div class="space-y-1.5">
            <span class="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">{{ t('bank.targetAccount') }}</span>
            <p v-if="selectedAccountObj" class="text-sm font-semibold text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
              {{ selectedAccountObj.code }} - {{ selectedAccountObj.name }}
            </p>
            <p v-else class="text-sm text-gray-400 italic">
              {{ t('bank.noAccountSelected') }}
            </p>
          </div>

          <button
            @click="handleReconcile"
            :disabled="reconciling || !bankAccountCode"
            class="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <svg v-if="reconciling" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ t('bank.reconcileBtn') }}
          </button>
        </div>

        <!-- Reconciliation Results panel -->
        <div v-if="reconResult" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 transition-all animate-fadeIn">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-100 dark:border-gray-700 pb-2">{{ t('bank.resultTitle') }}</h3>
          
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-blue-50/50 dark:bg-blue-900/10 p-2.5 rounded-lg">
              <span class="block text-xs font-semibold text-blue-500 dark:text-blue-400">{{ t('bank.totalLines') }}</span>
              <span class="text-xl font-bold font-mono text-blue-700 dark:text-blue-300">{{ reconResult.total_lines }}</span>
            </div>
            <div class="bg-emerald-50/50 dark:bg-emerald-900/10 p-2.5 rounded-lg">
              <span class="block text-xs font-semibold text-emerald-500 dark:text-emerald-400">{{ t('bank.matched') }}</span>
              <span class="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">{{ reconResult.matched }}</span>
            </div>
            <div class="bg-amber-50/50 dark:bg-amber-900/10 p-2.5 rounded-lg">
              <span class="block text-xs font-semibold text-amber-500 dark:text-amber-400">{{ t('bank.unmatched') }}</span>
              <span class="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">{{ reconResult.unmatched }}</span>
            </div>
          </div>

          <!-- Matching List -->
          <div v-if="reconResult.matches && reconResult.matches.length > 0" class="space-y-2">
            <h4 class="text-xs font-bold text-gray-600 dark:text-gray-400">{{ t('bank.reconciledList') }}</h4>
            <div class="max-h-56 overflow-y-auto space-y-2 pr-1">
              <div v-for="(match, idx) in reconResult.matches" :key="idx" class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-xs border border-gray-100 dark:border-gray-700/50">
                <div class="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                  <span>{{ match.description || 'Transacción Bancaria' }}</span>
                  <span class="font-mono text-emerald-600 dark:text-emerald-400">{{ formatCurrency(match.amount) }}</span>
                </div>
                <div class="flex justify-between text-gray-400 mt-1">
                  <span>Ref: {{ match.reference }}</span>
                  <span>{{ match.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
