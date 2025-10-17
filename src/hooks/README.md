# Hooks Compartidos Globales

Esta carpeta contiene **SOLO hooks compartidos** entre múltiples módulos de la aplicación.

## Regla de Oro

**Si un hook es específico de un módulo, debe vivir en `módulo/_hooks/`**

## Hooks Disponibles

### Sistema de UI

#### `use-toast.ts`
Sistema global de notificaciones toast.

**Usado en:** Todos los módulos (60+ archivos)

**Uso:**
```typescript
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: "Éxito",
  description: "Operación completada",
  variant: "default"
})
```

---

### Conversaciones y Mensajería

#### `use-conversations.ts`
Operaciones de conversaciones compartidas entre módulos.

**Usado en:** `conversaciones/`, `_global_features/RealTimeMetrics`

**Uso:**
```typescript
import { useConversations } from '@/hooks/use-conversations'

const {
  conversations,
  instances,
  stats,
  createConversation,
  markConversationAsRead
} = useConversations()
```

---

### Notificaciones

#### `use-notificaciones-queries.ts`
Queries y mutations para el sistema de notificaciones.

**Usado en:** `notificaciones/`, otros módulos

**Exports:**
- `useNotificacionesList()`
- `useNotificacionById()`
- `useCreateNotificacion()`
- `useUpdateNotificacion()`
- `useMarkNotificacionesAsRead()`
- `useMarkAllNotificacionesAsRead()`
- `useDeleteNotificacion()`
- `useDeleteManyNotificaciones()`
- `useNotificacionesStats()`
- `useNotificacionesUnreadCount()`
- `useCleanExpiredNotificaciones()`

#### `use-supabase-realtime-notifications.ts`
Suscripción en tiempo real a notificaciones usando Supabase.

**Usado en:** `_global_features/client-selector/realtime-notifications-provider.tsx`

**Uso:**
```typescript
import { useSupabaseRealtimeNotifications } from '@/hooks/use-supabase-realtime-notifications'

useSupabaseRealtimeNotifications({
  clientId,
  userId,
  enabled: true
})
```

---

### Utilidades

#### `use-debounce.ts`
Hook de debounce para optimizar rendimiento.

**Usado en:** Múltiples módulos (búsquedas, filtros)

**Exports:**
- `useDebounce<T>(value: T, delay: number): T`
- `useDebouncedCallback<T>(callback: T, delay: number): T`

**Uso:**
```typescript
import { useDebounce } from '@/hooks/use-debounce'

const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)
```

---

### Integraciones y Configuración

#### `use-instances.ts`
Gestión de instancias de WhatsApp (Evolution API).

**Usado en:** `configuracion/`

**Exports:**
- `getClientInstances(clientId: string)`
- `getInstanceStatus(clientId: string, instanceName: string)`
- `createWhatsAppInstance()`
- `deleteWhatsAppInstance()`

#### `use-integrations.ts`
Gestión de integraciones globales.

**Usado en:** `configuracion/`

**Retorna:**
```typescript
{
  integrations: Integration[]
  clients: Client[]
  isLoading: boolean
  error: Error | null
}
```

#### `use-plan-limits.ts`
Validación de límites de planes.

**Usado en:** `configuracion/`, validaciones globales

**Exports:**
- `usePlanLimits(options)`
- Funciones de validación de recursos
- Alertas de uso

---

### Archivos y Multimedia

#### `use-file-upload.ts`
Upload de archivos a Supabase Storage.

**Usado en:** `components/ui/file-history.tsx`

**Exports:**
- `useFileUpload()` - Upload con progreso
- `useFileInfo()` - Información de archivos del cliente

**Uso:**
```typescript
import { useFileUpload } from '@/hooks/use-file-upload'

const { uploadFile, isUploading, progress } = useFileUpload()

const result = await uploadFile(file, {
  clientId,
  messageType: 'image',
  onProgress: (p) => console.log(p)
})
```

#### `use-media-info.ts`
Información de archivos multimedia.

**Usado en:** `components/ui/media-display.tsx`

**Uso:**
```typescript
import { useMediaInfo } from '@/hooks/use-media-info'

const {
  mediaInfo,
  loading,
  getMediaUrl,
  downloadMedia
} = useMediaInfo(messageId)
```

---

## Hooks Específicos de Módulos

Los siguientes módulos tienen sus propios hooks en `_hooks/`:

### Módulos SaaS
- `/agentes/_hooks/` - Gestión de agentes y playground
- `/contactos/_hooks/` - CRUD de contactos
- `/usuarios/_hooks/` - CRUD de usuarios
- `/conversaciones/_hooks/` - Conversaciones y mensajes
- `/notificaciones/_hooks/` - Acciones de notificaciones
- `/pipelines/_hooks/` - Kanban y oportunidades
- `/tareas/_hooks/` - Gestión de tareas

### Módulos Dashboard
- `/dashboard/clientes/_hooks/` - Gestión de clientes

## Criterios para Hooks Compartidos

Un hook debe estar en `src/hooks/` si:

1. ✅ Se usa en **3+ módulos diferentes**
2. ✅ Es una **utilidad genérica** (debounce, toast)
3. ✅ Es parte de un **sistema global** (notificaciones, realtime)
4. ✅ Se usa en **componentes UI compartidos** (`components/ui/`)

Un hook debe ir en `módulo/_hooks/` si:

1. ✅ Es **específico del dominio** del módulo
2. ✅ Solo se usa **dentro del módulo**
3. ✅ Contiene **lógica de negocio** del módulo

---

**Última actualización:** Octubre 15, 2025 - Post migración de hooks

