import { z } from "zod"
import { ContactStatus, ContactChannel } from "@prisma/client"

// Re-export the Prisma enums for consistency
export { ContactStatus, ContactChannel } from "@prisma/client"

// Schema para contactos (actualizado con enums de Prisma)
export const ContactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").nullable().optional(),
  phone: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  status: z.nativeEnum(ContactStatus).default("NUEVO"),
  channel: z.nativeEnum(ContactChannel).default("WHATSAPP"),
  source: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  clientId: z.string().uuid(),
  // Campos opcionales de pipeline/etapa según Prisma
  pipelineId: z.string().uuid().nullable().optional(),
  stageId: z.string().uuid().nullable().optional(),
})

export type Contact = z.infer<typeof ContactSchema>

// Schema para crear un nuevo contacto
export const CreateContactSchema = ContactSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateContact = z.infer<typeof CreateContactSchema>

// Schema para actualizar un contacto
export const UpdateContactSchema = CreateContactSchema.partial()

export type UpdateContact = z.infer<typeof UpdateContactSchema>

// Props para modal de contacto
export interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onSave: (contact: CreateContact | UpdateContact) => void
}

// Filtros para búsqueda de contactos
export interface ContactFilters {
  status?: ContactStatus
  channel?: ContactChannel
  search?: string
  tags?: string[]
  clientId?: string
}

// Constantes para los formularios
export const CONTACT_CHANNELS = [
  { value: ContactChannel.WHATSAPP, label: "WhatsApp" },
  { value: ContactChannel.INSTAGRAM, label: "Instagram" },
  { value: ContactChannel.FACEBOOK, label: "Facebook" },
  { value: ContactChannel.WEB, label: "Web" },
  { value: ContactChannel.EMAIL, label: "Email" },
  { value: ContactChannel.TELEFONO, label: "Teléfono" }
]

export const CONTACT_STATUSES = [
  { value: ContactStatus.NUEVO, label: "Nuevo" },
  { value: ContactStatus.CALIFICADO, label: "Calificado" },
  { value: ContactStatus.AGENDADO, label: "Agendado" },
  { value: ContactStatus.CLIENTE, label: "Cliente" },
  { value: ContactStatus.DESCARTADO, label: "Descartado" }
]

export const CONTACT_SOURCES = [
  "Sitio Web",
  "Redes Sociales", 
  "Referido",
  "Publicidad",
  "Evento",
  "Otro"
]