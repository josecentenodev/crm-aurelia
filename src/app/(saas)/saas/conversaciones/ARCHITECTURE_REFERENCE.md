# 🏛️ Referencia Arquitectónica - Módulo de Conversaciones

> **Documento de Referencia para Desarrolladores e IAs**  
> Este módulo es un **ejemplo de arquitectura limpia y escalable** que debe servir como referencia para otros módulos del proyecto.

---

## 📋 Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Principios Arquitectónicos](#-principios-arquitectónicos)
3. [Estructura de Directorios](#-estructura-de-directorios)
4. [Capas de la Aplicación](#-capas-de-la-aplicación)
5. [Patrones de Diseño](#-patrones-de-diseño)
6. [Flujo de Datos](#-flujo-de-datos)
7. [Gestión de Estado](#-gestión-de-estado)
8. [Estrategias de Performance](#-estrategias-de-performance)
9. [Testing](#-testing)
10. [Buenas Prácticas](#-buenas-prácticas)
11. [Anti-Patrones](#-anti-patrones)

---

## 🎯 Visión General

### Propósito del Módulo

Sistema de mensajería en tiempo real multi-canal que centraliza todas las conversaciones del cliente con:
- **Actualización en tiempo real** vía Supabase Realtime
- **Soporte multi-canal** (WhatsApp, Telegram, Instagram, Facebook)
- **IA conversacional** con toggle manual/automático
- **Gestión optimista** para UX fluida
- **Arquitectura escalable** basada en features

### Métricas de Calidad

| Criterio | Puntuación | Justificación |
|----------|------------|---------------|
| **Arquitectura** | 9/10 | Feature-sliced design, SOLID aplicado |
| **Cohesión** | 9/10 | Módulos altamente cohesivos |
| **Acoplamiento** | 8/10 | Bajo entre features |
| **Type Safety** | 8/10 | TypeScript estricto |
| **Documentación** | 10/10 | README en cada capa |
| **Mantenibilidad** | 9/10 | Código limpio, bien organizado |

**Puntuación total: 8.5/10** ⭐

---

## 🏗️ Principios Arquitectónicos

### 1. **Feature-Sliced Design (FSD)**

Organización por features auto-contenidas en lugar de por tipo de archivo.

```
❌ MAL - Organización por tipo:
/components/ChatPanel.tsx
/components/Sidebar.tsx
/hooks/useMessages.ts
/hooks/useConversations.ts

✅ BIEN - Organización por feature:
/chat-panel/
  ├── chat-panel.tsx
  └── components/
/sidebar/
  ├── sidebar.tsx
  └── components/
```

**Beneficios:**
- Features independientes y desacopladas
- Fácil de escalar (agregar features sin tocar otras)
- Mejor entendimiento del dominio
- Equipos pueden trabajar en features paralelas

### 2. **SOLID Principles**

#### **S - Single Responsibility Principle**
Cada módulo tiene **una única razón para cambiar**.

```typescript
// ✅ BIEN: Responsabilidad única
export function useMessagesQuery({ conversationId }) {
  // Solo se encarga de fetch
  return api.messages.list.useQuery({ conversationId })
}

export function useOptimisticMessages({ serverMessages }) {
  // Solo se encarga de UI optimista
  const [temporaryMessages, setTemporaryMessages] = useState([])
  return { allMessages: [...serverMessages, ...temporaryMessages] }
}

// ❌ MAL: Múltiples responsabilidades
export function useMessages() {
  // Fetch + Optimistic + Realtime + State = demasiado
}
```

#### **O - Open/Closed Principle**
Abierto para extensión, cerrado para modificación.

```typescript
// ✅ BIEN: Extensible sin modificar
export function useConversationsFiltering({ data, selectedCategory }) {
  // Agregar nueva categoría no requiere modificar este hook
  return useMemo(() => filterByCategory(data, selectedCategory), [data, selectedCategory])
}

// Nueva categoría en constantes:
export const CATEGORIES = [...existingCategories, { id: 'vip', label: 'VIP' }]
```

#### **L - Liskov Substitution Principle**
Subtipos deben ser sustituibles por sus tipos base.

```typescript
// ✅ BIEN: Tipos consistentes
interface Message {
  id: string
  content: string
  createdAt: Date
}

interface TemporaryMessage extends Message {
  isTemporary: true
  messageStatus: 'PENDING' | 'SENT' | 'FAILED'
}

// TemporaryMessage puede usarse donde se espere Message
```

#### **I - Interface Segregation Principle**
Interfaces específicas mejor que genéricas.

```typescript
// ✅ BIEN: Interfaces segregadas
interface MessagesData {
  messages: UIMessage[]
  isLoading: boolean
}

interface MessagesActions {
  addTemporaryMessage: (msg: TemporaryMessage) => void
  removeTemporaryMessage: (id: string) => void
}

// ❌ MAL: Interfaz gigante
interface MessagesEverything {
  messages: UIMessage[]
  isLoading: boolean
  error: Error | null
  connectionState: ConnectionState
  addMessage: () => void
  removeMessage: () => void
  // ... 20 más
}
```

#### **D - Dependency Inversion Principle**
Depender de abstracciones, no de implementaciones.

```typescript
// ✅ BIEN: Depende de abstracción (hook)
function ChatPanel({ conversationId }) {
  const { messages } = useMessages({ conversationId })
  // No sabe si usa tRPC, GraphQL, REST, etc.
}

// ❌ MAL: Depende de implementación concreta
function ChatPanel({ conversationId }) {
  const { data } = api.messages.list.useQuery({ conversationId })
  // Acoplado a tRPC
}
```

### 3. **Separation of Concerns**

Cada capa tiene una responsabilidad clara:

```
┌─────────────────────────────────────────┐
│  Presentation Layer (_features)        │  ← Solo UI
├─────────────────────────────────────────┤
│  Business Logic (_hooks)               │  ← Lógica de negocio
├─────────────────────────────────────────┤
│  State Management (_store)             │  ← Estado global
├─────────────────────────────────────────┤
│  Infrastructure (_lib)                 │  ← Servicios técnicos
├─────────────────────────────────────────┤
│  Domain (_types)                       │  ← Tipos y contratos
├─────────────────────────────────────────┤
│  Utilities (_utils)                    │  ← Helpers puros
└─────────────────────────────────────────┘
```

### 4. **DRY (Don't Repeat Yourself)**

Abstraer lógica repetida en utilidades reutilizables.

```typescript
// ✅ BIEN: Lógica centralizada
export function formatMessageTime(date: Date | string): string {
  // Lógica compartida en un solo lugar
}

// Usado en múltiples componentes
<span>{formatMessageTime(message.createdAt)}</span>

// ❌ MAL: Duplicación
function Component1() {
  const time = new Intl.DateTimeFormat('es-AR', { hour: '2-digit' }).format(date)
}
function Component2() {
  const time = new Intl.DateTimeFormat('es-AR', { hour: '2-digit' }).format(date)
}
```

### 5. **Composition over Inheritance**

React favorece composición de componentes.

```typescript
// ✅ BIEN: Composición
<ChatLayout>
  <Sidebar />
  <ChatPanel />
  <ContactInfo />
</ChatLayout>

// ❌ MAL: Herencia (no idiomático en React)
class ChatLayout extends BaseLayout {
  // ...
}
```

---

## 📁 Estructura de Directorios

### Convenciones de Nomenclatura

```
conversaciones/
├── page.tsx                    # 📄 Next.js page (solo metadata)
├── layout.tsx                  # 🎨 Layout wrapper
├── README.md                   # 📖 Documentación principal
│
├── _features/                  # 🎨 Componentes por funcionalidad
│   ├── README.md
│   ├── index.ts               # ← Exportaciones públicas
│   ├── chat-panel/
│   │   ├── chat-panel.tsx     # ← Contenedor principal
│   │   ├── components/        # ← Componentes internos
│   │   │   ├── chat-header.tsx
│   │   │   ├── message-list.tsx
│   │   │   └── composer.tsx
│   │   └── README.md
│   └── sidebar/
│       ├── chats-sidebar.tsx
│       ├── components/
│       └── README.md
│
├── _hooks/                     # 🪝 Lógica de negocio
│   ├── README.md
│   ├── index.ts
│   ├── use-messages.ts        # ← Hook orquestador
│   └── messages/              # ← Hooks especializados
│       ├── use-messages-query.ts
│       ├── use-optimistic-messages.ts
│       └── use-messages-realtime.ts
│
├── _store/                     # 🗄️ Estado global (Zustand)
│   ├── README.md
│   ├── index.ts
│   ├── chats-filters-store.ts
│   └── chats-selection-store.ts
│
├── _lib/                       # 🔧 Utilidades de bajo nivel
│   ├── README.md
│   ├── index.ts
│   └── realtime-channel-manager.ts
│
├── _types/                     # 📊 Tipos de UI
│   ├── README.md
│   └── conversations.types.ts
│
└── _utils/                     # 🛠️ Helpers puros
    ├── README.md
    ├── index.ts
    ├── date-formatter.ts
    └── realtime-helpers.ts
```

### Reglas de Nomenclatura

1. **Prefijo underscore** (`_`) para carpetas internas que NO son rutas
2. **kebab-case** para archivos y carpetas
3. **PascalCase** para componentes React
4. **camelCase** para funciones y variables
5. **UPPER_SNAKE_CASE** para constantes

```typescript
// ✅ BIEN
export function ChatPanel() { ... }           // Componente
export function useMessages() { ... }         // Hook
export const CONTACT_CHANNELS = [...]         // Constante
const messagesList = [...messages]            // Variable

// ❌ MAL
export function chat_panel() { ... }          // snake_case (Python style)
export function UseMessages() { ... }         // PascalCase para no-componente
export const contactChannels = [...]          // camelCase para constante
```

---

## 🏛️ Capas de la Aplicación

### Capa 1: Presentation (_features)

**Responsabilidad:** Solo renderizado y eventos de UI

```typescript
// ✅ BIEN: Componente presentacional puro
export function MessageItem({ message, isContact }: Props) {
  return (
    <div className={cn("message", isContact && "contact")}>
      <p>{message.content}</p>
      <span>{formatMessageTime(message.createdAt)}</span>
    </div>
  )
}

// ❌ MAL: Lógica de negocio en componente
export function MessageItem({ messageId }: Props) {
  const { data } = api.messages.byId.useQuery({ id: messageId })
  const [state, setState] = useState()
  // Demasiada lógica...
}
```

**Características:**
- Props tipadas con interfaces específicas
- No contiene lógica de negocio
- Delega a hooks para estado/efectos
- Exporta solo interfaz pública vía `index.ts`

### Capa 2: Business Logic (_hooks)

**Responsabilidad:** Lógica de negocio reutilizable

```typescript
// ✅ BIEN: Hook con lógica clara
export function useMessages({ conversationId, clientId, enabled }: Props) {
  // 1. Fetch inicial
  const { messages: serverMessages } = useMessagesQuery(...)
  
  // 2. UI optimista
  const { allMessages, addTemporaryMessage } = useOptimisticMessages(...)
  
  // 3. Realtime
  useMessagesRealtime({ onMessageInserted: removeTemporaryMessage })
  
  // 4. Retorna interfaz limpia
  return { messages: allMessages, addTemporaryMessage }
}
```

**Patrón Facade:** Hook orquestador + hooks especializados

```
useMessages (Facade)
    ↓
┌────────────────┬─────────────────────┬──────────────────┐
│                │                     │                  │
useMessagesQuery useOptimisticMessages useMessagesRealtime
```

### Capa 3: State Management (_store)

**Responsabilidad:** Estado global compartido

```typescript
// ✅ BIEN: Store especializado con una responsabilidad
export const useChatsFiltersStore = create<ChatsFiltersState>()(
  persist(
    (set, get) => ({
      searchTerm: '',
      dateFilter: 'today',
      
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      // Función pura para transformar
      getTrpcFilters: () => {
        const state = get()
        return {
          search: state.searchTerm,
          dateFrom: getDateRange(state.dateFilter).from
        }
      }
    }),
    { name: 'chats-filters-store' }
  )
)
```

**Reglas:**
- Un store por dominio de estado
- Funciones puras para transformaciones
- Persistir solo lo necesario
- No mutar estado en renders

### Capa 4: Infrastructure (_lib)

**Responsabilidad:** Servicios técnicos de bajo nivel

```typescript
// ✅ BIEN: Singleton con responsabilidad única
class RealtimeChannelManager {
  private channels: Map<string, RealtimeChannel>
  private globalOperationQueue: Promise<any> = Promise.resolve()
  
  async getOrCreateChannel(channelName, setup) {
    return this.enqueueOperation(() => this._doGetOrCreateChannel(...))
  }
  
  private async enqueueOperation(operation) {
    // Cola global serializada
    const previous = this.globalOperationQueue
    const current = previous.catch(() => {}).then(() => operation())
    this.globalOperationQueue = current.catch(() => {})
    return current
  }
}

export const realtimeManager = new RealtimeChannelManager()
```

**Características:**
- Singleton para servicios compartidos
- Manejo robusto de errores
- Logging detallado en desarrollo
- Health monitoring

### Capa 5: Domain (_types)

**Responsabilidad:** Tipos y contratos

```typescript
// Separación clara entre tipos de dominio y UI

// @domain/Conversaciones.ts - Contratos de backend
export interface ConversationWithDetails {
  id: string
  title?: string | null
  assignedUser?: {
    name?: string | null  // ← Puede ser null (BD)
  }
}

// _types/conversations.types.ts - Optimizado para UI
export interface ChatConversation {
  id: string
  title?: string | null
  assignedUser?: {
    name: string  // ← Siempre string (UI muestra fallback)
  }
}
```

**Regla de oro:**
- Domain (`@domain/`) = Contratos de API, entidades, enums
- Types (`_types/`) = Props de componentes, ViewModels

### Capa 6: Utilities (_utils)

**Responsabilidad:** Funciones puras sin estado

```typescript
// ✅ BIEN: Función pura
export function formatMessageTime(date: Date | string): string {
  if (!date) return ""
  const messageDate = typeof date === 'string' ? new Date(date) : date
  return formatter.format(messageDate)
}

// ❌ MAL: Función con efectos secundarios
export function formatMessageTime(date: Date | string): string {
  localStorage.setItem('lastFormattedTime', Date.now())  // ← Side effect!
  return formatter.format(date)
}
```

**Características:**
- Sin estado interno
- Sin efectos secundarios
- Fáciles de testear
- Retornan valores determinísticos

---

## 🎨 Patrones de Diseño

### 1. Singleton Pattern

**Uso:** `realtimeManager` para gestión centralizada de canales

```typescript
class RealtimeChannelManager {
  private static instance: RealtimeChannelManager
  private channels: Map<string, RealtimeChannel> = new Map()
  
  private constructor() {}  // ← Constructor privado
  
  static getInstance(): RealtimeChannelManager {
    if (!this.instance) {
      this.instance = new RealtimeChannelManager()
    }
    return this.instance
  }
}

// Exportar instancia única
export const realtimeManager = new RealtimeChannelManager()
```

**Por qué:**
- Garantiza una única fuente de verdad
- Previene canales duplicados
- Permite health monitoring global

### 2. Observer Pattern

**Uso:** Supabase Realtime subscriptions

```typescript
// Observable: Canal de Supabase
const channel = supabase.channel('messages')

// Observers: Hooks que escuchan cambios
channel.on('postgres_changes', { event: 'INSERT' }, (payload) => {
  // Hook A reacciona
})

channel.on('postgres_changes', { event: 'UPDATE' }, (payload) => {
  // Hook B reacciona
})
```

**Por qué:**
- Desacopla emisores de receptores
- Múltiples componentes reaccionan a mismo evento
- Fácil agregar/remover observers

### 3. Repository Pattern

**Uso:** tRPC queries abstraen acceso a datos

```typescript
// Repository abstraction
export function useMessagesRepository({ conversationId }: Props) {
  return api.messages.list.useQuery({ conversationId })
}

// Componente usa abstracción, no implementación
function ChatPanel() {
  const { data } = useMessagesRepository({ conversationId })
  // No sabe si es tRPC, REST, GraphQL, etc.
}
```

**Por qué:**
- Cambiar implementación sin tocar componentes
- Fácil mockear en tests
- Centraliza lógica de fetch

### 4. Strategy Pattern

**Uso:** Filtrado dinámico de conversaciones

```typescript
// Estrategia de filtrado según categoría
const filterStrategies = {
  all: (conversations) => conversations,
  unassigned: (conversations) => conversations.filter(c => !c.assignedUser),
  mine: (conversations) => conversations.filter(c => c.assignedUser?.id === userId),
  archived: (conversations) => conversations.filter(c => c.status === 'ARCHIVADA')
}

// Seleccionar estrategia dinámicamente
const filtered = filterStrategies[selectedCategory](conversations)
```

**Por qué:**
- Fácil agregar nuevas estrategias
- Algoritmos intercambiables
- Open/Closed principle

### 5. Facade Pattern

**Uso:** `useMessages` orquesta múltiples hooks

```typescript
// Facade simplifica interfaz compleja
export function useMessages({ conversationId, clientId, enabled }: Props) {
  // Coordina múltiples subsistemas
  const query = useMessagesQuery({ conversationId })
  const optimistic = useOptimisticMessages({ serverMessages: query.messages })
  const realtime = useMessagesRealtime({ conversationId, onInsert: optimistic.remove })
  
  // Retorna interfaz simplificada
  return {
    messages: optimistic.allMessages,
    isLoading: query.isLoading,
    addTemporaryMessage: optimistic.add
  }
}

// Componente usa facade simple
const { messages, addTemporaryMessage } = useMessages({ conversationId })
```

**Por qué:**
- Interfaz simple para sistema complejo
- Oculta complejidad interna
- Fácil usar para consumidores

### 6. Command Pattern

**Uso:** Acciones optimistas con rollback

```typescript
// Command encapsula acción + undo
export function useOptimisticConversationActions({ conversation }: Props) {
  const [snapshot, setSnapshot] = useState()
  
  const handleArchiveToggle = async () => {
    // 1. Guardar snapshot (Command)
    setSnapshot(conversation)
    
    // 2. Ejecutar optimista
    updateCacheOptimistically({ status: 'ARCHIVADA' })
    
    try {
      // 3. Confirmar con backend
      await mutation.mutateAsync({ id: conversation.id, status: 'ARCHIVADA' })
    } catch (error) {
      // 4. Revertir (Undo)
      restoreFromSnapshot(snapshot)
    }
  }
  
  return { handleArchiveToggle }
}
```

**Por qué:**
- Operaciones reversibles (undo)
- Optimistic UI robusto
- Encapsula lógica de cambio

---

## 🔄 Flujo de Datos

### Arquitectura Unidireccional

```
Usuario interactúa con UI
    ↓
Componente dispara acción
    ↓
Hook maneja lógica de negocio
    ↓
Store actualiza estado (si global)
    ↓
Mutación tRPC al backend
    ↓
Backend procesa y retorna
    ↓
React Query invalida cache
    ↓
Componente re-renderiza con nuevos datos
```

### Ejemplo: Enviar Mensaje

```typescript
// 1. Usuario escribe y envía
<Composer onSend={handleSendMessage} />

// 2. Handler en ChatPanel
const handleSendMessage = async (message: string) => {
  // 3. Crear mensaje temporal (Optimistic UI)
  const tempId = crypto.randomUUID()
  addTemporaryMessage({
    id: tempId,
    content: message,
    messageStatus: 'PENDING'
  })
  
  // 4. Mutación al backend
  await sendTextMutation.mutateAsync({
    messageId: tempId,  // ← Mismo ID
    content: message
  })
  
  // 5. Backend guarda mensaje con ID=tempId
  // 6. Realtime emite INSERT
  // 7. useMessagesRealtime recibe evento
  // 8. removeTemporaryMessage(tempId)
  // 9. UI muestra mensaje real
}
```

### Hybrid Loading: tRPC + Realtime

```
┌─────────────────────────────────────────┐
│           Initial Load (tRPC)           │
│  - Cacheable                            │
│  - SSR-friendly                         │
│  - Batch requests                       │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│      Live Updates (Realtime)            │
│  - Low latency                          │
│  - WebSocket                            │
│  - Event-driven                         │
└─────────────────────────────────────────┘
```

**Por qué híbrido:**
- tRPC: Mejor para carga inicial (cacheable, SSR)
- Realtime: Mejor para updates (low latency, live)
- No mixing: Updates no invalidan tRPC (performance)

---

## 🗄️ Gestión de Estado

### Estado Local vs Global

```typescript
// ✅ Estado LOCAL (useState, useReducer)
// - Estado específico de un componente
// - No compartido con otros
const [isEditing, setIsEditing] = useState(false)
const [selectedFile, setSelectedFile] = useState<File | null>(null)

// ✅ Estado GLOBAL (Zustand)
// - Compartido entre múltiples componentes
// - Persiste entre navegaciones
const { selectedConversationId } = useChatsSelectionStore()
const { searchTerm, dateFilter } = useChatsFiltersStore()

// ✅ Estado del SERVIDOR (React Query/tRPC)
// - Datos del backend
// - Cache automático
const { data: conversations } = api.conversaciones.list.useQuery()
```

### Zustand Best Practices

```typescript
// ✅ BIEN: Store especializado
export const useChatsFiltersStore = create<ChatsFiltersState>()(
  persist(
    (set, get) => ({
      searchTerm: '',
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      // Función pura para transformar (no muta en render)
      getTrpcFilters: () => {
        const state = get()  // Lee sin mutar
        return { search: state.searchTerm }
      }
    }),
    {
      name: 'chats-filters-store',
      partialize: (state) => ({
        searchTerm: state.searchTerm  // Solo persiste esto
      })
    }
  )
)

// ❌ MAL: Store gigante con todo
export const useAppStore = create((set) => ({
  // Mensajes, conversaciones, usuarios, configuración...
  // Demasiado en un solo store
}))
```

### React Query (tRPC) Best Practices

```typescript
// ✅ BIEN: Query con configuración apropiada
const { data } = api.conversaciones.list.useQuery(
  { clientId, filters },
  {
    enabled: !!clientId,          // Solo fetch si hay clientId
    staleTime: 30 * 1000,         // Cache 30s (Realtime actualiza)
    refetchOnWindowFocus: false   // No refetch al cambiar tab
  }
)

// ✅ BIEN: Invalidaciones precisas
onSuccess: () => {
  void utils.conversaciones.list.invalidate({ clientId, filters })
}

// ❌ MAL: Invalidar todo
onSuccess: () => {
  void utils.invalidate()  // Invalida TODAS las queries
}
```

---

## ⚡ Estrategias de Performance

### 1. Memoización

```typescript
// ✅ Memoizar cálculos costosos
const filteredConversations = useMemo(
  () => conversations.filter(c => c.status === selectedStatus),
  [conversations, selectedStatus]
)

// ✅ Memoizar componentes
export const MessageItem = memo(({ message }: Props) => {
  return <div>{message.content}</div>
}, (prev, next) => {
  // Custom comparator
  return prev.message.id === next.message.id &&
         prev.message.updatedAt === next.message.updatedAt
})

// ✅ Memoizar callbacks
const handleClick = useCallback(() => {
  doSomething(value)
}, [value])
```

### 2. Lazy Loading

```typescript
// ✅ Dynamic imports para componentes pesados
const FilePreview = dynamic(
  () => import('./components/file-preview'),
  { 
    ssr: false,
    loading: () => <Skeleton />
  }
)

// ✅ Lazy loading de imágenes
<img src={url} loading="lazy" decoding="async" />
```

### 3. Virtualización (Recomendado)

```typescript
// ⚠️ PENDIENTE: Implementar para listas >500 items
import { useVirtualizer } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  overscan: 5
})

// Solo renderiza items visibles + overscan
```

### 4. Debouncing

```typescript
// ✅ Debounce en inputs de búsqueda
const debouncedSearch = useMemo(
  () => debounce((term: string) => setSearchTerm(term), 300),
  []
)

<Input onChange={(e) => debouncedSearch(e.target.value)} />
```

### 5. Optimistic UI

```typescript
// ✅ Actualiza UI inmediatamente, confirma después
addTemporaryMessage(tempMsg)  // Síncrono, instantáneo
await mutation.mutateAsync()  // Asíncrono, en background
```

---

## 🧪 Testing

### Estrategia de Testing

```typescript
// Pirámide de tests recomendada:
//
//        /\
//       /  \  E2E (10%)
//      /────\
//     /      \ Integration (30%)
//    /────────\
//   /          \ Unit (60%)
//  /────────────\

// Unit: Hooks, utils, stores
// Integration: Features completas
// E2E: Flujos críticos de usuario
```

### Testing de Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks'

test('useMessages loads and updates', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useMessages({ conversationId: '123', clientId: 'abc', enabled: true })
  )
  
  // Initial loading
  expect(result.current.isLoading).toBe(true)
  
  await waitForNextUpdate()
  
  // Data loaded
  expect(result.current.messages).toHaveLength(5)
  expect(result.current.isLoading).toBe(false)
  
  // Add temporary message
  act(() => {
    result.current.addTemporaryMessage(mockTempMessage)
  })
  
  expect(result.current.messages).toHaveLength(6)
})
```

### Testing de Stores

```typescript
test('ChatsFiltersStore updates filters', () => {
  const { result } = renderHook(() => useChatsFiltersStore())
  
  act(() => {
    result.current.setSearchTerm('Juan')
    result.current.setDateFilter('week')
  })
  
  expect(result.current.searchTerm).toBe('Juan')
  expect(result.current.dateFilter).toBe('week')
  
  const filters = result.current.getTrpcFilters()
  expect(filters.search).toBe('Juan')
  expect(filters.dateFrom).toBeDefined()
})
```

### Testing de Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

test('MessageItem renders correctly', () => {
  render(<MessageItem message={mockMessage} isContact={false} />)
  
  expect(screen.getByText(mockMessage.content)).toBeInTheDocument()
  expect(screen.getByText(/14:30/)).toBeInTheDocument()
})

test('Composer sends message on submit', async () => {
  const onSend = vi.fn()
  render(<Composer onSend={onSend} disabled={false} />)
  
  const input = screen.getByPlaceholderText(/Escribe mensaje/)
  fireEvent.change(input, { target: { value: 'Hola' } })
  fireEvent.submit(input.closest('form')!)
  
  expect(onSend).toHaveBeenCalledWith('Hola')
})
```

---

## ✅ Buenas Prácticas

### 1. Naming Conventions

```typescript
// ✅ Componentes: PascalCase
export function ChatPanel() {}
export function MessageList() {}

// ✅ Hooks: camelCase con prefijo 'use'
export function useMessages() {}
export function useConversations() {}

// ✅ Stores: camelCase con sufijo 'Store'
export const useChatsFiltersStore = create()

// ✅ Constantes: UPPER_SNAKE_CASE
export const MAX_MESSAGE_LENGTH = 5000
export const CONTACT_CHANNELS = [...]

// ✅ Types/Interfaces: PascalCase
export interface ChatConversation {}
export type MessageStatus = 'PENDING' | 'SENT'
```

### 2. File Organization

```typescript
// ✅ BIEN: Exports en index.ts
// _features/index.ts
export { ChatPanel } from './chat-panel/chat-panel'
export { ChatsSidebar } from './sidebar/chats-sidebar'

// Componente importa desde index
import { ChatPanel, ChatsSidebar } from './_features'

// ❌ MAL: Import directo de archivo interno
import { ChatPanel } from './_features/chat-panel/chat-panel'
```

### 3. Props Destructuring

```typescript
// ✅ BIEN: Destructuring en parámetros
export function MessageItem({ message, isContact }: Props) {
  return <div>{message.content}</div>
}

// ❌ MAL: Acceso vía props.
export function MessageItem(props: Props) {
  return <div>{props.message.content}</div>
}
```

### 4. Error Handling

```typescript
// ✅ BIEN: Try-catch con logging
try {
  await mutation.mutateAsync({ ... })
} catch (error) {
  console.error('[ChatPanel] Error sending message:', error)
  toast({
    title: 'Error',
    description: error instanceof Error ? error.message : 'Error desconocido',
    variant: 'destructive'
  })
}

// ❌ MAL: Catch silencioso
try {
  await mutation.mutateAsync({ ... })
} catch (error) {
  // Silencio... usuario no sabe qué pasó
}
```

### 5. TypeScript Strictness

```typescript
// ✅ BIEN: Tipos estrictos
interface MessageItemProps {
  message: UIMessage
  isContact: boolean
}

// ❌ MAL: any o tipos débiles
interface MessageItemProps {
  message: any  // ← Pierde type safety
  isContact?: boolean | undefined | null  // ← Demasiado permisivo
}
```

---

## ❌ Anti-Patrones

### 1. Prop Drilling

```typescript
// ❌ MAL: Pasar props por muchos niveles
<Layout conversationId={id}>
  <Sidebar conversationId={id}>
    <ConversationList conversationId={id}>
      <ConversationCard conversationId={id} />

// ✅ BIEN: Usar contexto o store
const { selectedConversationId } = useChatsSelectionStore()
```

### 2. God Components

```typescript
// ❌ MAL: Componente con demasiadas responsabilidades
export function ChatPanel() {
  // 500 líneas de código
  // Fetch, Realtime, State, UI, Mutations...
  // Imposible mantener
}

// ✅ BIEN: Separar responsabilidades
export function ChatPanel({ conversationId }: Props) {
  const { messages } = useMessages({ conversationId })  // ← Hook maneja lógica
  return (
    <div>
      <ChatHeader />
      <MessageList messages={messages} />
      <Composer />
    </div>
  )
}
```

### 3. Mutación Directa de Estado

```typescript
// ❌ MAL: Mutar estado directamente
const handleUpdate = () => {
  messages.push(newMessage)  // ← Mutación directa
  setMessages(messages)      // ← React no detecta cambio
}

// ✅ BIEN: Inmutabilidad
const handleUpdate = () => {
  setMessages([...messages, newMessage])  // ← Nueva referencia
}
```

### 4. UseEffect Innecesarios

```typescript
// ❌ MAL: useEffect para fetch
useEffect(() => {
  fetch('/api/messages')
    .then(res => res.json())
    .then(data => setMessages(data))
}, [conversationId])

// ✅ BIEN: React Query/tRPC
const { data: messages } = api.messages.list.useQuery({ conversationId })
```

### 5. Componentes No Memoizados en Listas

```typescript
// ❌ MAL: Re-renderiza todos los items siempre
{messages.map(msg => (
  <MessageItem key={msg.id} message={msg} />
))}

// ✅ BIEN: Memoizar items
export const MessageItem = memo(({ message }: Props) => {
  // ...
}, customComparator)
```

---

## 📚 Referencias y Recursos

### Arquitectura
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)

### React
- [React Docs - Thinking in React](https://react.dev/learn/thinking-in-react)
- [React Patterns](https://reactpatterns.com/)
- [Kent C. Dodds - Application State Management](https://kentcdodds.com/blog/application-state-management-with-react)

### TypeScript
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

### Performance
- [Web.dev - Performance](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

## 🎓 Checklist para Nuevos Módulos

Al crear un módulo nuevo, verificar:

- [ ] **Estructura FSD** - Organizado por features, no por tipo
- [ ] **README en cada capa** - Documentación exhaustiva
- [ ] **Exports centralizados** - index.ts en cada carpeta
- [ ] **Tipos separados** - Domain vs UI types
- [ ] **Hooks especializados** - Un hook, una responsabilidad
- [ ] **Store por dominio** - No god stores
- [ ] **Componentes memoizados** - Para listas y componentes costosos
- [ ] **Error handling** - Try-catch con logging y feedback
- [ ] **Type safety** - Sin any, tipos estrictos
- [ ] **Tests básicos** - Al menos unit tests de hooks
- [ ] **Performance considerada** - Lazy loading, memoization
- [ ] **Documentación de decisiones** - Por qué se hizo así

---

**Fecha de creación:** Octubre 2025  
**Versión:** 1.0  
**Mantenedor:** Equipo de Desarrollo Aurelia

Este documento debe actualizarse cuando cambien decisiones arquitectónicas fundamentales.

