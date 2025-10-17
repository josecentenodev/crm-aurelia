# 🗂️ Sidebar - Lista de Conversaciones

Panel lateral que muestra todas las conversaciones agrupadas por instancia con filtros y búsqueda en tiempo real.

## 🎯 Responsabilidades

1. **Listar conversaciones** - Agrupadas por instancia de Evolution API
2. **Filtros por categoría** - Todas, sin asignar, mías, nuevas, archivadas
3. **Búsqueda en tiempo real** - Por nombre, email o teléfono
4. **Actualización automática** - Vía Supabase Realtime
5. **Selección de conversación** - Coordina con ChatPanel vía store

## 🧩 Componentes Incluidos

```
sidebar/
├── chats-sidebar.tsx                  # 🎛️ Contenedor principal
└── components/
    ├── conversations-header.tsx       # 📋 Header con botón crear
    ├── conversations-search.tsx       # 🔍 Input de búsqueda
    ├── conversations-filters.tsx      # 🏷️ Botones de categorías
    ├── conversations-list.tsx         # 📜 Lista con estados
    ├── instance-group.tsx             # 📁 Grupo colapsable
    ├── conversation-card.tsx          # 💬 Card individual
    └── index.ts                       # Exports
```

## 📊 Flujo de Datos

```
ChatsFiltersStore (Zustand)
    ↓
getTrpcFilters() → { status, channel, search, dateRange }
    ↓
api.conversaciones.list.useQuery({ clientId, filters })
    ↓
ChatConversationsByInstance[] (agrupadas por instancia)
    ↓
useConversationsFiltering({ data, selectedCategory })
    ↓
filteredGroups (por categoría seleccionada)
    ↓
ConversationsList → InstanceGroup[] → ConversationCard[]
```

### **Actualización en tiempo real**
```
useRealtimeConversations({
  clientId,
  onInvalidate: () => utils.conversaciones.list.invalidate()
})
    ↓
Escucha INSERT/UPDATE/DELETE en Conversation
    ↓
Invalida query tRPC
    ↓
Refetch automático con filtros actuales
```

## 🔑 Props y Hooks

### **Props**
```typescript
interface ChatsSidebarProps {
  // Componente sin props - usa stores y contexto
}
```

### **Hooks utilizados**

**`useChatsFiltersStore`**
```typescript
const {
  searchTerm,           // Término de búsqueda
  setSearchTerm,
  selectedCategory,     // Categoría activa
  setSelectedCategory,
  getTrpcFilters        // Combina todos los filtros
} = useChatsFiltersStore()
```

**`useRealtimeConversations`**
```typescript
useRealtimeConversations({
  clientId,
  enabled: !!clientId && !isPending,
  onInvalidate: handleInvalidate  // Callback estable
})
```

**`useConversationsFiltering`**
```typescript
const { filteredGroups, categoryCounts } = useConversationsFiltering({
  conversationsData,
  selectedCategory
})
```

## 🎨 Categorías de Filtrado

```typescript
const categories: CategoryFilter[] = [
  { 
    id: 'all', 
    label: 'Todas', 
    icon: MessageSquare, 
    count: categoryCounts.all 
  },
  { 
    id: 'unassigned', 
    label: 'Sin asignar', 
    icon: User, 
    count: categoryCounts.unassigned 
  },
  { 
    id: 'mine', 
    label: 'Mis conversaciones', 
    icon: Users, 
    count: categoryCounts.mine 
  },
  { 
    id: 'new', 
    label: 'Nuevas', 
    icon: Zap, 
    count: categoryCounts.new 
  },
  { 
    id: 'archived', 
    label: 'Archivadas', 
    icon: Archive, 
    count: categoryCounts.archived 
  }
]
```

**Lógica de filtrado:**
- `all`: Muestra todas las conversaciones
- `unassigned`: `assignedUser === null`
- `mine`: `assignedUser !== null`
- `new`: `status === 'ACTIVA'`
- `archived`: `status === 'ARCHIVADA'`

## 📦 Agrupación por Instancia

```typescript
interface ChatConversationsByInstance {
  instanceName: string          // Nombre de la instancia
  phoneNumber?: string | null   // Número asociado
  instanceStatus?: string        // CONNECTED | DISCONNECTED
  instanceId?: string
  conversations: ChatConversation[]
  stats: {
    total: number
    active: number
    paused: number
    finished: number
  }
}
```

**Beneficios:**
- Separación visual por número de WhatsApp
- Fácil identificar instancias desconectadas
- Estadísticas rápidas por instancia
- Colapso/expansión independiente

## ⚡ Optimizaciones Aplicadas

### **1. Callback estable para invalidación**
```typescript
const handleInvalidate = useCallback(() => {
  if (!clientId) return
  void utils.conversaciones.list.invalidate({ clientId, filters })
}, [utils, clientId, filters])
```

**Por qué:** Evita re-suscripciones innecesarias a Realtime.

### **2. Memoización de contactos filtrados**
```typescript
const filteredContacts = useMemo(() => {
  if (!searchTerm.trim()) return contacts
  const term = searchTerm.toLowerCase()
  return contacts.filter(/* ... */)
}, [contacts, searchTerm])
```

### **3. Type casting seguro**
```typescript
const conversationsData = rawConversationsData as unknown as ChatConversationsByInstance[]
```

**Por qué:** tRPC retorna tipo genérico, necesitamos tipo específico de UI.

### **4. Stale time en queries**
```typescript
api.conversaciones.list.useQuery(
  { clientId, filters },
  { 
    enabled: !!clientId, 
    refetchOnWindowFocus: false, 
    staleTime: 30 * 1000  // 30 segundos
  }
)
```

**Por qué:** Reduce fetches innecesarios, Realtime maneja updates.

## 🔗 Integración con Otros Componentes

### **Con ChatsFiltersStore**
- Lee filtros (search, category, date, status, channel)
- Actualiza filtros vía setters
- Combina filtros con `getTrpcFilters()`

### **Con ChatsSelectionStore**
- No lee/escribe directamente
- `ConversationCard` maneja selección

### **Con ChatPanel**
- Comunicación vía `ChatsSelectionStore`
- Sidebar selecciona → Store actualiza → ChatPanel lee

### **Con RealtimeManager**
- Usa singleton para canal único
- Cleanup automático en unmount
- Evita canales duplicados

## 🐛 Debugging

### **Ver filtros aplicados**
```typescript
import { useChatsFiltersStore } from '../../_store'

const filters = useChatsFiltersStore.getState().getTrpcFilters()
console.log('Filtros actuales:', filters)
// {
//   groupByInstance: true,
//   search: 'Juan',
//   status: 'ACTIVA',
//   dateFrom: Date(...),
//   dateTo: Date(...)
// }
```

### **Ver conteos de categorías**
```typescript
const { categoryCounts } = useConversationsFiltering(...)
console.log(categoryCounts)
// { all: 45, unassigned: 12, mine: 33, new: 8, archived: 5 }
```

### **Verificar Realtime**
```typescript
import { realtimeManager } from '../../_lib'

console.log(realtimeManager.getStatus())
// {
//   activeChannels: 1,
//   channels: ['conversations:sidebar:clientId123'],
//   pendingCleanups: 0
// }
```

## 💡 Casos de Uso

### **Filtrar por categoría**
```typescript
import { ChatsSidebar } from './_features'

<ChatsSidebar />
// Usuario click en "Sin asignar"
// → setSelectedCategory('unassigned')
// → useConversationsFiltering filtra
// → Solo muestra conversaciones sin assignedUser
```

### **Buscar conversación**
```typescript
// Usuario escribe en ConversationsSearch
// → setSearchTerm('juan')
// → getTrpcFilters() incluye search: 'juan'
// → tRPC query refetch con filtro
// → Resultados filtrados en backend
```

### **Crear nueva conversación**
```typescript
// Usuario click en botón +
// → handleCreateNew()
// → router.push('/saas/conversaciones/nueva')
// → Monta CreateConversationForm
```

## 🚀 Posibles Mejoras

### **1. Virtualización de lista**
```typescript
// Problema: Con 1000+ conversaciones, render es lento
// Solución: react-window o react-virtual

import { VariableSizeList } from 'react-window'

<VariableSizeList
  height={600}
  itemCount={conversations.length}
  itemSize={getItemSize}
>
  {({ index, style }) => (
    <div style={style}>
      <ConversationCard conversation={conversations[index]} />
    </div>
  )}
</VariableSizeList>
```

**Beneficio:** Renderiza solo items visibles, ~10x más rápido.

### **2. Debounce en búsqueda**
```typescript
// Problema: Cada keystroke hace un fetch
// Solución: Debounce en setSearchTerm

import { useDebouncedValue } from '@/hooks/use-debounced-value'

const debouncedSearch = useDebouncedValue(searchTerm, 300)

api.conversaciones.list.useQuery({
  search: debouncedSearch  // Solo fetches después de 300ms sin escribir
})
```

**Beneficio:** Menos requests, mejor UX.

### **3. Skeleton más específico**
```typescript
// Problema: Skeleton genérico no refleja estructura real
// Solución: Skeleton que imita grupos de instancias

<div>
  {[1, 2].map(i => (
    <div key={i}>
      <Skeleton className="h-8 mb-2" /> {/* Instance header */}
      {[1, 2, 3].map(j => (
        <Skeleton key={j} className="h-16 ml-4 mb-1" /> {/* Cards */}
      ))}
    </div>
  ))}
</div>
```

### **4. Prefetch al hover**
```typescript
// Problema: Click en conversación → espera fetch de mensajes
// Solución: Prefetch onMouseEnter

<ConversationCard
  onMouseEnter={() => {
    void utils.conversaciones.listMessages.prefetch({
      conversationId: conversation.id
    })
  }}
/>
```

**Beneficio:** Mensajes ya cargados al hacer click.

### **5. Infinite scroll**
```typescript
// Problema: Cargar 1000+ conversaciones de golpe
// Solución: Paginación + infinite scroll

const { data, fetchNextPage, hasNextPage } = 
  api.conversaciones.listInfinite.useInfiniteQuery({
    limit: 50
  })

<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
>
  {/* Conversaciones */}
</InfiniteScroll>
```

### **6. Filters persistence mejorada**
```typescript
// Problema: Filtros se resetean al recargar
// Solución: Ya implementado con Zustand persist ✅

// Mejora: Sync con URL params
const [searchParams, setSearchParams] = useSearchParams()

useEffect(() => {
  const category = searchParams.get('category')
  if (category) setSelectedCategory(category)
}, [searchParams])
```

### **7. Optimistic updates en cambios de estado**
```typescript
// Problema: Update de conversación → espera backend → UI actualiza
// Solución: Optimistic UI

const updateMutation = api.conversaciones.update.useMutation({
  onMutate: async (newData) => {
    // Cancelar queries en curso
    await utils.conversaciones.list.cancel()
    
    // Snapshot del estado anterior
    const previous = utils.conversaciones.list.getData()
    
    // Update optimista
    utils.conversaciones.list.setData(/* updated data */)
    
    return { previous }
  },
  onError: (err, newData, context) => {
    // Revertir en caso de error
    utils.conversaciones.list.setData(context.previous)
  }
})
```

## ⚠️ Consideraciones

### **Performance con muchas instancias**
- Cada `InstanceGroup` puede colapsar/expandir
- Estado de colapso persiste en `useUIStateStore`
- Con 50+ instancias, considerar agrupar diferente

### **Filtros y Realtime**
- Realtime invalida → tRPC refetch con filtros actuales
- Si usuario filtra mientras llega update, puede no verlo
- **Solución:** Invalidar siempre, tRPC decide si refetch

### **Conversación seleccionada puede ser filtrada**
```typescript
// Problema: Usuario selecciona conversación → aplica filtro → desaparece
// Solución actual: Conversación se deselecciona visualmente
// Mejora: Mantener seleccionada aunque no visible
```

---

**Última actualización:** Análisis detallado - Octubre 2025

