<template>
  <nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-4">
      <!-- Home -->
      <li>
        <div>
          <router-link to="/" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200">
            <HomeIcon class="flex-shrink-0 h-5 w-5" />
            <span class="sr-only">{{ t('navigation.dashboard') }}</span>
          </router-link>
        </div>
      </li>

      <!-- Breadcrumb items -->
      <li v-for="(item, index) in breadcrumbs" :key="item.name">
        <div class="flex items-center">
          <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <router-link
            v-if="item.to && index < breadcrumbs.length - 1"
            :to="item.to"
            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            {{ item.name }}
          </router-link>
          <span
            v-else
            class="ml-4 text-sm font-medium text-gray-900 dark:text-white"
            aria-current="page"
          >
            {{ item.name }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { HomeIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const { t, te } = useI18n()

// Convert kebab-case to camelCase
const toCamelCase = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

const breadcrumbs = computed(() => {
  const items = []
  
  // Generate breadcrumbs based on route
  const pathSegments = route.path.split('/').filter(segment => segment)
  let currentPath = ''
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Check if segment is a number (likely an ID)
    if (/^\d+$/.test(segment)) {
      const prevSegment = pathSegments[index - 1]
      let entityName = ''
      
      if (prevSegment === 'users') {
        entityName = t('common.user')
      } else {
        entityName = ''
      }
      
      items.push({ 
        name: entityName ? `${entityName} #${segment}` : `#${segment}`, 
        to: null 
      })
    } else {
      const camelSegment = toCamelCase(segment)
      let translatedName = segment
      
      // Try resolving from multiple common namespaces
      if (te(`nav.${camelSegment}`)) {
        translatedName = t(`nav.${camelSegment}`)
      } else if (te(`navigation.${camelSegment}`)) {
        translatedName = t(`navigation.${camelSegment}`)
      } else {
        translatedName = segment.charAt(0).toUpperCase() + segment.slice(1)
      }
      
      items.push({
        name: translatedName,
        to: index === pathSegments.length - 1 ? null : currentPath
      })
    }
  })
  
  // Handle special cases based on route meta or name
  if (route.meta?.breadcrumb) {
    return route.meta.breadcrumb
  }
  
  return items
})
</script>
