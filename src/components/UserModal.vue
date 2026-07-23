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
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        
        <div class="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ isEditing ? (mode === 'global' ? t('users.editUser') : t('users.editMember')) : (mode === 'global' ? t('users.createUser') : t('users.addMember')) }}
            </h3>
            <button
              @click="handleClose"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-4">
              <!-- Fila 1: Nombre Completo -->
              <div v-if="mode === 'global' || !isEditing">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('users.fullName') }} <span v-if="mode === 'global'" class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.full_name"
                  type="text"
                  :required="mode === 'global'"
                  :placeholder="mode === 'global' ? t('users.fullNamePlaceholder') : 'Ej: Juan Pérez (Opcional)'"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <!-- Fila 2: Email (ocupa toda la fila) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('auth.email') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  required
                  :placeholder="t('users.emailPlaceholder')"
                  :disabled="isEditing"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                />
                <p v-if="isEditing" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ t('users.emailCannotChange') }}
                </p>
              </div>

              <!-- Fila 3: Contraseña y Confirmar Contraseña (solo para crear globalmente) -->
              <div v-if="mode === 'global' && !isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('auth.password') }} <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="formData.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      minlength="6"
                      :placeholder="t('users.passwordPlaceholder')"
                      class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ t('users.passwordMinLength') }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('users.confirmPassword') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    :placeholder="t('users.confirmPasswordPlaceholder')"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    :class="{ 'border-red-500': passwordMismatch }"
                  />
                  <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">
                    {{ t('users.passwordMismatch') }}
                  </p>
                </div>
              </div>

              <!-- Fila 4: Rol y Estado -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ mode === 'global' ? t('users.role') : t('users.roleSelector') }} <span class="text-red-500">*</span>
                  </label>
                  
                  <!-- Rol Global -->
                  <select
                    v-if="mode === 'global'"
                    v-model="formData.is_superuser"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option :value="true">{{ t('users.superuser') }}</option>
                    <option :value="false">{{ t('users.user') }}</option>
                  </select>

                  <!-- Rol Tenant -->
                  <select
                    v-else
                    v-model="formData.role"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="owner">{{ t('users.role_owner') }}</option>
                    <option value="admin">{{ t('users.role_admin') }}</option>
                    <option value="accountant">{{ t('users.role_accountant') }}</option>
                    <option value="viewer">{{ t('users.role_viewer') }}</option>
                  </select>
                  
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ isEditing ? t('users.canChangeRole') : t('users.selectRole') }}
                  </p>
                </div>

                <div v-if="mode === 'global' && isEditing">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('users.status') }}
                  </label>
                  <label class="flex items-center space-x-2">
                    <input
                      v-model="formData.isActive"
                      type="checkbox"
                      class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ t('users.userActive') }}
                    </span>
                  </label>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ t('users.deactivateUser') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                @click="handleClose"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || (mode === 'global' && !isEditing && passwordMismatch)"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="!isSubmitting">{{ isEditing ? t('common.update') : (mode === 'global' ? t('users.createUser') : t('users.addMember')) }}</span>
                <span v-else class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('common.loading') }}
                </span>
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

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'global' // 'global' or 'tenant'
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formData = ref({
  full_name: '',
  email: '',
  is_superuser: false,
  role: 'viewer',
  password: '',
  confirmPassword: '',
  isActive: true
})

const showPassword = ref(false)
const isSubmitting = ref(false)

const isEditing = computed(() => !!props.user)

const passwordMismatch = computed(() => {
  if (isEditing.value) return false
  return formData.value.password !== formData.value.confirmPassword && formData.value.confirmPassword.length > 0
})

const resetForm = () => {
  formData.value = {
    full_name: '',
    email: '',
    is_superuser: false,
    role: 'viewer',
    password: '',
    confirmPassword: '',
    isActive: true
  }
  showPassword.value = false
}

// Watch for user prop changes to populate form
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      full_name: newUser.full_name || '',
      email: newUser.email || '',
      is_superuser: newUser.is_superuser ?? false,
      role: newUser.role || 'viewer',
      password: '',
      confirmPassword: '',
      isActive: newUser.is_active ?? true
    }
    showPassword.value = false
  } else {
    resetForm()
  }
}, { immediate: true })

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('update:modelValue', false)
  }
}

const handleSubmit = () => {
  // Validar contraseñas si es creación global
  if (props.mode === 'global' && !isEditing.value && formData.value.password !== formData.value.confirmPassword) {
    return
  }

  isSubmitting.value = true

  const data = {}
  
  if (props.mode === 'global') {
    data.full_name = formData.value.full_name.trim()
    data.email = formData.value.email.trim().toLowerCase()
    data.is_superuser = formData.value.is_superuser
    if (!isEditing.value) {
      data.password = formData.value.password
    } else {
      data.is_active = formData.value.isActive
    }
  } else {
    // Tenant member mode
    if (isEditing.value) {
      data.role = formData.value.role
    } else {
      data.email = formData.value.email.trim().toLowerCase()
      data.role = formData.value.role
      if (formData.value.full_name.trim()) {
        data.full_name = formData.value.full_name.trim()
      }
    }
  }

  emit('submit', {
    data,
    isEditing: isEditing.value,
    userId: props.user?.id, // En tenant mode esto es el membership_id
    onComplete: () => {
      isSubmitting.value = false
      if (!isEditing.value) {
        resetForm()
      }
    }
  })
}
</script>

