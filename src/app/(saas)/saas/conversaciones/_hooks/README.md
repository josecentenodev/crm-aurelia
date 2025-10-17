# 🪝 Hooks - Lógica Reutilizable

Hooks personalizados que encapsulan lógica compleja de negocio para conversaciones y mensajes, siguiendo una **arquitectura modular y composable**.

## 🏗️ Arquitectura de Hooks

El módulo sigue una **estrategia de separación de responsabilidades**:

```
useMessages (Facade/Orquestador)
    ↓
┌────────────────┬─────────────────────┬──────────────────┐
│                │                     │                  │
useMessagesQuery useOptimisticMessages useMessagesRealtime
(tRPC fetch)     (UI optimista)       (Supabase RT)
```

**Ventajas:**
- ✅ Cada hook tiene **una sola responsabilidad**
- ✅ Fácil de testear en aislamiento
- ✅ Componentes usan solo `useMessages` (Facade)
- ✅ Permite reemplazar implementaciones sin cambiar componentes

## 📚 Hooks Disponibles

### **📡 `useMessages`** ⭐
Hook orquestador principal para mensajes con Realtime, optimistic UI y carga inicial.

**Cuándo usar:**
- Mostrar mensajes de una conversación
- Necesitas actualización en tiempo real
- Quieres optimistic UI para mensajes

**Arquitectura interna:**
```typescript
useMessages() {
  // 1. Carga inicial vía tRPC
  const serverMessages = useMessagesQuery()
  
  // 2. Gestión optimista
  const { allMessages, addTemporaryMessage } = useOptimisticMessages()
  
  // 3. Suscripción Realtime
  useMessagesRealtime({ onMessageInserted })
  
  // 4. Retorna interfaz unificada
  return { messages, isLoading, addTemporaryMessage, ... }
}
```

**Retorna:**
```typescript
{
  messages: Array<UIMessage | TemporaryMessage>  // Mensajes (reales + temporales)
  isLoading: boolean                             // Cargando inicial
  error: Error | null                            // Error de query
  connectionError: string | null                 // Error de Realtime
  reconnect: () => void                          // Reconexión manual
  addTemporaryMessage: (msg) => void             // Agregar optimista
  removeTemporaryMessage: (id) => void           // Remover optimista
  updateTemporaryMessage: (id, updates) => void  // Actualizar optimista
}
```

**Ejemplo:**
```typescript
const { 
  messages, 
  isLoading,
  addTemporaryMessage,
  updateTemporaryMessage 
} = useMessages({
  conversationId: 'abc123',
  clientId: 'xyz789',
  enabled: true
})

// Enviar mensaje optimista
const tempId = crypto.randomUUID()
const tempMsg: TemporaryMessage = {
  id: tempId,
  conversationId: 'abc123',
  content: 'Hola',
  role: 'USER',
  senderType: 'USER',
  messageType: 'TEXT',
  messageStatus: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  isTemporary: true,
  metadata: { isTemporary: true }
}
addTemporaryMessage(tempMsg)

// Actualizar cuando se envíe
updateTemporaryMessage(tempId, { messageStatus: 'SENT' })
```

**Ventajas de la arquitectura refactorizada:**
1. **Separation of Concerns**: Query, Optimistic UI y Realtime separados
2. **Testeable**: Cada hook interno es fácil de testear
3. **Single Responsibility**: `useMessages` solo orquesta, no implementa
4. **Composable**: Hooks internos pueden usarse independientemente si se necesita

### **🔍 Hooks Especializados (Internos)**

Los siguientes hooks son utilizados internamente por `useMessages`. Generalmente **no se usan directamente** en componentes.

#### **`useMessagesQuery`**
Hook de fetching vía tRPC.
```typescript
const { messages, isLoading, error } = useMessagesQuery({
  conversationId,
  clientId,
  enabled
})
```

#### **`useOptimisticMessages`**
Gestión de mensajes temporales.
```typescript
const {
  allMessages,              // serverMessages + temporaryMessages merged
  addTemporaryMessage,
  removeTemporaryMessage,
  updateTemporaryMessage,
  clearTemporaryMessages
} = useOptimisticMessages({
  serverMessages
})
```

#### **`useMessagesRealtime`**
Suscripción a cambios en tiempo real.
```typescript
const { connectionError, reconnect } = useMessagesRealtime({
  conversationId,
  clientId,
  enabled,
  onMessageInserted: (newMessage) => {
    // Callback cuando llega mensaje nuevo
  }
})
```

---

### **🔄 `useRealtimeConversations`**
Hook especializado para escuchar cambios en conversaciones del sidebar.

**Cuándo usar:**
- Lista de conversaciones que necesita actualizarse
- No renderizas mensajes individuales
- Solo te interesa cuando cambia metadata de conversación

**Retorna:**
```typescript
{
  cleanup: () => void  // Limpieza manual si necesario
}
```

**Ejemplo:**
```typescript
const utils = api.useUtils()

useRealtimeConversations({
  clientId: 'xyz789',
  enabled: true,
  onInvalidate: () => {
    // Refetch automático cuando hay cambios
    void utils.conversaciones.list.invalidate()
  }
})
```

**Qué escucha:**
- `INSERT/UPDATE/DELETE` en tabla `Conversation`
- `INSERT` de nuevos mensajes (para actualizar lastMessageAt)

---

### **⚡ `useOptimisticConversationActions`**
Hook para acciones de conversación con UI optimista y manejo de errores.

**Cuándo usar:**
- Archivar/desarchivar conversaciones
- Marcar como importante
- Asignar usuarios
- Cambiar estado

**Retorna:**
```typescript
{
  isArchiving: boolean
  isTogglingImportant: boolean
  isAssigningUser: boolean
  isChangingStatus: boolean
  handleArchiveToggle: () => Promise<void>
  handleImportantToggle: () => Promise<void>
  handleUserAssignment: (userId: string | null) => Promise<void>
  handleStatusChange: (status: ConversationStatus) => Promise<void>
  showErrorDialog: boolean
  setShowErrorDialog: (show: boolean) => void
  errorMessage: string
}
```

**Ejemplo:**
```typescript
const { 
  handleArchiveToggle, 
  isArchiving 
} = useOptimisticConversationActions({
  conversation,
  onConversationUpdate: (updated) => {
    console.log('Conversación actualizada:', updated)
  }
})

// Archivar con feedback visual inmediato
await handleArchiveToggle()
```

**Características:**
- Invalidaciones precisas con filtros actuales
- Manejo de errores con diálogo
- Estados de loading específicos
- Toast notifications automáticas

---

### **🔍 `useConversationsFiltering`**
Hook de lógica de negocio para filtrado y conteo de conversaciones.

**Cuándo usar:**
- Filtrar conversaciones por categoría
- Calcular conteos para badges
- Separar lógica de renderizado

**Retorna:**
```typescript
{
  filteredGroups: ChatConversationsByInstance[]
  categoryCounts: {
    all: number
    unassigned: number
    mine: number
    new: number
    archived: number
  }
}
```

**Ejemplo:**
```typescript
const { filteredGroups, categoryCounts } = useConversationsFiltering({
  conversationsData: rawData,
  selectedCategory: 'unassigned'
})

// Usar en UI
<Badge>{categoryCounts.unassigned}</Badge>
```

**Categorías soportadas:**
- `all` - Todas las conversaciones
- `unassigned` - Sin usuario asignado
- `mine` - Asignadas al usuario actual
- `new` - Estado ACTIVA
- `archived` - Estado ARCHIVADA

---

## 🎯 Patrones de Uso

### **Patrón 1: Mensajes en tiempo real**
```typescript
function ChatPanel({ conversationId }: Props) {
  // 1. Hook de mensajes con Realtime
  const { 
    messages, 
    isConnected,
    addTemporaryMessage 
  } = useSupabaseRealtimeMessages({
    conversationId,
    clientId,
    enabled: !!conversationId
  })

  // 2. Mutación para enviar
  const sendMutation = api.messages.sendText.useMutation()

  // 3. Handler con optimistic UI
  const handleSend = async (text: string) => {
    const tempId = crypto.randomUUID()
    addTemporaryMessage({
      id: tempId,
      content: text,
      messageStatus: 'PENDING',
      createdAt: new Date()
    })

    await sendMutation.mutateAsync({ 
      messageId: tempId,  // ← Mismo ID
      message: text 
    })
  }

  return <MessageList messages={messages} />
}
```

### **Patrón 2: Lista reactiva de conversaciones**
```typescript
function ConversationsSidebar() {
  const utils = api.useUtils()
  const { getTrpcFilters } = useChatsFiltersStore()
  
  // 1. Query de conversaciones
  const { data } = api.conversaciones.list.useQuery({
    clientId,
    filters: getTrpcFilters()
  })

  // 2. Realtime para invalidación
  useRealtimeConversations({
    clientId,
    enabled: true,
    onInvalidate: () => {
      void utils.conversaciones.list.invalidate()
    }
  })

  return <ConversationsList groups={data} />
}
```

### **Patrón 3: Acciones con feedback**
```typescript
function ConversationActions({ conversation }: Props) {
  const {
    handleArchiveToggle,
    isArchiving,
    showErrorDialog,
    errorMessage
  } = useOptimisticConversationActions({
    conversation,
    onConversationUpdate: (updated) => {
      // Opcional: actualizar UI local
    }
  })

  return (
    <>
      <Button 
        onClick={handleArchiveToggle}
        disabled={isArchiving}
      >
        {isArchiving ? 'Archivando...' : 'Archivar'}
      </Button>

      <ErrorDialog 
        open={showErrorDialog}
        message={errorMessage}
      />
    </>
  )
}
```

## 🔧 Detalles Técnicos

### **Gestión de Canales Realtime**
Todos los hooks usan `realtimeManager` singleton con **protección contra doble suscripción**:

```typescript
// Obtiene o crea canal (evita duplicados y doble suscripción)
const channel = await realtimeManager.getOrCreateChannel(
  channelName,
  (ch) => ch
    .on('postgres_changes', { ... }, handler)
    .subscribe()
)

// Cleanup con await (evita memory leaks)
await realtimeManager.removeChannel(channelName)
```

**Protecciones implementadas:**
- ✅ **Bloqueo de concurrencia**: Si dos hooks intentan crear el mismo canal simultáneamente, el segundo espera la promesa del primero
- ✅ **Verificación de estado**: Solo reutiliza canales en estado `joined` (activos)
- ✅ **Compatible con React Strict Mode**: No hay errores por doble invocación de efectos
- ✅ **Cleanup secuencial**: Espera limpieza completa antes de permitir recreación

[Ver implementación completa](./_lib/README.md)

### **Reconexión Automática**
`useSupabaseRealtimeMessages` incluye:

```typescript
// Backoff exponencial
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// Límite de reintentos
if (retryCount >= 5) {
  setConnectionState({ status: 'error', canReconnect: false })
  return
}

// Schedule próximo intento
setTimeout(reconnect, delay)
```

### **Merge de Mensajes**
Temporales + Reales = Vista unificada:

```typescript
// 1. Indexar reales por ID
const byId = new Map()
rawMessages.forEach(m => byId.set(m.id, m))

// 2. Agregar temporales solo si no existe real
const merged = [...rawMessages]
temporaryMessages.forEach(temp => {
  if (!byId.has(temp.id)) merged.push(temp)
})

// 3. Ordenar por createdAt
merged.sort((a, b) => 
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
)
```

## 🐛 Debugging

### **Ver estado de Realtime**
```typescript
import { realtimeManager } from '../_lib'

// Estado global de canales
console.log(realtimeManager.getStatus())
// {
//   activeChannels: 2,
//   pendingCleanups: 0,
//   channels: ['messages:abc123', 'conversations:sidebar:xyz']
// }

// Hook específico
const { connectionState } = useSupabaseRealtimeMessages(...)
console.log(connectionState)
// {
//   status: 'connected',
//   isStable: true,
//   retryCount: 0,
//   lastConnectedAt: Date(...)
// }
```

### **Forzar reconexión**
```typescript
const { reconnect, forceRefresh } = useSupabaseRealtimeMessages(...)

// Reconectar Realtime
reconnect()

// Forzar recarga completa desde tRPC
forceRefresh()
```

## ⚠️ Consideraciones

### **Performance**
- Hooks con Realtime son pesados, usar `enabled` para controlar
- `useSupabaseRealtimeMessages` NO invalida tRPC (solo actualiza estado local)
- Memoizar callbacks pasados a `onInvalidate` para evitar re-suscripciones

### **Limpieza de recursos**
- Todos los hooks limpian automáticamente en unmount
- Canales Realtime usan `await` en cleanup (evita memory leaks)
- Referencias se resetean al cambiar props clave (conversationId, clientId)

### **Manejo de errores**
- Realtime errors NO rompen la UI
- Hook continúa funcionando con datos en cache
- Estados de error visibles para debugging

## 📚 Referencias

- [tRPC React Hooks](https://trpc.io/docs/client/react)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## 🎯 Best Practices para Hooks

### **1. Usar el hook correcto para cada caso**
```typescript
// ✅ BIEN: Usar facade para componentes
const { messages } = useMessages({ conversationId, clientId })

// ❌ MAL: Usar hooks internos directamente (salvo caso especial)
const { messages } = useMessagesQuery({ conversationId, clientId })
const { addTemporaryMessage } = useOptimisticMessages({ serverMessages })
```

### **2. Habilitar hooks condicionalmente**
```typescript
// ✅ BIEN: enabled previene queries innecesarias
const { messages } = useMessages({
  conversationId,
  clientId,
  enabled: !!conversationId && !!clientId
})

// ❌ MAL: Query se ejecuta aunque no haya IDs
const { messages } = useMessages({ conversationId, clientId })
```

### **3. Memoizar callbacks de invalidación**
```typescript
// ✅ BIEN: Callback estable
const handleInvalidate = useCallback(() => {
  void utils.conversaciones.list.invalidate({ clientId })
}, [utils, clientId])

useRealtimeConversations({ clientId, onInvalidate: handleInvalidate })

// ❌ MAL: Callback inline causa re-suscripciones
useRealtimeConversations({
  clientId,
  onInvalidate: () => void utils.conversaciones.list.invalidate()
})
```

### **4. Cleanup de Realtime en unmount**
```typescript
// ✅ BIEN: Hook maneja cleanup automáticamente
useEffect(() => {
  // realtimeManager.getOrCreateChannel(...)
  
  return () => {
    // realtimeManager.removeChannel(...)
  }
}, [deps])

// Hook se encarga de todo, no necesitas cleanup manual
```

### **5. Testing de hooks**
```typescript
// Testear hooks con @testing-library/react-hooks
import { renderHook } from '@testing-library/react-hooks'

test('useMessages loads messages', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useMessages({ conversationId: '123', clientId: 'abc', enabled: true })
  )
  
  await waitForNextUpdate()
  
  expect(result.current.messages).toHaveLength(5)
  expect(result.current.isLoading).toBe(false)
})
```

## 📊 Performance Tips

### **Evitar re-renders innecesarios**
```typescript
// ✅ BIEN: Desestructurar solo lo necesario
const { messages } = useMessages({ ... })

// ❌ MAL: Tomar todo el objeto causa re-renders
const messagesState = useMessages({ ... })
```

### **Optimistic updates deben ser inmediatos**
```typescript
// ✅ BIEN: UI actualiza instantáneamente
addTemporaryMessage(tempMsg)  // Síncrono
await sendMutation.mutateAsync(...)  // Asíncrono

// ❌ MAL: UI espera a que termine la mutación
await sendMutation.mutateAsync(...)
// Usuario ve delay
```

### **Cleanup debe ser confiable**
```typescript
// ✅ BIEN: useEffect con cleanup
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [deps])

// ❌ MAL: Olvidar cleanup
useEffect(() => {
  subscribe()
  // Memory leak!
}, [deps])
```

---

**Última actualización:** Arquitectura refactorizada y best practices - Octubre 2025  
**Cambios principales:** 
- Documentación de arquitectura modular (Facade pattern)
- Separación clara entre `useMessages` (orquestador) y hooks internos
- Best practices y performance tips
- Información sobre testing de hooks
- Protección contra doble suscripción en Realtime (cola global)

