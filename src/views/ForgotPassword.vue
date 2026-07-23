<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import ThemeToggle from '../components/ThemeToggle.vue'
import ParticleBackground from '../components/Background.vue'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const email = ref('')
const error = ref('')
const successMessage = ref('')
const loading = ref(false)

const handleForgotPassword = async (e) => {
  e.preventDefault()
  
  error.value = ''
  successMessage.value = ''
  loading.value = true
  
  try {
    // Backend endpoint POST /auth/forgot-password is not implemented yet
    error.value = t('auth.featureNotAvailable') || 'La recuperación de contraseña por correo electrónico no está configurada en este momento. Contacte a un administrador.'
  } catch (err) {
    console.error('Forgot password error:', err)
    error.value = err.response?.data?.message || t('auth.forgotPasswordFailed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
    <!-- Particle Background -->
    <ParticleBackground />
    
    <!-- Theme Toggle Button -->
    <div class="absolute top-4 right-4 z-10">
      <ThemeToggle />
    </div>
    
    <!-- Forgot Password Form -->
    <Transition name="fade" appear>
      <div class="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-8 relative z-10">
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

        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100">{{ $t('auth.forgotPassword') }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mt-2">{{ $t('auth.forgotPasswordSubtitle') }}</p>
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-6">
          <Transition name="error-slide">
            <div v-if="error" class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded shadow-md flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span class="flex-1">{{ error }}</span>
            </div>
          </Transition>

          <Transition name="error-slide">
            <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded shadow-md flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="flex-1">{{ successMessage }}</span>
            </div>
          </Transition>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-100">{{ $t('auth.email') }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:bg-gray-700"
              :placeholder="$t('auth.emailPlaceholder')"
            />
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            >
              {{ loading ? $t('auth.sendingEmail') : $t('auth.sendResetLink') }}
            </button>
          </div>
          
          <div class="text-center mt-4">
            <router-link :to="{ name: 'login' }" class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {{ $t('auth.backToLogin') }}
            </router-link>
          </div>
        </form>
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

.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s ease-out;
}

.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
