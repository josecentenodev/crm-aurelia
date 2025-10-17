import { z } from "zod"

// Schema para límites de plan
export const PlanLimitsSchema = z.object({
  maxUsers: z.number().int().min(0),
  maxContacts: z.number().int().min(0),
  maxAgents: z.number().int().min(0),
  maxInstances: z.number().int().min(0),
  costPerInstance: z.number().min(0)
})

export type PlanLimits = z.infer<typeof PlanLimitsSchema>

// Schema para crear límites de plan
export const CreatePlanLimitsSchema = PlanLimitsSchema

export type CreatePlanLimits = z.infer<typeof CreatePlanLimitsSchema>

// Schema para actualizar límites de plan
export const UpdatePlanLimitsSchema = PlanLimitsSchema.partial()

export type UpdatePlanLimits = z.infer<typeof UpdatePlanLimitsSchema>

// Schema para configuración de alertas de límites
export const LimitAlertConfigSchema = z.object({
  planId: z.string().uuid(),
  alertThreshold: z.number().min(0).max(100),
  notifyOnApproaching: z.boolean(),
  notifyOnExceeded: z.boolean(),
  notificationChannels: z.array(z.string())
})

export type LimitAlertConfig = z.infer<typeof LimitAlertConfigSchema>

// Plan con límites incluidos
export interface PlanWithLimits {
  id: string
  name: string
  description?: string
  maxUsers: number
  maxContacts: number
  maxAgents: number
  maxInstances: number
  costPerInstance: number
  createdAt: Date
  updatedAt: Date
}

// Información de uso actual vs límites
export interface PlanUsageInfo {
  planId: string
  planName: string
  currentUsage: {
    users: number
    contacts: number
    agents: number
    instances: number
  }
  limits: PlanLimits
  remaining: {
    users: number
    contacts: number
    agents: number
    instances: number
  }
  isWithinLimits: boolean
  exceededLimits: string[]
}

// Validación de límites
export interface LimitValidation {
  isValid: boolean
  exceededLimits: string[]
  remainingCapacity: Record<string, number>
  suggestions: string[]
}

// Eventos de límites
export interface LimitEvent {
  type: "APPROACHING_LIMIT" | "LIMIT_EXCEEDED" | "LIMIT_RESET"
  planId: string
  clientId: string
  resourceType: "USERS" | "CONTACTS" | "AGENTS" | "INSTANCES"
  currentUsage: number
  limit: number
  timestamp: Date
  message: string
} 
