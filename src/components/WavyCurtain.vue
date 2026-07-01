<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()

// Computes the user's name or a default welcome message
const userName = computed(() => {
  if (authStore.user && authStore.user.name) {
    return `${t('auth.welcomeBack')}, ${authStore.user.name}`
  }
  return t('auth.welcomeBack')
})
</script>

<template>
  <Transition name="curtain">
    <div v-if="show" class="curtain-container">
      <!-- Wavy curtain layers -->
      <div class="wave-layer wave-1"></div>
      <div class="wave-layer wave-2"></div>
      <div class="wave-layer wave-3"></div>
      
      <!-- Logo and welcome text -->
      <div class="content">
        <div class="logo-container">
          <div class="logo">
            <img src="/favicon.svg" alt="Logo" class="w-16 h-16 rounded-2xl shadow-2xl">
          </div>
          <h2 class="brand-name">Admin Panel</h2>
        </div>
        
        <div class="welcome-container">
          <h3 class="welcome-text">{{ userName }}</h3>
          <div class="loading-bar">
            <div class="loading-progress"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.curtain-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
  overflow: hidden;
}

/* WAVES */
.wave-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  opacity: 0.15;
  transform-origin: center;
}

.wave-1 {
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8), transparent 60%);
  animation: waveMotion 15s infinite linear;
}

.wave-2 {
  background: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.6), transparent 50%);
  animation: waveMotion 10s infinite linear reverse;
}

.wave-3 {
  background: radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4), transparent 40%);
  animation: waveMotion 20s infinite linear;
}

@keyframes waveMotion {
  0% { transform: translate(-25%, -25%) rotate(0deg) scale(1.5); }
  50% { transform: translate(-25%, -25%) rotate(180deg) scale(1.2); }
  100% { transform: translate(-25%, -25%) rotate(360deg) scale(1.5); }
}

/* CONTENT STYLES */
.content {
  position: relative;
  z-index: 20;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: slideDown 0.8s ease-out;
}

.logo {
  background: rgba(255, 255, 255, 0.25);
  padding: 1rem;
  border-radius: 1.5rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.3);
  animation: float 6s ease-in-out infinite;
}

.brand-name {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.025em;
  text-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.welcome-container {
  animation: fadeIn 1s ease-out 0.3s backwards;
}

.welcome-text {
  font-size: 1.5rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
}

.loading-progress {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 4px;
  animation: progress 2s ease-in-out infinite;
  transform-origin: left;
}

/* ANIMATIONS */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes progress {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(0.7); }
  100% { transform: scaleX(1); opacity: 0; }
}

@keyframes slideDown {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* CURTAIN TRANSITION */
.curtain-enter-active,
.curtain-leave-active {
  transition: clip-path 1.2s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.5s ease;
}

.curtain-enter-from {
  clip-path: polygon(0 0, 100% 0, 100% 0, 0 0); /* Closed at top */
}

.curtain-enter-to {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); /* Fully Open cover */
}

.curtain-leave-from {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.curtain-leave-to {
  clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%); /* Closes to bottom */
}
</style>
