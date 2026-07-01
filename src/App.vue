<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useContextStore } from './stores/context'
import ScrollToTop from './components/common/ScrollToTop.vue'
import WavyCurtain from './components/WavyCurtain.vue'

const authStore = useAuthStore()
const contextStore = useContextStore()

onMounted(async () => {
  authStore.checkAuth()

  // Auto-load tenant/company context if already authenticated
  if (authStore.isAuthenticated) {
    try {
      await contextStore.loadTenants()
    } catch (e) {
      console.warn('Context init skipped:', e)
    }
  }
})
</script>

<template>
  <div>
    <WavyCurtain :show="authStore.showWelcomeAnimation" />
    <router-view />
    <ScrollToTop />
  </div>
</template>
