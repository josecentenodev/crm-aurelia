# 🗄️ Store - Gestión de Estado Global

Estado compartido del módulo de conversaciones usando Zustand con persistencia.

## 🎯 Principios

1. **Separación por responsabilidad** - Un store por dominio de estado
2. **Persistencia selectiva** - Solo se persiste lo necesario
3. **Funciones puras** - `getTrpcFilters()` no muta estado durante render
4. **Type-safe** - TypeScript estricto en todos los stores

## 📦 Stores Disponibles

### **🔍 `useChatsFiltersStore`**
Gestiona filtros de búsqueda, fecha y categorías de conversaciones.

**Estado:**
```typescript
{
  // Filtros básicos
  searchTerm: string
  dateFilter: 'today' | 'week' | 'month' | 'quarter' | 'year'
  selectedCategory: 'all' | 'unassigned' | 'mine' | 'new' | 'archived'

  // Filtros avanzados
  statusFilter?: ConversationStatus
  channelFilter?: ContactChannel
  instanceFilter?: string
  phoneNumberFilter?: string

  // UI
  isFiltersOpen: boolean
  activeFiltersCount: number
  categoryCounts: Record<string, number>
}
```

**Acciones:**
```typescript
const {
  // Setters
  setSearchTerm,
  setDateFilter,
  setSelectedCategory,
  setStatusFilter,
  setChannelFilter,
  setInstanceFilter,
  setPhoneNumberFilter,
  
  // Utilidades
  clearFilters,           // Limpia todos los filtros
  resetToDefaults,        // Vuelve a valores iniciales
  toggleFilters,          // Abre/cierra panel de filtros
  getTrpcFilters          // Combina filtros en formato tRPC
} = useChatsFiltersStore()
```

**Ejemplo:**
```typescript
import { useChatsFiltersStore } from './_store'

function Sidebar() {
  const { 
    searchTerm, 
    setSearchTerm, 
    selectedCategory,
    getTrpcFilters 
  } = useChatsFiltersStore()

  // Obtener filtros para tRPC (función pura)
  const filters = getTrpcFilters()

  const { data } = api.conversaciones.list.useQuery({
    clientId,
    filters // ← ConversationFilters completo
  })

  return (
    <Input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  )
}
```

**Persistencia:**
Solo se guarda en localStorage:
- `searchTerm`
- `dateFilter`
- `selectedCategory`
- Filtros avanzados (status, channel, instance, phone)

**NO se persiste:**
- `isFiltersOpen` (estado efímero de UI)
- `activeFiltersCount` (calculado)
- `categoryCounts` (dinámico)

---

### **🎯 `useChatsSelectionStore`**
Rastrea qué conversación está seleccionada actualmente.

**Estado:**
```typescript
{
  selectedConversationId: string | null
}
```

**Acciones:**
```typescript
const {
  selectedConversationId,
  setSelectedConversationId
} = useChatsSelectionStore()
```

**Ejemplo:**
```typescript
function ConversationCard({ conversation }: Props) {
  const { selectedConversationId, setSelectedConversationId } = 
    useChatsSelectionStore()

  const isSelected = selectedConversationId === conversation.id

  return (
    <Card 
      className={isSelected ? 'ring-2' : ''}
      onClick={() => setSelectedConversationId(conversation.id)}
    >
      {conversation.contact?.name}
    </Card>
  )
}

function ChatPanel() {
  const { selectedConversationId } = useChatsSelectionStore()

  if (!selectedConversationId) {
    return <EmptyState />
  }

  return <Messages conversationId={selectedConversationId} />
}
```

**Persistencia:**
Se guarda `selectedConversationId` para mantener selección entre recargas.

---

### **🎨 `useUIStateStore`**
Maneja estado efímero de UI (colapsos, tabs, etc).

**Estado:**
```typescript
{
  collapsedInstances: Set<string>  // IDs de instancias colapsadas
}
```

**Acciones:**
```typescript
const {
  toggleInstanceCollapse,    // Toggle específico
  collapseInstance,          // Colapsar uno
  expandInstance,            // Expandir uno
  collapseAll,               // Colapsar todos (reset)
  expandAll,                 // Expandir todos
  isInstanceCollapsed        // Checker
} = useUIStateStore()
```

**Ejemplo:**
```typescript
function InstanceGroup({ instanceId, conversations }: Props) {
  const { isInstanceCollapsed, toggleInstanceCollapse } = useUIStateStore()

  const isCollapsed = isInstanceCollapsed(instanceId)

  return (
    <>
      <button onClick={() => toggleInstanceCollapse(instanceId)}>
        {isCollapsed ? <ChevronRight /> : <ChevronDown />}
      </button>

      {!isCollapsed && (
        <div>
          {conversations.map(conv => <Card key={conv.id} />)}
        </div>
      )}
    </>
  )
}
```

**Persistencia:**
Se serializa `Set` como `Array` para localStorage:

```typescript
// Al guardar
partialize: (state) => ({
  collapsedInstances: Array.from(state.collapsedInstances)
})

// Al rehidratar
onRehydrateStorage: () => (state) => {
  if (state?.collapsedInstances) {
    state.collapsedInstances = new Set(state.collapsedInstances)
  }
}
```

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│  User Action    │
│  (UI Event)     │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Store Action   │
│  setFilter()    │
└────────┬────────┘
         ↓
┌─────────────────┐
│  State Update   │
│  (Zustand)      │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Subscribers    │
│  Re-render      │
└────────┬────────┘
         ↓
┌─────────────────┐
│  tRPC Query     │
│  Refetch data   │
└─────────────────┘
```

## 🎯 Patrón de Uso: Filtros + tRPC

### **Componente que aplica filtros**
```typescript
function FiltersDialog() {
  const { 
    statusFilter, 
    setStatusFilter,
    channelFilter,
    setChannelFilter 
  } = useChatsFiltersStore()

  return (
    <Dialog>
      <Select 
        value={statusFilter} 
        onValueChange={setStatusFilter}
      >
        <SelectItem value="ACTIVA">Activa</SelectItem>
        <SelectItem value="ARCHIVADA">Archivada</SelectItem>
      </Select>

      <Select 
        value={channelFilter}
        onValueChange={setChannelFilter}
      >
        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
        <SelectItem value="TELEGRAM">Telegram</SelectItem>
      </Select>
    </Dialog>
  )
}
```

### **Componente que consume filtros**
```typescript
function ConversationsList() {
  const { getTrpcFilters } = useChatsFiltersStore()
  const { clientId } = useClientContext()

  // getTrpcFilters() es una función PURA
  // No muta estado, solo lee y transforma
  const filters = getTrpcFilters()

  const { data } = api.conversaciones.list.useQuery({
    clientId,
    filters  // ← { status: 'ACTIVA', channel: 'WHATSAPP', ... }
  })

  return <>{/* Renderizar data */}</>
}
```

## 🔧 Implementación de `getTrpcFilters()`

Esta función combina todos los filtros en el formato esperado por tRPC:

```typescript
getTrpcFilters: (): ConversationFilters => {
  const state = get()
  
  const filters: ConversationFilters = {
    groupByInstance: true,
  }

  // Búsqueda
  if (state.searchTerm.trim()) {
    filters.search = state.searchTerm.trim()
  }

  // Filtros avanzados
  if (state.statusFilter) {
    filters.status = state.statusFilter as ConversationStatus
  }

  if (state.channelFilter) {
    filters.channel = state.channelFilter as ContactChannel
  }

  if (state.instanceFilter) {
    filters.evolutionInstanceId = state.instanceFilter
  }

  // Fecha
  if (state.dateFilter !== 'all') {
    const range = getDateRange(state.dateFilter)
    if (range) {
      filters.dateFrom = range.from
      filters.dateTo = range.to
    }
  }

  // Categoría (override otros filtros si aplica)
  switch (state.selectedCategory) {
    case 'unassigned':
      filters.assignedUserId = null
      break
    case 'new':
      filters.status = 'ACTIVA'
      break
    case 'archived':
      filters.status = 'ARCHIVADA'
      break
  }

  return filters
}
```

## ⚡ Optimizaciones

### **Debounced updates**
`activeFiltersCount` se actualiza con debounce:

```typescript
const debouncedUpdate = debounce(() => {
  const count = calculateActiveFiltersCount(get())
  set({ activeFiltersCount: count })
}, 100)

setSearchTerm: (term) => {
  set({ searchTerm: term })
  debouncedUpdate()  // ← No se ejecuta en cada keystroke
}
```

### **Función pura en render**
`getTrpcFilters()` **NO** llama a `set()`:

```typescript
// ✅ BIEN: Solo lee
getTrpcFilters: () => {
  const state = get()
  return { /* filtros transformados */ }
}

// ❌ MAL: Muta durante render
getTrpcFilters: () => {
  set({ lastRead: Date.now() })  // ← Causa loops infinitos
  return { /* ... */ }
}
```

## 🐛 Debugging

### **Ver estado completo**
```typescript
// En DevTools Console
import { useChatsFiltersStore } from './_store'

console.log(useChatsFiltersStore.getState())
// {
//   searchTerm: 'Juan',
//   dateFilter: 'week',
//   selectedCategory: 'unassigned',
//   activeFiltersCount: 3,
//   ...
// }
```

### **Monitorear cambios**
```typescript
useChatsFiltersStore.subscribe(
  (state) => console.log('Filtros cambiaron:', state)
)
```

### **Limpiar localStorage**
```typescript
localStorage.removeItem('chats-filters-store')
localStorage.removeItem('chats-selection-store')
localStorage.removeItem('conversations-ui-state')
```

## ⚠️ Consideraciones

### **No usar en loops**
```typescript
// ❌ MAL: Re-render por cada conversación
conversations.map(conv => {
  const { selectedId } = useChatsSelectionStore()
  return <Card isSelected={selectedId === conv.id} />
})

// ✅ BIEN: Hook fuera del loop
const { selectedId } = useChatsSelectionStore()
conversations.map(conv => (
  <Card isSelected={selectedId === conv.id} />
))
```

### **Selectores para performance**
```typescript
// Si solo necesitas un campo
const searchTerm = useChatsFiltersStore(state => state.searchTerm)
// ← Solo re-renderiza cuando searchTerm cambia

// vs
const { searchTerm } = useChatsFiltersStore()
// ← Re-renderiza con cualquier cambio del store
```

## 📚 Referencias

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [React State Management](https://react.dev/learn/managing-state)

---

**Última actualización:** Documentación inicial - Octubre 2025

