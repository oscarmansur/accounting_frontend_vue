<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      :class="buttonClass"
    >
      <span class="w-5 h-3.5 shadow-sm rounded-sm overflow-hidden flex-shrink-0 flex items-center" v-html="flags[currentLocale]"></span>
      <span class="hidden md:inline">{{ currentLanguage.name }}</span>
      <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div 
        v-show="isOpen" 
        class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
        :class="dropdownPosition"
      >
        <div class="py-1">
          <button
            v-for="lang in availableLanguages"
            :key="lang.code"
            @click="selectLanguage(lang.code)"
            class="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': currentLocale === lang.code }"
          >
            <span class="w-6 h-4 mr-2 shadow-sm rounded-sm overflow-hidden flex-shrink-0" v-html="flags[lang.code]"></span>
            <span>{{ lang.name }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Click outside handler -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-40" 
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/vue/24/outline'
import { changeLanguage, getAvailableLanguages, getCurrentLanguage } from '../../plugins/i18n'

const props = defineProps({
  buttonClass: {
    type: String,
    default: ''
  },
  dropdownPosition: {
    type: String,
    default: 'origin-top-right'
  }
})

const { locale } = useI18n()
const isOpen = ref(false)
const availableLanguages = getAvailableLanguages()

const currentLocale = computed(() => getCurrentLanguage())
const currentLanguage = computed(() => 
  availableLanguages.find(lang => lang.code === currentLocale.value) || availableLanguages[0]
)

const flags = {
  en: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24"><path fill="#B22234" d="M0 0h36v24H0z"/><path fill="#FFF" d="M0 3h36v3H0zm0 6h36v3H0zm0 6h36v3H0zm0 6h36v3H0z"/><path fill="#3C3B6E" d="M0 0h18v13H0z"/><g fill="#FFF"><circle cx="2" cy="2" r="1"/><circle cx="6" cy="2" r="1"/><circle cx="10" cy="2" r="1"/><circle cx="14" cy="2" r="1"/><circle cx="4" cy="4" r="1"/><circle cx="8" cy="4" r="1"/><circle cx="12" cy="4" r="1"/><circle cx="16" cy="4" r="1"/><circle cx="2" cy="6" r="1"/><circle cx="6" cy="6" r="1"/><circle cx="10" cy="6" r="1"/><circle cx="14" cy="6" r="1"/><circle cx="4" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="2" cy="10" r="1"/><circle cx="6" cy="10" r="1"/><circle cx="10" cy="10" r="1"/><circle cx="14" cy="10" r="1"/></g></svg>',
  es: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24"><rect fill="#c60b1e" width="36" height="24"/><rect fill="#ffc400" y="6" width="36" height="12"/><path fill="#c60b1e" d="M7 11h4v3c0 1.1-.9 2-2 2s-2-.9-2-2v-3z"/></svg>'
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectLanguage = (langCode) => {
  changeLanguage(langCode)
  locale.value = langCode
  closeDropdown()
}
</script>