# Hooks del Módulo Contactos

Hooks especializados para la gestión de contactos.

## Hooks Disponibles

### `useContactosList()`
Query para obtener todos los contactos del cliente actual.

**Retorna:**
```typescript
{
  data: Contact[] | undefined
  isLoading: boolean
  error: Error | null
}
```

### `useCreateContacto()`
Mutation para crear un nuevo contacto.

**Retorna:**
```typescript
{
  mutate: (data: CreateContact) => void
  mutateAsync: (data: CreateContact) => Promise<Contact>
  isPending: boolean
  error: Error | null
}
```

**Invalidación automática:**
- `contactos.list`
- `contactos.stats`

### `useUpdateContacto()`
Mutation para actualizar un contacto existente.

**Retorna:**
```typescript
{
  mutate: (data: UpdateContact) => void
  mutateAsync: (data: UpdateContact) => Promise<Contact>
  isPending: boolean
  error: Error | null
}
```

**Invalidación automática:**
- `contactos.list`
- `contactos.stats`

### `useDeleteContacto()`
Mutation para eliminar un contacto.

**Retorna:**
```typescript
{
  mutate: (data: { id: string }) => void
  mutateAsync: (data: { id: string }) => Promise<void>
  isPending: boolean
  error: Error | null
}
```

**Invalidación automática:**
- `contactos.list` (con clientId específico)

## Uso

```typescript
import { useContactosList, useCreateContacto } from './_hooks'

function ContactosPage() {
  const { data: contactos, isLoading } = useContactosList()
  const createMutation = useCreateContacto()
  
  const handleCreate = async (data: CreateContact) => {
    await createMutation.mutateAsync(data)
  }
  
  // ...
}
```

## Nota

Estos hooks están encapsulados en `ContactosProvider` para uso desde otras partes de la aplicación.
El provider no se migra ya que sirve como interfaz pública del módulo.

