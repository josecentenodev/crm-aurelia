import { type User } from './Usuarios';
import { type Contact } from './Contactos';
import { type Agent } from './Agentes';
import { z } from "zod"

// Schema para estado de cliente
export const ClientStatusSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export type ClientStatus = z.infer<typeof ClientStatusSchema>

// Schema para plan de cliente
export const ClientPlanSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional().nullable(),
    maxWhatsAppInstances: z.number().int().min(0).default(0),
    costPerWhatsAppInstance: z.number().min(0).default(0),
    createdAt: z.date(),
    updatedAt: z.date()
})

export type ClientPlan = z.infer<typeof ClientPlanSchema>


//Schema de ClientAIInfo
export const ClientAiInfoSchema = z.object({
    id: z.string().uuid(),
    clientId: z.string(),
    projectId: z.string(),
    projectName: z.string(),
    projectCreateAt: z.date(),
    serviceAccountId: z.string(),
    serviceAccountName: z.string(),
    serviceAccountCreateAt: z.date(),
    apiKeyId: z.string(),
    apiKeyValue: z.string()
});
export type ClientAiInfo = z.infer<typeof ClientAiInfoSchema>

export const CreateAiInfoScheme = ClientAiInfoSchema.omit({id: true, clientId: true})
export type CreateAiInfo = z.infer<typeof CreateAiInfoScheme>


export const UpdateClientAiInfoSchema = z.object({
    serviceAccountId: z.string(),
    serviceAccountName: z.string(),
    serviceAccountCreateAt: z.date(),
    apiKeyId: z.string(),
    apiKeyValue: z.string()
});

export type UpdateClientAiInfo = z.infer<typeof UpdateClientAiInfoSchema>

// Schema para clientes (actualizado con nuevos campos)
export const ClientSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional().nullable(),
    statusId: z.string().uuid(),
    planId: z.string().uuid(),
    maxUsers: z.number().int().positive().optional().nullable(),
    maxContacts: z.number().int().positive().optional().nullable(),
    maxAgents: z.number().int().positive().optional().nullable(),
    email: z.string().email("Email inválido").optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    cp: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    settings: z.record(z.any()).optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export type Client = z.infer<typeof ClientSchema>

// Schema para crear un nuevo cliente
export const CreateClientSchema = ClientSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
})

export type CreateClient = z.infer<typeof CreateClientSchema>

// Schema para actualizar un cliente
export const UpdateClientSchema = CreateClientSchema.partial()

export type UpdateClient = z.infer<typeof UpdateClientSchema>

// Cliente con información relacionada
export interface ClientWithRelations extends Client {
    status: ClientStatus
    plan: ClientPlan
    users: User[]
    contacts: Contact[]
    agentes: Agent[]
}

// Filtros para búsqueda de clientes
export interface ClientFilters {
    search?: string
    statusId?: string
    planId?: string
    active?: boolean
}

// Schema para registro de prueba gratuita
export const TrialRegistrationSchema = z.object({
  // Datos del cliente
  clientName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  clientDescription: z.string().optional(),
  clientEmail: z.string().email("Email de la empresa inválido").optional(),
  clientAddress: z.string().optional(),
  clientCity: z.string().optional(),
  clientCountry: z.string().optional(),
  
  // Datos del usuario admin
  userName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  userEmail: z.string().email("Email inválido"),
  userPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type TrialRegistration = z.infer<typeof TrialRegistrationSchema>