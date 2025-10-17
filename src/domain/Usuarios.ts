import { z } from "zod"
import { TipoUsuario } from "@prisma/client"

// Re-export the Prisma enum for consistency
export { TipoUsuario } from "@prisma/client"

// Schema para usuarios (actualizado con TipoUsuario)
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable().optional(),
  email: z.string().email("Email inválido").nullable().optional(),
  emailVerified: z.date().nullable().optional(),
  type: z.nativeEnum(TipoUsuario).default("CUSTOMER"),
  active: z.boolean().default(true),
  deletedAt: z.date().nullable().optional(),
  image: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof UserSchema>

// Schema para crear un nuevo usuario
export const CreateUserSchema = UserSchema.omit({
  id: true,
  emailVerified: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type CreateUser = z.infer<typeof CreateUserSchema>

// Schema para actualizar un usuario
export const UpdateUserSchema = CreateUserSchema.partial().omit({
  password: true,
})

export type UpdateUser = z.infer<typeof UpdateUserSchema>

// Usuario con información del cliente
export interface UserWithClient extends User {
  client?: {
    id: string
    name: string
    status?: {
      id: string
      name: string
    }
    plan?: {
      id: string
      name: string
    }
  }
}

// Filtros para búsqueda de usuarios
export interface UserFilters {
  type?: TipoUsuario
  active?: boolean
  clientId?: string
  search?: string
}

// Schema para crear usuario por superadmin
export const CreateUserBySuperadminSchema = CreateUserSchema.extend({
  clientId: z.string().uuid().optional(),
})

export type CreateUserBySuperadmin = z.infer<typeof CreateUserBySuperadminSchema>

// Schema para actualizar usuario por superadmin
export const UpdateUserBySuperadminSchema = UpdateUserSchema.extend({
  id: z.string().uuid(),
  clientId: z.string().uuid().optional(),
})

export type UpdateUserBySuperadmin = z.infer<typeof UpdateUserBySuperadminSchema>

// Re-export TipoUsuario as UserType for backward compatibility
export { TipoUsuario as UserType }