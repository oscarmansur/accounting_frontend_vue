import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // ── Public Routes ───────────────────────────────
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/Login.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/Register.vue')
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: () => import('../views/ForgotPassword.vue')
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: () => import('../views/ResetPassword.vue')
        },
        {
            path: '/verify-email',
            name: 'verify-email',
            component: () => import('../views/VerifyEmail.vue')
        },
        {
            path: '/access-denied',
            name: 'access-denied',
            component: () => import('../views/AccessDenied.vue')
        },

        // ── Authenticated Routes ────────────────────────
        {
            path: '/',
            component: () => import('../layouts/AppLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                // Dashboard
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('../views/Dashboard.vue')
                },

                // ── Configuration ───────────────────────
                {
                    path: 'config/companies',
                    name: 'companies',
                    component: () => import('../views/config/CompanyManagement.vue'),
                    meta: { roles: ['admin', 'owner'] }
                },
                {
                    path: 'config/chart-of-accounts',
                    name: 'chart-of-accounts',
                    component: () => import('../views/config/ChartOfAccounts.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'config/currency-rates',
                    name: 'currency-rates',
                    component: () => import('../views/config/CurrencyRates.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'config/subscription',
                    name: 'subscription',
                    component: () => import('../views/config/SubscriptionManagement.vue'),
                    meta: { roles: ['admin', 'owner'] }
                },

                // ── Accounting ──────────────────────────
                {
                    path: 'accounting/entries',
                    name: 'journal-entries',
                    component: () => import('../views/accounting/JournalEntries.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'accounting/contacts',
                    name: 'contacts',
                    component: () => import('../views/accounting/Contacts.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'accounting/fixed-assets',
                    name: 'fixed-assets',
                    component: () => import('../views/accounting/FixedAssets.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'accounting/bank-reconciliation',
                    name: 'bank-reconciliation',
                    component: () => import('../views/accounting/BankReconciliation.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },

                // ── Reports ─────────────────────────────
                {
                    path: 'reports/balance-sheet',
                    name: 'balance-sheet',
                    component: () => import('../views/reports/BalanceSheet.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'reports/profit-and-loss',
                    name: 'profit-and-loss',
                    component: () => import('../views/reports/ProfitAndLoss.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'reports/trial-balance',
                    name: 'trial-balance',
                    component: () => import('../views/reports/TrialBalance.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'reports/aging',
                    name: 'aging-report',
                    component: () => import('../views/reports/AgingReport.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },
                {
                    path: 'reports/ledger',
                    name: 'general-ledger',
                    component: () => import('../views/reports/GeneralLedger.vue'),
                    meta: { roles: ['admin', 'owner', 'accountant'] }
                },

                // ── Users (superuser / admin) ───────────
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('../views/Users.vue'),
                    meta: { roles: ['admin', 'owner'] }
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: () => import('../views/Profile.vue')
                },
                {
                    path: 'admin/tenants',
                    name: 'tenants',
                    component: () => import('../views/TenantManagement.vue'),
                    meta: { requiresSuperuser: true }
                }
            ]
        },

        // ── Catch-all ───────────────────────────────────
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../views/NotFound.vue')
        }
    ]
})

// ── Navigation Guards ───────────────────────────────────
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // 1. Auth check
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ name: 'login' })
    }

    // 2. Redirect authenticated users away from login
    if (to.name === 'login' && authStore.isAuthenticated) {
        return next({ name: 'dashboard' })
    }

    // 3. Superuser check
    if (to.meta.requiresSuperuser && !authStore.isSuperuser) {
        return next({ name: 'access-denied' })
    }

    // 4. Role-based access check
    if (to.meta.roles && to.meta.roles.length > 0) {
        // Superusers bypass all role checks
        if (!authStore.isSuperuser && !authStore.hasRole(to.meta.roles)) {
            return next({ name: 'access-denied' })
        }
    }

    next()
})

export default router
