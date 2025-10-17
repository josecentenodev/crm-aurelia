import { z } from "zod"
import { TipoUsuario } from "@prisma/client"
import type { Client, ClientStatus, ClientPlan, ClientFilters } from "./Clientes"
import type { User } from "./Usuarios"
import type { AgentTemplate, AgentField, AgentTemplateStepSchema } from "./Agentes"

// Re-export the Prisma enum for consistency
export { TipoUsuario } from "@prisma/client"

// Re-export types from other domains
export type { ClientFilters } from "./Clientes"
export type { AgentTemplateStepSchema } from "./Agentes"

// Template con detalles
export interface TemplateWithDetails extends AgentTemplate {
  _count: {
    agentes: number
  }
}

// Filtros para búsqueda de clientes (re-export desde Clientes)

// Filtros para búsqueda de usuarios
export interface UserSuperadminFilters {
  type?: TipoUsuario
  active?: boolean
  clientId?: string
  search?: string
}

// Filtros para templates globales
export interface TemplateGlobalFilters {
  category?: string
  isActive?: boolean
  search?: string
} 
