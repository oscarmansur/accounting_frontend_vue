<template>
  <div class="relative" ref="selectContainer">
    <!-- Label -->
    <label 
      v-if="label" 
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Select Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      class="w-full px-3 py-2 text-left border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      :class="[
        disabled 
          ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60' 
          : 'bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer',
        error 
          ? 'border-red-500 dark:border-red-500' 
          : 'border-gray-300 dark:border-gray-600',
        'text-gray-900 dark:text-white'
      ]"
    >
      <div class="flex items-center justify-between">
        <span :class="selectedOption ? '' : 'text-gray-500 dark:text-gray-400'">
          {{ displayText }}
        </span>
        <svg 
          class="w-5 h-5 transition-transform duration-200"
          :class="[
            isOpen ? 'transform rotate-180' : '',
            'text-gray-400 dark:text-gray-500'
          ]"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>

    <!-- Dropdown -->
    <Teleport to="body">
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="dropdownElement"
          class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden"
          :style="dropdownStyle"
        >
        <!-- Search Input -->
        <div class="p-2 border-b border-gray-200 dark:border-gray-700">
          <div class="relative">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keydown.down.prevent="navigateOptions('down')"
              @keydown.up.prevent="navigateOptions('up')"
              @keydown.enter.prevent="selectHighlightedOption"
              @keydown.esc="closeDropdown"
            />
            <svg 
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Options List -->
        <div class="overflow-y-auto max-h-64">
          <div
            v-if="filteredOptions.length === 0"
            class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center"
          >
            {{ emptyMessage }}
          </div>
          
          <button
            v-for="(option, index) in filteredOptions"
            :key="getOptionValue(option)"
            type="button"
            @click="selectOption(option)"
            @mouseenter="highlightedIndex = index"
            class="w-full px-4 py-2 text-left transition-colors duration-150 focus:outline-none"
            :class="[
              highlightedIndex === index 
                ? 'bg-blue-50 dark:bg-blue-900/30' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700',
              isSelected(option) 
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                : 'text-gray-900 dark:text-white'
            ]"
          >
            <slot name="option" :option="option" :is-selected="isSelected(option)">
              <div class="flex items-center justify-between">
                <span>{{ getOptionLabel(option) }}</span>
                <svg 
                  v-if="isSelected(option)"
                  class="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </slot>
          </button>
        </div>

        <!-- Clear Selection -->
        <div 
          v-if="clearable && selectedOption"
          class="p-2 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            type="button"
            @click="clearSelection"
            class="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            {{ clearText }}
          </button>
        </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Seleccione una opción'
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar...'
  },
  emptyMessage: {
    type: String,
    default: 'No se encontraron resultados'
  },
  clearText: {
    type: String,
    default: 'Limpiar selección'
  },
  optionLabel: {
    type: [String, Function],
    default: 'label'
  },
  optionValue: {
    type: [String, Function],
    default: 'value'
  },
  searchKeys: {
    type: Array,
    default: () => []
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'search'])

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(0)
const selectContainer = ref(null)
const searchInput = ref(null)
const dropdownElement = ref(null)
const dropdownPosition = ref('bottom') // 'top' or 'bottom'
const dropdownStyle = ref({})

// Get option label
const getOptionLabel = (option) => {
  if (!option) return ''
  if (typeof props.optionLabel === 'function') {
    return props.optionLabel(option)
  }
  return option[props.optionLabel] || option
}

// Get option value
const getOptionValue = (option) => {
  if (!option) return null
  if (typeof props.optionValue === 'function') {
    return props.optionValue(option)
  }
  return option[props.optionValue] !== undefined ? option[props.optionValue] : option
}

// Selected option
const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find(option => getOptionValue(option) === props.modelValue)
})

// Display text
const displayText = computed(() => {
  if (selectedOption.value) {
    return getOptionLabel(selectedOption.value)
  }
  return props.placeholder
})

// Filter options based on search
const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase().trim()
  
  return props.options.filter(option => {
    // Search in custom keys if provided
    if (props.searchKeys.length > 0) {
      return props.searchKeys.some(key => {
        // Support nested keys like 'cliente.identificador'
        const value = getNestedValue(option, key)
        return value && String(value).toLowerCase().includes(query)
      })
    }
    
    // Default: search in label
    const label = getOptionLabel(option)
    return label && String(label).toLowerCase().includes(query)
  })
})

// Helper function to get nested values
const getNestedValue = (obj, path) => {
  if (!obj || !path) return null
  
  // Split path by dots to handle nested properties
  const keys = path.split('.')
  let value = obj
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return null
    }
  }
  
  return value
}

// Check if option is selected
const isSelected = (option) => {
  return getOptionValue(option) === props.modelValue
}

// Toggle dropdown
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

// Calculate dropdown position
const calculateDropdownPosition = () => {
  if (!selectContainer.value) return
  
  const containerRect = selectContainer.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const spaceBelow = viewportHeight - containerRect.bottom
  const spaceAbove = containerRect.top
  
  const el = dropdownElement.value
  const dropdownHeight = el ? el.getBoundingClientRect().height : 320
  
  // Calculate position relative to viewport/document
  const width = `${containerRect.width}px`
  const left = `${containerRect.left + window.scrollX}px`
  
  let top = ''
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    // Render on top
    top = `${containerRect.top + window.scrollY - dropdownHeight - 4}px`
  } else {
    // Render below
    top = `${containerRect.bottom + window.scrollY + 4}px`
  }
  
  dropdownStyle.value = {
    position: 'absolute',
    width,
    left,
    top,
    zIndex: 9999
  }
}

// Close dropdown
const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = 0
}

// Select option
const selectOption = (option) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', option)
  closeDropdown()
}

// Clear selection
const clearSelection = () => {
  emit('update:modelValue', null)
  emit('change', null)
  closeDropdown()
}

// Navigate options with keyboard
const navigateOptions = (direction) => {
  if (direction === 'down') {
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
  } else if (direction === 'up') {
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  }
}

// Select highlighted option
const selectHighlightedOption = () => {
  if (filteredOptions.value.length > 0) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  }
}

// Click outside handler
const handleClickOutside = (event) => {
  const clickOnContainer = selectContainer.value && selectContainer.value.contains(event.target)
  const clickOnDropdown = dropdownElement.value && dropdownElement.value.contains(event.target)
  
  if (!clickOnContainer && !clickOnDropdown) {
    closeDropdown()
  }
}

// Watch for dropdown open
watch(isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    calculateDropdownPosition()
    searchInput.value?.focus()
    highlightedIndex.value = 0
  }
})

// Watch search query
watch(searchQuery, (newValue) => {
  emit('search', newValue)
  highlightedIndex.value = 0
})

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', calculateDropdownPosition, true)
  window.addEventListener('resize', calculateDropdownPosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', calculateDropdownPosition, true)
  window.removeEventListener('resize', calculateDropdownPosition)
})
</script>
