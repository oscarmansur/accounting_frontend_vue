<template>
  <TransitionRoot as="template" :show="modelValue">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form @submit.prevent="handleSubmit">
                <div class="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div v-if="icon" class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full" :class="iconBgClass">
                      <component :is="icon" class="h-6 w-6" :class="iconClass" aria-hidden="true" />
                    </div>
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        {{ title }}
                      </DialogTitle>
                      
                      <div class="mt-4">
                        <slot :formData="formData" :errors="errors" :isSubmitting="isSubmitting"></slot>
                        
                        <!-- Auto-generated form fields -->
                        <div v-if="fields.length > 0" class="space-y-4">
                          <div 
                            v-for="field in fields" 
                            :key="field.name"
                            class="space-y-1"
                          >
                            <label :for="field.name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {{ field.label }} <span v-if="field.required" class="text-red-500">*</span>
                            </label>
                            
                            <!-- Text input -->
                            <input
                              v-if="field.type === 'text' || field.type === 'email' || field.type === 'password'"
                              :id="field.name"
                              v-model="formData[field.name]"
                              :type="field.type"
                              :placeholder="field.placeholder"
                              :required="field.required"
                              :disabled="isSubmitting"
                              class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 dark:bg-gray-700"
                              :class="{ 'ring-red-500': errors[field.name] }"
                            />
                            
                            <!-- Textarea -->
                            <textarea
                              v-else-if="field.type === 'textarea'"
                              :id="field.name"
                              v-model="formData[field.name]"
                              :placeholder="field.placeholder"
                              :rows="field.rows || 3"
                              :required="field.required"
                              :disabled="isSubmitting"
                              class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 dark:bg-gray-700"
                              :class="{ 'ring-red-500': errors[field.name] }"
                            ></textarea>
                            
                            <!-- Select -->
                            <select
                              v-else-if="field.type === 'select'"
                              :id="field.name"
                              v-model="formData[field.name]"
                              :required="field.required"
                              :disabled="isSubmitting"
                              class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 dark:bg-gray-700"
                              :class="{ 'ring-red-500': errors[field.name] }"
                            >
                              <option v-if="field.placeholder" value="" disabled>{{ field.placeholder }}</option>
                              <option 
                                v-for="option in field.options" 
                                :key="option.value" 
                                :value="option.value"
                              >
                                {{ option.label }}
                              </option>
                            </select>
                            
                            <!-- Checkbox -->
                            <div v-else-if="field.type === 'checkbox'" class="flex items-center">
                              <input
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="checkbox"
                                :disabled="isSubmitting"
                                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                              />
                              <label :for="field.name" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                {{ field.label }}
                              </label>
                            </div>
                            
                            <!-- Error message -->
                            <p v-if="errors[field.name]" class="mt-1 text-sm text-red-600 dark:text-red-400">
                              {{ errors[field.name] }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    <span v-if="isSubmitting" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ submitButtonText }}...
                    </span>
                    <span v-else>{{ submitButtonText }}</span>
                  </button>
                  
                  <button
                    type="button"
                    :disabled="isSubmitting"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 sm:mt-0 sm:w-auto"
                    @click="closeModal"
                  >
                    {{ cancelButtonText }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Form'
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  iconClass: {
    type: String,
    default: 'text-blue-600'
  },
  iconBgClass: {
    type: String,
    default: 'bg-blue-100'
  },
  fields: {
    type: Array,
    default: () => []
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  submitButtonText: {
    type: String,
    default: 'Save'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  validationRules: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// Reactive state
const formData = ref({})
const errors = ref({})
const isSubmitting = ref(false)

// Initialize form data
const initializeFormData = () => {
  const data = {}
  props.fields.forEach(field => {
    data[field.name] = props.initialData[field.name] ?? field.defaultValue ?? ''
  })
  formData.value = data
  errors.value = {}
}

// Watch for modal open/close
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    initializeFormData()
  }
})

// Validation
const validateField = (fieldName, value) => {
  const rules = props.validationRules[fieldName]
  if (!rules) return null
  
  for (const rule of rules) {
    const error = rule(value, formData.value)
    if (error) return error
  }
  return null
}

const validateForm = () => {
  const newErrors = {}
  
  props.fields.forEach(field => {
    if (field.required && !formData.value[field.name]) {
      newErrors[field.name] = `${field.label} is required`
    } else {
      const error = validateField(field.name, formData.value[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    }
  })
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Event handlers
const closeModal = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  errors.value = {}
  
  try {
    await emit('submit', { 
      data: { ...formData.value }, 
      isEditing: Object.keys(props.initialData).length > 0 
    })
    closeModal()
  } catch (error) {
    // Handle submission errors
    if (error.fieldErrors) {
      errors.value = error.fieldErrors
    } else {
      // Generic error
      errors.value = { form: error.message || 'An error occurred' }
    }
  } finally {
    isSubmitting.value = false
  }
}

// Initialize on mount if modal is initially open
if (props.modelValue) {
  initializeFormData()
}
</script>