import { z } from "zod"

// Schema para roles (actualizado con nuevos campos)
export const RoleSchema = z.object({
  roleId: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  clientId: z.string().uuid(),
})

export type Role = z.infer<typeof RoleSchema>

// Schema para roles por usuario
export const RolePerUserSchema = z.object({
  roleId: z.string().uuid(),
  userId: z.string().uuid(),
})

export type RolePerUser = z.infer<typeof RolePerUserSchema>

// Schema para tareas
export const TaskSchema = z.object({
  taskId: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  groupId: z.string().uuid(),
})

export type Task = z.infer<typeof TaskSchema>

// Schema para grupos de tareas
export const TaskGroupSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
})

export type TaskGroup = z.infer<typeof TaskGroupSchema>

// Schema para tareas por rol
export const TaskPerRoleSchema = z.object({
  roleId: z.string().uuid(),
  taskId: z.string().uuid(),
})

export type TaskPerRole = z.infer<typeof TaskPerRoleSchema>

// Interfaz para permisos de usuario (legacy - deprecated)
export interface UserPermissions {
  roles: Role[]
  tasks: Task[]
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManageUsers: boolean
  canManageAgents: boolean
  canViewAnalytics: boolean
}

// Filtros para búsqueda de roles
export interface RoleFilters {
  search?: string
  clientId?: string
}

// Schema for permission structure (feature + action)
export const PermissionSchema = z.object({
  feature: z.string().min(1, "Feature name is required"),
  action: z.string().min(1, "Action name is required"),
})

export type Permission = z.infer<typeof PermissionSchema>

// Schema for user permissions response
export const UserPermissionsResponseSchema = z.object({
  userId: z.string().uuid(),
  clientId: z.string().uuid().nullable(),
  permissions: z.array(PermissionSchema),
})

export type UserPermissionsResponse = z.infer<typeof UserPermissionsResponseSchema>

// Schema for detailed permission with metadata (optional, for debugging/admin views)
export const DetailedPermissionSchema = z.object({
  feature: z.string(),
  featureDescription: z.string().nullable().optional(),
  action: z.string(),
  actionDescription: z.string().nullable().optional(),
  roleId: z.string().uuid(),
  roleName: z.string(),
})

export type DetailedPermission = z.infer<typeof DetailedPermissionSchema>