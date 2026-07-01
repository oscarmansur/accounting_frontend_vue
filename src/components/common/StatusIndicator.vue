<template>
  <div 
    class="flex items-center gap-3 px-3 py-2 transition-all duration-300 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
    :title="tooltipText"
    @click="manualCheck"
  >
    <!-- Status Indicator Light -->
    <div class="relative flex h-3 w-3 flex-shrink-0">
      <span
        v-if="status === 'online'"
        class="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"
      ></span>
      <span
        v-else-if="status === 'checking'"
        class="absolute inline-flex w-full h-full bg-yellow-400 rounded-full opacity-75 animate-pulse"
      ></span>
      <span
        class="relative inline-flex rounded-full h-3 w-3 transition-all duration-300 border-2"
        :class="{
          'bg-green-500 border-green-300 shadow-[0_0_12px_rgba(34,197,94,0.8)]': status === 'online',
          'bg-red-500 border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.8)]': status === 'offline' || status === 'error',
          'bg-yellow-500 border-yellow-300': status === 'checking'
        }"
      ></span>
    </div>
    
    <!-- Status Text -->
    <div
      class="flex flex-col overflow-hidden transition-all duration-300"
      :class="[
        isOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'
      ]"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold leading-none text-gray-800 dark:text-gray-100 whitespace-nowrap">
          {{ statusLabel }}
        </span>
        <span 
          v-if="uptimeFormatted" 
          class="text-[9px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap"
        >
          {{ uptimeFormatted }}
        </span>
      </div>
      <span class="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-1 whitespace-nowrap flex items-center gap-1">
        <span>{{ statusSubLabel }}</span>
        <span v-if="latency !== null" class="font-mono">
          ({{ latency }}ms)
        </span>
      </span>
    </div>
    
    <!-- Manual Refresh Icon -->
    <div 
      v-if="isOpen"
      class="ml-auto opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      :class="{ 'animate-spin transition duration-700 delay-700': checking == true }"
      @click.stop="manualCheck"
      :title="t('status.checkNow')"
    >
      <ArrowPathIcon 
        class="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

// Reactive state
const status = ref('checking')
const statusLabel = ref(t('status.checking'))
const statusSubLabel = ref(t('status.connecting'))
const tooltipText = ref(t('status.performingCheck'))
const latency = ref(null)
const uptime = ref(0)
const lastChecked = ref(null)
const checking = ref(false)

// API configuration
const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/v1').replace(/\/$/, '')
const HEALTH_POLL_MS = 30000 // Check every 30 seconds

// Computed properties
const uptimeFormatted = computed(() => {
  if (uptime.value <= 0) return ''
  
  const seconds = Math.floor(uptime.value)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return t('status.uptimeHoursMinutes', { hours, minutes })
  } else if (minutes > 0) {
    return t('status.uptimeMinutesSeconds', { minutes, seconds: secs })
  } else {
    return t('status.uptimeSeconds', { seconds: secs })
  }
})

// Status management
const setState = (newStatus, labelKey, subLabelKey, tooltipTextValue) => {
  status.value = newStatus
  statusLabel.value = t(labelKey)
  statusSubLabel.value = t(subLabelKey)
  tooltipText.value = tooltipTextValue
}

// Health check function
const checkStatus = async () => {
  checking.value = true
  const startTime = Date.now()
  
  try {
    // console.log('🔍 StatusIndicator: Checking health at', `${apiUrl}/health`)
    setState('checking', 'status.checking', 'status.contactingBackend', t('status.performingCheck'))
    
    const baseUrl = new URL(apiUrl).origin
    const response = await fetch(`${baseUrl}/health`, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    const endTime = Date.now()
    latency.value = endTime - startTime
    lastChecked.value = new Date()
    
    console.log('📊 StatusIndicator: Response status', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    // console.log('✅ StatusIndicator: Health data received', data)
    
    // Parse the actual API response
    if (data.status === 'ok' || data.status === 'OK') {
      uptime.value = data.uptime || 0
      setState(
        'online',
        'status.online',
        'status.backendActive',
        t('status.tooltipOnline', {
          lastChecked: t('status.lastChecked', { time: lastChecked.value.toLocaleTimeString() }),
          latency: t('status.latency', { ms: latency.value }),
          status: t('common.status'),
          uptime: uptimeFormatted.value
        })
      )
    // console.log('🟢 StatusIndicator: Backend is ONLINE')
    } else {
      throw new Error(data.message || 'Unknown backend status')
    }
    
  } catch (error) {
    latency.value = null
    lastChecked.value = new Date()
    
    //console.error('🔴 StatusIndicator: Health check failed', error)
    
    setState(
      'offline',
      'status.offline',
      'status.backendUnavailable',
      t('status.tooltipOffline', {
        errorMessage: error.message,
        lastChecked: t('status.lastChecked', { time: lastChecked.value.toLocaleTimeString() })
      })
    )
    
    console.warn('Health check failed:', error)
  } finally {
    setTimeout(() => {
      checking.value = false
    }, 700)
  }
}

// Manual check function
const manualCheck = () => {
  if (status.value !== 'checking') {
    checkStatus()
  }
}

// Polling management
let intervalId

onMounted(() => {
  checkStatus()
  intervalId = setInterval(checkStatus, HEALTH_POLL_MS)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
