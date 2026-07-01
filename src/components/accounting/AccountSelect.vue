<template>
  <SearchableSelect
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :options="selectableAccounts"
    :option-label="accountLabel"
    option-value="id"
    :search-keys="['code', 'name']"
    :placeholder="placeholder"
    :label="label"
    :required="required"
    :disabled="disabled"
    :error="error"
    :clearable="clearable"
    search-placeholder="Buscar por código o nombre..."
    empty-message="No se encontraron cuentas"
    clear-text="Quitar selección"
  >
    <!-- Custom option rendering -->
    <template #option="{ option, isSelected }">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2" :class="{ 'opacity-50': !option.is_selectable }">
          <!-- Folder icon for parent accounts -->
          <svg
            v-if="!option.is_selectable"
            class="w-4 h-4 text-amber-500 flex-shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <!-- Dot for selectable accounts -->
          <div
            v-else
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="accountTypeColor(option.account_type)"
          ></div>

          <div>
            <span class="text-xs font-mono text-gray-500 dark:text-gray-400 mr-1.5">{{ option.code }}</span>
            <span
              class="text-sm"
              :class="option.is_selectable
                ? 'text-gray-900 dark:text-white font-medium'
                : 'text-gray-500 dark:text-gray-400 italic'"
            >
              {{ option.name }}
            </span>
          </div>
        </div>

        <!-- Check icon -->
        <svg
          v-if="isSelected"
          class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
    </template>
  </SearchableSelect>
</template>

<script setup>
import { computed } from 'vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'

const props = defineProps({
  modelValue: { type: String, default: null },
  accounts: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Seleccione una cuenta...' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  clearable: { type: Boolean, default: true },
  /** If true, only show selectable (leaf) accounts */
  onlySelectable: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

/**
 * Filter accounts: always show in the dropdown, but only allow
 * selecting is_selectable accounts.
 */
const selectableAccounts = computed(() => {
  if (props.onlySelectable) {
    return props.accounts.filter(a => a.is_selectable)
  }
  return props.accounts
})

/**
 * Display label: code - name
 */
const accountLabel = (account) => {
  return `${account.code} - ${account.name}`
}

/**
 * Color dot based on account type.
 */
const accountTypeColor = (type) => {
  const colors = {
    asset: 'bg-blue-500',
    liability: 'bg-red-500',
    equity: 'bg-purple-500',
    revenue: 'bg-emerald-500',
    expense: 'bg-amber-500'
  }
  return colors[type] || 'bg-gray-400'
}
</script>
