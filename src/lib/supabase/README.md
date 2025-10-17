# Supabase Integration

Configuración unificada de Supabase para la aplicación Aurelia Platform.

## Características

- ✅ Cliente unificado para browser y servidor
- ✅ Configuración optimizada para Vercel
- ✅ Realtime habilitado para actualizaciones en vivo
- ✅ Manejo de errores robusto
- ✅ Storage para archivos multimedia

## Uso Básico

### Cliente Principal
```typescript
import { supabase } from '@/lib/supabase'

// Cliente unificado (browser + server)
const client = supabase
```

### Cliente Administrativo
```typescript
import { getAdminSupabase } from '@/lib/supabase'

// Solo para operaciones server-side
const adminClient = getAdminSupabase()
```

## Realtime

### Hook Genérico
```typescript
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime'

const { data, isLoading, isConnected, error } = useSupabaseRealtime<ConversationType>({
  table: 'Conversation',
  filter: `clientId=eq.${clientId}`,
  enabled: !!clientId
})
```

### Hook Especializado para Conversaciones
```typescript
import { useSupabaseRealtimeConversations } from '@/hooks/use-supabase-realtime-conversations'

const { conversations, isLoading, isConnected } = useSupabaseRealtimeConversations({
  clientId: 'client-id',
  enabled: true
})
```

## Storage

### URLs Públicas
```typescript
import { getPublicUrl } from '@/lib/supabase'

const imageUrl = getPublicUrl('media', 'whatsapp-images/photo.jpg')
```

### URLs Firmadas
```typescript
import { getSignedUrl } from '@/lib/supabase'

const signedUrl = await getSignedUrl('private-files/document.pdf', 3600)
```

## Configuración

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Configuración de Realtime
- **eventsPerSecond**: 2 (optimizado para estabilidad)
- **heartbeatIntervalMs**: 30000
- **reconnectAfterMs**: Backoff exponencial hasta 30s

## Manejo de Errores

```typescript
import { SupabaseErrorHandler } from '@/lib/supabase'

try {
  const { data, error } = await supabase.from('table').select('*')
  if (error) {
    throw SupabaseErrorHandler.handleRealtimeError(error, 'fetching data')
  }
} catch (error) {
  console.error('Error:', error.message)
}
```

## Mejores Prácticas

1. **Usar el hook genérico** para nuevas funcionalidades
2. **Filtrar por clientId** para seguridad
3. **Manejar estados de carga** apropiadamente
4. **Limpiar suscripciones** en useEffect cleanup
5. **Usar cliente administrativo** solo en server-side