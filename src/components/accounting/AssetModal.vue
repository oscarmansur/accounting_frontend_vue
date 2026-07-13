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
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        
        <div class="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ t('assets.createAssetTitle') }}
            </h3>
            <button
              @click="handleClose"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Body -->
            <div class="space-y-4">
              <!-- Code & Date -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('common.code') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.code"
                    type="text"
                    required
                    placeholder="EQ-001"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('assets.purchaseDate') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.purchase_date"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('common.name') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="Computadora Portátil Dell"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Value, Residual, Life -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('assets.purchaseValue') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.purchase_value"
                    type="number"
                    step="0.01"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('assets.residualValue') }}
                  </label>
                  <input
                    v-model="formData.residual_value"
                    type="number"
                    step="0.01"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('assets.usefulLifeMonths') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.useful_life_months"
                    type="number"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Accounts mapping -->
              <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <p class="text-xs text-gray-500 dark:text-gray-400 italic">{{ t('assets.accountsMappingNote') }}</p>
                <AccountSelect
                  v-model="formData.depreciation_account_id"
                  :accounts="accounts"
                  :label="t('assets.depreciationAccount')"
                  :placeholder="t('assets.selectDepreciationAccount')"
                  only-selectable
                />
                <AccountSelect
                  v-model="formData.expense_account_id"
                  :accounts="accounts"
                  :label="t('assets.expenseAccount')"
                  :placeholder="t('assets.selectExpenseAccount')"
                  only-selectable
                />
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                @click="handleClose"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || !formData.code || !formData.name || !formData.purchase_value"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ t('common.save') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AccountSelect from './AccountSelect.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  accounts: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formData = ref({
  code: '',
  name: '',
  purchase_date: new Date().toISOString().split('T')[0],
  purchase_value: 0,
  residual_value: 0,
  useful_life_months: 12,
  depreciation_account_id: null,
  expense_account_id: null
})

const isSubmitting = ref(false)

const resetForm = () => {
  formData.value = {
    code: '',
    name: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_value: 0,
    residual_value: 0,
    useful_life_months: 12,
    depreciation_account_id: null,
    expense_account_id: null
  }
}

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('update:modelValue', false)
  }
}

const handleSubmit = () => {
  isSubmitting.value = true
  emit('submit', {
    data: { ...formData.value },
    onComplete: () => {
      isSubmitting.value = false
      resetForm()
    }
  })
}
</script>
