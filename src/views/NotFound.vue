<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full text-center">
      <!-- 404 Illustration -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <span class="text-white font-bold text-4xl">404</span>
        </div>
      </div>

      <!-- Error Message -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('errors.notFound') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ t('errors.notFoundMessage') }}
        </p>
        
        <!-- Current URL Display -->
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">{{ t('errors.currentUrl') }}</div>
          <div class="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
            {{ currentUrl }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="goHome"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          <HomeIcon class="w-5 h-5" />
          {{ t('errors.goHome') }}
        </button>
        
        <button
          @click="goBack"
          class="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          {{ t('errors.goBack') }}
        </button>
      </div>

      <!-- Help Links -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
          {{ t('errors.helpLinks') }}
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link
            to="/"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            {{ t('errors.dashboard') }}
          </router-link>
          <router-link
            to="/users"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            {{ t('errors.users') }}
          </router-link>
          <router-link
            to="/settings"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            {{ t('errors.settings') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

const router = useRouter()
const currentUrl = ref('')

onMounted(() => {
  currentUrl.value = window.location.href
})

const goHome = () => {
  router.push({ name: 'dashboard' })
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
/* Add subtle animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div[class*="max-w-md"] {
  animation: fadeInUp 0.5s ease-out;
}
</style>