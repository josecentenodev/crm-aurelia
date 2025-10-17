# 📨 Hooks de Mensajería - Pipelines Module

Arquitectura modular de hooks para gestión de mensajes en tiempo real, duplicada desde el módulo de conversaciones para mantener independencia.

## 🏗️ Arquitectura

### Patrón Facade

```
useMessages (Orquestador)
    ↓
┌────────────────┬─────────────────────┬──────────────────┐
│                │                     │                  │
useMessagesQuery useOptimisticMessages useMessagesRealtime
(tRPC fetch)     (UI optimista)       (Supabase RT)
```

**Principio:** Separación de Responsabilidades (SRP)
- Cada hook tiene **una sola responsabilidad**
- `useMessages` solo **orquesta**, no implementa lógica
- Hooks internos son **reutilizables** y **testeables**

## 📚 Hooks Disponibles

### **`useMessages`** ⭐ (Hook Principal)

Hook orquestador que combina query, optimistic UI y realtime.

**Cuándo usar:**
- En cualquier componente que necesite mostrar mensajes
- Cuando necesitas actualización en tiempo real
- Cuando quieres optimistic UI para mejor UX

**API:**
```typescript
const {
  messages,                // Array<UIMessage | TemporaryMessage>
  isLoading,              // boolean - carga inicial
  error,                  // Error | null - error de query
  connectionError,        // string | null - error de Realtime
  reconnect,              // () => void - reconexión manual
  addTemporaryMessage,    // (msg: TemporaryMessage) => void
  removeTemporaryMessage, // (id: string) => void
  updateTemporaryMessage  // (id: string, updates: Partial<TemporaryMessage>) => void
} = useMessages({
  conversationId: string,
  clientId: string,
  enabled?: boolean  // default: true
})
```

**Ejemplo de uso:**
```typescript
import { useMessages } from '../_hooks/messages'
import type { TemporaryMessage } from '@/domain/Conversaciones'

function ConversationModal({ conversationId }: Props) {
  const { clientId } = useClientContext()
  
  const {
    messages,
    isLoading,
    connectionError,
    addTemporaryMessage,
    updateTemporaryMessage
  } = useMessages({
    conversationId,
    clientId,
    enabled: !!conversationId && !!clientId
  })

  const sendTextMutation = api.messages.sendText.useMutation()

  const handleSend = async (content: string) => {
    const tempId = crypto.randomUUID()
    
    // 1. Mensaje temporal (UI inmediata)
    addTemporaryMessage({
      id: tempId,
      conversationId,
      content,
      role: "USER",
      senderType: "USER",
      messageType: "TEXT",
      messageStatus: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemporary: true,
      metadata: { isTemporary: true }
    })

    try {
      // 2. Enviar al backend
      await sendTextMutation.mutateAsync({
        messageId: tempId,  // Mismo ID
        message: content,
        instanceId: "...",
        to: "...",
        clientId
      })
      
      // 3. Marcar como enviado
      updateTemporaryMessage(tempId, { messageStatus: "SENT" })
    } catch (error) {
      // 4. Marcar como fallido
      updateTemporaryMessage(tempId, { messageStatus: "FAILED" })
    }
    
    // 5. Realtime reemplaza temporal con mensaje real
  }

  return (
    <div>
      {messages.map(msg => <MessageItem key={msg.id} message={msg} />)}
    </div>
  )
}
```

---

### **`useMessagesQuery`** (Interno)

Hook especializado para fetch de mensajes vía tRPC.

**Responsabilidad:** Solo obtener datos del servidor

**Uso interno en `useMessages`:**
```typescript
const { messages, isLoading, error } = useMessagesQuery({
  conversationId,
  clientId,
  enabled
})
```

**Configuración:**
- `staleTime`: 30 segundos
- `refetchOnWindowFocus`: false

---

### **`useOptimisticMessages`** (Interno)

Hook especializado para gestión de mensajes temporales.

**Responsabilidad:** Solo gestionar UI optimista

**Uso interno en `useMessages`:**
```typescript
const {
  allMessages,              // serverMessages + temporaryMessages
  addTemporaryMessage,
  removeTemporaryMessage,
  updateTemporaryMessage,
  clearTemporaryMessages
} = useOptimisticMessages({
  serverMessages
})
```

**Lógica de merge:**
1. Indexa mensajes del servidor por ID
2. Filtra temporales que NO existan en servidor
3. Combina y ordena por `createdAt`

---

### **`useMessagesRealtime`** (Interno)

Hook especializado para suscripción Realtime.

**Responsabilidad:** Solo gestionar conexión Realtime

**Uso interno en `useMessages`:**
```typescript
const { connectionError, reconnect } = useMessagesRealtime({
  conversationId,
  clientId,
  enabled,
  onMessageInserted: (newMessage) => {
    // Remover temporal si existe
    removeTemporaryMessage(newMessage.id)
  }
})
```

**Eventos escuchados:**
- `INSERT` - Nuevo mensaje
- `UPDATE` - Mensaje actualizado
- `DELETE` - Mensaje eliminado

**Nombre de canal:** `pipelines-messages:{conversationId}`

---

## 🔄 Flujo Completo

### 1. Carga Inicial
```
Componente monta
    ↓
useMessages() ejecuta
    ↓
useMessagesQuery() → tRPC fetch
    ↓
Mensajes del servidor disponibles
    ↓
useMessagesRealtime() → Suscripción activa
```

### 2. Envío de Mensaje
```
Usuario escribe y envía
    ↓
addTemporaryMessage({ id, status: "PENDING" })
    ↓ UI actualiza instantáneamente
sendTextMutation.mutateAsync({ messageId })
    ↓ Backend procesa
updateTemporaryMessage(id, { status: "SENT" })
    ↓ Tick verde en UI
Realtime INSERT evento
    ↓ Mensaje real llega
onMessageInserted() → removeTemporaryMessage(id)
    ↓ UI muestra mensaje real
```

### 3. Mensaje Nuevo (de otro usuario/IA)
```
Backend inserta mensaje
    ↓
Realtime emite INSERT
    ↓
useMessagesRealtime() recibe evento
    ↓
onMessageInserted() callback
    ↓
tRPC invalidation
    ↓
useMessagesQuery() refetch
    ↓
UI actualiza con nuevo mensaje
```

---

## 🎯 Ventajas de la Arquitectura

### 1. **Testeable**
Cada hook puede testearse en aislamiento:
```typescript
// Test useMessagesQuery
test('fetches messages', async () => {
  const { result } = renderHook(() => 
    useMessagesQuery({ conversationId: '123', clientId: 'abc', enabled: true })
  )
  await waitFor(() => expect(result.current.messages).toHaveLength(5))
})

// Test useOptimisticMessages
test('adds temporary message', () => {
  const { result } = renderHook(() =>
    useOptimisticMessages({ serverMessages: [] })
  )
  act(() => result.current.addTemporaryMessage(mockMsg))
  expect(result.current.allMessages).toHaveLength(1)
})
```

### 2. **Mantenible**
Cambios localizados en hooks específicos:
- Cambiar lógica de fetch → solo `useMessagesQuery`
- Cambiar merge logic → solo `useOptimisticMessages`
- Cambiar suscripción → solo `useMessagesRealtime`

### 3. **Reutilizable**
Hooks internos pueden usarse independientemente si se necesita:
```typescript
// Solo query sin realtime
const { messages } = useMessagesQuery({ conversationId, clientId, enabled: true })

// Solo optimistic UI
const { addTemporaryMessage } = useOptimisticMessages({ serverMessages })
```

### 4. **Performance**
- Realtime no invalida tRPC (evita refetches innecesarios)
- Optimistic UI instantáneo
- Reference counting de canales Realtime

---

## 🔍 Debugging

### Ver mensajes en desarrollo
Los hooks loguean en desarrollo con prefijo `[Pipelines-*]`:

```
[Pipelines-useMessagesQuery] Fetching messages for: abc123
[Pipelines-useOptimisticMessages] ➕ Temporal agregado: temp-123
[Pipelines-useMessagesRealtime] 🚀 Suscribiendo canal: pipelines-messages:abc123
[Pipelines-useMessagesRealtime] 📡 Canal: SUBSCRIBED
[Pipelines-useMessagesRealtime] ➕ Nuevo mensaje realtime: real-456
[Pipelines-useOptimisticMessages] ➖ Temporal removido: temp-123
```

### Errores comunes

**Error: "conversationId is required"**
```typescript
// ❌ MAL
useMessages({ conversationId: '', clientId: 'abc', enabled: true })

// ✅ BIEN
useMessages({ 
  conversationId, 
  clientId, 
  enabled: !!conversationId && !!clientId  // Solo habilitar si hay IDs
})
```

**Error: Mensajes duplicados**
```typescript
// Causa: No usar mismo ID para temporal y real
const tempId = crypto.randomUUID()
addTemporaryMessage({ id: tempId, ... })
await sendTextMutation.mutateAsync({ 
  messageId: tempId  // ← Debe ser el mismo ID
})
```

---

## 🆚 Diferencias con Módulo de Conversaciones

| Aspecto | Conversaciones | Pipelines |
|---------|---------------|-----------|
| **Ubicación** | `conversaciones/_hooks/messages` | `pipelines/_hooks/messages` |
| **Logging prefix** | `[useMessages]` | `[Pipelines-useMessages]` |
| **Canal Realtime** | `messages:{id}` | `pipelines-messages:{id}` |
| **RealtimeManager** | `conversaciones/_lib` | `pipelines/_lib` |
| **Independencia** | ❌ | ✅ Totalmente autónomo |

**Ventaja:** Cambios en conversaciones no afectan pipelines y viceversa.

---

## 📊 Performance Tips

### 1. Habilitar condicionalmente
```typescript
// ✅ BIEN
const { messages } = useMessages({
  conversationId,
  clientId,
  enabled: isOpen && !!conversationId  // Solo cuando modal abierto
})

// ❌ MAL
const { messages } = useMessages({ conversationId, clientId, enabled: true })
```

### 2. Cleanup automático
El hook limpia automáticamente en unmount:
```typescript
useEffect(() => {
  // RealtimeManager.removeChannel() se llama automáticamente
}, [conversationId])  // También limpia al cambiar conversación
```

### 3. Memoizar callbacks
Los callbacks internos ya están memoizados, no necesitas `useCallback` al usar el hook.

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0 (Duplicado y adaptado de conversaciones)  
**Estado:** Producción  
**Arquitectura:** Facade Pattern + Separation of Concerns

