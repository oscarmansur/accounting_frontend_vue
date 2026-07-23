<template>
  <aside
    :class="sidebarClasses"
    class="fixed flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out h-[calc(100vh-4rem)] top-16 z-20 shadow-lg lg:shadow-none"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
      <MenuItem
        v-for="item in navigation"
        :key="item.id"
        :item="item"
        :is-sidebar-open="isExpanded"
        :level="0"
        :open-items="openItems"
        @toggle="toggleItem"
        @navigate="handleNavClick"
      />
    </nav>



    <!-- System Status -->
    <div class="px-2 py-2 border-t border-gray-200 dark:border-gray-700">
      <StatusIndicator :is-open="isExpanded" />
    </div>

    <!-- User info (bottom) -->
    <div 
      v-if="user"
      class="border-t border-gray-200 dark:border-gray-700 p-4 transition-all duration-300"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0 transition-all duration-300">
          <div 
            class="rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-200 font-bold transition-all duration-300"
            :class="[
              isExpanded ? 'h-10 w-10' : 'h-8 w-8 text-sm shadow-sm'
            ]"
          >
            {{ userInitials }}
          </div>
        </div>
        <div 
          class="overflow-hidden transition-all duration-300"
          :class="[
            isExpanded ? 'max-w-xs opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'
          ]"
        >
          <p class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
            {{ user.full_name || user.name || user.email }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import MenuItem from './MenuItem.vue';
import StatusIndicator from '../common/StatusIndicator.vue';
import { 
  HomeIcon, 
  UsersIcon, 
  CogIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  CalculatorIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline';

const { t } = useI18n();
const authStore = useAuthStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'navigate']);

const route = useRoute();
const openItems = ref(new Set());
const isHovered = ref(false);

const isExpanded = computed(() => props.isOpen || (isHovered.value && !props.isMobile));

/**
 * Accounting-oriented navigation structure.
 * Items are filtered based on user roles.
 */
const navigation = computed(() => {
  const items = [
    { 
      id: 'dashboard',
      name: t('nav.dashboard', 'Panel de Control'), 
      href: '/', 
      icon: HomeIcon, 
      routeName: 'dashboard' 
    },
    { 
      id: 'config',
      name: t('nav.config', 'Configuración'),
      icon: CogIcon,
      children: [
        { 
          id: 'companies', 
          name: t('nav.companies', 'Empresas'), 
          href: '/config/companies', 
          routeName: 'companies',
          roles: ['admin', 'owner']
        },
        { 
          id: 'chart-of-accounts', 
          name: t('nav.chartOfAccounts', 'Plan de Cuentas'), 
          href: '/config/chart-of-accounts', 
          routeName: 'chart-of-accounts' 
        },
        {
          id: 'currency-rates',
          name: t('nav.currencyRates', 'Tasas de Cambio'),
          href: '/config/currency-rates',
          routeName: 'currency-rates'
        },
        {
          id: 'subscription',
          name: t('nav.subscription', 'Suscripción'),
          href: '/config/subscription',
          routeName: 'subscription',
          roles: ['admin', 'owner']
        }
      ]
    },
    { 
      id: 'accounting',
      name: t('nav.accounting', 'Contabilidad'),
      icon: CalculatorIcon,
      children: [
        { 
          id: 'journal-entries', 
          name: t('nav.journalEntries', 'Asientos Contables'), 
          href: '/accounting/entries', 
          routeName: 'journal-entries',
          icon: DocumentTextIcon
        },
        {
          id: 'contacts',
          name: t('nav.contacts', 'Contactos'),
          href: '/accounting/contacts',
          routeName: 'contacts',
          icon: UserGroupIcon
        },
        {
          id: 'bank-reconciliation',
          name: t('nav.bankReconciliation', 'Conciliación Bancaria'),
          href: '/accounting/bank-reconciliation',
          routeName: 'bank-reconciliation',
          icon: BookOpenIcon
        },
        {
          id: 'fixed-assets',
          name: t('nav.fixedAssets', 'Activos Fijos'),
          href: '/accounting/fixed-assets',
          routeName: 'fixed-assets',
          icon: ClipboardDocumentListIcon
        }
      ]
    },
    { 
      id: 'reports',
      name: t('nav.reports', 'Reportes'),
      icon: ChartBarIcon,
      children: [
        { 
          id: 'general-ledger', 
          name: t('nav.generalLedger', 'Libro Mayor'), 
          href: '/reports/ledger', 
          routeName: 'general-ledger' 
        },
        { 
          id: 'balance-sheet', 
          name: t('nav.balanceSheet', 'Balance General'), 
          href: '/reports/balance-sheet', 
          routeName: 'balance-sheet' 
        },
        { 
          id: 'profit-and-loss', 
          name: t('nav.profitAndLoss', 'Estado de Resultados'), 
          href: '/reports/profit-and-loss', 
          routeName: 'profit-and-loss' 
        },
        { 
          id: 'trial-balance', 
          name: t('nav.trialBalance', 'Balance de Comprobación'), 
          href: '/reports/trial-balance', 
          routeName: 'trial-balance' 
        },
        { 
          id: 'aging-report', 
          name: t('nav.agingReport', 'Antigüedad de Saldos'), 
          href: '/reports/aging', 
          routeName: 'aging-report' 
        }     
      ]
    }
  ];

  // Users section — only for admin/owner/superuser
  if (authStore.isSuperuser || authStore.hasRole(['admin', 'owner'])) {
    items.push({
      id: 'users',
      name: t('nav.users', 'Usuarios'),
      href: '/users',
      icon: UsersIcon,
      routeName: 'users'
    });
  }

  // Tenants section — superuser only
  if (authStore.isSuperuser) {
    items.push({
      id: 'tenants',
      name: t('nav.tenants', 'Organizaciones'),
      href: '/admin/tenants',
      icon: BuildingOffice2Icon,
      routeName: 'tenants'
    });
  }

  return items;
});

const sidebarClasses = computed(() => {
  const classes = [];
  
  if (props.isMobile) {
    classes.push('w-64');
    if (!props.isOpen) {
      classes.push('-translate-x-full');
    } else {
      classes.push('translate-x-0');
    }
  } else {
    // Desktop behavior
    if (isExpanded.value) {
      classes.push('w-64');
      
      // If expanding via hover only (not pinned open), add shadow and ensure it floats
      if (!props.isOpen && isHovered.value) {
        classes.push('lg:shadow-xl border-r-0'); // Add shadow for floating effect
      }
    } else {
      classes.push('w-16');
    }
  }
  
  return classes.join(' ');
});

const userInitials = computed(() => {
  if (!props.user) return 'A';
  const name = props.user.full_name || props.user.name || '';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase() || 'A';
});

const toggleItem = (itemId) => {
  if (openItems.value.has(itemId)) {
    openItems.value.delete(itemId);
  } else {
    openItems.value.add(itemId);
  }
};

const handleNavClick = () => {
  if (props.isMobile) {
    emit('close');
  }
  emit('navigate');
};
</script>
