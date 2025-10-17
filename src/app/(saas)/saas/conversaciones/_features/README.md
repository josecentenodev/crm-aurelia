# 🎨 Features - Arquitectura de Componentes

Cada feature es un módulo auto-contenido que encapsula una funcionalidad completa del sistema de conversaciones.

## 📐 Principios de Diseño

### **1. Auto-contenido**
- Cada feature tiene su propia carpeta con componentes y lógica
- No hay imports cruzados entre features
- Exporta su interfaz pública vía `index.ts`

### **2. Composición**
- Features se componen en `ChatsLayout`
- Comunicación vía props callbacks o stores compartidos
- Cada feature puede evolucionar independientemente

### **3. Responsabilidad única**
- Una feature = una preocupación del negocio
- Componentes internos organizados por función
- Separación clara entre presentación y lógica

## 🗂️ Features Disponibles

### **📱 chat-panel** 
Panel principal de mensajería con composer, mensajes en tiempo real y toggle de IA.

**Exporta:**
- `ChatPanel` - Componente principal

**Responsabilidades:**
- Mostrar mensajes de una conversación
- Enviar mensajes (texto, imágenes, documentos)
- Toggle IA manual/automático
- Actualización en tiempo real vía Realtime

[Ver documentación completa](./chat-panel/README.md)

---

### **🗂️ sidebar**
Lista de conversaciones con filtros, búsqueda y agrupación por instancia.

**Exporta:**
- `ChatsSidebar` - Componente principal

**Responsabilidades:**
- Listar conversaciones agrupadas
- Filtros por categoría (todas, sin asignar, mías, nuevas, archivadas)
- Búsqueda en tiempo real
- Selección de conversación activa

[Ver documentación completa](./sidebar/README.md)

---

### **ℹ️ contact-info**
Panel lateral con información del contacto y acciones de conversación.

**Exporta:**
- `ContactInfoPanel` - Componente principal

**Responsabilidades:**
- Mostrar datos del contacto
- Cambiar estado de conversación
- Asignar usuarios
- Archivar/desarchivar
- Marcar como importante

[Ver documentación completa](./contact-info/README.md)

---

### **🎛️ header**
Barra superior con filtros avanzados, selector de fecha y notificaciones.

**Exporta:**
- `ChatsPageHeader` - Componente principal

**Responsabilidades:**
- Filtros de fecha (hoy, semana, mes, trimestre, año)
- Filtros avanzados (estado, canal, instancia)
- Botón de notificaciones

[Ver documentación completa](./header/README.md)

---

### **➕ create-conversation**
Formulario para crear nuevas conversaciones con validación completa.

**Exporta:**
- `CreateConversationForm` - Componente principal

**Responsabilidades:**
- Selección de contacto con búsqueda
- Configuración de canal e instancia
- Mensaje inicial opcional
- Toggle IA al crear

[Ver documentación completa](./create-conversation/README.md)

---

## 🔄 Flujo de Comunicación

```
┌─────────────┐
│   Header    │ → setDateFilter()
│             │ → setStatusFilter()     ┌─────────────────┐
└─────────────┘ → setChannelFilter()    │ FiltersStore    │
                                        │ (Zustand)       │
┌─────────────┐                         └─────────────────┘
│   Sidebar   │ → lee filtros               ↓
│             │ ← recibe conversaciones  getTrpcFilters()
└─────────────┘                             ↓
       │                              ┌──────────────┐
       │ setSelectedConversationId()  │ tRPC Query   │
       ↓                              └──────────────┘
┌─────────────────┐
│ SelectionStore  │
│ (Zustand)       │
└─────────────────┘
       ↓
┌─────────────┐          ┌──────────────────┐
│  ChatPanel  │ ← lee    │ ContactInfoPanel │
│             │          │                  │
└─────────────┘          └──────────────────┘
```

## 🧩 Patrón de Composición

### **1. Feature Container** (Smart Component)
```typescript
// chat-panel.tsx
export function ChatPanel({ conversationId }: ChatPanelProps) {
  // Lógica de negocio
  const { data } = api.conversaciones.byId.useQuery(...)
  const { messages } = useSupabaseRealtimeMessages(...)
  
  // Delegación a componentes presentacionales
  return (
    <>
      <ChatHeader {...} />
      <MessageList messages={messages} />
      <Composer onSend={handleSend} />
    </>
  )
}
```

### **2. Presentational Components**
```typescript
// components/message-list.tsx
export function MessageList({ messages, isTyping }: Props) {
  // Solo renderizado, sin lógica de negocio
  return (
    <div>
      {messages.map(msg => <MessageItem key={msg.id} {...} />)}
    </div>
  )
}
```

### **3. Index Export**
```typescript
// index.ts
export { ChatPanel } from './chat-panel'
// Componentes internos NO se exportan
```

## 📝 Convenciones de Código

### **Nombres de archivos**
- Features: `kebab-case.tsx` (ej. `chat-panel.tsx`)
- Componentes: `kebab-case.tsx` (ej. `message-list.tsx`)
- Hooks: `use-kebab-case.ts` (ej. `use-realtime.ts`)

### **Estructura de carpeta**
```
feature-name/
├── feature-name.tsx          # Componente principal
├── components/               # Componentes internos
│   ├── component-a.tsx
│   └── component-b.tsx
└── index.ts                  # Exportaciones públicas
```

### **Props typing**
```typescript
// ✅ BIEN: Tipo específico del componente
interface ChatPanelProps {
  conversationId: string | null
  onClose?: () => void
}

// ❌ MAL: Reutilizar tipos genéricos
type ChatPanelProps = ConversationWithDetails & { onClose?: () => void }
```

## 🚀 Crear una Nueva Feature

### **Paso 1: Estructura**
```bash
mkdir -p _features/nueva-feature/components
touch _features/nueva-feature/nueva-feature.tsx
touch _features/nueva-feature/index.ts
touch _features/nueva-feature/README.md
```

### **Paso 2: Componente principal**
```typescript
// nueva-feature.tsx
"use client"

import { api } from '@/trpc/react'

interface NuevaFeatureProps {
  // Props específicas
}

export function NuevaFeature({ }: NuevaFeatureProps) {
  // Lógica de negocio
  
  return (
    // UI
  )
}
```

### **Paso 3: Export**
```typescript
// index.ts
export { NuevaFeature } from './nueva-feature'
```

### **Paso 4: Documentación**
```markdown
# Nueva Feature

## Propósito
...

## Uso
...

## Props
...
```

### **Paso 5: Integrar**
```typescript
// _features/index.ts
export { NuevaFeature } from './nueva-feature/nueva-feature'
```

## 🔍 Testing (Futuro)

Cuando se implemente testing, cada feature tendrá:

```
feature-name/
├── feature-name.tsx
├── feature-name.test.tsx     # Tests del componente principal
├── components/
│   ├── component-a.tsx
│   └── component-a.test.tsx  # Tests de componentes internos
└── __mocks__/                # Mocks específicos de la feature
```

## 📚 Recursos

- [React Component Patterns](https://reactpatterns.com/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)

---

**Última actualización:** Documentación inicial - Octubre 2025

