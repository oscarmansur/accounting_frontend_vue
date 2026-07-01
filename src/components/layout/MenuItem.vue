<template>
  <div>
    <!-- Menu item with children (accordion) -->
    <div v-if="item.children">
      <button
        @click="handleToggle"
        class="w-full group flex items-center justify-between py-2 text-sm font-medium rounded-md transition-all duration-150"
        :class="[
          isSidebarOpen ? 'px-' : 'px-2',
          isAnyChildActive 
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        ]"
        :style="{ paddingLeft: isSidebarOpen ? `${level * 0.75 + 0.75}rem` : '0.5rem' }"
      >
        <div class="flex items-center min-w-0 flex-1">
          <component 
            v-if="item.icon"
            :is="item.icon" 
            class="flex-shrink-0 h-5 w-5 transition-colors duration-150" 
            :class="[
              isAnyChildActive 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
            ]" 
            aria-hidden="true" 
          />
          <span 
            class="whitespace-nowrap overflow-hidden transition-all duration-300 truncate"
            :class="[
              isSidebarOpen ? 'max-w-xs opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'
            ]"
          >
            {{ item.name }}
          </span>
        </div>
        
        <!-- Chevron icon -->
        <ChevronDownIcon
          class="flex-shrink-0 h-4 w-4 transition-all duration-200"
          :class="[
            isSidebarOpen ? 'opacity-100 ml-2' : 'opacity-0 w-0',
            isOpen ? 'rotate-180' : 'rotate-0',
            isAnyChildActive 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-400 dark:text-gray-500'
          ]"
        />
      </button>

      <!-- Submenu (CSS-only accordion) -->
      <div 
        class="submenu-container overflow-hidden"
        :class="submenuClasses"
      >
        <div class="py-1 space-y-1">
          <MenuItem
            v-for="child in item.children"
            :key="child.id"
            :item="child"
            :is-sidebar-open="isSidebarOpen"
            :level="level + 1"
            :open-items="openItems"
            @toggle="$emit('toggle', $event)"
            @navigate="$emit('navigate')"
          />
        </div>
      </div>
    </div>

    <!-- Menu item without children (link) -->
    <router-link
      v-else
      :to="item.href"
      class="group flex items-center py-2 text-sm font-medium rounded-md transition-all duration-150"
      :class="[
        isSidebarOpen ? 'px-3' : 'px-2',
        isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      ]"
      :style="{ paddingLeft: isSidebarOpen ? `${level * 0.75 + 0.75}rem` : '0.5rem' }"
      @click="$emit('navigate')"
    >
      <component 
        v-if="item.icon"
        :is="item.icon" 
        class="flex-shrink-0 h-5 w-5 transition-colors duration-150" 
        :class="[
          isActive 
            ? 'text-white' 
            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
        ]" 
        aria-hidden="true" 
      />
      <span 
        class="whitespace-nowrap overflow-hidden transition-all duration-300 truncate"
        :class="[
          isSidebarOpen ? 'max-w-xs opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'
        ]"
      >
        {{ item.name }}
      </span>
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isSidebarOpen: {
    type: Boolean,
    default: true
  },
  level: {
    type: Number,
    default: 0
  },
  openItems: {
    type: Set,
    required: true
  }
});

const emit = defineEmits(['toggle', 'navigate']);

const route = useRoute();

const isOpen = computed(() => {
  return props.openItems.has(props.item.id);
});

const isActive = computed(() => {
  return route.name === props.item.routeName;
});

const isAnyChildActive = computed(() => {
  if (!props.item.children) return false;
  
  const checkChildren = (children) => {
    for (const child of children) {
      if (child.routeName && route.name === child.routeName) {
        return true;
      }
      if (child.children && checkChildren(child.children)) {
        return true;
      }
    }
    return false;
  };
  
  return checkChildren(props.item.children);
});

// CSS class-based approach for smooth animations
const submenuClasses = computed(() => {
  // When sidebar is collapsed, hide submenu
  if (!props.isSidebarOpen) {
    return 'submenu-hidden';
  }
  // When sidebar is open, show/hide based on isOpen state
  return isOpen.value ? 'submenu-open' : 'submenu-closed';
});

const handleToggle = () => {
  if (props.isSidebarOpen) {
    emit('toggle', props.item.id);
  }
};
</script>

<style scoped>
.submenu-container {
  /* Use grid for smooth height animation - this is the professional approach */
  display: grid;
  transition: grid-template-rows 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.submenu-container > div {
  overflow: hidden;
}

/* Open state - full height */
.submenu-open {
  grid-template-rows: 1fr;
  opacity: 1;
}

/* Closed state - zero height */
.submenu-closed {
  grid-template-rows: 0fr;
  opacity: 0;
}

/* Hidden when sidebar is collapsed - instant hide, no animation needed */
.submenu-hidden {
  grid-template-rows: 0fr;
  opacity: 0;
}
</style>
