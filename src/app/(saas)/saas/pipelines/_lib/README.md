# 🔧 Lib - Servicios de Infraestructura

Servicios técnicos de bajo nivel para el módulo de Pipelines.

## 📚 Servicios Disponibles

### **RealtimeChannelManager**

Singleton que gestiona todos los canales de Supabase Realtime para este módulo.

**Responsabilidades:**
- Crear y gestionar canales de Supabase Realtime
- Reference counting para canales compartidos
- Cola global serializada para prevenir race conditions
- Limpieza automática cuando no hay más referencias
- Health monitoring

**Uso:**
```typescript
import { realtimeManager } from '../_lib'

// Crear o reutilizar canal
const channel = await realtimeManager.getOrCreateChannel(
  'pipelines-messages:abc123',
  (ch) => ch
    .on('postgres_changes', { ... }, handler)
    .subscribe()
)

// Remover canal (solo limpia cuando ref count = 0)
await realtimeManager.removeChannel('pipelines-messages:abc123')
```

**Características:**

#### 1. **Reference Counting**
Múltiples componentes pueden usar el mismo canal sin crear duplicados:
```typescript
// Componente A
await realtimeManager.getOrCreateChannel('messages:123', setup)
// Refs: 1

// Componente B (reutiliza)
await realtimeManager.getOrCreateChannel('messages:123', setup)
// Refs: 2

// Componente A cleanup
await realtimeManager.removeChannel('messages:123')
// Refs: 1 (canal sigue activo)

// Componente B cleanup
await realtimeManager.removeChannel('messages:123')
// Refs: 0 (canal se limpia)
```

#### 2. **Cola Global Serializada**
Previene race conditions ejecutando todas las operaciones en serie:
```typescript
// Operación 1 se ejecuta
getOrCreateChannel('channel-A') 
  // Operación 2 espera a que termine la 1
  getOrCreateChannel('channel-B')
    // Operación 3 espera a que termine la 2
    removeChannel('channel-A')
```

**Ventaja:** Compatible con React Strict Mode (doble invocación de efectos).

#### 3. **Reutilización de Canales Activos**
Solo reutiliza canales en estado `joined` (saludables):
```typescript
const existing = this.channels.get(channelName)
if (existing && existing.state === 'joined') {
  return existing  // Reutilizar
}
// Si está en otro estado, limpia y recrea
```

#### 4. **Protección contra Memory Leaks**
- Límite hard de 100 canales simultáneos
- Warning a partir de 10 canales
- Delay de cleanup para asegurar limpieza del socket

**Debugging:**

```typescript
// Ver estado actual
const status = realtimeManager.getStatus()
console.log(status)
// {
//   activeChannels: 2,
//   pendingCleanups: 0,
//   hasQueuedOperations: false,
//   channels: ['pipelines-messages:abc123', ...],
//   cleaningUp: []
// }

// Health check
const health = realtimeManager.getHealthStatus()
console.log(health)
// {
//   activeChannels: 2,
//   pendingCleanups: 0,
//   channelRefs: { 'pipelines-messages:abc123': 1 },
//   isHealthy: true,
//   warning: null
// }

// Limpiar todo (emergencia)
await realtimeManager.cleanupAll()
```

**Logging:**

En desarrollo, el manager loguea todas las operaciones:
```
[Pipelines-RealtimeManager] 📈 Channel refs: pipelines-messages:abc123 = 1
[Pipelines-RealtimeManager] 🆕 Creando nuevo canal: pipelines-messages:abc123
[Pipelines-RealtimeManager] ✅ Canal conectado y registrado
[Pipelines-RealtimeManager] 📊 Canales activos: 1
```

Prefijo `[Pipelines-RealtimeManager]` para diferenciar del manager de conversaciones.

## 🎯 Diferencias con el Manager de Conversaciones

Aunque el código es duplicado, los managers son **completamente independientes**:

| Característica | Conversaciones | Pipelines |
|---------------|----------------|-----------|
| **Logging prefix** | `[RealtimeManager]` | `[Pipelines-RealtimeManager]` |
| **Nombres de canales** | `messages:abc123` | `pipelines-messages:abc123` |
| **Instancia** | Singleton propio | Singleton propio |
| **Canales gestionados** | Solo conversaciones | Solo pipelines |

**Ventaja:** Si un módulo tiene problemas, no afecta al otro.

## 🔒 Garantías de Seguridad

1. **No Memory Leaks**: Reference counting + cleanup con await
2. **No Double Subscription**: Cola global + verificación de estado
3. **No Race Conditions**: Todas las operaciones serializadas
4. **Hard Limits**: Máximo 100 canales (protección)

## 📊 Métricas de Performance

- **Overhead por canal**: ~50ms creación + 200ms cleanup
- **Memoria por canal**: ~1-2KB
- **Límite recomendado**: < 10 canales simultáneos
- **Límite hard**: 100 canales

## 🐛 Troubleshooting

### Problema: "tried to subscribe multiple times"
**Causa:** React Strict Mode ejecuta efectos dos veces
**Solución:** ✅ Ya manejado por la cola global

### Problema: Canales no se limpian
**Causa:** Ref count > 0 (componentes aún usando el canal)
**Solución:** Verificar que todos los componentes hacen cleanup en unmount

### Problema: Muchos canales activos
**Causa:** Componentes no limpian en unmount
**Solución:** 
```typescript
useEffect(() => {
  // Setup...
  return () => {
    void realtimeManager.removeChannel(channelName)  // ← Cleanup
  }
}, [deps])
```

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0 (Duplicado de conversaciones)  
**Estado:** Producción

