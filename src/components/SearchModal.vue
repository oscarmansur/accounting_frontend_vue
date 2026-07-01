<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform -translate-y-4 scale-95"
          enter-to-class="opacity-100 transform translate-y-0 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 transform translate-y-0 scale-100"
          leave-to-class="opacity-0 transform -translate-y-4 scale-95"
        >
          <div
            v-if="isOpen"
            class="w-full max-w-2xl mx-4 mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style="max-height: calc(100vh - 8rem);"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Buscar
              </h3>
              <button
                type="button"
                class="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                @click="closeModal"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Search Bar (sin dropdown) -->
            <div class="p-4 flex-shrink-0">
              <SearchBar
                v-model="localSearchQuery"
                placeholder="Buscar usuarios, reportes..."
                :results="[]"
                :show-dropdown="false"
                @search="handleSearch"
                @clear="handleClear"
              />
            </div>

            <!-- Content Area (altura fija con scroll) -->
            <div class="flex-1 overflow-y-auto min-h-[300px]">
              <!-- Search Results -->
              <div v-if="localSearchQuery && results.length > 0" class="px-4 pb-4">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Resultados
                </p>
                <div class="space-y-2">
                  <button
                    v-for="(result, index) in results"
                    :key="index"
                    class="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-700 border border-transparent transition-all duration-150 text-left"
                    @click="handleSelect(result)"
                  >
                    <span class="text-2xl flex-shrink-0">{{ result.initial }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {{ result.title }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {{ result.description }}
                      </p>
                    </div>
                    <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- No Results -->
              <div v-else-if="localSearchQuery && results.length === 0" class="px-4 pb-4">
                <div class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No se encontraron resultados</p>
                  <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Intenta con otros términos de búsqueda</p>
                </div>
              </div>

              <!-- Quick Access -->
              <div v-else class="px-4 pb-4">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Acceso Rápido
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    v-for="route in quickAccessRoutes"
                    :key="route.name"
                    class="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-700 border border-transparent transition-all duration-150 text-left"
                    @click="handleQuickAccess(route)"
                  >
                    <span class="text-2xl flex-shrink-0">{{ route.icon }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {{ route.title }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {{ route.description }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
                Presiona <kbd class="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">ESC</kbd> para cerrar
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import SearchBar from './SearchBar.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  results: {
    type: Array,
    default: () => []
  },
  quickAccessRoutes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:isOpen', 'update:modelValue', 'search', 'select', 'clear']);

const localSearchQuery = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  localSearchQuery.value = newValue;
});

watch(localSearchQuery, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeModal = () => {
  emit('update:isOpen', false);
  // Limpiar búsqueda al cerrar
  setTimeout(() => {
    localSearchQuery.value = '';
    emit('clear');
  }, 200);
};

const handleSearch = (query) => {
  emit('search', query);
};

const handleSelect = (route) => {
  emit('select', route);
  closeModal();
};

const handleClear = () => {
  emit('clear');
};

const handleQuickAccess = (route) => {
  emit('select', route);
  closeModal();
};

// Keyboard shortcuts
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>
