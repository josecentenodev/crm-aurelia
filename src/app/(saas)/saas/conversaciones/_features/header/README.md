# 🎛️ Header - Filtros y Controles

Barra superior que orquesta filtros de fecha, filtros avanzados y notificaciones del módulo de conversaciones.

## 🎯 Responsabilidades

1. **Filtro de fecha** - Rangos predefinidos (hoy, semana, mes, trimestre, año)
2. **Filtros avanzados** - Estado, canal, instancia, teléfono
3. **Notificaciones** - Badge con contador (placeholder para futuro)
4. **Coordinación de filtros** - Actualiza `ChatsFiltersStore` global

## 🧩 Componentes Incluidos

```
header/
├── chats-page-header.tsx              # 🎛️ Orquestador principal
└── components/
    ├── date-filter-select.tsx         # 📅 Selector de fecha
    ├── chats-page-filters-dialog.tsx  # 🔍 Modal filtros avanzados
    └── notifications-button.tsx       # 🔔 Botón notificaciones
```

## 📊 Flujo de Datos

```
ChatsPageHeader
    ↓
ChatsFiltersStore (lee/escribe)
    ↓
┌─────────────────┬──────────────────────┬──────────────────┐
│ DateFilterSelect│ ChatsFiltersDialog   │ NotificationsBtn │
│                 │                      │                  │
│ setDateFilter() │ setStatusFilter()    │ (placeholder)    │
│                 │ setChannelFilter()   │                  │
│                 │ setInstanceFilter()  │                  │
│                 │ setPhoneFilter()     │                  │
└─────────────────┴──────────────────────┴──────────────────┘
    ↓
getTrpcFilters()
    ↓
ChatsSidebar (consume filtros)
    ↓
api.conversaciones.list.useQuery({ filters })
```

## 🔑 Componentes Detallados

### **DateFilterSelect**
Dropdown para seleccionar rango de fecha.

```typescript
const { dateFilter, setDateFilter } = useChatsFiltersStore()

<Select value={dateFilter} onValueChange={setDateFilter}>
  <SelectItem value="today">Hoy</SelectItem>
  <SelectItem value="week">Esta semana</SelectItem>
  <SelectItem value="month">Este mes</SelectItem>
  <SelectItem value="quarter">Este trimestre</SelectItem>
  <SelectItem value="year">Este año</SelectItem>
</Select>
```

**Transformación interna:**
```typescript
// En getTrpcFilters()
if (dateFilter !== 'all') {
  const range = getDateRange(dateFilter)
  filters.dateFrom = range.from
  filters.dateTo = range.to
}
```

---

### **ChatsFiltersDialog**
Modal con filtros avanzados que afectan la query de backend.

```typescript
interface ChatsFiltersDialogProps {
  instances?: Array<{
    id: string
    instanceName: string
    phoneNumber?: string | null
  }>
}
```

**Filtros disponibles:**
1. **Estado** - ACTIVA, PAUSADA, FINALIZADA, ARCHIVADA
2. **Canal** - WHATSAPP, TELEGRAM, INSTAGRAM, FACEBOOK
3. **Instancia** - Dropdown con instancias del cliente
4. **Teléfono** - Input de búsqueda libre

**Estados:**
```typescript
const {
  statusFilter,
  channelFilter,
  instanceFilter,
  phoneNumberFilter,
  setStatusFilter,
  setChannelFilter,
  setInstanceFilter,
  setPhoneNumberFilter,
  clearFilters,      // Limpia todos
  resetToDefaults    // Vuelve a defaults
} = useChatsFiltersStore()

const hasActiveFilters = statusFilter || channelFilter || instanceFilter || phoneNumberFilter
```

**Badge indicador:**
```typescript
{hasActiveFilters && (
  <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white">
    !
  </Badge>
)}
```

---

### **NotificationsButton**
Placeholder para sistema de notificaciones futuro.

```typescript
const [notificationCount] = useState(3)  // Placeholder

<Button variant="ghost" size="sm">
  <Bell className="w-5 h-5" />
  {notificationCount > 0 && (
    <Badge className="absolute -top-1 -right-1 bg-purple-600">
      {notificationCount}
    </Badge>
  )}
</Button>
```

**Estado actual:** No tiene funcionalidad, solo UI.

## 📦 Integración con Store

### **Lectura de instancias**
```typescript
const { clientId } = useClientContext()

const { data: instances = [] } = api.conversaciones.getClientInstances.useQuery(
  { clientId: clientId! },
  { 
    enabled: !!clientId, 
    staleTime: 5 * 60 * 1000  // Cache 5 min
  }
)
```

**Por qué:** Dropdown de instancias necesita lista actualizada.

### **Actualización de filtros**
```typescript
// Usuario cambia filtro en Dialog
setStatusFilter('ACTIVA')
    ↓
ChatsFiltersStore actualizado
    ↓
Todos los consumidores (Sidebar) re-renderizan
    ↓
getTrpcFilters() retorna nuevos filtros
    ↓
tRPC query refetch automático
```

## 🎨 Layout Visual

```
┌─────────────────────────────────────────────────────────┐
│                 Conversaciones                          │
│                                                         │
│  [Búsqueda removida]     📅 [Hoy ▼] 🔍 [Filtros] 🔔 [3]│
└─────────────────────────────────────────────────────────┘
```

**Decisión de diseño:**
- Input de búsqueda se movió al sidebar (más contextual)
- Header solo tiene filtros globales
- Alineación derecha para consistencia visual

## ⚡ Optimizaciones Aplicadas

### **1. Cache de instancias**
```typescript
api.conversaciones.getClientInstances.useQuery(
  { clientId },
  { staleTime: 5 * 60 * 1000 }  // 5 minutos
)
```

**Por qué:** Instancias rara vez cambian, evita fetches innecesarios.

### **2. Enabled condicional**
```typescript
{ enabled: !!clientId }
```

**Por qué:** No fetch hasta que clientId esté disponible.

### **3. Props drilling mínimo**
```typescript
// ✅ BIEN: Solo pasa instances necesarias
<ChatsFiltersDialog instances={instances} />

// ❌ MAL: Pasar todo el store
<ChatsFiltersDialog store={useChatsFiltersStore()} />
```

## 🐛 Debugging

### **Ver filtros activos**
```typescript
import { useChatsFiltersStore } from '../../_store'

const state = useChatsFiltersStore.getState()
console.log('Filtros header:', {
  dateFilter: state.dateFilter,
  statusFilter: state.statusFilter,
  channelFilter: state.channelFilter,
  instanceFilter: state.instanceFilter,
  activeFiltersCount: state.activeFiltersCount
})
```

### **Ver transformación a tRPC**
```typescript
const filters = useChatsFiltersStore.getState().getTrpcFilters()
console.log('Filtros enviados a tRPC:', filters)
// {
//   groupByInstance: true,
//   status: 'ACTIVA',
//   channel: 'WHATSAPP',
//   dateFrom: Date(2025-10-01),
//   dateTo: Date(2025-10-31)
// }
```

## 🚀 Posibles Mejoras

### **1. Filtros guardados (presets)**
```typescript
// Mejora: Guardar combinaciones frecuentes
const filterPresets = [
  { 
    name: 'Sin responder hoy',
    filters: { 
      dateFilter: 'today', 
      statusFilter: 'ACTIVA',
      assignedUserId: null 
    }
  },
  {
    name: 'WhatsApp archivadas',
    filters: {
      channelFilter: 'WHATSAPP',
      statusFilter: 'ARCHIVADA'
    }
  }
]

<Popover>
  <PopoverTrigger>
    <Button>Filtros guardados</Button>
  </PopoverTrigger>
  <PopoverContent>
    {filterPresets.map(preset => (
      <Button onClick={() => applyPreset(preset)}>
        {preset.name}
      </Button>
    ))}
  </PopoverContent>
</Popover>
```

### **2. Indicador visual de filtros activos**
```typescript
// Mejora: Mostrar chips con filtros aplicados
{activeFiltersCount > 0 && (
  <div className="flex gap-2 ml-4">
    {statusFilter && (
      <Badge variant="secondary">
        Estado: {statusFilter}
        <X className="w-3 h-3" onClick={() => setStatusFilter(undefined)} />
      </Badge>
    )}
    {channelFilter && (
      <Badge variant="secondary">
        Canal: {channelFilter}
        <X className="w-3 h-3" onClick={() => setChannelFilter(undefined)} />
      </Badge>
    )}
  </div>
)}
```

### **3. Búsqueda global mejorada**
```typescript
// Mejora: Agregar búsqueda global en header
<div className="flex-1 max-w-md">
  <Input
    placeholder="Buscar en todas las conversaciones..."
    value={globalSearch}
    onChange={(e) => setGlobalSearch(e.target.value)}
    icon={<Search />}
  />
</div>
```

**Diferencia con sidebar:**
- Header: Búsqueda global (incluye archivadas, todas las instancias)
- Sidebar: Búsqueda filtrada (solo en lista visible)

### **4. Notificaciones funcionales**
```typescript
// Mejora: Conectar con backend real
const { data: notifications } = api.notifications.list.useQuery({
  clientId,
  unreadOnly: true
})

<Popover>
  <PopoverTrigger>
    <Button>
      <Bell />
      {notifications?.length > 0 && (
        <Badge>{notifications.length}</Badge>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    {notifications?.map(notif => (
      <div key={notif.id}>
        <p>{notif.title}</p>
        <span>{formatRelativeTime(notif.createdAt)}</span>
      </div>
    ))}
  </PopoverContent>
</Popover>
```

### **5. Filtros por usuario asignado**
```typescript
// Mejora: Filtro rápido "Mis conversaciones"
<ToggleGroup type="single" value={assignedFilter}>
  <ToggleGroupItem value="all">Todas</ToggleGroupItem>
  <ToggleGroupItem value="mine">Mías</ToggleGroupItem>
  <ToggleGroupItem value="unassigned">Sin asignar</ToggleGroupItem>
</ToggleGroup>
```

**Implementación:**
```typescript
const { currentUser } = useAuth()

const setAssignedFilter = (value: string) => {
  switch(value) {
    case 'mine':
      setFilters({ assignedUserId: currentUser.id })
      break
    case 'unassigned':
      setFilters({ assignedUserId: null })
      break
    default:
      setFilters({ assignedUserId: undefined })
  }
}
```

### **6. Exportar conversaciones filtradas**
```typescript
// Mejora: Botón para exportar resultados
<Button
  variant="outline"
  onClick={async () => {
    const filters = getTrpcFilters()
    const csv = await exportConversations(filters)
    downloadCSV(csv, 'conversaciones.csv')
  }}
>
  <Download className="w-4 h-4 mr-2" />
  Exportar
</Button>
```

### **7. Rango de fechas custom**
```typescript
// Mejora: Calendario para seleccionar fechas específicas
<Popover>
  <PopoverTrigger>
    <Button variant="outline">
      {dateFrom && dateTo 
        ? `${format(dateFrom)} - ${format(dateTo)}`
        : 'Seleccionar rango'
      }
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="range"
      selected={{ from: dateFrom, to: dateTo }}
      onSelect={(range) => {
        setCustomDateRange(range)
      }}
    />
  </PopoverContent>
</Popover>
```

### **8. Contador de resultados**
```typescript
// Mejora: Mostrar cuántas conversaciones hay con filtros actuales
const { data: conversationsData } = api.conversaciones.list.useQuery(...)

<div className="text-sm text-gray-600">
  {conversationsData?.length || 0} conversaciones
  {hasActiveFilters && ' (filtradas)'}
</div>
```

## ⚠️ Consideraciones

### **Filtros y performance**
```typescript
// Con muchos filtros activos, query puede ser lenta
// Solución: Índices en BD
// - Index en (clientId, status, channel)
// - Index en (clientId, createdAt)
// - Full-text search en phoneNumber
```

### **Sincronización entre filtros**
```typescript
// Problema: Usuario selecciona "Archivadas" en sidebar
// pero también tiene statusFilter="ACTIVA" en header
// Resultado: Conflicto, no ve resultados

// Solución actual: Categoría tiene prioridad en getTrpcFilters()
switch (selectedCategory) {
  case 'archived':
    filters.status = 'ARCHIVADA'  // ← Override statusFilter
    break
}
```

### **Persistencia de filtros**
```typescript
// Filtros se persisten en localStorage vía Zustand
// Al recargar página, filtros se mantienen
// Usuario puede confundirse si no recuerda filtros activos

// Solución: Indicador visual de "filtros guardados"
{hasPersistedFilters && (
  <Badge>Filtros guardados activos</Badge>
)}
```

---

**Última actualización:** Análisis detallado - Octubre 2025

