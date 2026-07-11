<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import ThemeToggle from '../components/ThemeToggle.vue'
import ParticleBackground from '../components/Background.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const error = ref('')
const successMessage = ref('')
const loading = ref(true)
const token = ref('')

onMounted(async () => {
  token.value = route.query.token
  if (!token.value) {
    error.value = t('auth.invalidToken') || 'Invalid or missing verification token.'
    loading.value = false
    return
  }
  
  try {
    await authStore.verifyEmail(token.value)
    successMessage.value = t('auth.emailVerifiedSuccess') || 'Email verified successfully! You can now login.'
    // Redirect after delay
    setTimeout(() => {
        router.push({ name: 'login' })
    }, 3000)
  } catch (err) {
    console.error('Verification error:', err)
    error.value = err.response?.data?.message || t('auth.emailVerificationFailed') || 'Email verification failed.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
    <!-- Particle Background -->
    <ParticleBackground />
    
    <!-- Theme Toggle Button -->
    <div class="absolute top-4 right-4 z-10">
      <ThemeToggle />
    </div>
    
    <!-- Verification Card -->
    <Transition name="fade" appear>
      <div class="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-8 relative z-10 text-center">
        <!-- Logo -->
        <div class="flex justify-center mb-6">
          <div class="flex items-center space-x-3 group">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <img src="/favicon.svg" alt="Logo" class="w-12 h-12 rounded-xl">
            </div>
            <span class="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {{ $t('auth.adminPanel') }}
            </span>
          </div>
        </div>

        <div class="mb-8">
          <div v-if="loading" class="flex flex-col items-center">
            <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ $t('auth.verifyingEmail') || 'Verifying Email...' }}</h2>
          </div>
          
          <div v-else-if="successMessage" class="flex flex-col items-center">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{{ $t('auth.verified') || 'Verified!' }}</h2>
            <p class="text-green-600 dark:text-green-400">{{ successMessage }}</p>
          </div>
          
          <div v-else class="flex flex-col items-center">
             <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{{ $t('auth.verificationError') || 'Verification Error' }}</h2>
            <p class="text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
        </div>

        <div class="text-center mt-6">
            <router-link :to="{ name: 'login' }" class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {{ $t('auth.backToLogin') }}
            </router-link>
          </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: all 0.6s ease-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
