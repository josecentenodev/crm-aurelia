import { z } from "zod"
import { FieldType } from "@prisma/client"

// Re-export the Prisma enum for consistency
export { FieldType } from "@prisma/client"

// Enum alineado con Prisma
export enum AgentType {
  AgenteQA = "AgenteQA",
  AgentePersonalizado = "AgentePersonalizado"
}

export const AgentTypeValues = Object.values(AgentType)

export const FieldTypeValues = ["TEXT", "TEXTAREA", "NUMBER", "EMAIL", "SELECT", "MULTISELECT", "CHECKBOX", "RADIO", "DATE", "JSON"] as const

// Schema para campos de agente (actualizado para usar stepId)
export const AgentFieldSchema = z.object({
  id: z.string().uuid(),
  stepId: z.string().uuid(), // ← Cambio: ahora pertenece a un step
  name: z.string(),
  label: z.string(),
  type: z.nativeEnum(FieldType),
  required: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  order: z.number(), // Orden dentro del step
  config: z.any().optional(),
})

export type AgentField = z.infer<typeof AgentFieldSchema>

// Schema para steps de template (nuevo)
export const AgentTemplateStepSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string(), // Ícono del step
  order: z.number(), // Orden del step en el template
  fields: z.array(AgentFieldSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type AgentTemplateStep = z.infer<typeof AgentTemplateStepSchema>

// Schema para templates de agente (actualizado con steps)
export const AgentTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  isGlobal: z.boolean().default(false),
  steps: z.array(AgentTemplateStepSchema), // ← Cambio: ahora tiene steps
  createdAt: z.date(),
  updatedAt: z.date(),
  clientId: z.string().uuid().optional().nullable(),
})

export type AgentTemplate = z.infer<typeof AgentTemplateSchema>

export const AgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  templateId: z.string().uuid(),
  customFields: z.record(z.any()),
  isActive: z.boolean().default(true),
  isPrincipal: z.boolean().default(false),
  conversationsThisMonth: z.number().default(0),
  clientId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),

  //Template description
  description: z.string().optional(),

  //TODO: This must not be optional
  //AI information
  aiModel: z.string().optional(),
  aiTemperature: z.number().optional(),
  aiTopP: z.number().optional(),
  aiMaxOutputTokens: z.number().optional(),
  aiPrompt: z.string().optional(),

})

export type Agent = z.infer<typeof AgentSchema>

export const AgentPromptInfo = z.object({
  name: z.string(),
  customFields: z.record(z.any()),
  //Template description
  description: z.string().optional(),
});
export type AgentPromptInfo = z.infer<typeof AgentPromptInfo>

// Schema para crear un nuevo agente
export const CreateAgentSchema = AgentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  conversationsThisMonth: true,
}).extend({
  clientId: z.string().uuid().optional(),
})

export type CreateAgent = z.infer<typeof CreateAgentSchema>

// Schema para actualizar un agente
export const UpdateAgentSchema = CreateAgentSchema.partial()

export type UpdateAgent = z.infer<typeof UpdateAgentSchema>

// Filtros para búsqueda de agentes
export interface AgentFilters {
  type?: AgentType
  isActive?: boolean
  clientId?: string
  search?: string
}

// Estadísticas del agente
export interface AgentStats {
  totalConversations: number
  conversationsThisMonth: number
  averageResponseTime: number
  satisfactionRate: number
  totalMessages: number
}

// Schema para crear un step de template
export const CreateAgentTemplateStepSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().min(1, "El nombre del step es requerido"),
  description: z.string().nullable().optional(),
  icon: z.string().min(1, "El ícono del step es requerido"),
  order: z.number().default(0),
})

export type CreateAgentTemplateStep = z.infer<typeof CreateAgentTemplateStepSchema>

// Schema para actualizar un step de template
export const UpdateAgentTemplateStepSchema = CreateAgentTemplateStepSchema.partial().extend({
  id: z.string().uuid(),
})

export type UpdateAgentTemplateStep = z.infer<typeof UpdateAgentTemplateStepSchema>

// Schema para crear un campo de agente
export const CreateAgentFieldSchema = AgentFieldSchema.omit({ id: true }).extend({
  stepId: z.string().uuid(), // ← Cambio: ahora pertenece a un step
})

export type CreateAgentField = z.infer<typeof CreateAgentFieldSchema>

// Schema para actualizar un campo de agente
export const UpdateAgentFieldSchema = AgentFieldSchema.partial().extend({
  id: z.string().uuid(),
  stepId: z.string().uuid(),
})

export type UpdateAgentField = z.infer<typeof UpdateAgentFieldSchema>

// Schema para eliminar un campo de agente
export const DeleteAgentFieldSchema = z.object({
  id: z.string().uuid(),
  stepId: z.string().uuid(), // ← Cambio: ahora pertenece a un step
})

export type DeleteAgentField = z.infer<typeof DeleteAgentFieldSchema>

// Schema para crear template con steps y fields anidados
export const CreateAgentTemplateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  isGlobal: z.boolean().default(false),
  clientId: z.string().uuid().optional(),
  steps: z.array(z.object({
    name: z.string().min(1, "El nombre del step es requerido"),
    description: z.string().nullable().optional(),
    icon: z.string().min(1, "El ícono del step es requerido"),
    order: z.number().default(0),
    fields: z.array(z.object({
      name: z.string().min(1, "El nombre del campo es requerido"),
      label: z.string().min(1, "La etiqueta del campo es requerida"),
      type: z.enum(FieldTypeValues),
      required: z.boolean().default(false),
      options: z.array(z.string()).default([]),
      order: z.number().default(0),
      config: z.any().optional()
    })).default([])
  })).default([])
})

export type CreateAgentTemplate = z.infer<typeof CreateAgentTemplateSchema>

// Schema para actualizar template
export const UpdateAgentTemplateSchema = CreateAgentTemplateSchema.partial().extend({
  id: z.string().uuid(),
})

export type UpdateAgentTemplate = z.infer<typeof UpdateAgentTemplateSchema>
