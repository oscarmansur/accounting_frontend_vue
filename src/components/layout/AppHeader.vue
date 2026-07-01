<template>
  <header class="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 transition-colors duration-200">
    <div class="h-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-full">
        <!-- Left section: Logo and menu toggle -->
        <div class="flex items-center space-x-4">
          <!-- Mobile menu button -->
          <button
            type="button"
            class="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-150"
            @click="$emit('toggle-mobile-menu')"
          >
            <span class="sr-only">{{ props.isSidebarOpen ? 'Cerrar menú' : 'Abrir menú' }}</span>
            <svg 
              v-if="props.isSidebarOpen" 
              class="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg 
              v-else 
              class="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Desktop sidebar toggle -->
          <button
            type="button"
            class="hidden lg:block p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-150"
            @click="$emit('toggle-sidebar')"
          >
            <span class="sr-only">{{ props.isSidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar' }}</span>
            <svg 
              class="h-6 w-6 transition-transform duration-300" 
              :class="{ 'rotate-180': props.isSidebarOpen }"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Logo -->
          <div class="flex justify-center">
            <div class="flex items-center space-x-2 sm:space-x-3 group">
              <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Contabilidad
              </span>
            </div>
          </div>
        </div>

        <!-- Center section: Spacer -->
        <div class="hidden md:flex flex-1"></div>

        <!-- Right section: Company Switcher + User menu -->
        <div class="flex items-center space-x-3">
          <CompanySwitcher />
          <LanguageSelector />
          <ThemeToggle />
          <UserDropdown :user="user" @logout="$emit('logout')" />
        </div>
      </div>
    </div>


  </header>
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue';
import UserDropdown from './UserDropdown.vue';
import LanguageSelector from '@/components/common/LanguageSelector.vue';
import CompanySwitcher from './CompanySwitcher.vue';

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  isSidebarOpen: {
    type: Boolean,
    default: true
  }
});

defineEmits(['toggle-sidebar', 'toggle-mobile-menu', 'logout']);
</script>
