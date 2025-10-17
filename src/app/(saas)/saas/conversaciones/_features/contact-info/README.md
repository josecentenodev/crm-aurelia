# ℹ️ Contact Info Panel - Información del Contacto

Panel lateral derecho que muestra información detallada del contacto y permite gestionar el estado de la conversación.

## 🎯 Responsabilidades

1. **Mostrar información del contacto** - Nombre, email, teléfono, canal
2. **Cambiar estado de conversación** - Con confirmación previa
3. **Asignar/reasignar usuarios** - Dropdown con lista de usuarios
4. **Acciones rápidas** - Archivar, marcar como importante
5. **Estadísticas** - Total mensajes, fecha inicio, instancia

## 🧩 Componentes Incluidos

```
contact-info/
├── contact-info-panel.tsx                     # 🎛️ Contenedor principal
└── components/
    ├── conversation-status-selector.tsx       # 📊 Selector de estado
    ├── conversation-status-change-dialog.tsx  # ✅ Confirmación cambio
    ├── user-assignment-dropdown.tsx           # 👤 Asignación usuario
    ├── conversation-action-buttons.tsx        # ⚡ Archivar/importante
    └── conversation-error-dialog.tsx          # ❌ Manejo de errores
```

## 📊 Flujo de Datos

### **Carga de información**
```
conversationId (prop)
    ↓
api.conversaciones.byId.useQuery({ id })
    ↓
ConversationWithDetails (incluye contact, agent, assignedUser)
    ↓
Renderiza secciones: Info, Estado, Stats, Acciones
```

### **Cambio de estado**
```
Usuario selecciona nuevo estado
    ↓
ConversationStatusSelector
    ↓
setShowConfirmDialog(true)
    ↓
Usuario confirma en Dialog
    ↓
handleStatusChange(newStatus)
    ↓
useOptimisticConversationActions
    ↓
api.conversaciones.update.useMutation
    ↓
onSuccess: invalidate queries + toast
```

### **Asignación de usuario**
```
Click en dropdown → Modal con lista usuarios
    ↓
Usuario selecciona → Confirmación
    ↓
handleUserAssignment(userId)
    ↓
Optimistic update en store
    ↓
Mutación tRPC
    ↓
onSuccess: invalidate + update UI
```

## 🔑 Props y Hooks

### **Props**
```typescript
interface ContactInfoPanelProps {
  conversationId: string | null
  onConversationUpdate?: (updatedConversation: ChatConversation) => void
  onCategoryCountsUpdate?: (counts: Record<string, number>) => void
}
```

### **Hooks utilizados**

**`useOptimisticConversationActions`**
```typescript
const {
  isChangingStatus,
  handleStatusChange,
  isArchiving,
  handleArchiveToggle,
  isTogglingImportant,
  handleImportantToggle,
  showErrorDialog,
  errorMessage
} = useOptimisticConversationActions({
  conversation,
  onConversationUpdate
})
```

## 🎨 Estados de UI

### **Sin conversación seleccionada**
```
┌────────────────────┐
│                    │
│     👤 Usuario     │
│                    │
│  Selecciona una    │
│  conversación      │
│                    │
└────────────────────┘
```

### **Cargando**
```
┌────────────────────┐
│ [Skeleton Header]  │
├────────────────────┤
│ [Avatar Skeleton]  │
│ [Info Skeleton]    │
├────────────────────┤
│ [Estado Skeleton]  │
│ [Stats Skeleton]   │
├────────────────────┤
│ [Buttons Skeleton] │
└────────────────────┘
```

### **Con conversación**
```
┌─────────────────────────────┐
│ Información del Contacto    │
│ ┌─────┐                     │
│ │ JP  │ Juan Pérez          │
│ └─────┘ WhatsApp            │
│                             │
│ 📧 juan@example.com         │
│ 📱 +54 9 11 1234-5678       │
├─────────────────────────────┤
│ Estado y Asignación         │
│                             │
│ Estado:    [Activa ▼]       │
│ Asignado:  [María G. ▼]     │
│ IA:        🤖 Activa        │
├─────────────────────────────┤
│ Estadísticas                │
│                             │
│ Total mensajes:     45      │
│ Primer contacto:    15/10   │
│ Canal:             WhatsApp │
│ Instancia:         Ventas   │
├─────────────────────────────┤
│ [⭐ Importante] [📦 Archivar]│
└─────────────────────────────┘
```

## 📋 Secciones del Panel

### **1. Información del Contacto**
```typescript
<div className="p-6 border-b">
  <CardTitle>Información del Contacto</CardTitle>
  
  {/* Avatar + Nombre */}
  <div className="flex items-center">
    <Avatar>{contact.name[0]}</Avatar>
    <div>
      <h3>{contact.name}</h3>
      <p>{conversation.channel}</p>
    </div>
  </div>
  
  {/* Detalles */}
  {contact.email && <Mail /> {contact.email}}
  {contact.phone && <Phone /> {contact.phone}}
</div>
```

### **2. Estado y Asignación**
```typescript
<div className="p-6 border-b">
  <CardTitle>Estado y Asignación</CardTitle>
  
  <ConversationStatusSelector
    currentStatus={conversation.status}
    onStatusChange={handleStatusChange}
    isChanging={isChangingStatus}
  />
  
  <UserAssignmentDropdown
    conversation={conversation}
    onConversationUpdate={onConversationUpdate}
  />
  
  {conversation.agent && (
    <div>IA: <Bot /> Activa</div>
  )}
</div>
```

### **3. Estadísticas**
```typescript
<div className="p-6 border-b">
  <CardTitle>Estadísticas</CardTitle>
  
  <div>Total mensajes: {conversation._count.messages}</div>
  <div>Primer contacto: {formatFullDate(conversation.createdAt)}</div>
  <div>Canal: {conversation.channel}</div>
  {conversation.evolutionInstance && (
    <div>Instancia: {conversation.evolutionInstance.instanceName}</div>
  )}
</div>
```

### **4. Botones de Acción**
```typescript
<div className="p-6">
  <ConversationActionButtons
    conversation={conversation}
    onConversationUpdate={onConversationUpdate}
  />
</div>
```

## ⚡ Optimizaciones Aplicadas

### **1. Hook condicional pero siempre llamado**
```typescript
// ✅ BIEN: Hook siempre se llama (reglas de hooks)
const {
  handleStatusChange,
  // ...
} = useOptimisticConversationActions({
  conversation,  // Puede ser null/undefined
  onConversationUpdate
})

// El hook maneja internamente cuando conversation es null
```

**Por qué:** Evita error de hooks condicionales.

### **2. Skeleton específico por sección**
```typescript
if (isPending) {
  return (
    <>
      <div className="p-6 border-b">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          {/* ... */}
        </div>
      </div>
      {/* Más secciones */}
    </>
  )
}
```

**Beneficio:** Usuario ve estructura mientras carga.

### **3. Type casting seguro**
```typescript
<UserAssignmentDropdown
  conversation={conversation as unknown as ChatConversation}
/>
```

**Por qué:** tRPC retorna tipo ligeramente diferente al de UI.

### **4. Error handling con diálogo**
```typescript
<ConversationErrorDialog
  isOpen={showErrorDialog}
  onClose={() => setShowErrorDialog(false)}
  errorMessage={errorMessage}
/>
```

**Beneficio:** Errores visibles pero no intrusivos.

## 🔄 Flujo de Acciones con Optimistic UI

### **Archivar conversación**
```
Usuario click "Archivar"
    ↓
handleArchiveToggle()
    ↓
setIsArchiving(true) → UI muestra loading
    ↓
api.conversaciones.update.mutateAsync({
  id,
  status: 'ARCHIVADA'
})
    ↓
onMutate: Update optimista del cache local
    ↓
onSuccess: 
  - invalidate conversaciones.list
  - invalidate conversaciones.byId
  - toast("Conversación archivada")
    ↓
onError:
  - Revertir cambio optimista
  - setShowErrorDialog(true)
  - setErrorMessage(error.message)
    ↓
onSettled: setIsArchiving(false)
```

### **Marcar como importante**
```
Usuario toggle estrella
    ↓
handleImportantToggle()
    ↓
Optimistic: Estrella cambia inmediatamente
    ↓
Mutación: api.conversaciones.update
    ↓
Success: Confirma cambio
Error: Revierte + muestra error
```

## 🐛 Debugging

### **Ver estado de conversación**
```typescript
import { api } from '@/trpc/react'

const { data } = api.conversaciones.byId.useQuery({ id: 'abc123' })
console.log('Conversación:', data)
// {
//   status: 'ACTIVA',
//   isImportant: false,
//   assignedUser: { id: '...', name: 'María' },
//   _count: { messages: 45 }
// }
```

### **Monitorear invalidaciones**
```typescript
const utils = api.useUtils()

// Espiar invalidaciones
const originalInvalidate = utils.conversaciones.list.invalidate
utils.conversaciones.list.invalidate = (...args) => {
  console.log('Invalidando conversaciones.list con:', args)
  return originalInvalidate(...args)
}
```

### **Verificar filtros en invalidación**
```typescript
// En useOptimisticConversationActions
const { getTrpcFilters } = useChatsFiltersStore()

onSuccess: () => {
  const currentFilters = getTrpcFilters()
  console.log('Invalidando con filtros:', currentFilters)
  void utils.conversaciones.list.invalidate({
    clientId,
    filters: currentFilters  // ← CRÍTICO: usar filtros actuales
  })
}
```

## 🚀 Posibles Mejoras

### **1. Quick actions en header**
```typescript
// Problema: Botones importantes al fondo, requiere scroll
// Solución: Acciones rápidas en header

<div className="p-4 border-b flex items-center justify-between">
  <h3>Juan Pérez</h3>
  <div className="flex gap-2">
    <Button size="sm" variant="ghost">
      <Star className={isImportant ? 'fill-yellow-400' : ''} />
    </Button>
    <Button size="sm" variant="ghost">
      <Archive />
    </Button>
  </div>
</div>
```

### **2. Timeline de actividad**
```typescript
// Mejora: Mostrar timeline de cambios de estado
<div className="p-6">
  <h3>Actividad Reciente</h3>
  <div className="space-y-2">
    <div className="flex gap-2">
      <Clock className="w-4 h-4" />
      <span>Archivada - hace 2 horas</span>
    </div>
    <div className="flex gap-2">
      <User className="w-4 h-4" />
      <span>Asignada a María - hace 1 día</span>
    </div>
  </div>
</div>
```

**Requiere:** Campo `history` en modelo o tabla `ConversationEvent`.

### **3. Tags personalizados**
```typescript
// Mejora: Etiquetar conversaciones
<div className="flex gap-2 mt-2">
  <Badge>Urgente</Badge>
  <Badge>VIP</Badge>
  <Badge variant="outline">+ Agregar tag</Badge>
</div>
```

**Implementación:**
- Relación many-to-many `Conversation ↔ Tag`
- CRUD de tags en modal
- Filtro por tags en sidebar

### **4. Notas internas**
```typescript
// Mejora: Agregar notas visibles solo para el equipo
<div className="p-6">
  <h3>Notas Internas</h3>
  <Textarea 
    placeholder="Agregar nota para el equipo..."
    value={notes}
    onChange={(e) => updateNotes(e.target.value)}
  />
  <p className="text-xs">Solo visible para usuarios internos</p>
</div>
```

### **5. Shortcuts de teclado**
```typescript
// Mejora: Atajos para acciones comunes
useHotkeys('i', () => handleImportantToggle())  // I → importante
useHotkeys('a', () => handleArchiveToggle())    // A → archivar
useHotkeys('u', () => handleUnassign())         // U → desasignar

<div className="text-xs text-gray-500 mt-2">
  Atajos: I=Importante, A=Archivar, U=Desasignar
</div>
```

### **6. Integración con CRM**
```typescript
// Mejora: Sincronizar con etapa de pipeline
{conversation.contact?.stage && (
  <div className="p-6 border-b">
    <h3>Pipeline</h3>
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: conversation.contact.stage.color }}
      />
      <span>{conversation.contact.stage.name}</span>
    </div>
    <Button size="sm" className="mt-2">
      Mover a siguiente etapa
    </Button>
  </div>
)}
```

### **7. Historial de asignaciones**
```typescript
// Mejora: Ver quién estuvo asignado antes
<Collapsible>
  <CollapsibleTrigger>
    Ver historial de asignaciones
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="space-y-2">
      <div>María García - 15/10 a 20/10</div>
      <div>Juan López - 10/10 a 15/10</div>
    </div>
  </CollapsibleContent>
</Collapsible>
```

### **8. Métricas de respuesta**
```typescript
// Mejora: Tiempos de respuesta
<div className="p-6">
  <h3>Tiempos de Respuesta</h3>
  <div>
    <span>Tiempo promedio:</span>
    <span className="font-semibold">2.5 min</span>
  </div>
  <div>
    <span>Última respuesta:</span>
    <span>hace 5 min</span>
  </div>
</div>
```

## ⚠️ Consideraciones

### **Invalidaciones precisas**
```typescript
// ❌ MAL: Invalidar sin filtros
void utils.conversaciones.list.invalidate()

// ✅ BIEN: Invalidar con filtros actuales
const currentFilters = getTrpcFilters()
void utils.conversaciones.list.invalidate({
  clientId,
  filters: currentFilters
})
```

**Por qué:** Sin filtros, invalida TODAS las queries, incluso con filtros diferentes.

### **Error handling robusto**
```typescript
// Siempre tener fallback en caso de error
{showErrorDialog && (
  <ConversationErrorDialog
    isOpen={showErrorDialog}
    onClose={() => setShowErrorDialog(false)}
    errorMessage={errorMessage}
    onRetry={handleRetry}  // ← Opcional: permitir retry
  />
)}
```

### **Conversación puede ser null**
```typescript
// Hook siempre debe manejar null/undefined
const {
  handleStatusChange
} = useOptimisticConversationActions({
  conversation,  // Puede ser null
  onConversationUpdate
})

// Dentro del hook:
if (!conversation) return
```

---

**Última actualización:** Análisis detallado - Octubre 2025

