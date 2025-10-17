import { z } from "zod"
import type { Contact } from "./Contactos"
import type { User } from "./Usuarios"
import { ConversationStatus, ConversationType } from "./Conversaciones"

// Enums para estados de lead
export enum LeadStatus {
  NUEVO = "nuevo",
  CONTACTADO = "contactado",
  CALIFICADO = "calificado",
  PROPUESTA = "propuesta",
  NEGOCIACION = "negociacion",
  GANADO = "ganado",
  PERDIDO = "perdido"
}

export enum LeadSource {
  WEBSITE = "website",
  REFERIDO = "referido",
  REDES_SOCIALES = "redes_sociales",
  EMAIL = "email",
  TELEFONO = "telefono",
  EVENTO = "evento",
  OTRO = "otro"
}

// Schema para leads
export const LeadSchema = z.object({
  id: z.string().uuid(),
  contactId: z.string().uuid(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NUEVO),
  source: z.nativeEnum(LeadSource).optional(),
  value: z.number().positive().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.date().optional().nullable(),
  assignedUserId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  clientId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type Lead = z.infer<typeof LeadSchema>

// Schema para crear un nuevo lead
export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export type CreateLead = z.infer<typeof CreateLeadSchema>

// Schema para actualizar un lead
export const UpdateLeadSchema = CreateLeadSchema.partial()

export type UpdateLead = z.infer<typeof UpdateLeadSchema>

// Lead con información del contacto
export interface LeadWithContact extends Lead {
  contact: Contact
  assignedUser?: User
}

// Filtros para búsqueda de leads
export interface LeadFilters {
  status?: LeadStatus
  source?: LeadSource
  assignedUserId?: string
  clientId?: string
  search?: string
  minValue?: number
  maxValue?: number
}
