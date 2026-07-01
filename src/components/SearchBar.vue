<template>
  <div class="relative w-full max-w-md">
    <!-- Search Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg 
          class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors duration-200" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-10 pr-10 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
        @input="handleInput"
        @keydown.enter="handleSearch"
        @focus="isFocused = true"
        @blur="handleBlur"
      />
      
      <!-- Clear button -->
      <button
        v-if="searchQuery"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
        @click="clearSearch"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Search Results Dropdown (Optional) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 transform scale-95"
      enter-to-class="opacity-100 transform scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 transform scale-100"
      leave-to-class="opacity-0 transform scale-95"
    >
      <div
        v-if="showResults && searchQuery && results.length > 0"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto"
      >
        <ul class="py-2">
          <li
            v-for="(result, index) in results"
            :key="index"
            class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
            @click="selectResult(result)"
          >
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span class="text-white text-xs font-semibold">{{ result.initial }}</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ result.title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ result.description }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
    
    <!-- No Results Message -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 transform scale-95"
      enter-to-class="opacity-100 transform scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 transform scale-100"
      leave-to-class="opacity-0 transform scale-95"
    >
      <div
        v-if="showResults && searchQuery && results.length === 0"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        <div class="px-4 py-6 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No se encontraron resultados</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  modelValue: {
    type: String,
    default: ''
  },
  // Array of search results to display
  results: {
    type: Array,
    default: () => []
  },
  // Enable/disable dropdown results
  showDropdown: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'search', 'select', 'clear']);

const searchQuery = ref(props.modelValue);
const isFocused = ref(false);
const showResults = ref(false);

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue;
});

// Watch for changes in searchQuery
watch(searchQuery, (newValue) => {
  emit('update:modelValue', newValue);
  
  if (props.showDropdown && newValue) {
    showResults.value = true;
  } else {
    showResults.value = false;
  }
});

const handleInput = () => {
  emit('search', searchQuery.value);
};

const handleSearch = () => {
  emit('search', searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  showResults.value = false;
  emit('clear');
};

const selectResult = (result) => {
  emit('select', result);
  showResults.value = false;
};

const handleBlur = () => {
  // Delay hiding results to allow click events to fire
  setTimeout(() => {
    isFocused.value = false;
    showResults.value = false;
  }, 200);
};
</script>
