# Hooks del Módulo Usuarios

Hooks especializados para la gestión de usuarios del cliente.

## Hooks Disponibles

### `useUsuariosListByClient()`
Query para obtener todos los usuarios del cliente actual.

**Retorna:**
```typescript
{
  data: User[] | undefined
  isLoading: boolean
  error: Error | null
}
```

### `useCreateUsuario()`
Mutation para crear un nuevo usuario.

**Retorna:**
```typescript
{
  mutate: (data: CreateUser) => void
  mutateAsync: (data: CreateUser) => Promise<User>
  isPending: boolean
  error: Error | null
}
```

**Invalidación automática:**
- `usuarios.getUsers` (con clientId específico)

### `useUpdateUsuario()`
Mutation para actualizar un usuario existente.

**Retorna:**
```typescript
{
  mutate: (data: UpdateUser) => void
  mutateAsync: (data: UpdateUser) => Promise<User>
  isPending: boolean
  error: Error | null
}
```

**Invalidación automática:**
- `usuarios.getUsers` (con clientId específico)

### `useDeleteUsuario()`
Mutation para eliminar un usuario.

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
- `usuarios.getUsers` (con clientId específico)

## Uso

```typescript
import { useUsuariosListByClient, useCreateUsuario } from './_hooks'

function UsuariosPage() {
  const { data: usuarios, isLoading } = useUsuariosListByClient()
  const createMutation = useCreateUsuario()
  
  const handleCreate = async (data: CreateUser) => {
    await createMutation.mutateAsync(data)
  }
  
  // ...
}
```

## Integración con Configuración

El hook `useUsuariosListByClient` también se usa en el módulo de configuración
para la gestión de usuarios del cliente actual.

