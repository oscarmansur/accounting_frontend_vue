<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="handleClose">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black opacity-30"></div>
        
        <!-- Modal Panel -->
        <div class="relative bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl z-10">
          
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            :disabled="loading"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <KeyIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ $t('users.changePassword') }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span v-if="fetchingUser" class="animate-pulse">{{ $t('users.loadingUser') }}</span>
                <span v-else>
                  {{ $t('users.changePasswordSubtitle', { name: targetUser?.name || '' }) }}
                </span>
              </p>
            </div>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleResetPassword" class="space-y-4">
            
            <!-- Error / Success Alerts -->
            <Transition name="alert-slide">
              <div v-if="error" class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 rounded text-sm flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span class="flex-1 font-medium">{{ error }}</span>
              </div>
            </Transition>

            <Transition name="alert-slide">
              <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-3 rounded text-sm flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="flex-1 font-medium">{{ successMessage }}</span>
              </div>
            </Transition>

            <div class="space-y-4">
              <!-- New Password -->
              <div>
                <label for="modal-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ $t('auth.password') }}
                </label>
                <div class="relative">
                  <input
                    id="modal-password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    :disabled="loading || fetchingUser || isForbiddenAdmin"
                    class="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:bg-gray-700 disabled:opacity-60 transition-colors"
                    :placeholder="$t('users.passwordPlaceholder')"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    tabindex="-1"
                  >
                    <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                    <EyeSlashIcon v-else class="w-5 h-5" />
                  </button>
                </div>
                <p v-if="isPasswordTooShort" class="text-xs text-red-500 mt-1">
                  {{ $t('users.passwordMinLength') }}
                </p>
              </div>

              <!-- Confirm New Password -->
              <div>
                <label for="modal-confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ $t('users.confirmPassword') }}
                </label>
                <input
                  id="modal-confirmPassword"
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :disabled="loading || fetchingUser || isForbiddenAdmin"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:bg-gray-700 disabled:opacity-60 transition-colors"
                  :placeholder="$t('users.confirmPasswordPlaceholder')"
                  :class="{ 'border-red-500 dark:border-red-500 focus:ring-red-500': passwordMismatch }"
                />
                <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">
                  {{ $t('users.passwordMismatch') }}
                </p>
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                type="button"
                @click="handleClose"
                :disabled="loading"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {{ $t('common.cancel') }}
              </button>
              
              <button
                type="submit"
                :disabled="loading || fetchingUser || passwordMismatch || isPasswordTooShort || isForbiddenAdmin"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                <span v-if="loading" class="flex items-center mr-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ $t('users.savingPassword') }}
                </span>
                <span v-else>{{ $t('users.changePassword') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const authStore = useAuthStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  userId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const targetUser = ref(null)
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const successMessage = ref('')
const loading = ref(false)
const fetchingUser = ref(false)
const showPassword = ref(false)

const isOwnPassword = computed(() => {
  return authStore.user && props.userId && String(authStore.user.id) === String(props.userId)
})

const isForbiddenAdmin = computed(() => {
  return targetUser.value && targetUser.value.role === 'admin' && !isOwnPassword.value
})

const passwordMismatch = computed(() => {
  return password.value !== confirmPassword.value && confirmPassword.value.length > 0
})

const isPasswordTooShort = computed(() => {
  return password.value.length > 0 && password.value.length < 6
})

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.userId) {
    fetchUserInfo()
  } else if (!newVal) {
    resetForm()
  }
})

watch(() => props.userId, (newVal) => {
  if (props.modelValue && newVal) {
    fetchUserInfo()
  }
})

const fetchUserInfo = async () => {
  try {
    fetchingUser.value = true
    error.value = ''
    successMessage.value = ''
    password.value = ''
    confirmPassword.value = ''
    
    const response = await api.get(`/users/${props.userId}`)
    targetUser.value = response.data
    
    if (isForbiddenAdmin.value) {
      error.value = t('users.forbiddenAdmin')
    }
  } catch (err) {
    console.error('Error fetching user info:', err)
    error.value = t('users.saveError') + ' ' + (err.response?.data?.message || err.message)
  } finally {
    fetchingUser.value = false
  }
}

const resetForm = () => {
  password.value = ''
  confirmPassword.value = ''
  error.value = ''
  successMessage.value = ''
  loading.value = false
  showPassword.value = false
  targetUser.value = null
}

const handleClose = () => {
  if (!loading.value) {
    emit('update:modelValue', false)
  }
}

const handleResetPassword = async () => {
  if (isForbiddenAdmin.value) {
    error.value = t('users.forbiddenAdmin')
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = t('users.passwordMismatch')
    return
  }

  if (password.value.length < 6) {
    error.value = t('users.passwordMinLength')
    return
  }

  error.value = ''
  successMessage.value = ''
  loading.value = true
  
  try {
    await api.patch(`/users/${props.userId}`, { password: password.value })
    successMessage.value = t('users.passwordChangedSuccessfully')
    
    emit('success')
    
    setTimeout(() => {
      handleClose()
    }, 1500)

  } catch (err) {
    console.error('Reset password error:', err)
    error.value = err.response?.data?.message || t('users.changePasswordError')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.3s ease-out;
}

.alert-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
