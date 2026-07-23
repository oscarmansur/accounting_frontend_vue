<script setup>
/**
 * SubscriptionManagement view - Allows tenant owner/admin to view/update subscription tiers.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import subscriptionsService from '@/services/subscriptions'
import { SparklesIcon, CheckIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

// State
const currentSubscription = ref(null)
const loading = ref(false)
const updatingPlan = ref(null)
const error = ref('')
const success = ref('')

const plans = computed(() => [
  {
    type: 'basic',
    name: t('subscription.basicName'),
    price: '$0',
    period: t('subscription.periodForever'),
    description: t('subscription.basicDesc'),
    features: [
      t('subscription.featBasic1'),
      t('subscription.featBasic2'),
      t('subscription.featBasic3'),
      t('subscription.featBasic4'),
      t('subscription.featBasic5')
    ],
    bgClass: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-0'
  },
  {
    type: 'pro',
    name: t('subscription.proName'),
    price: '$29',
    period: t('subscription.periodMonth'),
    description: t('subscription.proDesc'),
    features: [
      t('subscription.featPro1'),
      t('subscription.featPro2'),
      t('subscription.featPro3'),
      t('subscription.featPro4'),
      t('subscription.featPro5'),
      t('subscription.featPro6')
    ],
    bgClass: 'bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-800 border-blue-200 dark:border-blue-800 ring-2 ring-blue-600 dark:ring-blue-500 z-10 shadow-md',
    popular: true
  },
  {
    type: 'enterprise',
    name: t('subscription.enterpriseName'),
    price: '$99',
    period: t('subscription.periodMonth'),
    description: t('subscription.enterpriseDesc'),
    features: [
      t('subscription.featEnt1'),
      t('subscription.featEnt2'),
      t('subscription.featEnt3'),
      t('subscription.featEnt4'),
      t('subscription.featEnt5'),
      t('subscription.featEnt6')
    ],
    bgClass: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-0'
  }
])

const fetchSubscription = async () => {
  loading.value = true
  try {
    const response = await subscriptionsService.getCurrent()
    currentSubscription.value = response.data
  } catch (err) {
    error.value = t('subscription.fetchError')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleUpdatePlan = async (planType) => {
  if (currentSubscription.value?.plan_type === planType) return
  
  updatingPlan.value = planType
  error.value = ''
  success.value = ''
  
  try {
    const response = await subscriptionsService.update({
      plan_type: planType,
      status: 'active'
    })
    currentSubscription.value = response.data
    const matchedPlan = plans.value.find(p => p.type === planType)
    success.value = t('subscription.updateSuccess', { plan: matchedPlan?.name })
    setTimeout(() => success.value = '', 5000)
  } catch (err) {
    error.value = err.response?.data?.detail || t('subscription.updateError')
  } finally {
    updatingPlan.value = null
  }
}

const formatDate = (dateString) => {
  if (!dateString) return t('subscription.noDate')
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(fetchSubscription)
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center space-y-3">
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
        <SparklesIcon class="w-8 h-8 text-yellow-500" />
        {{ t('subscription.title') }}
      </h1>
      <p class="max-w-2xl mx-auto text-base text-gray-500 dark:text-gray-400">
        {{ t('subscription.description') }}
      </p>
      
      <!-- Current Plan Status Banner -->
      <div v-if="currentSubscription" class="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-sm font-medium shadow-sm mt-4">
        <ShieldCheckIcon class="w-5 h-5 text-indigo-500" />
        <span>{{ t('subscription.currentStatus') }} <strong class="uppercase font-semibold">{{ currentSubscription.plan_type }}</strong></span>
        <span class="text-gray-300 dark:text-gray-600">|</span>
        <span>{{ t('subscription.status') }} <span class="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded text-xs uppercase font-semibold">{{ currentSubscription.status }}</span></span>
        <template v-if="currentSubscription.expires_at">
          <span class="text-gray-300 dark:text-gray-600">|</span>
          <span>{{ t('subscription.expiresAt') }} {{ formatDate(currentSubscription.expires_at) }}</span>
        </template>
      </div>
    </div>

    <!-- Alert banners -->
    <transition name="fade">
      <div v-if="error" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 max-w-4xl mx-auto">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        <span>{{ error }}</span>
        <button @click="error = ''" class="ml-auto text-red-500 hover:text-red-700">&times;</button>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="success" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 max-w-4xl mx-auto">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
        <span>{{ success }}</span>
      </div>
    </transition>

    <!-- Pricing Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-stretch">
      <div 
        v-for="plan in plans" 
        :key="plan.type"
        class="flex flex-col justify-between p-8 rounded-2xl border shadow-sm relative transition-all duration-300"
        :class="plan.bgClass"
      >
        <div>
          <!-- Popular plan indicator inside flow -->
          <div v-if="plan.popular" class="mb-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              <SparklesIcon class="w-3.5 h-3.5" />
              {{ t('subscription.popular') }}
            </span>
          </div>

          <!-- Plan metadata -->
          <div class="flex justify-between items-start gap-2">
            <h3 class="text-xl font-extrabold text-gray-900 dark:text-white tracking-normal leading-snug flex-1">{{ plan.name }}</h3>
            <!-- Active plan badge -->
            <span 
              v-if="currentSubscription?.plan_type === plan.type"
              class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase whitespace-nowrap mt-1"
            >
              {{ t('subscription.active') }}
            </span>
          </div>
          <p class="mt-4 text-gray-500 dark:text-gray-400 text-sm min-h-[40px]">{{ plan.description }}</p>
          
          <!-- Pricing -->
          <div class="mt-6 flex items-baseline">
            <span class="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ plan.price }}</span>
            <span class="ml-2 text-sm font-semibold text-gray-400 dark:text-gray-500">/ {{ plan.period }}</span>
          </div>

          <!-- Feature checklist -->
          <ul class="mt-8 space-y-4">
            <li v-for="feat in plan.features" :key="feat" class="flex items-start">
              <CheckIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 mr-3" />
              <span class="text-sm text-gray-600 dark:text-gray-300 leading-normal">{{ feat }}</span>
            </li>
          </ul>
        </div>

        <!-- Action button -->
        <button
          @click="handleUpdatePlan(plan.type)"
          :disabled="currentSubscription?.plan_type === plan.type || updatingPlan !== null"
          class="mt-8 w-full py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2"
          :class="[
            currentSubscription?.plan_type === plan.type
              ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-default shadow-none border border-transparent'
              : plan.popular
                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          ]"
        >
          <svg v-if="updatingPlan === plan.type" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ currentSubscription?.plan_type === plan.type ? t('subscription.currentPlan') : t('subscription.selectPlan') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
