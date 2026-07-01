<template>
  <div class="relative">
    <!-- Trigger Button -->
    <button
      type="button"
      class="group flex items-center space-x-3 focus:outline-none p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      @click.stop="toggleUserMenu"
    >
      <div class="sm:hidden flex items-center space-x-1">
        <div class="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-200 font-bold text-sm overflow-hidden ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-600 transition-all">
          <span>{{ userInitials }}</span>
        </div>
        <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isUserMenuOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <div class="hidden sm:flex items-center space-x-3">
        <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-200 font-bold overflow-hidden ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-600 transition-all">
          <span>{{ userInitials }}</span>
        </div>
        <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isUserMenuOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isUserMenuOpen"
        class="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/10 dark:ring-gray-600 ring-opacity-5 focus:outline-none z-50 overflow-hidden transition-all duration-200"
        v-click-outside="closeUserMenu"
        @click.stop
      >
        <!-- User info -->
        <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate capitalize">{{ userName }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-300 truncate">{{ user?.email || t('common.noEmail') }}</p>
          <div class="mt-2">
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              :class="roleClasses"
            >
              {{ userRole }}
            </span>
          </div>
        </div>

        <!-- Menu Options -->
        <div class="py-1">
          <button
            type="button"
            class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
            @click="handleNotifications"
          >
            <svg class="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>{{ t('common.notifications') }}</span>
          </button>
          
          <button
            type="button"
            class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
            @click="handleProfile"
          >
            <svg class="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{{ t('common.myProfile') }}</span>
          </button>
          
          <button
            type="button"
            class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
            @click="handleSettings"
          >
            <svg class="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ t('common.settings') }}</span>
          </button>
        </div>

        <!-- Logout -->
        <div class="py-1 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:bg-gray-800/90 dark:hover:bg-red-900/30 transition-all duration-200"
            @click="handleLogout"
          >
            <svg class="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{{ t('common.logout') }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['logout', 'notifications', 'profile', 'settings']);

const isUserMenuOpen = ref(false);

const userName = computed(() => {
  if (!props.user) return t('common.user');
  return props.user.name || t('common.user');
});

const userInitials = computed(() => {
  if (!props.user) return t('common.user').charAt(0).toUpperCase();
  const name = props.user.name || '';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase() || t('common.user').charAt(0).toUpperCase();
});

const userRole = computed(() => {
  if (!props.user || !props.user.role) return t('common.user');
  const role = props.user.role.toLowerCase();
  
  if (role === 'admin' || role === 'administrator') {
    return t('common.administrator');
  } else if (role === 'user' || role === 'usuario') {
    return t('common.user');
  }
  // Capitalize first letter for unknown roles
  return role.charAt(0).toUpperCase() + role.slice(1);
});

const roleClasses = computed(() => {
  const role = props.user?.role?.toLowerCase() || '';
  
  if (role === 'admin' || role === 'administrador') {
    return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
  } else if (role === 'user' || role === 'usuario') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  } else {
    return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
  }
});

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const handleNotifications = () => {
  closeUserMenu();
  emit('notifications');
};

const handleProfile = () => {
  closeUserMenu();
  emit('profile');
};

const handleSettings = () => {
  closeUserMenu();
  emit('settings');
};

const handleLogout = () => {
  closeUserMenu();
  emit('logout');
};

// Custom directive for clicking outside
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>
