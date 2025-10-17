# Módulo de Pipelines - Documentación de Arquitectura

## 📋 Descripción General

Este módulo implementa un sistema completo de gestión de pipeline de ventas (CRM) con tablero Kanban, drag & drop, y gestión de oportunidades. Sigue la **arquitectura modular** establecida en el módulo de conversaciones.

## 🏗️ Estructura de Carpetas

```
pipelines/
├── page.tsx                    # Entry point simple (solo monta el layout)
├── README.md                   # Documentación del módulo
├── _layout/                    # Componentes de layout y orquestación
│   ├── pipelines-layout.tsx   # Componente principal orquestador
│   └── index.ts               # Exportaciones
├── _features/                  # Features modulares e independientes
│   ├── kanban-board/          # Tablero Kanban con drag & drop
│   │   ├── kanban-board.tsx
│   │   ├── components/        # Componentes específicos del board
│   │   │   ├── column-content.tsx
│   │   │   ├── column-header.tsx
│   │   │   ├── pipeline-column.tsx
│   │   │   ├── unassigned-column.tsx
│   │   │   └── total-summary-panel.tsx
│   │   └── index.ts
│   ├── opportunity-management/ # Gestión de oportunidades
│   │   ├── opportunity-card.tsx
│   │   ├── components/
│   │   │   └── opportunity-create-form.tsx
│   │   └── index.ts
│   ├── board-customization/   # Personalización del tablero
│   │   ├── board-customization-panel.tsx
│   │   └── index.ts
│   ├── contact-integration/   # Integración con contactos
│   │   ├── contact-card.tsx
│   │   └── index.ts
│   └── index.ts              # Exportaciones centralizadas
├── _shared/                   # Componentes compartidos del módulo
│   ├── conversation-modal/    # Modal de conversaciones (usado por múltiples features)
│   │   ├── conversation-modal.tsx
│   │   └── index.ts
│   └── index.ts              # Exportaciones de shared
├── _hooks/                    # Hooks reutilizables
│   ├── messages/             # 📨 Arquitectura modular de mensajería
│   │   ├── use-messages.ts           # Hook orquestador (Facade)
│   │   ├── use-messages-query.ts     # Query vía tRPC
│   │   ├── use-optimistic-messages.ts # UI optimista
│   │   ├── use-messages-realtime.ts  # Suscripción Realtime
│   │   └── index.ts
│   ├── use-debounce.ts       # Hook de debounce
│   ├── use-drag-and-drop.ts  # Lógica de drag & drop
│   ├── use-kanban-totals.ts  # Cálculo de totales
│   ├── use-opportunity-mutations.ts  # Mutaciones de oportunidades
│   ├── use-pipeline-data.ts  # Carga de datos del pipeline
│   ├── use-seller-users.ts   # Obtener usuarios vendedores
│   └── index.ts              # Exportaciones
├── _lib/                      # 🔧 Servicios de infraestructura
│   ├── realtime-channel-manager.ts  # Singleton para Realtime
│   └── index.ts
├── _types/                    # Tipos TypeScript centralizados
│   ├── pipelines.types.ts    # Todos los tipos del módulo
│   └── index.ts              # Exportaciones
└── _utils/                    # Utilidades compartidas
    ├── formatters.ts         # Funciones de formateo
    └── index.ts              # Exportaciones
```

## 🎯 Principios de Diseño

### 1. **Separación por Features**
Cada feature es independiente y exporta sus componentes a través de un `index.ts`:
- ✅ Facilita el mantenimiento
- ✅ Evita acoplamiento
- ✅ Mejora la legibilidad
- ✅ **Cada feature es autosuficiente** - no depende de otros features

### 2. **Componentes Compartidos en `_shared/`**
Solo componentes **verdaderamente compartidos** entre múltiples features:
- ✅ `ConversationModal` - usado por contact-integration y opportunity-management
- ⚠️ **Regla de oro**: Si un componente solo se usa en un feature, debe vivir dentro de ese feature
- ✅ Si un componente se usa en toda la app, debería estar en `src/components/`

### 3. **Tipos Centralizados**
Todos los tipos se definen en `_types/pipelines.types.ts`:
- ✅ Single source of truth
- ✅ Evita duplicación
- ✅ Facilita refactorización

### 4. **Hooks Reutilizables con Arquitectura Modular**
Lógica de negocio extraída a hooks customizados:
- ✅ Testeable independientemente
- ✅ Reutilizable entre componentes
- ✅ Mantiene componentes UI simples
- ✅ **Arquitectura Facade**: Hooks orquestadores que coordinan hooks especializados
- ✅ **Separación de Responsabilidades**: Un hook = una responsabilidad

### 5. **Infraestructura de Servicios (`_lib/`)**
Servicios técnicos de bajo nivel:
- ✅ **RealtimeChannelManager**: Singleton para gestión de canales Supabase
- ✅ Reference counting para canales compartidos
- ✅ Cola global serializada (previene doble suscripción)
- ✅ Protección contra memory leaks

### 6. **Utilidades Compartidas**
Funciones puras en `_utils/`:
- ✅ Sin dependencias externas
- ✅ Fáciles de testear
- ✅ Reutilizables

### 7. **Layout como Orquestador**
El componente `PipelinesLayout` coordina:
- ✅ Carga de datos
- ✅ Estado global del módulo
- ✅ Comunicación entre features
- ✅ Lógica de negocio principal

---

## 🪝 Arquitectura de Hooks de Mensajería

El módulo de pipelines implementa una **arquitectura modular independiente** para la gestión de mensajes en tiempo real, duplicada del módulo de conversaciones pero mantenida de forma separada para permitir modificaciones específicas.

### Patrón Facade

```
useMessages (Orquestador)
    ↓
┌────────────────┬─────────────────────┬──────────────────┐
│                │                     │                  │
useMessagesQuery useOptimisticMessages useMessagesRealtime
(tRPC fetch)     (UI optimista)       (Supabase RT)
```

### Hooks Disponibles

#### **`useMessages`** (Facade - Punto de Entrada)
Hook principal que orquesta toda la lógica de mensajería.

```typescript
import { useMessages } from '../_hooks/messages'

const {
  messages,                // Mensajes (reales + temporales)
  isLoading,              // Cargando inicial
  error,                  // Error de query
  connectionError,        // Error de Realtime
  reconnect,              // Reconexión manual
  addTemporaryMessage,    // Agregar mensaje optimista
  updateTemporaryMessage  // Actualizar mensaje optimista
} = useMessages({
  conversationId: 'abc123',
  clientId: 'xyz789',
  enabled: true
})
```

**Uso en ConversationModal:**
```typescript
// 1. Crear mensaje temporal
const tempId = crypto.randomUUID()
addTemporaryMessage({
  id: tempId,
  content: "Hola",
  messageStatus: "PENDING",
  ...
})

// 2. Enviar al backend
await sendTextMutation.mutateAsync({
  messageId: tempId,  // Mismo ID
  message: "Hola"
})

// 3. Actualizar estado
updateTemporaryMessage(tempId, { messageStatus: "SENT" })

// 4. El mensaje real llega por Realtime y reemplaza al temporal
```

#### **`useMessagesQuery`** (Especializado)
Solo responsable de obtener datos del servidor vía tRPC.

#### **`useOptimisticMessages`** (Especializado)
Solo responsable de gestionar mensajes temporales y combinarlos con los reales.

#### **`useMessagesRealtime`** (Especializado)
Solo responsable de la suscripción Realtime y notificar cambios.

### RealtimeChannelManager

Singleton que gestiona todos los canales de Supabase Realtime:

```typescript
import { realtimeManager } from '../_lib'

// Estado del manager
console.log(realtimeManager.getStatus())
// {
//   activeChannels: 2,
//   pendingCleanups: 0,
//   channels: ['pipelines-messages:abc123', ...]
// }
```

**Características:**
- ✅ Reference counting: Solo limpia canales cuando no hay referencias
- ✅ Cola global serializada: Previene race conditions
- ✅ Reutilización de canales activos
- ✅ Logging detallado en desarrollo

### Ventajas de la Duplicación

**¿Por qué duplicar en lugar de compartir?**

1. **Independencia de Módulos**: Cambios en conversaciones no afectan pipelines
2. **Modificaciones Específicas**: Permitir ajustes para necesidades particulares
3. **Versionado Independiente**: Cada módulo evoluciona a su ritmo
4. **Menor Acoplamiento**: No hay dependencias cruzadas entre módulos
5. **Testing Aislado**: Cada módulo se testea independientemente

**Desventajas aceptadas:**
- ⚠️ Código duplicado (trade-off consciente)
- ⚠️ Cambios deben aplicarse manualmente en ambos módulos si se desea sincronización

### Flujo Completo de Envío de Mensaje

```
Usuario escribe mensaje
    ↓
handleSendMessage()
    ↓
1. addTemporaryMessage() → UI muestra mensaje con "PENDING"
    ↓
2. sendTextMutation.mutateAsync() → Envío al backend
    ↓
3. updateTemporaryMessage() → "SENT" (tick verde)
    ↓
4. Realtime INSERT evento → Llega mensaje real de BD
    ↓
5. onMessageInserted() → Remueve temporal (ya existe real)
    ↓
6. UI muestra mensaje real definitivo
```

## 📦 Features del Módulo

### 1. **Kanban Board**
- Visualización de oportunidades en columnas
- Drag & drop para mover oportunidades
- Columnas configurables
- Totales por columna y general
- **Componentes:**
  - `KanbanBoard` - Componente principal
  - `PipelineColumn` - Columna individual
  - `UnassignedColumn` - Columna de sin asignar
  - `TotalSummaryPanel` - Panel de totales

### 2. **Opportunity Management**
- Creación de oportunidades
- Edición de oportunidades
- Asignación de vendedores
- Seguimiento de deadlines
- **Componentes:**
  - `OpportunityCard` - Card de oportunidad
  - `OpportunityCreateForm` - Formulario de creación

### 3. **Board Customization**
- Ajuste de ancho de columnas
- Ajuste de altura de headers
- Persistencia de preferencias
- **Componentes:**
  - `BoardCustomizationPanel` - Panel de ajustes

### 4. **Contact Integration**
- Cards de contactos
- Visualización de conversaciones
- Navegación a detalles de contacto
- **Componentes:**
  - `ContactCard` - Card de contacto

### 5. **Shared Components**
Componentes reutilizables entre features:
- `ConversationModal` - Modal flotante de conversaciones
  - Chat en tiempo real
  - Toggle de IA
  - Minimizable
  - **Usado por:** contact-integration, opportunity-management

## 🔄 Flujo de Datos

```
page.tsx
  └─> PipelinesLayout (orquestador)
      ├─> usePipelineData (carga datos)
      ├─> useOpportunityMutations (mutaciones)
      ├─> useDragAndDrop (drag & drop)
      └─> Features
          ├─> KanbanBoard
          │   └─> OpportunityCard (from opportunity-management)
          ├─> OpportunityCreateForm
          ├─> BoardCustomizationPanel
          └─> Features usan ConversationModal (from _shared)
```

## 🎨 Patrones Utilizados

### 1. **Optimistic Updates**
El hook `useDragAndDrop` implementa actualizaciones optimistas:
- UI responde inmediatamente
- Rollback automático en caso de error
- Queue de operaciones pendientes

### 2. **Compound Components**
Componentes que trabajan juntos:
```typescript
<KanbanBoard>
  <UnassignedColumn />
  <PipelineColumn />
  <TotalSummaryPanel />
</KanbanBoard>
```

### 3. **Shared Components Pattern**
Componentes compartidos en `_shared/`:
```typescript
// ✅ CORRECTO - Componente usado por múltiples features
_shared/conversation-modal/

// ❌ INCORRECTO - Debería estar dentro del feature
_shared/opportunity-card/
```

### 4. **Custom Hooks**
Encapsulan lógica reutilizable:
- Data fetching
- Mutaciones
- UI state

## 📝 Convenciones de Código

### Nombres de Archivos
- Components: `kebab-case.tsx`
- Hooks: `use-kebab-case.ts`
- Types: `kebab-case.types.ts`
- Utils: `kebab-case.ts`

### Imports
```typescript
// Orden de imports:
// 1. React y librerías externas
// 2. Componentes UI globales
// 3. Componentes compartidos del módulo (_shared)
// 4. Hooks del módulo (_hooks)
// 5. Tipos del módulo (_types)
// 6. Utilidades del módulo (_utils)
```

### Exportaciones
Siempre usar exportaciones nombradas y centralizarlas en `index.ts`:
```typescript
export { Component } from './component'
```

### Reglas para `_shared/`
1. **Solo incluir componentes usados por 2+ features**
2. Documentar qué features usan cada componente
3. Si se usa en toda la app, mover a `src/components/`
4. Si se usa en un solo feature, mover al feature correspondiente

## 🔍 Análisis de Acoplamiento

### Dependencias entre Features
```
kanban-board → opportunity-management (usa OpportunityCard)
contact-integration → _shared (usa ConversationModal)
opportunity-management → _shared (usa ConversationModal)
```

### Componentes Compartidos Actualmente
- ✅ `ConversationModal` (2 features)
- ✅ `OpportunityCard` (usado solo por kanban-board - correcto)

## 🚀 Próximas Mejoras

1. **Testing**
   - Unit tests para hooks
   - Integration tests para features
   - E2E tests para flujos críticos

2. **Performance**
   - Memoización de componentes pesados
   - Virtual scrolling para listas largas
   - Code splitting por feature

3. **Features Adicionales**
   - Filtros avanzados
   - Reportes y analytics
   - Automatizaciones

## 🔍 Debugging

### Ver estado de Realtime

```typescript
import { realtimeManager } from './_lib'

// Estado global
const status = realtimeManager.getStatus()
console.log('Canales activos:', status.activeChannels)
console.log('Lista de canales:', status.channels)

// Health check
const health = realtimeManager.getHealthStatus()
if (!health.isHealthy) {
  console.warn('⚠️ Problema de salud:', health.warning)
}
```

### Limpiar todos los canales

```typescript
// En caso de problemas
await realtimeManager.cleanupAll()

// Forzar limpieza completa
await realtimeManager.forceCleanupAll()
```

## 📚 Referencias

- [Arquitectura de Conversaciones](../conversaciones/README.md) - Arquitectura original
- [Arquitectura de Referencia](../conversaciones/ARCHITECTURE_REFERENCE.md) - Patrones y principios
- [Hooks de Conversaciones](../conversaciones/_hooks/README.md) - Documentación de hooks originales
- [Guías de Cursor](../../../../.cursor/rules/)
- [Documentación de Next.js](https://nextjs.org/docs)

---

## 📝 Changelog de Arquitectura

### v2.1 - Octubre 2025
- ✅ Implementación de arquitectura modular de hooks de mensajería
- ✅ Duplicación de código desde conversaciones para independencia
- ✅ RealtimeChannelManager propio con cola global serializada
- ✅ ConversationModal actualizado a nueva arquitectura
- ✅ Optimistic UI implementado para envío de mensajes

### v2.0 - Octubre 2025
- ✅ Arquitectura modular + Shared Components
- ✅ Feature-sliced design
- ✅ Tipos centralizados

---

**Última actualización:** Octubre 2025
**Versión de arquitectura:** 2.1 (Modular + Hooks Independientes + Shared Components)
**Acoplamiento:** Mínimo (módulo autosuficiente)
**Cohesión:** Máxima (cada feature y hook es independiente)
**Código Duplicado:** Hooks de mensajería (trade-off consciente para independencia)
