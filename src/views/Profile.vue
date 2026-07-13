<script setup>
/**
 * User Profile view (Mi Perfil)
 * Integrates with auth store and handles PATCH /users/me
 */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

// State
const fullName = ref(authStore.user?.full_name || '')
const email = ref(authStore.user?.email || '')
const newPassword = ref('')
const confirmPassword = ref('')

const loadingProfile = ref(false)
const loadingPassword = ref(false)

const profileError = ref('')
const profileSuccess = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

// Computed
const userInitials = computed(() => {
  const name = authStore.user?.full_name || authStore.user?.email || 'A'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase()
})

const userRole = computed(() => {
  if (authStore.isSuperuser) return t('common.admin')
  return authStore.user?.role || 'viewer'
})

// Methods
const handleUpdateProfile = async () => {
  if (!fullName.value || !email.value) {
    profileError.value = t('profile.fieldsRequired')
    return
  }

  loadingProfile.value = true
  profileError.value = ''
  profileSuccess.value = ''

  try {
    await authStore.updateProfile({
      full_name: fullName.value,
      email: email.value
    })
    profileSuccess.value = t('profile.updatedSuccess')
  } catch (err) {
    profileError.value = err.response?.data?.detail || 'Error al actualizar perfil'
  } finally {
    loadingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    passwordError.value = t('profile.fieldsRequired')
    return
  }

  if (newPassword.value.length < 8) {
    passwordError.value = t('profile.passwordLength')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = t('profile.passwordMismatch')
    return
  }

  loadingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    await authStore.updateProfile({
      password: newPassword.value
    })
    passwordSuccess.value = t('profile.passwordSuccess')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    passwordError.value = err.response?.data?.detail || 'Error al cambiar contraseña'
  } finally {
    loadingPassword.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('profile.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('profile.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- User Card (Left) -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col items-center p-6 text-center h-fit">
        <div class="relative group">
          <div class="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20 transform group-hover:scale-105 transition-transform duration-300">
            {{ userInitials }}
          </div>
          <span class="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800 shadow-sm"></span>
        </div>

        <h2 class="mt-4 text-lg font-bold text-gray-900 dark:text-white capitalize">
          {{ authStore.user?.full_name || t('common.user') }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate w-full px-4">
          {{ authStore.user?.email }}
        </p>

        <!-- Details list -->
        <div class="w-full mt-6 border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4 text-left">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">{{ t('profile.role') }}</span>
            <span class="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {{ userRole }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">{{ t('profile.status') }}</span>
            <span class="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              {{ t('common.active') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Forms (Right / 2 Columns wide) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Info Form -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
            <span class="text-xl">👤</span>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ t('profile.personalData') }}</h3>
          </div>

          <!-- Messages -->
          <div v-if="profileError" class="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {{ profileError }}
          </div>
          <div v-if="profileSuccess" class="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
            {{ profileSuccess }}
          </div>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('profile.fullName') }}
                </label>
                <input
                  v-model="fullName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('profile.email') }}
                </label>
                <input
                  v-model="email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="submit"
                :disabled="loadingProfile"
                class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <svg v-if="loadingProfile" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ loadingProfile ? t('profile.updating') : t('profile.updateProfile') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Password Change Form -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
            <span class="text-xl">🔑</span>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ t('profile.changePassword') }}</h3>
          </div>

          <!-- Messages -->
          <div v-if="passwordError" class="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {{ passwordError }}
          </div>
          <div v-if="passwordSuccess" class="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
            {{ passwordSuccess }}
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('profile.newPassword') }}
                </label>
                <input
                  v-model="newPassword"
                  type="password"
                  required
                  minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('profile.confirmNewPassword') }}
                </label>
                <input
                  v-model="confirmPassword"
                  type="password"
                  required
                  minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="submit"
                :disabled="loadingPassword"
                class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <svg v-if="loadingPassword" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ loadingPassword ? t('profile.updating') : t('profile.changePassword') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
