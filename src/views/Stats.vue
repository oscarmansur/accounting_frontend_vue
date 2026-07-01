<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import StatsCard from '../components/common/StatsCard.vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
)

const stats = ref({
  totalRevenue: 0,
  totalOrders: 0,
  totalUsers: 0,
  activeRaffles: 0,
  completedRaffles: 0,
  revenueByRaffle: [],
  ordersByStatus: {},
  salesTrend: []
})

const loading = ref(false)

onMounted(() => {
  fetchStats()
})

const fetchStats = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/stats')
    const data = response.data.data
    
    // Map the nested API response to the flat stats structure
    stats.value = {
      totalRevenue: parseFloat(data.revenue?.total || 0),
      totalOrders: data.orders?.total || 0,
      totalUsers: data.users?.total || 0,
      activeRaffles: data.raffles?.active || 0,
      completedRaffles: data.raffles?.completed || 0,
      revenueByRaffle: data.revenueByRaffle || [],
      ordersByStatus: data.ordersByStatus || {},
      salesTrend: data.salesTrend || []
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    loading.value = false
  }
}

const revenueChartData = computed(() => ({
  labels: stats.value.revenueByRaffle?.map(r => r.title) || [],
  datasets: [{
    label: 'Ingresos por Rifa',
    data: stats.value.revenueByRaffle?.map(r => r.revenue) || [],
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)'
    ]
  }]
}))

const ordersChartData = computed(() => ({
  labels: ['Pendiente', 'Pagado', 'Fallido', 'Reembolsado'],
  datasets: [{
    data: [
      stats.value.ordersByStatus?.pending || 0,
      stats.value.ordersByStatus?.paid || 0,
      stats.value.ordersByStatus?.failed || 0,
      stats.value.ordersByStatus?.refunded || 0
    ],
    backgroundColor: [
      'rgba(245, 158, 11, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(107, 114, 128, 0.8)'
    ]
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Estadísticas</h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Cargando estadísticas...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ingresos Totales"
          :value="formatCurrency(stats.totalRevenue)"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          icon-color="text-green-600"
        />

        <StatsCard
          title="Órdenes Totales"
          :value="stats.totalOrders"
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          icon-color="text-blue-600"
        />

        <StatsCard
          title="Usuarios"
          :value="stats.totalUsers"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          icon-color="text-purple-600"
        />

        <StatsCard
          title="Rifas Activas"
          :value="stats.activeRaffles"
          icon="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          icon-color="text-yellow-600"
        />
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue by Raffle -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Ingresos por Rifa
          </h3>
          <div class="h-64">
            <Bar v-if="revenueChartData.labels.length > 0" :data="revenueChartData" :options="chartOptions" />
            <p v-else class="text-center text-gray-500 dark:text-gray-400 pt-20">
              No hay datos disponibles
            </p>
          </div>
        </div>

        <!-- Orders by Status -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Órdenes por Estado
          </h3>
          <div class="h-64">
            <Doughnut :data="ordersChartData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
