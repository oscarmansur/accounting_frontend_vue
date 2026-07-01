<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="internalVisible" class="loading-overlay">
        <div class="loading-content">
          <!-- Animated spinner with gradient -->
          <div class="spinner-container">
            <div class="spinner"></div>
            <div class="spinner-glow"></div>
          </div>
          
          <!-- Loading text with animation -->
          <div class="loading-text">
            <span>{{ text }}</span>
            <span class="dots">
              <span class="dot">.</span>
              <span class="dot">.</span>
              <span class="dot">.</span>
            </span>
          </div>
          
          <!-- Optional progress bar -->
          <div v-if="showProgress" class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { t } from 'i18n'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: t('loading')
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  minDisplayTime: {
    type: Number,
    default: 800 // Tiempo mínimo en milisegundos (0 para desactivar)
  }
})

const internalVisible = ref(false)
const isHiding = ref(false)
let showTimestamp = 0
let hideTimeout = null

// Limpiar timeout previo
const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

// Controlar el tiempo mínimo de visualización
watch(() => props.isVisible, (shouldShow, wasShowing) => {
  // console.log('🔄 isVisible cambió:', { shouldShow, wasShowing, minDisplayTime: props.minDisplayTime })
  
  if (shouldShow) {
    // MOSTRAR: Cancelar cualquier ocultación pendiente y mostrar inmediatamente
    clearHideTimeout()
    isHiding.value = false
    internalVisible.value = true
    showTimestamp = Date.now()
    //console.log('✅ Mostrando overlay en:', showTimestamp)
  } else if (!isHiding.value) {
    // OCULTAR: Solo si no estamos ya en proceso de ocultar
    isHiding.value = true
    
    const elapsed = Date.now() - showTimestamp
    const remaining = Math.max(0, props.minDisplayTime - elapsed)
    
    //console.log('⏱️ Tiempo transcurrido:', elapsed, 'ms')
    //console.log('⏱️ Tiempo restante:', remaining, 'ms')
    
    if (remaining > 0 && props.minDisplayTime > 0) {
      // Esperar el tiempo restante
      //console.log('⏳ Esperando', remaining, 'ms antes de ocultar')
      hideTimeout = setTimeout(() => {
        //console.log('❌ Ocultando overlay después de espera')
        internalVisible.value = false
        isHiding.value = false
        showTimestamp = 0
      }, remaining)
    } else {
      // Ocultar inmediatamente
      //console.log('❌ Ocultando overlay inmediatamente')
      internalVisible.value = false
      isHiding.value = false
      showTimestamp = 0
    }
  }
}, { immediate: true })

// Limpiar timeout al desmontar el componente
onUnmounted(() => {
  clearHideTimeout()
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: overlayAppear 0.3s ease-out;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Spinner Container */
.spinner-container {
  position: relative;
  width: 80px;
  height: 80px;
}

/* Main Spinner */
.spinner {
  width: 80px;
  height: 80px;
  border: 4px solid transparent;
  border-top-color: #3b82f6;
  border-right-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  position: relative;
  z-index: 2;
}

.spinner::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border: 4px solid transparent;
  border-top-color: #ec4899;
  border-left-color: #f59e0b;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse;
}

/* Glow Effect */
.spinner-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
  z-index: 1;
}

/* Loading Text */
.loading-text {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dots {
  display: inline-flex;
  gap: 0.125rem;
}

.dot {
  animation: dotPulse 1.4s ease-in-out infinite;
  opacity: 0;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* Progress Bar */
.progress-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  border-radius: 2px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
}

@keyframes dotPulse {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes overlayAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Transition Classes */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-active .spinner-container {
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .spinner-container {
    width: 60px;
    height: 60px;
  }
  
  .spinner {
    width: 60px;
    height: 60px;
  }
  
  .spinner-glow {
    width: 60px;
    height: 60px;
  }
  
  .loading-text {
    font-size: 1rem;
  }
  
  .progress-bar {
    width: 150px;
  }
}
</style>
