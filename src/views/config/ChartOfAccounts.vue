<script setup>
/**
 * Chart of Accounts — Collapsible tree view of the NIIF account hierarchy.
 * Supports searching, expanding/collapsing, and adding new accounts.
 */
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import accountingService from '@/services/accounting'
import FormModal from '@/components/common/FormModal.vue'

const { t } = useI18n()

const tree = ref([])
const flatAccounts = ref([])
const loading = ref(false)
const searchQuery = ref('')
const expandedNodes = ref(new Set())
const showCreateModal = ref(false)
const error = ref('')
const success = ref('')

// Account type configuration
const accountTypes = {
  asset: { label: t('accounting.assets'), color: 'blue', icon: '📊' },
  liability: { label: t('accounting.liabilities'), color: 'red', icon: '📋' },
  equity: { label: t('accounting.equity'), color: 'purple', icon: '🏛️' },
  revenue: { label: t('accounting.revenue'), color: 'emerald', icon: '💰' },
  expense: { label: t('accounting.expenses'), color: 'amber', icon: '💸' }
}

const accountFields = [
  { name: 'code', label: t('common.code'), type: 'text', required: true, placeholder: '1.1.01.01.001' },
  { name: 'name', label: t('common.name'), type: 'text', required: true, placeholder: 'Banco Nacional' },
  {
    name: 'account_type', label: t('common.type'), type: 'select', required: true,
    options: [
      { value: 'asset', label: t('accounting.assets') },
      { value: 'liability', label: t('accounting.liabilities') },
      { value: 'equity', label: t('accounting.equity') },
      { value: 'revenue', label: t('accounting.revenue') },
      { value: 'expense', label: t('accounting.expenses') }
    ]
  },
  { name: 'level', label: t('accounting.accountLevel'), type: 'text', required: true, placeholder: '1', defaultValue: '1' },
  { name: 'is_selectable', label: t('accounting.selectable'), type: 'checkbox', defaultValue: true }
]

const fetchTree = async () => {
  loading.value = true
  try {
    const [treeRes, flatRes] = await Promise.all([
      accountingService.getTree(),
      accountingService.getFlat()
    ])
    tree.value = treeRes.data
    flatAccounts.value = flatRes.data

    // Auto-expand first level
    tree.value.forEach(node => expandedNodes.value.add(node.id))
  } catch (err) {
    error.value = 'Error al cargar el plan de cuentas'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Flatten tree for search
const flattenTree = (nodes, depth = 0) => {
  const result = []
  for (const node of nodes) {
    result.push({ ...node, depth })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

const allNodesFlat = computed(() => flattenTree(tree.value))

const filteredTree = computed(() => {
  if (!searchQuery.value) return tree.value

  const query = searchQuery.value.toLowerCase()
  const filterNodes = (nodes) => {
    return nodes.reduce((acc, node) => {
      const matchesSelf =
        node.code.toLowerCase().includes(query) ||
        node.name.toLowerCase().includes(query)

      const filteredChildren = node.children?.length
        ? filterNodes(node.children)
        : []

      if (matchesSelf || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren })
      }
      return acc
    }, [])
  }

  return filterNodes(tree.value)
})

const totalAccounts = computed(() => flatAccounts.value.length)
const selectableCount = computed(() => flatAccounts.value.filter(a => a.is_selectable).length)

const toggleNode = (nodeId) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const expandAll = () => {
  allNodesFlat.value.forEach(n => expandedNodes.value.add(n.id))
}

const collapseAll = () => {
  expandedNodes.value.clear()
}

const getTypeColor = (type) => {
  const colors = {
    asset: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    liability: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    equity: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    revenue: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    expense: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
  }
  return colors[type] || 'text-gray-600 bg-gray-50'
}

const handleCreateAccount = async ({ data }) => {
  try {
    await accountingService.create({
      ...data,
      level: parseInt(data.level) || 1,
      is_selectable: data.is_selectable !== false
    })
    success.value = t('accounting.accountCreated')
    showCreateModal.value = false
    await fetchTree()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al crear cuenta'
    throw err
  }
}

onMounted(fetchTree)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('accounting.chartOfAccounts', 'Plan de Cuentas') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ totalAccounts }} cuentas · {{ selectableCount }} seleccionables
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {{ t('accounting.newAccount') }}
      </button>
    </div>

    <!-- Alerts -->
    <transition name="slide">
      <div v-if="error" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
        <span>{{ error }}</span>
        <button @click="error = ''" class="ml-auto">&times;</button>
      </div>
    </transition>
    <transition name="slide">
      <div v-if="success" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
        <span>{{ success }}</span>
      </div>
    </transition>

    <!-- Toolbar -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('accounting.searchAccountPlaceholder')"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <!-- Expand / Collapse -->
        <div class="flex gap-2">
          <button @click="expandAll" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {{ t('accounting.expandAll') }}
          </button>
          <button @click="collapseAll" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {{ t('accounting.collapseAll') }}
          </button>
          <button @click="fetchTree" :disabled="loading" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg :class="{ 'animate-spin': loading }" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    </div>

    <!-- Tree -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Type groups -->
      <div v-for="typeGroup in ['asset', 'liability', 'equity', 'revenue', 'expense']" :key="typeGroup">
        <template v-if="filteredTree.filter(n => n.account_type === typeGroup).length > 0">
          <!-- Type header -->
          <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 z-10">
            <div class="flex items-center gap-2">
              <span class="text-base">{{ accountTypes[typeGroup]?.icon }}</span>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {{ accountTypes[typeGroup]?.label }}
              </span>
            </div>
          </div>

          <!-- Tree nodes -->
          <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <template v-for="node in filteredTree.filter(n => n.account_type === typeGroup)" :key="node.id">
              <TreeNode
                :node="node"
                :depth="0"
                :expanded-nodes="expandedNodes"
                :type-color-fn="getTypeColor"
                @toggle="toggleNode"
              />
            </template>
          </div>
        </template>
      </div>

      <!-- Empty -->
      <div v-if="filteredTree.length === 0 && !loading" class="py-16 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {{ searchQuery ? 'No se encontraron cuentas con ese criterio' : 'No hay cuentas en el plan. Crea la primera empresa para inicializar el plan NIIF.' }}
        </p>
      </div>
    </div>

    <!-- Create Modal -->
    <FormModal
      v-model="showCreateModal"
      :title="t('accounting.createAccount')"
      :fields="accountFields"
      :submit-button-text="t('accounting.createAccountBtn')"
      @submit="handleCreateAccount"
    />
  </div>
</template>

<!-- Recursive TreeNode sub-component -->
<script>
import { h, defineComponent } from 'vue'

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: Object,
    depth: Number,
    expandedNodes: Object,
    typeColorFn: Function
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    return () => {
      const isExpanded = props.expandedNodes.has(props.node.id)
      const hasChildren = props.node.children?.length > 0
      const paddingLeft = `${(props.depth * 1.5) + 1}rem`

      const nodeRow = h('div', {
        class: [
          'flex items-center gap-2 py-2.5 px-4 cursor-pointer transition-colors duration-150',
          'hover:bg-gray-50 dark:hover:bg-gray-700/30',
          props.node.is_selectable ? '' : 'font-medium'
        ],
        style: { paddingLeft },
        onClick: () => hasChildren && emit('toggle', props.node.id)
      }, [
        // Expand/collapse chevron
        hasChildren
          ? h('svg', {
              class: ['w-4 h-4 transition-transform duration-200 flex-shrink-0 text-gray-400',
                isExpanded ? 'rotate-90' : ''],
              fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor'
            }, [
              h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5l7 7-7 7' })
            ])
          : h('span', { class: 'w-4 h-4 flex-shrink-0' }),

        // Code
        h('span', {
          class: 'text-xs font-mono px-1.5 py-0.5 rounded ' + (props.typeColorFn?.(props.node.account_type) || '')
        }, props.node.code),

        // Name
        h('span', {
          class: [
            'text-sm flex-1',
            props.node.is_selectable
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-gray-600 dark:text-gray-400 font-semibold'
          ]
        }, props.node.name),

        // Selectable badge
        !props.node.is_selectable && hasChildren
          ? h('span', { class: 'text-xs text-gray-400 dark:text-gray-500' }, `(${props.node.children.length})`)
          : null,

        props.node.is_selectable
          ? h('span', { class: 'w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0', title: 'Seleccionable' })
          : null
      ])

      const childNodes = isExpanded && hasChildren
        ? props.node.children.map(child =>
            h(TreeNode, {
              key: child.id,
              node: child,
              depth: props.depth + 1,
              expandedNodes: props.expandedNodes,
              typeColorFn: props.typeColorFn,
              onToggle: (id) => emit('toggle', id)
            })
          )
        : []

      return h('div', [nodeRow, ...childNodes])
    }
  }
})

export default { components: { TreeNode } }
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
