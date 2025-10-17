# Hooks del Módulo Clientes (Dashboard)

Hooks especializados para la gestión de clientes en el dashboard administrativo.

## Hooks Disponibles

### `useClient()`
Hook para obtener y gestionar el cliente actual.

**Retorna:**
```typescript
{
  client: Client | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
  updateClient: (data: UpdateClientData) => Promise<Client>
  deleteClient: () => Promise<void>
  isUpdating: boolean
  isDeleting: boolean
}
```

**Uso:**
```typescript
import { useClient } from './_hooks'

function ClientDetailPage() {
  const { client, updateClient, isUpdating } = useClient()
  
  const handleUpdate = async () => {
    await updateClient({ name: 'Nuevo nombre' })
  }
}
```

### `useClientInvalidation()`
Utilidades para invalidar el cache de clientes y datos relacionados.

**Retorna:**
```typescript
{
  invalidateClient: () => Promise<void>
  invalidateClientInstances: () => Promise<void>
  invalidateClientIntegrations: () => Promise<void>
  invalidateAll: () => Promise<void>
}
```

**Uso:**
```typescript
import { useClientInvalidation } from './_hooks'

function ClientActions() {
  const { invalidateAll } = useClientInvalidation()
  
  const handleRefresh = async () => {
    await invalidateAll()
  }
}
```

### `useClientMetrics()`
Hook para obtener métricas del cliente con selector de periodo.

**Props:**
```typescript
{
  clientId: string
  period?: MetricsPeriod  // "7d" | "30d" | "90d"
  enabled?: boolean
}
```

**Retorna:**
```typescript
{
  metrics: ClientMetrics | undefined
  detailedMetrics: DetailedMetrics | undefined
  selectedPeriod: MetricsPeriod
  isLoading: boolean
  isLoadingDetailed: boolean
  error: Error | null
  errorDetailed: Error | null
  updatePeriod: (period: MetricsPeriod) => void
  refetch: () => void
  getGrowthColor: (growth: number) => string
  getGrowthIcon: (growth: number) => string
  formatPercentage: (value: number) => string
  formatNumber: (value: number) => string
}
```

**Uso:**
```typescript
import { useClientMetrics } from './_hooks'

function ClientMetricsTab({ clientId }: Props) {
  const {
    metrics,
    selectedPeriod,
    updatePeriod,
    formatPercentage
  } = useClientMetrics({ clientId, period: "30d" })
  
  return (
    <div>
      <Select value={selectedPeriod} onValueChange={updatePeriod}>
        <SelectItem value="7d">7 días</SelectItem>
        <SelectItem value="30d">30 días</SelectItem>
        <SelectItem value="90d">90 días</SelectItem>
      </Select>
      
      {metrics && (
        <div>
          Conversaciones: {metrics.conversations}
          Crecimiento: {formatPercentage(metrics.growth)}
        </div>
      )}
    </div>
  )
}
```

### `useClientDetailedMetrics()`
Hook para métricas detalladas con agrupación personalizada.

**Parámetros:**
```typescript
clientId: string
metric?: MetricsType  // "conversations" | "contacts" | "messages"
period?: MetricsPeriod  // "7d" | "30d" | "90d"
groupBy?: GroupByType  // "day" | "week" | "month"
```

**Retorna:**
```typescript
{
  data: DetailedMetricsData | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```

## Refetch Automático

Todos los hooks incluyen refetch automático:
- `useClientMetrics`: cada 5 minutos
- `useClientDetailedMetrics`: cada 5 minutos
- Stale time: 2 minutos para métricas básicas

## Tipos Exportados

```typescript
export type MetricsPeriod = "7d" | "30d" | "90d"
export type MetricsType = "conversations" | "contacts" | "messages"
export type GroupByType = "day" | "week" | "month"
```

