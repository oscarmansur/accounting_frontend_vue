<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import ThemeToggle from '../components/ThemeToggle.vue'
import ParticleBackground from '../components/TruckBackground.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const successMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)
const token = ref('')

onMounted(() => {
  token.value = route.query.token
  if (!token.value) {
    error.value = t('auth.invalidToken') || 'Invalid or missing reset token.'
  }
})

const handleResetPassword = async (e) => {
  e.preventDefault()
  
  if (password.value !== confirmPassword.value) {
    error.value = t('users.passwordMismatch')
    return
  }

  error.value = ''
  successMessage.value = ''
  loading.value = true
  
  try {
    await authStore.resetPassword(token.value, password.value)
    successMessage.value = t('auth.passwordResetSuccess') || 'Password reset successfully! Redirecting...'
    
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)

  } catch (err) {
    console.error('Reset password error:', err)
    error.value = err.response?.data?.message || t('auth.passwordResetFailed')
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
    
    <!-- Reset Password Form -->
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
          <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100">{{ $t('auth.resetPassword') }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mt-2">{{ $t('auth.resetPasswordSubtitle') }}</p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-6">
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
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-100">{{ $t('users.passwordPlaceholder') }}</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:bg-gray-700"
                :placeholder="$t('auth.passwordPlaceholder')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 top-1 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                tabindex="-1"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <div>
             <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-100">{{ $t('users.confirmPassword') }}</label>
             <input
               id="confirmPassword"
               v-model="confirmPassword"
               :type="showPassword ? 'text' : 'password'"
               required
               class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:bg-gray-700"
               :placeholder="$t('users.confirmPasswordPlaceholder')"
             />
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            >
              {{ loading ? $t('auth.resetingPassword') : $t('auth.resetPasswordButton') }}
            </button>
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
