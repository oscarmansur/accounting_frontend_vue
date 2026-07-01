<template>
  <div 
    v-if="show"
    class="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 border border-yellow-200 dark:border-yellow-800"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          {{ title }}
        </h3>
        <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          <p>{{ message }}</p>
        </div>
        <div v-if="showBackButton" class="mt-4">
          <button
            @click="goBack"
            class="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-600 dark:hover:text-yellow-100"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Permisos Insuficientes'
  },
  message: {
    type: String,
    default: 'No tienes permisos para acceder a esta funcionalidad.'
  },
  showBackButton: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()

const goBack = () => {
  router.push({ name: 'dashboard' })
}
</script>
