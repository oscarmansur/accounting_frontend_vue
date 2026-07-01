# SearchableSelect Component

Componente selector reutilizable con búsqueda integrada, totalmente personalizable y con soporte para modo oscuro.

## Características

- ✅ Búsqueda en tiempo real
- ✅ Navegación con teclado (↑↓ Enter Esc)
- ✅ Modo oscuro automático
- ✅ Slots personalizables
- ✅ Múltiples campos de búsqueda
- ✅ Validación y mensajes de error
- ✅ Opción de limpiar selección
- ✅ Totalmente accesible
- ✅ Animaciones suaves
- ✅ Posicionamiento inteligente (abre hacia arriba si no hay espacio abajo)

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modelValue` | String/Number/Object | `null` | Valor seleccionado (v-model) |
| `options` | Array | `[]` | Array de opciones |
| `label` | String | `''` | Etiqueta del campo |
| `placeholder` | String | `'Seleccione una opción'` | Texto cuando no hay selección |
| `searchPlaceholder` | String | `'Buscar...'` | Placeholder del input de búsqueda |
| `emptyMessage` | String | `'No se encontraron resultados'` | Mensaje cuando no hay resultados |
| `clearText` | String | `'Limpiar selección'` | Texto del botón limpiar |
| `optionLabel` | String/Function | `'label'` | **Campo o función** para obtener el label mostrado |
| `optionValue` | String/Function | `'value'` | **Campo o función** para obtener el value retornado |
| `searchKeys` | Array | `[]` | **Array de campos** en los que buscar (ej: `['nombre', 'dni', 'email']`) |
| `required` | Boolean | `false` | Campo requerido |
| `disabled` | Boolean | `false` | Deshabilitar el selector |
| `clearable` | Boolean | `true` | Mostrar botón de limpiar |
| `error` | String | `''` | Mensaje de error |

### Personalización de Props Clave

#### `optionLabel` - Personalizar el texto mostrado
Puedes usar un **string** (nombre del campo) o una **función** para formatear el label:

```vue
<!-- Usando string (campo del objeto) -->
<SearchableSelect option-label="nombre" />

<!-- Usando función para formato personalizado -->
<SearchableSelect 
  :option-label="(item) => `${item.nombre} - DNI: ${item.dni}`" 
/>
```

#### `optionValue` - Personalizar el valor retornado
Puedes retornar un **campo específico**, el **objeto completo**, o un **objeto personalizado**:

```vue
<!-- Retornar ID (por defecto) -->
<SearchableSelect option-value="id" />

<!-- Retornar DNI en lugar de ID -->
<SearchableSelect option-value="identificador" />

<!-- Retornar objeto completo -->
<SearchableSelect :option-value="(item) => item" />

<!-- Retornar objeto personalizado -->
<SearchableSelect 
  :option-value="(item) => ({ id: item.id, nombre: item.nombre })" 
/>
```

#### `searchKeys` - Personalizar campos de búsqueda
Define en qué campos se realizará la búsqueda. **Soporta campos anidados usando notación de punto**:

```vue
<!-- Buscar solo en nombre -->
<SearchableSelect :search-keys="['nombre']" />

<!-- Buscar en múltiples campos -->
<SearchableSelect 
  :search-keys="['nombre', 'identificador', 'email', 'telefono']" 
/>

<!-- Buscar en campos anidados (notación de punto) -->
<SearchableSelect 
  :search-keys="['cliente.nombre', 'cliente.identificador', 'plan.nombre']" 
/>

<!-- Ejemplo completo con contratos -->
<SearchableSelect 
  :search-keys="['id', 'cliente.nombre', 'cliente.razon_social', 'cliente.identificador', 'plan.nombre']" 
/>
```

## Events

| Event | Payload | Descripción |
|-------|---------|-------------|
| `update:modelValue` | value | Emitido cuando cambia la selección |
| `change` | option | Emitido cuando se selecciona una opción |
| `search` | query | Emitido cuando cambia el texto de búsqueda |

## Slots

### `option`

Personaliza cómo se muestra cada opción en el dropdown.

**Props del slot:**
- `option`: La opción actual
- `isSelected`: Boolean indicando si está seleccionada

## Ejemplos de Uso

### Ejemplo 1: Búsqueda por DNI del Cliente

```vue
<template>
  <SearchableSelect
    v-model="clienteId"
    :options="clientes"
    label="Cliente"
    placeholder="Seleccione un cliente"
    search-placeholder="Buscar por nombre o DNI..."
    option-label="nombre"
    option-value="id"
    :search-keys="['nombre', 'identificador', 'email']"
    required
  />
</template>

<script setup>
import { ref } from 'vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'

const clienteId = ref(null)
const clientes = ref([
  { id: 1, nombre: 'Juan Pérez', identificador: '12345678', email: 'juan@example.com' },
  { id: 2, nombre: 'María García', identificador: '87654321', email: 'maria@example.com' }
])
</script>
```

### Ejemplo 2: Retornar DNI en lugar de ID

```vue
<SearchableSelect
  v-model="clienteDni"
  :options="clientes"
  label="Cliente"
  option-label="nombre"
  option-value="identificador"
  :search-keys="['nombre', 'identificador']"
/>
<!-- Ahora v-model contendrá el DNI, no el ID -->
```

### Ejemplo 3: Retornar Objeto Completo

```vue
<SearchableSelect
  v-model="clienteCompleto"
  :options="clientes"
  label="Cliente"
  option-label="nombre"
  :option-value="(cliente) => cliente"
  :search-keys="['nombre', 'identificador']"
/>
<!-- Ahora v-model contendrá el objeto completo del cliente -->
```

### Ejemplo 4: Retornar Objeto Personalizado

```vue
<SearchableSelect
  v-model="clienteData"
  :options="clientes"
  label="Cliente"
  option-label="nombre"
  :option-value="(cliente) => ({ 
    id: cliente.id, 
    nombre: cliente.nombre,
    dni: cliente.identificador 
  })"
  :search-keys="['nombre', 'identificador']"
/>
<!-- v-model contendrá: { id: 1, nombre: 'Juan', dni: '12345678' } -->
```

### Ejemplo 5: Label Personalizado con Función

```vue
<SearchableSelect
  v-model="clienteId"
  :options="clientes"
  label="Cliente"
  :option-label="(cliente) => `${cliente.nombre} (DNI: ${cliente.identificador})`"
  option-value="id"
  :search-keys="['nombre', 'identificador']"
/>
<!-- Mostrará: "Juan Pérez (DNI: 12345678)" -->
```

### Ejemplo 6: Búsqueda Solo por DNI

```vue
<SearchableSelect
  v-model="clienteId"
  :options="clientes"
  label="Cliente"
  search-placeholder="Ingrese el DNI del cliente..."
  option-label="nombre"
  option-value="id"
  :search-keys="['identificador']"
/>
<!-- Solo buscará en el campo 'identificador' -->
```

### Uso Básico

### Ejemplo 7: Uso Básico Simple

```vue
<template>
  <SearchableSelect
    v-model="selectedId"
    :options="users"
    label="Usuario"
    placeholder="Seleccione un usuario"
    option-label="name"
    option-value="id"
  />
</template>

<script setup>
import { ref } from 'vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'

const selectedId = ref(null)
const users = ref([
  { id: 1, name: 'Juan Pérez' },
  { id: 2, name: 'María García' },
  { id: 3, name: 'Carlos López' }
])
</script>
```

### Ejemplo 8: Con Búsqueda Múltiple

```vue
<SearchableSelect
  v-model="selectedClienteId"
  :options="clientes"
  label="Cliente"
  placeholder="Seleccione un cliente"
  search-placeholder="Buscar por nombre o DNI..."
  option-label="nombre"
  option-value="id"
  :search-keys="['nombre', 'identificador', 'email']"
  required
/>
```

### Con Slot Personalizado

```vue
<SearchableSelect
  v-model="selectedClienteId"
  :options="clientes"
  label="Cliente"
  option-value="id"
  :search-keys="['nombre', 'identificador']"
>
  <template #option="{ option, isSelected }">
    <div class="flex items-center justify-between w-full">
      <div class="flex-1">
        <div class="font-medium text-gray-900 dark:text-white">
          {{ option.nombre }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          DNI: {{ option.identificador }}
        </div>
      </div>
      <svg 
        v-if="isSelected"
        class="w-5 h-5 text-blue-600 dark:text-blue-400"
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </div>
  </template>
</SearchableSelect>
```

### Con Función Personalizada para Label

```vue
<SearchableSelect
  v-model="selectedPlanId"
  :options="planes"
  label="Plan"
  :option-label="(plan) => `${plan.nombre} - $${plan.precio}`"
  option-value="id"
  :search-keys="['nombre', 'descripcion']"
/>
```

### Con Validación

```vue
<template>
  <SearchableSelect
    v-model="selectedId"
    :options="options"
    label="Campo Requerido"
    :error="errorMessage"
    required
    @change="validateSelection"
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedId = ref(null)
const errorMessage = ref('')

const validateSelection = (option) => {
  if (!option) {
    errorMessage.value = 'Este campo es requerido'
  } else {
    errorMessage.value = ''
  }
}
</script>
```

### Escuchando Eventos

```vue
<SearchableSelect
  v-model="selectedId"
  :options="options"
  @change="handleChange"
  @search="handleSearch"
/>

<script setup>
const handleChange = (option) => {
  console.log('Opción seleccionada:', option)
}

const handleSearch = (query) => {
  console.log('Buscando:', query)
  // Aquí podrías hacer una búsqueda en el servidor
}
</script>
```

## Navegación con Teclado

- **↓** (Flecha Abajo): Navegar a la siguiente opción
- **↑** (Flecha Arriba): Navegar a la opción anterior
- **Enter**: Seleccionar la opción resaltada
- **Esc**: Cerrar el dropdown

## Estilos y Modo Oscuro

El componente utiliza clases de Tailwind CSS con soporte completo para modo oscuro usando la estrategia `dark:` de Tailwind.

### Personalización de Colores

Puedes personalizar los colores modificando las clases de Tailwind en el componente:

- **Focus ring**: `focus:ring-blue-500`
- **Hover**: `hover:bg-gray-50 dark:hover:bg-gray-700`
- **Selected**: `bg-blue-100 dark:bg-blue-900/50`

## Mejores Prácticas

1. **Usa searchKeys para búsquedas eficientes**: Define los campos específicos donde buscar
2. **Personaliza con slots cuando sea necesario**: Para mostrar información adicional
3. **Valida las selecciones**: Usa el prop `error` para mostrar mensajes de validación
4. **Usa funciones para labels complejos**: Cuando necesites formatear el texto de manera especial
5. **Habilita clearable**: Para permitir que los usuarios deseleccionen opciones

## Accesibilidad

- Soporte completo de navegación con teclado
- Labels semánticos con `<label>`
- Indicadores visuales de estado (focus, hover, selected)
- Mensajes de error asociados al campo
- Indicador visual de campo requerido

## Rendimiento

- Búsqueda optimizada con computed properties
- Cierre automático al hacer clic fuera
- Limpieza de event listeners en unmount
- Transiciones CSS suaves sin JavaScript
- Posicionamiento inteligente que detecta espacio disponible
- Recalcula posición en scroll y resize para mantener visibilidad


## Casos de Uso Comunes

### 1. Selector de Cliente con Búsqueda por DNI

```vue
<SearchableSelect
  v-model="contratoForm.cliente_id"
  :options="clientes"
  label="Cliente"
  search-placeholder="Buscar por nombre, DNI o email..."
  :option-label="(c) => `${c.nombre} - ${c.identificador}`"
  option-value="id"
  :search-keys="['nombre', 'razon_social', 'identificador', 'email']"
  required
/>
```

### 2. Retornar Múltiples Campos

```vue
<template>
  <SearchableSelect
    v-model="selectedCliente"
    :options="clientes"
    :option-value="(c) => ({ id: c.id, nombre: c.nombre, dni: c.identificador })"
    option-label="nombre"
    :search-keys="['nombre', 'identificador']"
  />
  
  <!-- Usar los datos -->
  <p v-if="selectedCliente">
    Cliente: {{ selectedCliente.nombre }} ({{ selectedCliente.dni }})
  </p>
</template>
```

### 3. Búsqueda en Servidor (API)

```vue
<template>
  <SearchableSelect
    v-model="clienteId"
    :options="clientesFromAPI"
    option-label="nombre"
    option-value="id"
    @search="buscarEnServidor"
  />
</template>

<script setup>
import { ref } from 'vue'

const clienteId = ref(null)
const clientesFromAPI = ref([])

const buscarEnServidor = async (query) => {
  if (query.length >= 3) {
    // Llamar a tu API
    const response = await fetch(`/api/clientes/search?q=${query}`)
    clientesFromAPI.value = await response.json()
  }
}
</script>
```

### 4. Selector con Validación Personalizada

```vue
<template>
  <SearchableSelect
    v-model="planId"
    :options="planes"
    label="Plan"
    :error="planError"
    required
    @change="validarPlan"
  />
</template>

<script setup>
import { ref } from 'vue'

const planId = ref(null)
const planError = ref('')

const validarPlan = (plan) => {
  if (!plan) {
    planError.value = 'Debe seleccionar un plan'
  } else if (plan.precio > 100) {
    planError.value = 'Este plan requiere aprobación especial'
  } else {
    planError.value = ''
  }
}
</script>
```

## Tabla de Comparación de Configuraciones

| Necesidad | Configuración |
|-----------|---------------|
| Buscar solo por DNI | `:search-keys="['identificador']"` |
| Buscar por nombre y DNI | `:search-keys="['nombre', 'identificador']"` |
| Retornar ID | `option-value="id"` |
| Retornar DNI | `option-value="identificador"` |
| Retornar objeto completo | `:option-value="(item) => item"` |
| Retornar campos específicos | `:option-value="(item) => ({ id: item.id, nombre: item.nombre })"` |
| Label simple | `option-label="nombre"` |
| Label formateado | `:option-label="(item) => \`${item.nombre} - ${item.dni}\`"` |

## Tips y Mejores Prácticas

1. **Búsqueda eficiente**: Define solo los campos necesarios en `searchKeys` para mejor rendimiento
2. **Labels descriptivos**: Usa funciones en `optionLabel` para mostrar información relevante
3. **Valores apropiados**: Retorna solo los datos que necesitas con `optionValue`
4. **Validación**: Usa el prop `error` para mostrar mensajes de validación
5. **Búsqueda en servidor**: Usa el evento `@search` para búsquedas en API cuando tengas muchos datos
6. **Slots personalizados**: Usa el slot `option` para diseños complejos con avatares, badges, etc.


## Posicionamiento Inteligente

El componente detecta automáticamente si hay suficiente espacio debajo del selector para mostrar el dropdown. Si no hay espacio suficiente pero sí hay espacio arriba, el dropdown se abrirá hacia arriba automáticamente.

### Cómo funciona:

1. Al abrir el dropdown, calcula el espacio disponible arriba y abajo
2. Si hay menos de 320px (altura máxima del dropdown) abajo pero más espacio arriba, abre hacia arriba
3. Se recalcula automáticamente en eventos de scroll y resize
4. Funciona perfectamente en modales, contenedores con scroll, y cualquier posición en la página

### Ejemplo visual:

```
┌─────────────────────┐
│ Dropdown Options    │  ← Se abre hacia arriba
│ • Opción 1          │     cuando no hay espacio
│ • Opción 2          │     abajo
│ • Opción 3          │
└─────────────────────┘
┌─────────────────────┐
│ [Selector ▲]        │  ← Selector cerca del fondo
└─────────────────────┘
```

No requiere configuración adicional, funciona automáticamente.


## Búsqueda en Campos Anidados

El componente soporta búsqueda en campos anidados usando notación de punto. Esto es especialmente útil cuando trabajas con objetos que tienen relaciones.

### Ejemplo con Contratos:

```vue
<SearchableSelect
  v-model="contratoId"
  :options="contratos"
  label="Contrato"
  search-placeholder="Buscar por cliente, DNI o plan..."
  :search-keys="[
    'id',                           // ID del contrato
    'cliente.nombre',               // Nombre del cliente (anidado)
    'cliente.razon_social',         // Razón social (anidado)
    'cliente.identificador',        // DNI del cliente (anidado)
    'plan.nombre'                   // Nombre del plan (anidado)
  ]"
  option-value="id"
/>
```

### Estructura de datos:

```javascript
const contratos = [
  {
    id: 1,
    precio: 49.99,
    cliente: {
      id: 10,
      nombre: 'Juan Pérez',
      identificador: '12345678',
      email: 'juan@example.com'
    },
    plan: {
      id: 5,
      nombre: 'Plan Premium',
      velocidad_bajada: 100
    }
  }
]
```

Con esta configuración, el usuario puede buscar:
- Por ID de contrato: "1"
- Por nombre del cliente: "Juan"
- Por DNI: "12345678"
- Por plan: "Premium"

### Ventajas:

✅ No necesitas aplanar tus objetos  
✅ Mantén la estructura de datos original  
✅ Búsqueda profunda sin código adicional  
✅ Soporta múltiples niveles de anidación  
