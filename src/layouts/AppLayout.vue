<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AppHeader from '../components/layout/AppHeader.vue';
import AppSidebar from '../components/layout/AppSidebar.vue';
import Breadcrumb from '../components/layout/Breadcrumb.vue';


const authStore = useAuthStore();
const router = useRouter();

// State
const isSidebarOpen = ref(true);
const isMobileMenuOpen = ref(false);
const isMobile = ref(false);

// Computed
const mainContentClasses = computed(() => {
  const classes = ['flex-1 transition-all duration-300 overflow-y-auto'];
  
  if (!isMobile.value) {
    if (isSidebarOpen.value) {
      classes.push('ml-64');
    } else {
      classes.push('ml-16');
    }
  }
  
  return classes.join(' ');
});

// Methods
const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
    isSidebarOpen.value = isMobileMenuOpen.value;
  } else {
    isSidebarOpen.value = !isSidebarOpen.value;
  }
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  isSidebarOpen.value = isMobileMenuOpen.value;
};

const closeSidebar = () => {
  if (isMobile.value) {
    isMobileMenuOpen.value = false;
    isSidebarOpen.value = false;
  }
};

const handleLogout = () => {
  if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout();
    router.push({ name: 'login' });
  }
};

const checkMobile = () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 1024;
  
  if (wasMobile !== isMobile.value) {
    if (isMobile.value) {
      isSidebarOpen.value = false;
      isMobileMenuOpen.value = false;
    } else {
      isSidebarOpen.value = true;
    }
  }
};

const handleResize = () => {
  checkMobile();
};

// Lifecycle
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <!-- Header -->
    <AppHeader
      :user="authStore.user"
      :is-sidebar-open="isSidebarOpen"
      @toggle-sidebar="toggleSidebar"
      @toggle-mobile-menu="toggleMobileMenu"
      @logout="handleLogout"
      @profile="router.push({ name: 'profile' })"
    />

    <!-- Mobile overlay -->
    <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
    >
      <div
        v-if="isMobile && isSidebarOpen"
        class="fixed inset-0 z-10 transition-opacity duration-300"
        style="top: 4rem; background-color: rgba(0, 0, 0, 0.3);"
        @click="closeSidebar"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <AppSidebar
      :is-open="isSidebarOpen"
      :is-mobile="isMobile"
      :user="authStore.user"
      @close="closeSidebar"
    />

    <!-- Main Content -->
    <main :class="mainContentClasses" class="pt-24 px-6 sm:px-8 pb-6 sm:pb-8" style="min-height: 100vh;">
      <Breadcrumb />
      <router-view />
    </main>
  </div>
</template>
