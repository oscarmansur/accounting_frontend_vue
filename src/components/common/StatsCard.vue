<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: 'text-blue-600'
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <div 
    class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-shadow"
    :class="{ 'cursor-pointer hover:shadow-lg': clickable }"
    @click="clickable ? handleClick() : null"
  >
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg :class="['h-6 w-6', iconColor]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {{ title }}
            </dt>
            <dd class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ value }}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
