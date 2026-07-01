<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        No tienes los permisos necesarios para acceder a esta sección. Contacta a tu administrador si crees que esto es un error.
      </p>
      <button
        @click="router.push({ name: 'dashboard' })"
        class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
      >
        Volver al Panel
      </button>
    </div>
  </div>
</template>
