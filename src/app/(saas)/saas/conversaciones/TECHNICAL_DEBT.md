# 🔧 Deuda Técnica y Plan de Mejoras

> **Documento de Análisis Técnico**  
> Evaluación exhaustiva de deuda técnica, oportunidades de mejora y análisis de modularización del módulo de conversaciones.

**Última actualización:** Octubre 2025  
**Próxima revisión:** Diciembre 2025

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Deuda Técnica Crítica](#-deuda-técnica-crítica)
3. [Mejoras de Performance](#-mejoras-de-performance)
4. [Análisis de Modularización](#-análisis-de-modularización)
5. [Refactorings Propuestos](#-refactorings-propuestos)
6. [Roadmap de Implementación](#-roadmap-de-implementación)
7. [Métricas y Seguimiento](#-métricas-y-seguimiento)

---

## 📊 Resumen Ejecutivo

### Estado Actual del Módulo

| Categoría | Estado | Tendencia |
|-----------|--------|-----------|
| **Arquitectura** | 🟢 Excelente | → Estable |
| **Performance** | 🟡 Buena | ↗️ Mejorable |
| **Testing** | 🔴 Limitado | ↗️ En progreso |
| **Type Safety** | 🟢 Bueno | → Estable |
| **Documentación** | 🟢 Excelente | → Estable |
| **Escalabilidad** | 🟡 Buena | ↗️ Mejorable |

### Puntuación General: **7.8/10**

**Fortalezas principales:**
- ✅ Arquitectura modular bien diseñada (9/10)
- ✅ Documentación exhaustiva (10/10)
- ✅ Separación de responsabilidades (9/10)

**Debilidades principales:**
- ❌ Cobertura de tests insuficiente (4/10)
- ⚠️ Performance con listas largas (7/10)
- ⚠️ Acoplamiento a contextos globales (6/10)

---

## 🚨 Deuda Técnica Crítica

### 1. **Falta de Tests** 🔴 CRÍTICO

**Problema:**
Solo existen 2 archivos de test en todo el módulo:
- `_hooks/messages/use-messages.test.tsx`
- `_lib/realtime-channel-manager.test.ts`

**Impacto:**
- Alto riesgo de regresiones
- Dificulta refactoring seguro
- No hay validación de lógica de negocio

**Solución:**
```typescript
// Estructura de tests propuesta:
conversaciones/
├── _features/
│   ├── chat-panel/__tests__/
│   │   ├── chat-panel.test.tsx
│   │   └── components/
│   │       ├── message-list.test.tsx
│   │       └── composer.test.tsx
│   ├── sidebar/__tests__/
│   └── contact-info/__tests__/
├── _hooks/__tests__/
│   ├── use-messages.test.ts
│   ├── use-conversations-filtering.test.ts
│   └── use-optimistic-conversation-actions.test.ts
└── _store/__tests__/
    ├── chats-filters-store.test.ts
    └── chats-selection-store.test.ts
```

**Cobertura objetivo:**
- Unit tests: 80% de hooks y stores
- Integration tests: Features críticas (chat-panel, sidebar)
- E2E: Flujo completo de envío de mensaje

**Esfuerzo:** 40 horas (1 semana)  
**Prioridad:** 🔥 Alta

---

### 2. **Performance con Listas Largas** 🟡 IMPORTANTE

**Problema:**
Sin virtualización, renderiza todos los elementos aunque no sean visibles.

**Métricas actuales:**
```
100 mensajes:   ~150ms render ✅
500 mensajes:   ~800ms render ⚠️
1000 mensajes: ~2000ms render ❌ Inaceptable
```

**Solución:**
Implementar virtualización con `@tanstack/react-virtual`:

```typescript
// _features/chat-panel/components/message-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function MessageList({ messages }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,  // Altura estimada de cada mensaje
    overscan: 5              // Items extras arriba/abajo
  })
  
  return (
    <div ref={parentRef} className="overflow-auto h-full">
      <div 
        style={{ 
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualItem => {
          const message = messages[virtualItem.index]
          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <MessageItem message={message} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Métricas esperadas post-implementación:**
```
100 mensajes:   ~50ms render ✅
500 mensajes:   ~80ms render ✅
1000 mensajes:  ~100ms render ✅
5000 mensajes:  ~120ms render ✅
```

**Mismo patrón aplicar a:**
- `ConversationsList` en sidebar (cuando >200 conversaciones)

**Esfuerzo:** 16 horas (2 días)  
**Prioridad:** 🔥 Alta

---

### 3. **Type Casting Manual** 🟡 IMPORTANTE

**Problema:**
Varios lugares usan `as unknown as` para convertir tipos:

```typescript
// ❌ Casting manual (code smell)
const conversationsData = 
  rawConversationsData as unknown as ChatConversationsByInstance[]

<UserAssignmentDropdown
  conversation={conversation as unknown as ChatConversation}
/>
```

**Impacto:**
- Pierde garantías de TypeScript
- Bugs potenciales en runtime
- Dificulta refactoring

**Solución:**
Crear adapters explícitos:

```typescript
// _utils/type-adapters.ts
export function adaptToUIConversations(
  raw: ConversationWithDetails[]
): ChatConversation[] {
  return raw.map(conv => ({
    id: conv.id,
    title: conv.title,
    status: conv.status,
    assignedUser: conv.assignedUser ? {
      ...conv.assignedUser,
      name: conv.assignedUser.name ?? 'Usuario sin nombre'
    } : undefined,
    // ... mapeo explícito campo por campo
  }))
}

// Uso:
const conversationsData = adaptToUIConversations(rawConversationsData)
```

**Beneficios:**
- ✅ Type safety completo
- ✅ Transformaciones explícitas
- ✅ Fácil debuggear
- ✅ Testeable

**Esfuerzo:** 8 horas (1 día)  
**Prioridad:** 🟡 Media

---

### 4. **Memoización Faltante** 🟡 IMPORTANTE

**Problema:**
`MessageItem` no está memoizado, causando re-renders innecesarios.

```typescript
// Situación actual:
export function MessageItem({ message, isContact }: Props) {
  // Re-renderiza TODOS los mensajes cuando llega uno nuevo
  return <div>{message.content}</div>
}
```

**Solución:**
```typescript
export const MessageItem = memo(({ message, isContact }: Props) => {
  return <div>{message.content}</div>
}, (prevProps, nextProps) => {
  // Custom comparator: solo re-renderiza si cambió lo relevante
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.messageStatus === nextProps.message.messageStatus &&
    prevProps.message.updatedAt === nextProps.message.updatedAt &&
    prevProps.isContact === nextProps.isContact
  )
})
```

**Impacto esperado:**
- ~90% reducción en re-renders
- Mejora notable en conversaciones largas

**Esfuerzo:** 2 horas  
**Prioridad:** 🟡 Media

---

### 5. **Acoplamiento a ClientProvider** 🟢 MENOR

**Problema:**
Múltiples componentes dependen directamente de `useClientContext()`:

```typescript
// Aparece en muchos lugares:
const { clientId } = useClientContext()
```

**Impacto:**
- Dificulta testing (requiere mock del contexto completo)
- Acoplamiento a implementación específica
- No reutilizable fuera del contexto

**Solución:**
Pasar `clientId` como prop en componentes raíz:

```typescript
// page.tsx (Server Component)
export default async function ConversationsPage() {
  const clientId = await getClientIdFromSession()
  
  return (
    <HydrateClient>
      <ChatsLayout clientId={clientId} />
    </HydrateClient>
  )
}

// ChatsLayout
export function ChatsLayout({ clientId }: Props) {
  return (
    <>
      <ChatsSidebar clientId={clientId} />
      <ChatPanel clientId={clientId} />
    </>
  )
}
```

**Beneficios:**
- ✅ Testeable sin contexto
- ✅ Explicit dependencies
- ✅ Reutilizable

**Esfuerzo:** 4 horas  
**Prioridad:** 🟢 Baja

---

## ⚡ Mejoras de Performance

### 1. **Prefetch al Hover** 🟡 MEDIA

**Oportunidad:**
Cuando usuario hace hover sobre una conversación, prefetch de mensajes.

```typescript
// sidebar/components/conversation-card.tsx
export function ConversationCard({ conversation }: Props) {
  const utils = api.useUtils()
  
  const handleMouseEnter = useCallback(() => {
    // Prefetch mensajes en background
    void utils.messages.list.prefetch({
      conversationId: conversation.id,
      clientId: conversation.clientId
    })
  }, [conversation.id, conversation.clientId, utils])
  
  return (
    <div onMouseEnter={handleMouseEnter}>
      {/* ... */}
    </div>
  )
}
```

**Beneficio:**
- Mensajes ya cargados al hacer click
- Percepción de velocidad mejorada

**Esfuerzo:** 2 horas  
**ROI:** Alto

---

### 2. **Selectores Granulares en Zustand** 🟡 MEDIA

**Problema actual:**
```typescript
// ❌ Re-renderiza con cualquier cambio del store
const { searchTerm, dateFilter, selectedCategory } = useChatsFiltersStore()
```

**Solución:**
```typescript
// ✅ Solo re-renderiza cuando searchTerm cambia
const searchTerm = useChatsFiltersStore(state => state.searchTerm)
const dateFilter = useChatsFiltersStore(state => state.dateFilter)
```

**Beneficio:**
- Reduce re-renders innecesarios
- Mejora performance en componentes con filtros

**Esfuerzo:** 4 horas  
**ROI:** Medio

---

### 3. **Debounce en Búsqueda** 🟢 BAJA

**Problema:**
Cada keystroke dispara una query.

**Solución:**
```typescript
// sidebar/components/conversations-search.tsx
import { useDebouncedValue } from '@/hooks/use-debounced-value'

export function ConversationsSearch() {
  const [localSearch, setLocalSearch] = useState('')
  const debouncedSearch = useDebouncedValue(localSearch, 300)
  
  useEffect(() => {
    setSearchTerm(debouncedSearch)
  }, [debouncedSearch])
  
  return <Input value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} />
}
```

**Beneficio:**
- Menos requests al backend
- UX más fluida

**Esfuerzo:** 2 horas  
**ROI:** Medio

---

### 4. **Mover Cálculo de Categorías al Backend** 🟢 BAJA

**Problema:**
Cliente recorre todas las conversaciones para contar categorías:

```typescript
// Ejecuta en cliente (puede ser lento con 1000+ conversaciones)
function calculateCategoryCounts(conversations) {
  let all = 0, unassigned = 0, mine = 0
  for (const group of conversations) {
    for (const conv of group.conversations) {
      all++
      if (!conv.assignedUser) unassigned++
      // ...
    }
  }
  return { all, unassigned, mine }
}
```

**Solución:**
Backend retorna conteos:

```typescript
// tRPC endpoint
export const conversacionesRouter = router({
  list: publicProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input }) => {
      const [conversations, counts] = await Promise.all([
        db.conversation.findMany({ where: { clientId: input.clientId } }),
        db.conversation.groupBy({
          by: ['status', 'assignedUserId'],
          where: { clientId: input.clientId },
          _count: true
        })
      ])
      
      return {
        conversations,
        categoryCounts: {
          all: counts.reduce((sum, c) => sum + c._count, 0),
          unassigned: counts.find(c => !c.assignedUserId)?._count ?? 0,
          // ...
        }
      }
    })
})
```

**Beneficio:**
- Escalable con cualquier cantidad de conversaciones
- Reduce carga en cliente

**Esfuerzo:** 6 horas  
**ROI:** Alto (si >500 conversaciones)

---

## 🧩 Análisis de Modularización

### Features Actuales y Evaluación

| Feature | LOC | Componentes | Complejidad | Modularización |
|---------|-----|-------------|-------------|----------------|
| **chat-panel** | ~600 | 9 | Alta | 🟡 Mejorable |
| **sidebar** | ~400 | 7 | Media | 🟢 Adecuada |
| **contact-info** | ~350 | 5 | Media | 🟢 Adecuada |
| **header** | ~200 | 3 | Baja | 🟢 Adecuada |
| **create-conversation** | ~300 | 1 | Media | 🟢 Adecuada |

---

### 📱 chat-panel - Propuesta de Modularización

**Problema:**
`chat-panel` es la feature más compleja (600 LOC, 9 componentes). Mezcla múltiples responsabilidades.

**Análisis de responsabilidades:**
1. **Gestión de mensajes** (message-list, message-item, ai-typing-indicator)
2. **Envío de mensajes** (composer, file-preview)
3. **Control de IA** (ai-active-banner, ai-toggle-dialog)
4. **Header del chat** (chat-header, connection-alert)

**Propuesta: Separar en sub-features**

```
_features/
├── chat-panel/                      # ← Orquestador principal
│   ├── chat-panel.tsx              # ← Monta sub-features
│   └── README.md
│
├── message-display/                 # ← Nueva: Visualización de mensajes
│   ├── message-display.tsx         # ← Container
│   ├── components/
│   │   ├── message-list.tsx
│   │   ├── message-item.tsx
│   │   ├── ai-typing-indicator.tsx
│   │   └── connection-alert.tsx
│   └── README.md
│
├── message-composer/                # ← Nueva: Envío de mensajes
│   ├── message-composer.tsx        # ← Container
│   ├── components/
│   │   ├── composer.tsx
│   │   └── file-preview.tsx
│   └── README.md
│
└── ai-control/                      # ← Nueva: Gestión de IA
    ├── ai-control.tsx              # ← Container
    ├── components/
    │   ├── ai-active-banner.tsx
    │   ├── ai-toggle-dialog.tsx
    │   └── ai-status-indicator.tsx
    └── README.md
```

**Nuevo ChatPanel (simplificado):**

```typescript
// chat-panel.tsx
export function ChatPanel({ conversationId }: Props) {
  const { conversation } = useConversation({ conversationId })
  
  return (
    <div className="flex h-full flex-col">
      <ChatHeader conversation={conversation} />
      
      <div className="flex-1 min-h-0">
        <MessageDisplay conversationId={conversationId} />
      </div>
      
      {conversation.isAiActive ? (
        <AIControl conversation={conversation} />
      ) : (
        <MessageComposer conversationId={conversationId} />
      )}
    </div>
  )
}
```

**Beneficios:**
- ✅ Cada sub-feature es independiente y testeable
- ✅ Más fácil de mantener (50-150 LOC por feature)
- ✅ Equipos pueden trabajar en paralelo
- ✅ Reutilizable (MessageDisplay podría usarse en otros contextos)

**Esfuerzo:** 12 horas (1.5 días)  
**Prioridad:** 🟡 Media  
**ROI:** Alto si el módulo sigue creciendo

---

### 🗂️ sidebar - Análisis de Separación

**Estado actual:** Adecuada cohesión (400 LOC, 7 componentes)

**Posible mejora:** Separar filtrado en feature independiente

```
_features/
├── sidebar/
│   ├── chats-sidebar.tsx
│   └── components/
│       ├── conversations-list.tsx
│       └── conversation-card.tsx
│
└── conversations-filters/           # ← Nueva feature
    ├── conversations-filters.tsx
    └── components/
        ├── search-bar.tsx
        ├── category-filters.tsx
        └── advanced-filters-dialog.tsx
```

**Beneficio:** Filtros reutilizables en otros módulos (ej: archivados, reportes)

**Esfuerzo:** 6 horas  
**Prioridad:** 🟢 Baja  
**Recomendación:** ⏸️ Postponer (no hay necesidad inmediata)

---

### ℹ️ contact-info - Propuesta de Optimización

**Estado actual:** Buena modularización (350 LOC, 5 componentes)

**Oportunidad menor:** Separar acciones rápidas

```
_features/
├── contact-info/
│   ├── contact-info-panel.tsx
│   └── components/
│       ├── contact-details.tsx
│       └── conversation-stats.tsx
│
└── conversation-actions/           # ← Nueva feature (opcional)
    ├── conversation-actions.tsx
    └── components/
        ├── status-selector.tsx
        ├── user-assignment.tsx
        └── quick-actions.tsx
```

**Beneficio:** Acciones reutilizables (sidebar podría mostrar quick actions)

**Esfuerzo:** 8 horas  
**Prioridad:** 🟢 Baja  
**Recomendación:** ⏸️ Postponer

---

## 🔄 Refactorings Propuestos

### 1. **Extraer Hook `useSendMessage`** 🟡 MEDIA

**Problema:**
ChatPanel tiene 3 mutaciones de envío mezcladas con lógica de UI.

```typescript
// Situación actual en chat-panel.tsx (líneas ~100-300)
const sendTextMutation = api.messages.sendText.useMutation({ ... })
const sendImageMutation = api.messages.sendImage.useMutation({ ... })
const sendDocumentMutation = api.messages.sendDocument.useMutation({ ... })

const handleSendMessage = async (message) => {
  // Lógica compleja mezclada con UI
}
```

**Solución:**
```typescript
// _hooks/use-send-message.ts
export function useSendMessage({ conversationId, clientId }: Props) {
  const { toast } = useToast()
  const { addTemporaryMessage, updateTemporaryMessage } = useOptimisticMessages()
  
  const sendTextMutation = api.messages.sendText.useMutation()
  const sendImageMutation = api.messages.sendImage.useMutation()
  const sendDocumentMutation = api.messages.sendDocument.useMutation()
  
  const sendText = useCallback(async (content: string) => {
    const tempId = crypto.randomUUID()
    
    addTemporaryMessage({
      id: tempId,
      content,
      messageStatus: 'PENDING',
      // ...
    })
    
    try {
      await sendTextMutation.mutateAsync({
        messageId: tempId,
        content,
        conversationId,
        clientId
      })
      
      updateTemporaryMessage(tempId, { messageStatus: 'SENT' })
    } catch (error) {
      updateTemporaryMessage(tempId, { messageStatus: 'FAILED' })
      toast({ title: 'Error', description: error.message })
    }
  }, [conversationId, clientId])
  
  const sendImage = useCallback(async (file: File) => {
    // Similar...
  }, [])
  
  const sendDocument = useCallback(async (file: File) => {
    // Similar...
  }, [])
  
  return {
    sendText,
    sendImage,
    sendDocument,
    isSending: sendTextMutation.isPending || 
               sendImageMutation.isPending || 
               sendDocumentMutation.isPending
  }
}

// Uso en ChatPanel:
const { sendText, sendImage, isSending } = useSendMessage({
  conversationId,
  clientId
})

<Composer onSend={sendText} disabled={isSending} />
```

**Beneficios:**
- ✅ Separación de responsabilidades
- ✅ Reutilizable en otros contextos
- ✅ Más fácil de testear
- ✅ ChatPanel se simplifica ~150 LOC

**Esfuerzo:** 6 horas  
**Prioridad:** 🟡 Media

---

### 2. **Normalizar Estado de Mensajes** 🟢 BAJA

**Oportunidad:**
Mantener mensajes en forma normalizada (Map por ID) en lugar de arrays.

```typescript
// Actual: Array (búsqueda O(n))
const messages: UIMessage[] = [...]
const message = messages.find(m => m.id === id)  // O(n)

// Propuesto: Map (búsqueda O(1))
const messagesById = new Map<string, UIMessage>()
const message = messagesById.get(id)  // O(1)

// Para renderizado:
const messagesList = Array.from(messagesById.values()).sort(...)
```

**Beneficio:**
- Búsquedas/actualizaciones más rápidas
- Importante con >1000 mensajes

**Esfuerzo:** 4 horas  
**Prioridad:** 🟢 Baja (solo si >1000 mensajes es común)

---

### 3. **State Machine para IA Toggle** 🟢 BAJA

**Oportunidad:**
Usar XState para gestionar estados complejos del toggle de IA.

```typescript
// Estados posibles:
// - inactive (IA off)
// - confirming_activation (dialog abierto)
// - activating (mutación en progreso)
// - active (IA on)
// - confirming_deactivation
// - deactivating
// - error

import { createMachine } from 'xstate'

const aiToggleMachine = createMachine({
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'confirming_activation' }
    },
    confirming_activation: {
      on: {
        CONFIRM: 'activating',
        CANCEL: 'inactive'
      }
    },
    activating: {
      invoke: {
        src: 'activateAI',
        onDone: 'active',
        onError: 'error'
      }
    },
    active: {
      on: { TOGGLE: 'confirming_deactivation' }
    },
    // ...
  }
})
```

**Beneficio:**
- Estados explícitos y predecibles
- Visualización de flujo
- Previene estados imposibles

**Esfuerzo:** 8 horas  
**Prioridad:** 🟢 Baja (overkill para toggle simple)  
**Recomendación:** ⏸️ Postponer (solo si toggle se vuelve más complejo)

---

## 🗺️ Roadmap de Implementación

### Fase 1: Fundamentos (Sprint 1-2) 🔥 CRÍTICO

**Objetivo:** Resolver deuda técnica crítica

| Tarea | Esfuerzo | Prioridad | Impacto |
|-------|----------|-----------|---------|
| 1. Implementar virtualización | 16h | 🔥 Alta | Alto |
| 2. Memoizar MessageItem | 2h | 🔥 Alta | Alto |
| 3. Tests de hooks críticos | 16h | 🔥 Alta | Alto |
| 4. Tests de stores | 8h | 🔥 Alta | Medio |

**Total:** 42 horas (~1 semana)

**Resultado esperado:**
- ✅ Performance aceptable con 1000+ mensajes
- ✅ ~40% cobertura de tests
- ✅ Re-renders reducidos en ~90%

---

### Fase 2: Performance (Sprint 3-4) 🟡 IMPORTANTE

**Objetivo:** Optimizar experiencia de usuario

| Tarea | Esfuerzo | Prioridad | Impacto |
|-------|----------|-----------|---------|
| 5. Prefetch al hover | 2h | 🟡 Media | Alto |
| 6. Selectores granulares Zustand | 4h | 🟡 Media | Medio |
| 7. Debounce en búsqueda | 2h | 🟡 Media | Medio |
| 8. Type adapters explícitos | 8h | 🟡 Media | Medio |

**Total:** 16 horas (~2 días)

**Resultado esperado:**
- ✅ UX más fluida (percepción de velocidad)
- ✅ Type safety completo
- ✅ Menos requests innecesarios

---

### Fase 3: Testing Completo (Sprint 5) 🟡 IMPORTANTE

**Objetivo:** Alcanzar cobertura adecuada

| Tarea | Esfuerzo | Prioridad | Impacto |
|-------|----------|-----------|---------|
| 9. Tests de features | 20h | 🟡 Media | Alto |
| 10. Tests de integración | 12h | 🟡 Media | Alto |
| 11. Setup E2E básico | 8h | 🟡 Media | Medio |

**Total:** 40 horas (~1 semana)

**Resultado esperado:**
- ✅ 80% cobertura de código crítico
- ✅ CI/CD con tests automáticos
- ✅ Confianza en refactorings

---

### Fase 4: Refactoring Avanzado (Sprint 6-7) 🟢 MEJORA

**Objetivo:** Mejorar arquitectura y modularización

| Tarea | Esfuerzo | Prioridad | Impacto |
|-------|----------|-----------|---------|
| 12. Extraer hook useSendMessage | 6h | 🟡 Media | Medio |
| 13. Modularizar chat-panel | 12h | 🟡 Media | Medio |
| 14. Desacoplar de ClientProvider | 4h | 🟢 Baja | Bajo |
| 15. Mover cálculo categorías a backend | 6h | 🟢 Baja | Medio |

**Total:** 28 horas (~3.5 días)

**Resultado esperado:**
- ✅ Código más mantenible
- ✅ Features más pequeñas y enfocadas
- ✅ Escalabilidad mejorada

---

### Fase 5: Optimizaciones Futuras (Backlog) 🟢 OPCIONAL

**Objetivo:** Mejoras incrementales según necesidad

| Tarea | Esfuerzo | Prioridad | Trigger |
|-------|----------|-----------|---------|
| 16. State machine para IA | 8h | 🟢 Baja | Si toggle se complica |
| 17. Normalizar estado de mensajes | 4h | 🟢 Baja | Si >1000 mensajes común |
| 18. Separar conversations-filters | 6h | 🟢 Baja | Si se reutiliza en otros módulos |
| 19. Web Workers para parsing | 12h | 🟢 Baja | Si mensajes muy grandes |

**Total:** 30 horas

---

## 📈 Métricas y Seguimiento

### KPIs de Calidad

| Métrica | Actual | Objetivo | Estado |
|---------|--------|----------|--------|
| **Cobertura de tests** | 10% | 80% | 🔴 |
| **Render time (1000 msgs)** | 2000ms | <150ms | 🔴 |
| **Re-renders innecesarios** | ~90% | <10% | 🔴 |
| **Type safety** | 85% | 95% | 🟡 |
| **Bundle size (feature)** | ~250KB | <200KB | 🟢 |
| **Tiempo carga inicial** | ~1.2s | <1s | 🟡 |

### Tracking de Deuda Técnica

```typescript
// Herramienta sugerida: SonarQube
// Métricas a trackear:
{
  technicalDebt: {
    high: 2,        // items críticos
    medium: 5,      // items importantes
    low: 8          // items mejora continua
  },
  codeSmells: {
    total: 15,
    byType: {
      'type-casting': 8,
      'prop-drilling': 3,
      'god-component': 1,
      'missing-memo': 3
    }
  },
  coverage: {
    lines: 12,
    functions: 15,
    branches: 8
  }
}
```

### Revisión Trimestral

**Próximas revisiones:**
- 📅 Diciembre 2025: Post Fase 1-2
- 📅 Marzo 2026: Post Fase 3-4
- 📅 Junio 2026: Evaluación anual

---

## 🎯 Conclusiones y Recomendaciones

### Resumen de Prioridades

1. **🔥 Hacer YA (Sprint 1-2)**
   - Virtualización de listas
   - Tests básicos de hooks y stores
   - Memoización de MessageItem

2. **🟡 Hacer Pronto (Sprint 3-5)**
   - Type adapters explícitos
   - Prefetch y optimizaciones de UX
   - Tests de integración completos

3. **🟢 Evaluar Después (Sprint 6+)**
   - Modularización de chat-panel (si crece)
   - Refactorings avanzados
   - Optimizaciones especializadas

### Riesgos si NO se Aborda

- ❌ **Performance**: App lenta con >500 mensajes (abandono de usuarios)
- ❌ **Testing**: Alto riesgo de bugs en producción
- ❌ **Escalabilidad**: Difícil agregar features sin romper existentes
- ❌ **Mantenibilidad**: Código cada vez más difícil de entender

### Oportunidades

- ✅ **Referencia arquitectónica**: Con mejoras, este módulo puede ser template para otros
- ✅ **Developer Experience**: Tests completos facilitan onboarding
- ✅ **Performance**: Virtualización permite conversaciones ilimitadas
- ✅ **Type Safety**: Eliminar castings mejora confianza en refactorings

---

**Documento vivo:** Este archivo debe actualizarse cada sprint al completar tareas.

**Próxima actualización:** Al completar Fase 1 (Diciembre 2025)

**Responsable:** Tech Lead / Arquitecto del Proyecto

