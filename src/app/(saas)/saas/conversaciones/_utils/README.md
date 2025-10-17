# 🛠️ Utils - Utilidades y Helpers

Funciones puras y helpers compartidos para transformaciones de datos, formateo y lógica auxiliar.

## 📚 Utilidades Disponibles

### **📅 `date-formatter.ts`**
Funciones para formatear fechas en diferentes contextos de UI.

#### **`formatMessageTime()`**
Formatea hora de mensaje en lista de chat.

```typescript
formatMessageTime(createdAt: string | Date): string

// Ejemplos
formatMessageTime('2025-01-15T14:30:00Z')  // → "14:30"
formatMessageTime(new Date())               // → "15:45"
```

**Características:**
- Formato 24 horas (HH:mm)
- Timezone Argentina automático
- Manejo de fechas sin zona horaria (asume UTC)

---

#### **`formatConversationTime()`**
Formatea fecha para lista de conversaciones con contexto relativo.

```typescript
formatConversationTime(date: Date | string | null): string

// Ejemplos
formatConversationTime(hace2Horas)    // → "14:30"
formatConversationTime(ayer)          // → "mié 10:15"
formatConversationTime(hace10Dias)    // → "05/01"
```

**Lógica:**
- **< 24h**: Solo hora (14:30)
- **< 7 días**: Día + hora (mié 10:15)
- **> 7 días**: Fecha corta (05/01)

---

#### **`formatFullDate()`**
Formatea fecha completa para detalles de conversación.

```typescript
formatFullDate(date: Date | string | null): string

// Ejemplo
formatFullDate('2025-01-15T14:30:00Z')
// → "15 de enero de 2025, 14:30"
```

---

#### **`parseAsUtcIfMissingZone()`**
Helper para parsear fechas con zona horaria implícita UTC.

```typescript
parseAsUtcIfMissingZone(value: string | Date): Date | null

// Casos
parseAsUtcIfMissingZone('2025-01-15T14:30:00Z')   // ✅ Ya tiene Z
parseAsUtcIfMissingZone('2025-01-15T14:30:00')    // ✅ Agrega Z automático
parseAsUtcIfMissingZone(new Date())               // ✅ Pasa directo
```

**Por qué existe:**
Prisma a veces retorna timestamps sin zona. Esta función asegura consistencia interpretando como UTC.

---

### **📆 `date-helpers.ts`**
Utilidades para rangos de fechas y filtros temporales.

#### **`getDateRange()`**
Obtiene rango de fechas según filtro seleccionado.

```typescript
getDateRange(filter: DateFilterValue): DateRange | null

type DateFilterValue = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

interface DateRange {
  from: Date
  to: Date
}

// Ejemplo
const range = getDateRange('week')
// { 
//   from: Date(lunes 00:00), 
//   to: Date(domingo 23:59) 
// }
```

**Rangos soportados:**
- `today`: Hoy 00:00 → 23:59
- `week`: Lunes → Domingo
- `month`: Primer día → Último día del mes
- `quarter`: Inicio → Fin del trimestre
- `year`: 1 enero → 31 diciembre
- `all`: `null` (sin filtro)

---

#### **`formatDateRange()`**
Formatea rango de fechas para mostrar en UI.

```typescript
formatDateRange(filter: DateFilterValue): string

// Ejemplos
formatDateRange('today')     // → "Hoy"
formatDateRange('week')      // → "Esta semana"
formatDateRange('month')     // → "Este mes"
formatDateRange('quarter')   // → "Este trimestre"
formatDateRange('year')      // → "Este año"
formatDateRange('all')       // → "Todo el tiempo"
```

---

### **🔄 `realtime-helpers.ts`**
Helpers para lógica de reconexión de Realtime.

#### **`calculateReconnectDelay()`**
Calcula delay de reconexión con backoff exponencial.

```typescript
calculateReconnectDelay(
  retryCount: number, 
  baseMs = 1000, 
  maxMs = 30000
): number

// Ejemplos
calculateReconnectDelay(0)  // → 1000ms (1s)
calculateReconnectDelay(1)  // → 2000ms (2s)
calculateReconnectDelay(2)  // → 4000ms (4s)
calculateReconnectDelay(3)  // → 8000ms (8s)
calculateReconnectDelay(4)  // → 16000ms (16s)
calculateReconnectDelay(5)  // → 30000ms (30s MAX)
```

**Fórmula:**
```typescript
delay = min(baseMs * 2^retryCount, maxMs)
```

---

#### **`canAutoReconnect()`**
Verifica si se puede intentar reconexión automática.

```typescript
canAutoReconnect(
  canReconnect: boolean,
  isReconnecting: boolean,
  retryCount: number,
  maxRetries = 5
): boolean

// Uso
if (canAutoReconnect(true, false, retries)) {
  scheduleReconnect()
}
```

**Condiciones para reconectar:**
- ✅ `canReconnect === true` (flag habilitado)
- ✅ `isReconnecting === false` (no hay reconexión en curso)
- ✅ `retryCount < maxRetries` (no excede límite)

---

### **🔀 `type-adapters.ts`**
Adaptadores para transformar tipos entre capas.

#### **`adaptConversationsData()`**
Transforma datos de tRPC a tipos de UI.

```typescript
adaptConversationsData(
  data: unknown
): ChatConversationsByInstance[]

// Uso
const rawData = await trpcClient.conversaciones.list.query(...)
const uiData = adaptConversationsData(rawData)
```

**Transformaciones:**
- Convierte `unknown` a tipo seguro
- Valida estructura esperada
- Retorna array vacío si datos inválidos

---

## 🎯 Patrones de Uso

### **Patrón 1: Formatear fechas en mensajes**
```typescript
import { formatMessageTime } from './_utils/date-formatter'

function MessageItem({ message }: Props) {
  return (
    <div>
      <p>{message.content}</p>
      <span>{formatMessageTime(message.createdAt)}</span>
    </div>
  )
}
```

### **Patrón 2: Filtros de fecha**
```typescript
import { getDateRange } from './_utils/date-helpers'
import { useChatsFiltersStore } from './_store'

function DateFilter() {
  const { dateFilter, setDateFilter } = useChatsFiltersStore()
  
  const range = getDateRange(dateFilter)
  
  const filters = {
    dateFrom: range?.from,
    dateTo: range?.to
  }
  
  return <Select value={dateFilter} onChange={setDateFilter} />
}
```

### **Patrón 3: Reconexión Realtime**
```typescript
import { 
  calculateReconnectDelay, 
  canAutoReconnect 
} from './_utils/realtime-helpers'

function useRealtimeWithRetry() {
  const [retryCount, setRetryCount] = useState(0)
  
  const reconnect = useCallback(() => {
    if (!canAutoReconnect(true, false, retryCount)) {
      console.log('Max retries alcanzado')
      return
    }
    
    const delay = calculateReconnectDelay(retryCount)
    
    setTimeout(() => {
      // Intentar reconectar
      setRetryCount(prev => prev + 1)
    }, delay)
  }, [retryCount])
  
  return { reconnect }
}
```

### **Patrón 4: Type-safe data adapters**
```typescript
import { adaptConversationsData } from './_utils/type-adapters'

const { data: rawData } = api.conversaciones.list.useQuery(...)

// Transformar a tipos de UI
const conversations = adaptConversationsData(rawData)

// Ahora es type-safe ChatConversationsByInstance[]
conversations.forEach(group => {
  console.log(group.instanceName)  // ✅ TypeScript OK
  console.log(group.conversations) // ✅ TypeScript OK
})
```

## 🔧 Implementación de Helpers

### **Manejo de timezones**
```typescript
// Siempre usar timezone Argentina explícito
const formatter = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Argentina/Buenos_Aires'
})

formatter.format(date)  // → "14:30"
```

### **Backoff exponencial con cap**
```typescript
export function calculateReconnectDelay(
  retryCount: number,
  baseMs = 1000,
  maxMs = 30000
): number {
  // 2^retryCount pero con límite
  const exponential = baseMs * Math.pow(2, retryCount)
  return Math.min(exponential, maxMs)
}
```

### **Type guards**
```typescript
function isValidConversationData(data: unknown): data is ChatConversationsByInstance[] {
  if (!Array.isArray(data)) return false
  
  return data.every(group => 
    typeof group.instanceName === 'string' &&
    Array.isArray(group.conversations)
  )
}

export function adaptConversationsData(data: unknown): ChatConversationsByInstance[] {
  if (isValidConversationData(data)) {
    return data
  }
  
  console.warn('Invalid conversation data structure')
  return []
}
```

## ⚡ Performance

### **Memoización de formatters**
```typescript
// ❌ MAL: Crear formatter en cada render
function Component({ date }: Props) {
  const formatted = new Intl.DateTimeFormat('es-AR', {...}).format(date)
  return <span>{formatted}</span>
}

// ✅ BIEN: Formatter fuera del componente
const formatter = new Intl.DateTimeFormat('es-AR', {...})

function Component({ date }: Props) {
  const formatted = formatter.format(date)
  return <span>{formatted}</span>
}
```

### **Early returns**
```typescript
export function formatConversationTime(date: Date | string | null): string {
  // Early return para casos inválidos
  if (!date) return ""
  
  const messageDate = new Date(date)
  if (isNaN(messageDate.getTime())) return ""
  
  // Lógica principal solo si fecha válida
  const diffInHours = (now - messageDate) / (1000 * 60 * 60)
  // ...
}
```

## 🐛 Debugging

### **Verificar timezone**
```typescript
import { formatMessageTime } from './_utils/date-formatter'

const testDate = '2025-01-15T14:30:00Z'
console.log('UTC:', testDate)
console.log('Argentina:', formatMessageTime(testDate))
// Debe mostrar 11:30 (UTC-3)
```

### **Test de reconexión**
```typescript
import { calculateReconnectDelay } from './_utils/realtime-helpers'

// Simular 5 reintentos
for (let i = 0; i < 5; i++) {
  console.log(`Intento ${i}: ${calculateReconnectDelay(i)}ms`)
}
// 0: 1000ms
// 1: 2000ms
// 2: 4000ms
// 3: 8000ms
// 4: 16000ms
```

### **Verificar adaptación de tipos**
```typescript
import { adaptConversationsData } from './_utils/type-adapters'

// Test con datos válidos
const valid = [{ instanceName: 'Test', conversations: [] }]
console.log(adaptConversationsData(valid))  // ✅ Array

// Test con datos inválidos
const invalid = { wrong: 'structure' }
console.log(adaptConversationsData(invalid))  // ✅ [] (vacío)
```

## ⚠️ Consideraciones

### **Timezones**
- Siempre especificar timezone explícito para evitar sorpresas
- Prisma puede retornar timestamps sin zona → usar `parseAsUtcIfMissingZone()`
- Cliente puede estar en diferente timezone que servidor

### **Funciones puras**
- Todas las utils deben ser funciones puras (sin efectos secundarios)
- No deben depender de estado global
- Fáciles de testear en aislamiento

### **Manejo de errores**
- Siempre retornar valor seguro en caso de error
- Usar try/catch cuando se parsean fechas
- Logging para debugging pero nunca romper la UI

## 📚 Referencias

- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)

---

**Última actualización:** Documentación inicial - Octubre 2025

