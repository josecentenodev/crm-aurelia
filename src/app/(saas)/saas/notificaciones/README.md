# 🔔 Módulo de Notificaciones

Módulo refactorizado siguiendo el patrón modular de features de Aurelia Platform.

## 📁 Estructura

```
notificaciones/
├── page.tsx                          # Orquestador principal (115 líneas)
├── _features/                        # Features autocontenidas
│   ├── notification-header/          # Header con acciones
│   │   ├── notifications-header.tsx
│   │   └── index.ts
│   ├── notification-stats/           # Tarjetas de estadísticas
│   │   ├── stats-cards.tsx
│   │   └── index.ts
│   ├── notification-filters/         # Filtros de búsqueda
│   │   ├── notification-filters.tsx
│   │   └── index.ts
│   └── notification-list/            # Lista de notificaciones
│       ├── notification-list.tsx
│       ├── components/
│       │   ├── notification-item.tsx
│       │   ├── empty-state.tsx
│       │   ├── loading-skeleton.tsx
│       │   └── index.ts
│       └── index.ts
├── _hooks/                           # Hooks del módulo
│   ├── use-notification-actions.ts   # Actions centralizadas
│   └── index.ts
├── _lib/                             # Utilidades compartidas
│   ├── notification-config.ts        # Configuración
│   ├── notification-helpers.ts       # Helpers (iconos, colores, etc.)
│   └── index.ts
└── README.md                         # Este archivo
```

## 🎯 Principios de Arquitectura

### 1. **Separación de Responsabilidades**
- **page.tsx**: Orquestador minimalista (~115 líneas vs 378 originales)
- **Features**: Componentes autocontenidos y reutilizables
- **Hooks**: Lógica de negocio encapsulada
- **Lib**: Utilidades puras sin efectos secundarios

### 2. **Alta Cohesión, Bajo Acoplamiento**
- Cada feature es independiente
- Comunicación vía props explícitas
- No hay imports cruzados entre features

### 3. **Single Responsibility**
- `NotificationHeader`: Solo header y botón de "marcar todas"
- `StatsCards`: Solo visualización de estadísticas
- `NotificationFilters`: Solo controles de filtrado
- `NotificationList`: Solo renderizado de lista

## 🔧 Componentes Principales

### `page.tsx` - Orquestador
**Responsabilidades:**
- Gestión de estado global
- Coordinación de queries
- Manejo de subscripción realtime
- Distribución de props a features

```tsx
// Estructura simplificada
export default function NotificacionesPage() {
  // 1. Context & State
  const { session, clientId, filters } = useContexts()

  // 2. Data Fetching
  const { data, isLoading, error } = useNotificacionesList()
  const { stats } = useNotificacionesStats()

  // 3. Actions
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationActions()

  // 4. Realtime
  useSupabaseRealtimeNotifications()

  // 5. Render
  return (
    <>
      <NotificationsHeader />
      <StatsCards />
      <NotificationFilters />
      <NotificationList />
    </>
  )
}
```

### Features

#### `NotificationsHeader`
- Título y descripción
- Botón "Marcar todas como leídas"
- Condicional basado en `stats.unread`

#### `StatsCards`
- 4 tarjetas: Total, No leídas, Urgentes, Errores
- Visualización con iconos y colores
- Data desde `NotificationStats`

#### `NotificationFilters`
- Filtros por tipo, prioridad, estado
- Botón "Limpiar filtros"
- Manejo de estado local

#### `NotificationList`
- Estados: loading, error, empty, success
- Paginación con "Cargar más"
- Delegación a `NotificationItem`

#### `NotificationItem`
- Visualización de notificación individual
- Acciones: marcar como leída, eliminar
- Indicadores visuales (leído/no leído, prioridad)

## 📚 Hooks Personalizados

### `use-notification-actions.ts`
Centraliza todas las mutaciones:
```tsx
const {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  isMarkingAsRead,
  isMarkingAllAsRead,
  isDeleting,
  isLoading,
} = useNotificationActions()
```

**Beneficios:**
- DRY: Lógica de mutaciones en un solo lugar
- Consistencia: Mismo manejo de errores
- Testeable: Mock único para tests

## 🛠️ Utilidades

### `notification-config.ts`
Configuración centralizada:
```tsx
export const NOTIFICATION_CONFIG = {
  pagination: { defaultLimit: 50, maxLimit: 100 },
  polling: { listInterval: 60000, statsInterval: 120000 },
  cache: { staleTime: 20000, gcTime: 300000 },
  cleanup: { autoMarkReadAfterDays: 30 },
  ui: { skeletonCount: 3, dropdownPreviewLimit: 5 },
}
```

### `notification-helpers.ts`
Funciones puras para:
- `getNotificationIcon(type)` - Componente de icono
- `getNotificationIconClasses(type)` - Clases CSS
- `getPriorityBadgeClasses(priority)` - Clases de badge
- `getUnreadNotificationClasses(read)` - Clases de card
- `translateNotificationType(type)` - Traducción
- `translateNotificationPriority(priority)` - Traducción

## 🔄 Flujo de Datos

```
┌─────────────────┐
│   page.tsx      │ ◄── Orquestador
└────────┬────────┘
         │
         ├─► useNotificacionesList() ──┐
         ├─► useNotificacionesStats()   ├─► tRPC ──► API Router ──► Prisma
         └─► useNotificationActions() ──┘
         │
         ├─► useSupabaseRealtimeNotifications() ──► Supabase Realtime
         │                                               │
         │                                               ▼
         │                                      Query Invalidation
         │
         ├─► NotificationsHeader ────► stats, onMarkAllAsRead
         ├─► StatsCards ─────────────► stats
         ├─► NotificationFilters ────► filters, handlers
         └─► NotificationList ───────► notifications, handlers
                    │
                    └─► NotificationItem × N
```

## ✅ Mejoras Implementadas

### Hotfixes Críticos
1. ✅ **NotificationsButton conectado** - Usa store real + hooks
2. ✅ **Deprecado onSuccess eliminado** - Migrado a useEffect
3. ✅ **Import faltante agregado** - `api` en realtime hook

### Arquitectura
4. ✅ **Patrón modular implementado** - 100% adherencia a CLAUDE.md
5. ✅ **Configuración centralizada** - Sin magic numbers
6. ✅ **Helpers compartidos** - DRY en iconos, colores, traducciones
7. ✅ **Hooks personalizados** - Acciones encapsuladas

### Code Quality
8. ✅ **TypeScript strict** - 0 errores de tipo
9. ✅ **Props explícitas** - No prop drilling
10. ✅ **Exports organizados** - Barrel files (index.ts)

## 🎨 Convenciones de Código

### Naming
- **Components**: PascalCase (`NotificationList.tsx`)
- **Hooks**: camelCase con prefijo `use` (`use-notification-actions.ts`)
- **Utils**: kebab-case (`notification-helpers.ts`)
- **Folders**: kebab-case (`notification-list/`)

### Imports
```tsx
// ✅ Correcto - Importar desde index.ts
import { NotificationList } from "./_features/notification-list"
import { useNotificationActions } from "./_hooks"
import { NOTIFICATION_CONFIG, getPriorityBadgeClasses } from "./_lib"

// ❌ Incorrecto - Importar archivos individuales
import { NotificationList } from "./_features/notification-list/notification-list"
```

### Estructura de Componentes
```tsx
// 1. Imports
import { ... } from "..."

// 2. Types/Interfaces
interface Props { ... }

// 3. Component
export function Component({ ...props }: Props) {
  // 3.1. Hooks
  const data = useHook()

  // 3.2. Handlers
  const handleAction = () => { ... }

  // 3.3. Render
  return (...)
}
```

## 🧪 Testing (Pendiente)

### Estructura Propuesta
```
notificaciones/
└── __tests__/
    ├── page.test.tsx
    ├── _features/
    │   ├── notification-header.test.tsx
    │   ├── notification-stats.test.tsx
    │   ├── notification-filters.test.tsx
    │   └── notification-list.test.tsx
    ├── _hooks/
    │   └── use-notification-actions.test.ts
    └── _lib/
        ├── notification-config.test.ts
        └── notification-helpers.test.ts
```

## 📊 Métricas

### Antes de Refactoring
- **page.tsx**: 378 líneas
- **Componentes**: 1 archivo monolítico
- **Separación**: Baja cohesión
- **Reutilización**: Difícil
- **Testing**: Complejo

### Después de Refactoring
- **page.tsx**: 115 líneas (-70%)
- **Componentes**: 11 archivos modulares
- **Separación**: Alta cohesión, bajo acoplamiento
- **Reutilización**: Features independientes
- **Testing**: Cada feature se testea aislada

## 🚀 Próximos Pasos

### Corto Plazo
- [ ] Agregar tests unitarios
- [ ] Implementar optimistic updates
- [ ] Reducir polling con realtime activo

### Mediano Plazo
- [ ] Virtual scrolling para listas grandes
- [ ] Rate limiting en creación
- [ ] Deduplicación de notificaciones

### Largo Plazo
- [ ] Agrupación de notificaciones similares
- [ ] Preferencias de usuario
- [ ] Email/Push notifications
- [ ] Analytics de engagement

## 📖 Referencias

- [CLAUDE.md](../../../../CLAUDE.md) - Lineamientos del proyecto
- [NOTIFICATIONS_QUICKSTART.md](../../../../docs/NOTIFICATIONS_QUICKSTART.md) - Guía rápida
- [Prisma Schema](../../../../prisma/schema.prisma) - Modelo de datos
- [tRPC Router](../../../../server/api/routers/notificaciones.ts) - API layer

---

**Última actualización**: 2025-01-13
**Autor**: Claude Code
**Versión**: 2.0.0
