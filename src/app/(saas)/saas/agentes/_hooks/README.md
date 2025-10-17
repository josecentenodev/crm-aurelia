# Hooks del Módulo Agentes

Hooks especializados para la gestión de agentes y templates.

## Hooks Disponibles

### `useAgentesByClient()`
Query para obtener todos los agentes del cliente actual.

**Retorna:**
```typescript
{
  data: Agent[] | undefined
  isLoading: boolean
  error: Error | null
}
```

### `useTemplatesByClient()`
Query para obtener todos los templates disponibles para el cliente.

**Retorna:**
```typescript
{
  data: AgentTemplate[] | undefined
  isLoading: boolean
  error: Error | null
}
```

### `useCreateAgente()`
Mutation para crear un nuevo agente.

**Retorna:**
```typescript
{
  mutate: (data: CreateAgent) => void
  mutateAsync: (data: CreateAgent) => Promise<Agent>
  isPending: boolean
  error: Error | null
}
```

### `useUpdateAgente()`
Mutation para actualizar un agente existente.

**Retorna:**
```typescript
{
  mutate: (data: UpdateAgent) => void
  mutateAsync: (data: UpdateAgent) => Promise<Agent>
  isPending: boolean
  error: Error | null
}
```

### `useAgentCache()`
Utilidades para invalidación y actualización optimista del cache de agentes.

**Retorna:**
```typescript
{
  invalidateAgent: (agentId: string) => void
  invalidateAgentsList: (clientId: string) => void
  updateAgentOptimistically: (agentId: string, clientId: string, updates: Partial<UpdateAgent>) => void
  removeAgentOptimistically: (agentId: string, clientId: string) => void
  addAgentOptimistically: (newAgent: Agent, clientId: string) => void
}
```

### `usePlaygroundRealtime()`
Hook para suscripción en tiempo real a mensajes del playground.

**Props:**
```typescript
{
  sessionId: string | null
  onNewMessage?: (message: PlaygroundMessage) => void
  onMessageDelete?: (messageId: string) => void
  enabled?: boolean
}
```

**Retorna:**
```typescript
{
  isConnected: boolean
  connectionError: string | null
  subscribe: () => void
  unsubscribe: () => void
}
```

## Uso

```typescript
import { useAgentesByClient, useAgentCache } from './_hooks'

function AgentesPage() {
  const { data: agentes, isLoading } = useAgentesByClient()
  const { invalidateAgentsList } = useAgentCache()
  
  // ...
}
```

