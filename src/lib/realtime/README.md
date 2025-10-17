# 🔄 Sistema de Realtime con Channel Manager

Sistema centralizado de gestión de canales Supabase Realtime para Aurelia Platform.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Componentes](#componentes)
- [Uso](#uso)
- [Convención de Nombres](#convención-de-nombres)
- [Características](#características)
- [Debugging](#debugging)

## 🏗️ Arquitectura

Este sistema implementa un **patrón Singleton** para gestionar todos los canales de Supabase Realtime de forma centralizada, evitando:

- ❌ Duplicación de canales
- ❌ Memory leaks por cleanup incorrecto
- ❌ Overhead de múltiples conexiones
- ❌ Debugging complejo

### Patrón de Diseño

```
┌─────────────────────────────────────────┐
│     SupabaseChannelManager (Singleton)  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Channels Map                   │   │
│  │  - global:notifications:...     │   │
│  │  - private:conversation:...     │   │
│  │  - private:playground:...       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Auto Cleanup                   │   │
│  │  - Remove inactive channels     │   │
│  │  - Prevent memory leaks         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           │
           ├─> Hook: useSupabaseRealtimeNotifications
           ├─> Hook: use-single-conversation-realtime (future)
           └─> Hook: use-playground-realtime (future)
```

## 🧩 Componentes

### 1. `SupabaseChannelManager`

Singleton que gestiona el ciclo de vida de todos los canales.

**Responsabilidades:**
- Crear y reutilizar canales
- Gestionar suscriptores múltiples por canal
- Cleanup automático de canales inactivos
- Logging centralizado para debugging

### 2. Types (`types.ts`)

Tipos TypeScript compartidos para type safety.

### 3. Constants (`constants.ts`)

Constantes y helpers para naming conventions.

### 4. Index (`index.ts`)

Punto de entrada que exporta toda la API pública.

## 📖 Uso

### Uso Básico

```typescript
import { getChannelManager, buildNotificationsChannelName } from "@/lib/realtime"

// Obtener instancia del manager
const manager = getChannelManager()

// Generar nombre de canal siguiendo convención
const channelName = buildNotificationsChannelName(clientId, userId)

// Suscribirse a eventos
const unsubscribe = manager.subscribe<Notification>(
  channelName,
  {
    event: "INSERT",
    schema: "public",
    table: "Notification",
    filter: `clientId=eq.${clientId}`
  },
  (payload) => {
    console.log("New notification:", payload.new)
  }
)

// Cleanup
unsubscribe()
```

### Uso en Hook de React

```typescript
"use client"

import { useEffect } from "react"
import { getChannelManager, buildNotificationsChannelName } from "@/lib/realtime"

export function useMyRealtime(clientId: string) {
  useEffect(() => {
    const manager = getChannelManager()
    const channelName = buildNotificationsChannelName(clientId)
    
    const unsubscribe = manager.subscribe(
      channelName,
      { event: "INSERT", schema: "public", table: "MyTable" },
      (payload) => console.log(payload)
    )
    
    return unsubscribe
  }, [clientId])
}
```

## 🏷️ Convención de Nombres

Todos los canales siguen la convención: `{scope}:{entity}:{id1}:{id2}...`

### Scopes

- `global` - Canales globales/compartidos
- `private` - Canales privados específicos
- `public` - Canales públicos

### Entities

- `notifications` - Notificaciones del sistema
- `conversation` - Mensajes de conversaciones
- `playground` - Mensajes de playground
- `messages` - Mensajes genéricos

### Ejemplos

```typescript
// Notificaciones globales de un cliente
"global:notifications:client-abc123"

// Notificaciones de un usuario específico
"global:notifications:client-abc123:user-xyz789"

// Mensajes de una conversación (futuro)
"private:conversation:conv-456"

// Mensajes de playground (futuro)
"private:playground:session-789"
```

### Helper Functions

```typescript
import { buildChannelName, buildNotificationsChannelName } from "@/lib/realtime"

// Método genérico
const name = buildChannelName("GLOBAL", "NOTIFICATIONS", "client-123", "user-456")
// => "global:notifications:client-123:user-456"

// Helper específico para notificaciones
const name = buildNotificationsChannelName("123", "456")
// => "global:notifications:client-123:user-456"
```

## ✨ Características

### 1. Reutilización de Canales

Si múltiples componentes se suscriben al mismo canal, el Channel Manager reutiliza la conexión existente:

```typescript
// Component A
const unsubA = manager.subscribe("global:notifications:client-123", config, callbackA)

// Component B (reusa el mismo canal)
const unsubB = manager.subscribe("global:notifications:client-123", config, callbackB)

// Solo se crea UN canal de Supabase
```

### 2. Auto Cleanup

El Channel Manager limpia automáticamente canales inactivos:

```typescript
const manager = getChannelManager({
  autoCleanup: true,           // Activar cleanup automático
  cleanupInterval: 5 * 60000,  // Cada 5 minutos
  maxInactiveTime: 10 * 60000  // Remover si inactivo >10min
})
```

### 3. Logging Centralizado

En desarrollo, todos los eventos se loguean automáticamente:

```
[ChannelManager] Channel Manager initialized
[ChannelManager] Subscribing to channel: global:notifications:client-123
[ChannelManager] Creating channel: global:notifications:client-123
[ChannelManager] Channel global:notifications:client-123 successfully subscribed
[ChannelManager] Subscriber sub_1234_abc added to global:notifications:client-123. Total subscribers: 1
```

### 4. Type Safety

Todos los payloads están tipados:

```typescript
manager.subscribe<Notification>(
  channelName,
  config,
  (payload) => {
    // payload.new está tipado como Notification
    console.log(payload.new.title)
  }
)
```

### 5. Prevención de Memory Leaks

El cleanup es automático y garantizado:

```typescript
// Al desmontar componente, se limpia automáticamente
useEffect(() => {
  const unsubscribe = manager.subscribe(...)
  
  // Channel Manager se encarga del cleanup
  return unsubscribe
}, [])
```

## 🐛 Debugging

### Ver Estadísticas

```typescript
const manager = getChannelManager()
const stats = manager.getStats()

console.log(stats)
// {
//   totalChannels: 2,
//   totalSubscribers: 5,
//   channels: [
//     {
//       name: "global:notifications:client-123",
//       subscribers: 3,
//       status: "SUBSCRIBED",
//       createdAt: Date,
//       lastActivityAt: Date
//     },
//     ...
//   ]
// }
```

### Habilitar Logs en Producción

```typescript
const manager = getChannelManager({
  enableLogging: true  // Por defecto solo en development
})
```

### Limpiar Manualmente

```typescript
const manager = getChannelManager()

// Limpiar todos los canales
manager.cleanup()

// Resetear instancia (útil para testing)
SupabaseChannelManager.resetInstance()
```

## 🚀 Estado Actual

### ✅ Implementado

- ✅ Channel Manager singleton
- ✅ Hook de notificaciones refactorizado (`useSupabaseRealtimeNotifications`)
- ✅ Integrado en layout SaaS
- ✅ Auto cleanup de canales
- ✅ Logging centralizado
- ✅ Type safety completo

### 🔮 Futuro (Opcional)

- 🔜 Migrar `use-single-conversation-realtime` al Channel Manager
- 🔜 Migrar `use-playground-realtime` al Channel Manager
- 🔜 Implementar Broadcast en vez de Postgres Changes (mejor performance)
- 🔜 Debouncing inteligente de invalidaciones

## 📝 Notas Importantes

1. **No tocar otros módulos:** Conversaciones y Playground siguen independientes por ahora
2. **Naming convention es crítica:** Usar siempre los helpers para generar nombres
3. **Un canal por entidad:** No crear múltiples canales para la misma entidad
4. **Cleanup automático:** El manager se encarga, no hacer cleanup manual
5. **Testing:** Verificar en múltiples ventanas/usuarios que no hay duplicación

## 🔗 Referencias

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Best Practices](https://supabase.com/docs/guides/realtime/getting_started)
- [Channel Naming](https://supabase.com/docs/guides/realtime/concepts#channels)

