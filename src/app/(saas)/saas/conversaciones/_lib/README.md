# 🔌 Realtime Library - Gestión Centralizada de Canales

Singleton para gestión coordinada de canales Supabase Realtime, previniendo duplicados y conflictos de estado mediante una **cola global de operaciones serializadas**.

## 🎯 Problema que Resuelve

### **Escenario problemático:**
1. Usuario navega a `/conversaciones` → Hook crea canal `conversations:sidebar`
2. Usuario navega a `/dashboard` → Hook limpia canal (CLOSED)
3. React Strict Mode ejecuta cleanup **dos veces** → Canal queda en memoria pero cerrado
4. Usuario regresa a `/conversaciones` → Hook intenta **reutilizar canal CLOSED**
5. **Error:** `"tried to subscribe multiple times"` ❌

### **Síntomas:**
```
Uncaught (in promise) tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance

Error: Channel conversations:sidebar:XXX failed to subscribe: errored
```

### **Causa raíz:**
- Canal de Supabase en estado `CLOSED` o `CHANNEL_ERROR` **no puede re-suscribirse**
- Múltiples hooks intentan gestionar el mismo canal concurrentemente
- React Strict Mode (desarrollo) causa double-invoke de efectos
- Race conditions entre creación/destrucción de canales diferentes

---

## 🏗️ Arquitectura del Manager

### **RealtimeChannelManager (Singleton)**
```typescript
class RealtimeChannelManager {
  private channels: Map<string, RealtimeChannel>                    // Canales activos
  private channelClients: Map<string, ReturnType<typeof getSupabaseClient>>
  private pendingCleanups: Set<string>                              // Limpiezas en curso
  private subscriptionCounts: Map<string, number>                   // Reference counting
  
  // ✅ COLA GLOBAL: Garantiza que TODAS las operaciones se ejecuten EN SERIE
  private globalOperationQueue: Promise<any> = Promise.resolve()
  
  async getOrCreateChannel(
    channelName: string,
    setupCallback: (channel: RealtimeChannel) => RealtimeChannel
  ): Promise<RealtimeChannel>
  
  async removeChannel(channelName: string): Promise<void>
  
  // 📊 Health monitoring
  getStatus(): HealthStatus
  getHealthStatus(): DetailedHealth
}

export const realtimeManager = new RealtimeChannelManager()
```

### **Flujo de Gestión con Cola Global Serializada**

```
Hook Request (getOrCreateChannel o removeChannel)
    ↓
enqueueOperation() → Agrega operación a cola global
    ↓
Espera a que operación anterior termine
    ↓
Ejecuta operación actual EN SERIE
    ↓
┌─── Para getOrCreateChannel: ────────────────────────────┐
│                                                          │
│  1. Incrementar reference count                         │
│     ↓                                                    │
│  2. ¿Canal existe en Map?                               │
│     ├─ SÍ → ¿Estado = "joined"?                        │
│     │        ├─ SÍ → Reutilizar canal ✅               │
│     │        └─ NO → Limpiar y continuar 🔄           │
│     │                                                    │
│     └─ NO → Continuar                                   │
│           ↓                                             │
│  3. Crear nuevo canal 🆕                                │
│     - Configure callbacks                               │
│     - channel.subscribe()                               │
│     - Esperar "joined" (timeout 30s)                   │
│     - Guardar en channels Map                          │
│     ↓                                                    │
│  4. Retornar canal ✅                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌─── Para removeChannel: ──────────────────────────────────┐
│                                                          │
│  1. Decrementar reference count                         │
│     ↓                                                    │
│  2. ¿Count > 0?                                         │
│     ├─ SÍ → Skip cleanup (aún en uso) ⏸️              │
│     │                                                    │
│     └─ NO → Continuar con cleanup                       │
│           ↓                                             │
│  3. Marcar en pendingCleanups                          │
│     ↓                                                    │
│  4. Unsubscribe secuencial                             │
│     await channel.unsubscribe()                         │
│     await delay(200ms)                                  │
│     await supabase.removeChannel()                      │
│     ↓                                                    │
│  5. Eliminar de Maps y pendingCleanups                 │
│     ✅ Cleanup completo                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
    ↓
Próxima operación en cola puede ejecutarse
```

**Ventajas de la Cola Global:**
- ✅ **Zero race conditions**: Imposible que dos canales se creen/destruyan simultáneamente
- ✅ **Operaciones atómicas**: Cada operación termina completamente antes de la siguiente
- ✅ **Simplicidad**: No requiere locks, mutexes ni semáforos complejos
- ✅ **Debugging fácil**: Operaciones ejecutan en orden predecible

---

## 🔑 Métodos Principales

### **1. getOrCreateChannel**

Obtiene canal existente (si está activo) o crea uno nuevo.

```typescript
const channel = await realtimeManager.getOrCreateChannel(
  'messages:abc123',
  (ch) => ch
    .on('postgres_changes', {...}, handler)
    .subscribe((status) => console.log(status))
)
```

**Lógica interna con cola global serializada:**
```typescript
// Todas las operaciones pasan por enqueueOperation()
async getOrCreateChannel(channelName, setupCallback) {
  return this.enqueueOperation(async () => {
    return this._doGetOrCreateChannel(channelName, setupCallback)
  })
}

// Implementación de enqueueOperation (cola global)
private async enqueueOperation<T>(operation: () => Promise<T>): Promise<T> {
  const previousOperation = this.globalOperationQueue
  
  const currentOperation = previousOperation
    .catch(() => {})  // Ignorar errores previos
    .then(() => operation())  // Ejecutar operación actual
  
  this.globalOperationQueue = currentOperation.catch(() => {})
  
  return currentOperation
}

// Lógica interna _doGetOrCreateChannel (ejecuta EN SERIE)
private async _doGetOrCreateChannel(channelName, setupCallback) {
  // 1. Incrementar reference count
  const currentCount = this.subscriptionCounts.get(channelName) || 0
  this.subscriptionCounts.set(channelName, currentCount + 1)

// 2. Verificar canal existente
const existing = this.channels.get(channelName)
if (existing) {
  const state = String(existing.state)
  
  // ✅ Solo reutilizar si está activo
  if (state === 'joined') {
    return existing
  }
  
  // 🔄 Si está CLOSED/errored, limpiar y crear nuevo
  this.channels.delete(channelName)
  await existing.unsubscribe()
  await supabase.removeChannel(existing)
}

// 3. Crear nuevo canal CON BLOQUEO
const creationPromise = this._createChannel(channelName, setupCallback)
this.pendingCreations.set(channelName, creationPromise)  // ← Bloquea creaciones concurrentes

try {
  const channel = await creationPromise
  // 4. Guardar en Map (hecho en _createChannel)
  return channel
} finally {
  // 5. Desbloquear siempre (éxito o error)
  this.pendingCreations.delete(channelName)
}

// Método privado _createChannel:
// - Crea canal de Supabase
// - Aplica callbacks
// - Espera suscripción (timeout 10s)
// - Guarda en channels Map
// - Retorna canal
```

**Estados de canal:**
- `joined` - Conectado y activo → Reutilizable ✅
- `closed` - Cerrado manualmente → **NO reutilizable** ❌
- `errored` - Error en conexión → **NO reutilizable** ❌
- `leaving` - Desconectando → Esperar cleanup
- `joining` - Conectando → Esperar resolución

---

### **2. removeChannel**

Limpia y remueve canal de forma segura con delays.

```typescript
await realtimeManager.removeChannel('messages:abc123')
```

**Flujo:**
```typescript
// 1. Validar existencia
if (!this.channels.has(channelName)) return

// 2. Marcar como "limpiando"
this.pendingCleanups.add(channelName)

try {
  // 3. Unsubscribe secuencial
  await channel.unsubscribe()
  await new Promise(resolve => setTimeout(resolve, 100))  // Delay crítico
  
  // 4. Remover del cliente Supabase
  await supabase.removeChannel(channel)
  
  // 5. Eliminar de Map
  this.channels.delete(channelName)
  
} finally {
  // 6. Desmarcar cleanup
  this.pendingCleanups.delete(channelName)
}
```

**¿Por qué el delay de 100ms?**
- Supabase necesita tiempo para procesar el unsubscribe
- Evita race conditions con removeChannel
- Previene errores "channel already removed"

---

### **3. waitForCleanup**

Espera a que termine una limpieza pendiente (timeout 5s).

```typescript
private async waitForCleanup(channelName: string) {
  const start = Date.now()
  
  while (this.pendingCleanups.has(channelName)) {
    if (Date.now() - start > 5000) {
      console.warn('Timeout esperando cleanup')
      this.pendingCleanups.delete(channelName)
      break
    }
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}
```

**Casos de uso:**
- Hook A está limpiando canal
- Hook B (mismo canal) monta antes de que termine
- Hook B espera a que Hook A termine antes de crear

---

## 🛡️ Prevención de Doble Suscripción (Hooks)

### **Problema en React Strict Mode:**
```typescript
useEffect(() => {
  // Monta 1
  setupChannel()  // Crea canal
  
  return () => cleanup()  // Limpia canal
}, [deps])

// React Strict Mode ejecuta AMBOS dos veces:
// 1. setupChannel() → cleanup()  
// 2. setupChannel() → cleanup()  (inmediatamente después)
//
// Resultado: Intento de suscribir 2x al mismo canal → ERROR
```

### **Solución: Bandera isSubscribingRef**

```typescript
export function useRealtimeConversations({ clientId }) {
  const isSubscribingRef = useRef(false)
  
  useEffect(() => {
    // 🚫 Prevenir doble ejecución
    if (isSubscribingRef.current) {
      console.log('Suscripción ya en curso, saltando...')
      return
    }
    
    const setupChannel = async () => {
      isSubscribingRef.current = true  // Marcar inicio
      
      try {
        const channel = await realtimeManager.getOrCreateChannel(...)
        channelRef.current = channel
      } catch (error) {
        console.error('Error en setup:', error)
      } finally {
        isSubscribingRef.current = false  // Desmarcar siempre
      }
    }
    
    void setupChannel()
    
    return () => {
      const cleanup = async () => {
        isSubscribingRef.current = false  // Reset en cleanup
        await realtimeManager.removeChannel(channelName)
      }
      void cleanup()
    }
  }, [clientId])
}
```

**Garantías:**
- Solo una suscripción activa a la vez
- Flag se resetea en error, éxito y cleanup
- Compatible con React Strict Mode

---

## 📊 Debugging

### **Ver estado del manager**
```typescript
import { realtimeManager } from '@/app/(saas)/saas/conversaciones/_lib'

const status = realtimeManager.getStatus()
console.log(status)
// {
//   activeChannels: 2,
//   pendingCleanups: 0,
//   pendingCreations: 1,
//   channels: ['messages:abc123', 'conversations:sidebar:def456'],
//   cleaningUp: [],
//   creating: ['messages:xyz789']
// }
```

### **Ver canales activos**
```typescript
const channels = realtimeManager.getActiveChannels()
console.log('Canales activos:', channels)
// ['messages:abc123', 'conversations:sidebar:def456']
```

### **Verificar existencia**
```typescript
const exists = realtimeManager.hasChannel('messages:abc123')
console.log('Canal existe:', exists)
```

### **Limpieza total**
```typescript
// En caso de emergencia (testing, debugging)
await realtimeManager.cleanupAll()
```

---

## 🔍 Logs de Desarrollo

El manager genera logs detallados en modo desarrollo:

```
[RealtimeManager] 🆕 Creando nuevo canal: messages:abc123
[RealtimeManager] ✅ Canal conectado y registrado: messages:abc123
[RealtimeManager] 📊 Canales activos: 1

[RealtimeManager] ♻️ Reutilizando canal activo: messages:abc123

[RealtimeManager] ⏳ Creación en curso, esperando: messages:abc123  ← NUEVO: Previene doble suscripción

[RealtimeManager] 🔄 Canal en estado CLOSED, creando uno nuevo: messages:abc123

[RealtimeManager] ⏳ Esperando limpieza de canal: messages:abc123

[RealtimeManager] 🧹 Iniciando limpieza de canal: messages:abc123
[RealtimeManager] 📤 Unsubscribing canal: messages:abc123
[RealtimeManager] 🗑️ Removiendo canal del cliente: messages:abc123
[RealtimeManager] ✅ Canal limpiado exitosamente: messages:abc123
[RealtimeManager] 📊 Canales restantes: 0
```

---

## ⚠️ Consideraciones

### **Timeout de suscripción**
```typescript
// Si el canal no alcanza estado "joined" en 10s → reject
await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error('Channel subscription timeout after 10s'))
  }, 10000)
  // ...
})
```

**Causas comunes:**
- Credenciales Supabase inválidas
- Políticas RLS bloqueando suscripción
- Filtros malformados (ej: `filter: clientId=eq.null`)
- Network issues

### **Canales duplicados por nombre diferente**
```typescript
// ❌ MAL: Misma conversación, diferentes nombres
await realtimeManager.getOrCreateChannel('messages:abc123', ...)
await realtimeManager.getOrCreateChannel('conv-messages:abc123', ...)

// ✅ BIEN: Convención de nombres consistente
const channelName = `messages:${conversationId}`
await realtimeManager.getOrCreateChannel(channelName, ...)
```

### **Callbacks en setupCallback**
```typescript
// El callback se ejecuta UNA SOLA VEZ al crear el canal
// NO se re-ejecuta al reutilizar

await realtimeManager.getOrCreateChannel('messages:abc', (ch) => ch
  .on('postgres_changes', {...}, (payload) => {
    // Este handler está "cerrado" sobre el estado original
    // Si el estado cambia externamente, el handler NO ve los cambios
    console.log(currentState)  // ← Valor al momento de crear el canal
  })
)

// Solución: Usar refs para valores dinámicos
const handlerRef = useRef(myHandler)
useEffect(() => { handlerRef.current = myHandler }, [myHandler])

.on('postgres_changes', {...}, (payload) => {
  handlerRef.current(payload)  // ← Siempre usa el valor actual
})
```

---

## 🚀 Mejoras Futuras

### **1. Reconnection automática**
```typescript
// Detectar desconexiones y reconectar automáticamente
private async handleChannelError(channelName: string) {
  const channel = this.channels.get(channelName)
  if (channel?.state === 'errored') {
    console.warn('Intentando reconectar...')
    await this.removeChannel(channelName)
    // Dejar que el hook re-cree automáticamente
  }
}
```

### **2. Métricas y monitoreo**
```typescript
interface ChannelMetrics {
  totalCreated: number
  totalReused: number
  totalErrors: number
  avgSubscriptionTime: number
  activeChannels: number
}

getMetrics(): ChannelMetrics
```

### **3. Channel pooling**
```typescript
// Pre-crear canales comunes para reducir latencia
await realtimeManager.warmup([
  'conversations:sidebar',
  'notifications:global'
])
```

### **4. Garbage collection automático**
```typescript
// Limpiar canales inactivos después de X tiempo
private gcInterval = setInterval(() => {
  this.channels.forEach((channel, name) => {
    if (channel.state === 'closed' && !this.pendingCleanups.has(name)) {
      this.channels.delete(name)
    }
  })
}, 60000)  // Cada 60s
```

---

## 📊 Estado Actual de la Implementación

### ✅ Funcionalidades Implementadas

- **Cola global de operaciones serializadas** - Zero race conditions
- **Reference counting** - Canales compartidos entre múltiples hooks
- **Health monitoring** - `getStatus()` y `getHealthStatus()`
- **Cleanup secuencial con delays** - Previene errores de Supabase
- **Límites de seguridad** - Hard limit de 100 canales
- **Logging detallado** - Debug completo en modo desarrollo

### 🎯 Garantías del Sistema

1. **Thread-Safety**: Cola global serializa todas las operaciones
2. **Memory Safety**: Reference counting previene cleanups prematuros
3. **State Consistency**: Solo canales en estado `joined` se reutilizan
4. **Error Resilience**: Errores no afectan la cola ni otros canales
5. **React Strict Mode Compatible**: Sin errores de doble suscripción

### 📈 Métricas de Salud

```typescript
const health = realtimeManager.getHealthStatus()

// Ejemplo de respuesta:
{
  activeChannels: 3,
  pendingCleanups: 0,
  channelRefs: {
    "messages:abc123": 2,          // Usado por 2 hooks
    "conversations:sidebar:xyz": 1
  },
  isHealthy: true,
  warning: null
}
```

**Umbrales de advertencia:**
- `< 10 canales`: Healthy ✅
- `10-19 canales`: Warning (posible leak) ⚠️
- `20+ canales`: Critical ❌
- `100 canales`: Hard limit (rechaza nuevos)

---

**Última actualización:** Arquitectura con cola global - Octubre 2025
**Cambios principales:** Implementación de cola global serializada para eliminar race conditions
