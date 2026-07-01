import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export function useRouteSearch() {
    const router = useRouter();
    const searchQuery = ref('');

    // Define las rutas con metadata para búsqueda
    const searchableRoutes = [
        {
            name: 'dashboard',
            path: '/',
            title: 'Dashboard',
            description: 'Panel principal con estadísticas',
            icon: '📊',
            keywords: ['inicio', 'principal', 'estadísticas', 'dashboard', 'home']
        },
        {
            name: 'users',
            path: '/users',
            title: 'Usuarios',
            description: 'Gestión de usuarios',
            icon: '👥',
            keywords: ['usuarios', 'clientes', 'personas', 'users']
        },
        {
            name: 'stats',
            path: '/stats',
            title: 'Estadísticas',
            description: 'Estadísticas y reportes',
            icon: '📈',
            keywords: ['estadísticas', 'estadisticas', 'reportes', 'gráficos', 'graficos', 'analytics']
        }
    ];

    // Función para normalizar texto (quitar acentos y convertir a minúsculas)
    const normalizeText = (text) => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

    // Resultados filtrados basados en la búsqueda
    const searchResults = computed(() => {
        if (!searchQuery.value || searchQuery.value.trim().length < 2) {
            return [];
        }

        const query = normalizeText(searchQuery.value.trim());

        return searchableRoutes
            .filter(route => {
                const titleMatch = normalizeText(route.title).includes(query);
                const descriptionMatch = normalizeText(route.description).includes(query);
                const keywordsMatch = route.keywords.some(keyword =>
                    normalizeText(keyword).includes(query)
                );

                return titleMatch || descriptionMatch || keywordsMatch;
            })
            .map(route => ({
                ...route,
                initial: route.icon
            }));
    });

    // Función para navegar a una ruta
    const navigateToRoute = (route) => {
        router.push({ name: route.name });
        searchQuery.value = ''; // Limpiar búsqueda después de navegar
    };

    return {
        searchQuery,
        searchResults,
        navigateToRoute
    };
}
