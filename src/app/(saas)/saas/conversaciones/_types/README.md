# 📚 Guía de Tipos del Módulo Conversaciones

## 🎯 Estrategia de Arquitectura

Este proyecto sigue una **arquitectura de capas** para organización de tipos:

```
@domain/Conversaciones.ts     ← CAPA DE NEGOCIO (Backend Contract)
       ↓
_types/conversations.types.ts ← CAPA DE PRESENTACIÓN (UI)
       ↓
  Componentes React            ← CAPA DE VISTA
```

---

## ✅ Reglas de Ubicación

### Usar `@domain/Conversaciones` para:

- ✅ **Entidades de Prisma** (`Conversation`, `Message`)
- ✅ **Enums de Prisma** (`ConversationStatus`, `MessageRole`)
- ✅ **DTOs de API/tRPC** (`ConversationFilters`, `CreateConversation`)
- ✅ **Schemas de validación** (Zod schemas)
- ✅ **Tipos de contratos** (interfaces que define el backend)
- ✅ **Estado de hooks** (cuando es compartido con backend)

### Usar `_types/conversations.types.ts` para:

- ✅ **Props de componentes** (`ChatPanelProps`, `MessageItemProps`)
- ✅ **ViewModels de UI** (`ChatConversation` - versión optimizada)
- ✅ **Tipos de estado local** (`ConnectionState`, `CategoryCounts`)
- ✅ **Tipos derivados** (transformaciones específicas de UI)

---

## ⚠️ Casos Especiales

### `ChatConversation` vs `ConversationWithDetails`

**¿Por qué existen dos tipos similares?**

`ChatConversation` es una **versión optimizada para UI** con diferencias intencionales:

```typescript
// @domain/ - ConversationWithDetails
assignedUser?: {
  name?: string | null  // ← OPCIONAL (puede venir null de BD)
}

// _types/ - ChatConversation  
assignedUser?: {
  name: string  // ← REQUERIDO (UI siempre muestra algo)
}
```

**Beneficios de esta separación:**
1. ✅ UI puede optimizar sin romper contratos de API
2. ✅ Backend puede evolucionar independientemente
3. ✅ Transformaciones claras entre capas
4. ✅ Type-safety mejorado en componentes

---

## 🚫 Anti-Patrones (NO hacer)

### ❌ NO duplicar tipos del dominio

```typescript
// ❌ MAL: Duplicar en _types/
export interface ChatFilters { ... }

// ✅ BIEN: Usar desde domain
import type { ConversationFilters } from '@/domain/Conversaciones'
```

### ❌ NO importar desde _types/ en @domain/

```typescript
// ❌ MAL: Domain importando de UI
// @domain/Conversaciones.ts
import type { ChatConversation } from '@/app/.../conversations.types'

// ✅ BIEN: Flujo unidireccional
// Domain → UI (nunca al revés)
```

### ❌ NO mezclar props con entidades

```typescript
// ❌ MAL: Mezclar en _types/
export interface Conversation { ... }  // ← Esto es dominio!
export interface ChatPanelProps { ... }

// ✅ BIEN: Separar responsabilidades
// Domain tiene Conversation
// _types/ solo tiene Props
```

---

## 📝 Checklist al Agregar Tipos Nuevos

Antes de crear un tipo nuevo, pregúntate:

- [ ] ¿Es una entidad de base de datos? → **@domain/**
- [ ] ¿Lo usa tRPC/API? → **@domain/**
- [ ] ¿Es un enum de Prisma? → **@domain/**
- [ ] ¿Es un schema de validación? → **@domain/**
- [ ] ¿Es un prop de componente? → **_types/**
- [ ] ¿Es optimización de rendering? → **_types/**
- [ ] ¿Ya existe algo similar en domain? → **Usar ese, no duplicar**

---

## 🔄 Transformaciones entre Capas

Cuando necesites convertir entre tipos de dominio y UI, crea **adapters**:

```typescript
// _utils/adapters.ts (ejemplo)
export function toUIConversation(
  domain: ConversationWithDetails
): ChatConversation {
  return {
    ...domain,
    assignedUser: domain.assignedUser ? {
      ...domain.assignedUser,
      name: domain.assignedUser.name ?? 'Usuario sin nombre'
    } : undefined
  }
}
```

---

## 📚 Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Última actualización:** Refactorización de tipos (Octubre 2025)

