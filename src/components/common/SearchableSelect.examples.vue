<template>
  <div class="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
      SearchableSelect - Ejemplos de Personalización
    </h1>

    <!-- Ejemplo 1: Búsqueda por múltiples campos -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        1. Búsqueda por Múltiples Campos (DNI, Nombre, Email)
      </h2>
      <SearchableSelect
        v-model="ejemplo1"
        :options="clientes"
        label="Cliente"
        placeholder="Seleccione un cliente"
        search-placeholder="Buscar por nombre, DNI o email..."
        option-label="nombre"
        option-value="id"
        :search-keys="['nombre', 'identificador', 'email', 'telefono']"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Valor seleccionado: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ ejemplo1 }}</code>
      </p>
    </section>

    <!-- Ejemplo 2: Función personalizada para optionLabel -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        2. Label Personalizado con Función
      </h2>
      <SearchableSelect
        v-model="ejemplo2"
        :options="clientes"
        label="Cliente (Formato Personalizado)"
        placeholder="Seleccione un cliente"
        :option-label="(cliente) => `${cliente.nombre} (DNI: ${cliente.identificador})`"
        option-value="id"
        :search-keys="['nombre', 'identificador']"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Valor seleccionado: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ ejemplo2 }}</code>
      </p>
    </section>

    <!-- Ejemplo 3: Función personalizada para optionValue -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        3. Value Personalizado (Retornar objeto completo)
      </h2>
      <SearchableSelect
        v-model="ejemplo3"
        :options="clientes"
        label="Cliente (Objeto Completo)"
        placeholder="Seleccione un cliente"
        option-label="nombre"
        :option-value="(cliente) => cliente"
        :search-keys="['nombre', 'identificador']"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Objeto seleccionado: 
        <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded block mt-1">
          {{ ejemplo3 ? JSON.stringify(ejemplo3, null, 2) : 'null' }}
        </code>
      </p>
    </section>

    <!-- Ejemplo 4: Búsqueda por campo específico (solo DNI) -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        4. Búsqueda Solo por DNI
      </h2>
      <SearchableSelect
        v-model="ejemplo4"
        :options="clientes"
        label="Cliente (Buscar solo por DNI)"
        placeholder="Seleccione un cliente"
        search-placeholder="Ingrese el DNI..."
        option-label="nombre"
        option-value="id"
        :search-keys="['identificador']"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Valor seleccionado: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ ejemplo4 }}</code>
      </p>
    </section>

    <!-- Ejemplo 5: Slot personalizado con información adicional -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        5. Slot Personalizado con Avatar y Badges
      </h2>
      <SearchableSelect
        v-model="ejemplo5"
        :options="clientes"
        label="Cliente (Vista Enriquecida)"
        placeholder="Seleccione un cliente"
        option-value="id"
        :search-keys="['nombre', 'identificador', 'email']"
      >
        <template #option="{ option, isSelected }">
          <div class="flex items-center justify-between w-full py-1">
            <div class="flex items-center space-x-3 flex-1">
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {{ option.nombre.charAt(0).toUpperCase() }}
              </div>
              
              <!-- Info -->
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ option.nombre }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 space-x-2">
                  <span>📋 {{ option.identificador }}</span>
                  <span v-if="option.email">📧 {{ option.email }}</span>
                </div>
              </div>
              
              <!-- Badge -->
              <span 
                class="px-2 py-1 text-xs rounded-full"
                :class="option.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ option.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            
            <!-- Check icon -->
            <svg 
              v-if="isSelected"
              class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </template>
      </SearchableSelect>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Valor seleccionado: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ ejemplo5 }}</code>
      </p>
    </section>

    <!-- Ejemplo 6: Retornar campo personalizado como value -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        6. Value Personalizado (Retornar DNI en lugar de ID)
      </h2>
      <SearchableSelect
        v-model="ejemplo6"
        :options="clientes"
        label="Cliente (Value = DNI)"
        placeholder="Seleccione un cliente"
        option-label="nombre"
        option-value="identificador"
        :search-keys="['nombre', 'identificador']"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        DNI seleccionado: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ ejemplo6 }}</code>
      </p>
    </section>

    <!-- Ejemplo 7: Búsqueda con función personalizada -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        7. Planes con Búsqueda Personalizada
      </h2>
      <SearchableSelect
        v-model="ejemplo7"
        :options="planes"
        label="Plan de Internet"
        placeholder="Seleccione un plan"
        search-placeholder="Buscar por nombre, velocidad o precio..."
        :option-label="(plan) => `${plan.nombre} - ${plan.velocidad_bajada}Mbps - $${plan.precio}`"
        option-value="id"
        :search-keys="['nombre', 'descripcion', 'velocidad_bajada', 'precio']"
      >
        <template #option="{ option, isSelected }">
          <div class="flex items-center justify-between w-full">
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ option.nombre }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {{ option.velocidad_bajada }}Mbps ↓ / {{ option.velocidad_subida }}Mbps ↑
                </span>
                <span class="ml-3 font-semibold text-green-600 dark:text-green-400">
                  ${{ option.precio }}
                </span>
              </div>
            </div>
            <svg 
              v-if="isSelected"
              class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </template>
      </SearchableSelect>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Valor seleccionado: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ ejemplo7 }}</code>
      </p>
    </section>

    <!-- Ejemplo 8: Con evento de búsqueda para API -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        8. Búsqueda con Evento (Para APIs)
      </h2>
      <SearchableSelect
        v-model="ejemplo8"
        :options="clientesFiltrados"
        label="Cliente (Búsqueda en Servidor)"
        placeholder="Seleccione un cliente"
        search-placeholder="Buscar en el servidor..."
        option-label="nombre"
        option-value="id"
        @search="handleServerSearch"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Última búsqueda: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ lastSearch }}</code>
      </p>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Valor seleccionado: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ ejemplo8 }}</code>
      </p>
    </section>

    <!-- Ejemplo 9: Retornar múltiples campos como objeto -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        9. Value Personalizado (Objeto con campos específicos)
      </h2>
      <SearchableSelect
        v-model="ejemplo9"
        :options="clientes"
        label="Cliente (Retornar nombre + DNI)"
        placeholder="Seleccione un cliente"
        option-label="nombre"
        :option-value="(cliente) => ({ nombre: cliente.nombre, dni: cliente.identificador })"
        :search-keys="['nombre', 'identificador']"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Objeto seleccionado: 
        <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {{ ejemplo9 ? JSON.stringify(ejemplo9) : 'null' }}
        </code>
      </p>
    </section>

    <!-- Ejemplo 10: Con Validación y Mensajes de Error -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        10. Búsqueda en Campos Anidados (Contratos)
      </h2>
      <SearchableSelect
        v-model="ejemplo10"
        :options="contratos"
        label="Contrato"
        placeholder="Seleccione un contrato"
        search-placeholder="Buscar por ID, cliente, DNI o plan..."
        :option-label="(c) => `#${c.id} - ${c.cliente.nombre}`"
        option-value="id"
        :search-keys="['id', 'cliente.nombre', 'cliente.identificador', 'plan.nombre']"
      >
        <template #option="{ option, isSelected }">
          <div class="flex items-center justify-between w-full py-1">
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">
                Contrato #{{ option.id }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Cliente: {{ option.cliente.nombre }} (DNI: {{ option.cliente.identificador }})
              </div>
              <div class="text-xs text-gray-400 dark:text-gray-500">
                Plan: {{ option.plan.nombre }} - ${{ option.precio }}
              </div>
            </div>
            <svg 
              v-if="isSelected"
              class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </template>
      </SearchableSelect>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Prueba buscar por: "1" (ID), "Juan" (nombre), "12345678" (DNI), o "Premium" (plan)
      </p>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Valor seleccionado: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ ejemplo10 }}</code>
      </p>
    </section>

    <!-- Ejemplo 11: Con Validación y Mensajes de Error -->
    <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        11. Con Validación y Mensajes de Error
      </h2>
      <SearchableSelect
        v-model="ejemplo11"
        :options="clientes"
        label="Cliente (Con Validación)"
        placeholder="Seleccione un cliente"
        option-label="nombre"
        option-value="id"
        :search-keys="['nombre', 'identificador']"
        required
        :error="error11"
        @change="validateEjemplo11"
      />
      <button
        @click="submitEjemplo11"
        class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Validar Selección
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SearchableSelect from './SearchableSelect.vue'

// Datos de ejemplo
const clientes = ref([
  { id: 1, nombre: 'Juan Pérez', identificador: '12345678', email: 'juan@example.com', telefono: '555-0001', activo: true },
  { id: 2, nombre: 'María García', identificador: '87654321', email: 'maria@example.com', telefono: '555-0002', activo: true },
  { id: 3, nombre: 'Carlos López', identificador: '11223344', email: 'carlos@example.com', telefono: '555-0003', activo: false },
  { id: 4, nombre: 'Ana Martínez', identificador: '44332211', email: 'ana@example.com', telefono: '555-0004', activo: true },
  { id: 5, nombre: 'Pedro Sánchez', identificador: '55667788', email: 'pedro@example.com', telefono: '555-0005', activo: true }
])

const planes = ref([
  { id: 1, nombre: 'Plan Básico', velocidad_bajada: 50, velocidad_subida: 10, precio: 29.99, descripcion: 'Ideal para navegación básica' },
  { id: 2, nombre: 'Plan Estándar', velocidad_bajada: 100, velocidad_subida: 20, precio: 49.99, descripcion: 'Para streaming y trabajo' },
  { id: 3, nombre: 'Plan Premium', velocidad_bajada: 300, velocidad_subida: 50, precio: 79.99, descripcion: 'Máxima velocidad' },
  { id: 4, nombre: 'Plan Empresarial', velocidad_bajada: 500, velocidad_subida: 100, precio: 129.99, descripcion: 'Para empresas' }
])

// Estados de los ejemplos
const ejemplo1 = ref(null)
const ejemplo2 = ref(null)
const ejemplo3 = ref(null)
const ejemplo4 = ref(null)
const ejemplo5 = ref(null)
const ejemplo6 = ref(null)
const ejemplo7 = ref(null)
const ejemplo8 = ref(null)
const ejemplo9 = ref(null)
const ejemplo10 = ref(null)
const ejemplo11 = ref(null)

// Datos de contratos con estructura anidada
const contratos = ref([
  { 
    id: 1, 
    precio: 49.99,
    cliente: { nombre: 'Juan Pérez', identificador: '12345678' },
    plan: { nombre: 'Plan Premium', velocidad: 100 }
  },
  { 
    id: 2, 
    precio: 29.99,
    cliente: { nombre: 'María García', identificador: '87654321' },
    plan: { nombre: 'Plan Básico', velocidad: 50 }
  },
  { 
    id: 3, 
    precio: 79.99,
    cliente: { nombre: 'Carlos López', identificador: '11223344' },
    plan: { nombre: 'Plan Empresarial', velocidad: 300 }
  }
])

// Ejemplo 8: Búsqueda en servidor
const lastSearch = ref('')
const clientesFiltrados = ref([...clientes.value])

const handleServerSearch = (query) => {
  lastSearch.value = query
  // Simular búsqueda en servidor
  if (!query) {
    clientesFiltrados.value = [...clientes.value]
  } else {
    // Aquí harías una llamada a tu API
    console.log('Buscando en servidor:', query)
    // Simulación local
    clientesFiltrados.value = clientes.value.filter(c => 
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.identificador.includes(query)
    )
  }
}

// Ejemplo 11: Validación
const error11 = ref('')

const validateEjemplo11 = (option) => {
  if (!option) {
    error11.value = 'Debe seleccionar un cliente'
  } else {
    error11.value = ''
  }
}

const submitEjemplo11 = () => {
  if (!ejemplo11.value) {
    error11.value = 'Este campo es requerido'
  } else {
    error11.value = ''
    alert('¡Validación exitosa!')
  }
}
</script>
