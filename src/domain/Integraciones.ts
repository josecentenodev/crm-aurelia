import { z } from "zod"

// Schema para tipos de integración
export const IntegrationTypeSchema = z.enum([
  "EVOLUTION_API",
  "WHATSAPP_BUSINESS",
  "TELEGRAM_BOT",
  "EMAIL_SMTP",
  "SMS_TWILIO"
])

export type IntegrationType = z.infer<typeof IntegrationTypeSchema>

// Schema para estado de contenedor
export const ContainerStatusSchema = z.enum([
  "RUNNING",
  "STOPPED",
  "STARTING",
  "STOPPING",
  "ERROR"
])

export type ContainerStatus = z.infer<typeof ContainerStatusSchema>

// Schema para estado de instancia
export const InstanceStatusSchema = z.enum([
  "DISCONNECTED",
  "CONNECTING",
  "CONNECTED",
  "ERROR",
  "MAINTENANCE"
])

export type InstanceStatus = z.infer<typeof InstanceStatusSchema>

// Schema para EvolutionApiIntegration
export const EvolutionApiIntegrationSchema = z.object({
  id: z.string().uuid(),
  integrationId: z.string().uuid(),
  containerName: z.string().optional().nullable(),
  hostPort: z.number().optional().nullable(),
  evolutionApiUrl: z.string().optional().nullable(),
  managerUrl: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  containerStatus: ContainerStatusSchema.default("STOPPED"),
  lastDeployedAt: z.date().optional().nullable(),
  lastHealthCheck: z.date().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type EvolutionApiIntegration = z.infer<typeof EvolutionApiIntegrationSchema>

// Schema para EvolutionApiInstance
export const EvolutionApiInstanceSchema = z.object({
  id: z.string().uuid(),
  evolutionApiId: z.string().uuid(),
  instanceName: z.string(),
  phoneNumber: z.string().optional().nullable(),
  status: InstanceStatusSchema.default("DISCONNECTED"),
  qrCode: z.string().optional().nullable(),
  qrCodeExpires: z.date().optional().nullable(),
  lastConnected: z.date().optional().nullable(),
  lastMessageAt: z.date().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type EvolutionApiInstance = z.infer<typeof EvolutionApiInstanceSchema>

// Schema para integración global
export const GlobalIntegrationSchema = z.object({
  id: z.string().uuid(),
  type: IntegrationTypeSchema,
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isConfigurable: z.boolean().default(true),
  backendUrl: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type GlobalIntegration = z.infer<typeof GlobalIntegrationSchema>

// Schema para integración de cliente (actualizado)
export const ClientIntegrationSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  type: IntegrationTypeSchema,
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Relaciones específicas por tipo
  evolutionApi: EvolutionApiIntegrationSchema.optional().nullable(),
  whatsappBusiness: z.any().optional().nullable(), // TODO: Implementar cuando se agregue WhatsApp Business
  telegramBot: z.any().optional().nullable() // TODO: Implementar cuando se agregue Telegram
})

export type ClientIntegration = z.infer<typeof ClientIntegrationSchema>

// Schema para activar una integración de cliente
export const ActivateClientIntegrationSchema = z.object({
  clientId: z.string().uuid(),
  type: IntegrationTypeSchema,
  config: z.record(z.any()).optional()
})

export type ActivateClientIntegration = z.infer<typeof ActivateClientIntegrationSchema>

// Schema para permisos de integración por cliente
export const ClientIntegrationPermissionSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  integrationType: IntegrationTypeSchema,
  isEnabled: z.boolean().default(false),
  maxInstances: z.number().int().min(0).default(0),
  costPerInstance: z.number().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type ClientIntegrationPermission = z.infer<typeof ClientIntegrationPermissionSchema>

// Schema para crear permisos de integración
export const CreateClientIntegrationPermissionSchema = ClientIntegrationPermissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export type CreateClientIntegrationPermission = z.infer<typeof CreateClientIntegrationPermissionSchema>

// Schema para actualizar permisos de integración
export const UpdateClientIntegrationPermissionSchema = CreateClientIntegrationPermissionSchema.partial()

export type UpdateClientIntegrationPermission = z.infer<typeof UpdateClientIntegrationPermissionSchema>

// Schema para límites de integración por plan
export const PlanIntegrationLimitsSchema = z.object({
  id: z.string().uuid(),
  planId: z.string().uuid(),
  integrationType: IntegrationTypeSchema,
  maxInstances: z.number().int().min(0),
  costPerInstance: z.number().min(0).default(0),
  isEnabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type PlanIntegrationLimits = z.infer<typeof PlanIntegrationLimitsSchema>

// Schema para crear límites de integración por plan
export const CreatePlanIntegrationLimitsSchema = PlanIntegrationLimitsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export type CreatePlanIntegrationLimits = z.infer<typeof CreatePlanIntegrationLimitsSchema>

// Schema para actualizar límites de integración por plan
export const UpdatePlanIntegrationLimitsSchema = CreatePlanIntegrationLimitsSchema.partial()

export type UpdatePlanIntegrationLimits = z.infer<typeof UpdatePlanIntegrationLimitsSchema>

// Integración con información completa (actualizada)
export interface IntegrationWithDetails extends ClientIntegration {
  globalIntegration: GlobalIntegration
  permissions: ClientIntegrationPermission
  planLimits: PlanIntegrationLimits
  evolutionApi?: EvolutionApiIntegration & {
    instances: EvolutionApiInstance[]
  }
}

// Filtros para búsqueda de integraciones
export interface IntegrationFilters {
  clientId?: string
  type?: IntegrationType
  isActive?: boolean
}

// Filtros para búsqueda de instancias
export interface InstanceFilters {
  clientId?: string
  integrationId?: string
  status?: InstanceStatus
  phoneNumber?: string
}

// Estado de Evolution API
export interface EvolutionAPIStatus {
  isConnected: boolean
  lastConnection?: Date
  instanceStatus?: "online" | "offline" | "connecting"
  errorMessage?: string
  stats?: {
    totalMessages: number
    activeInstances: number
    uptime: number
  }
}

// Estado de una instancia
export interface InstanceStatusInfo {
  instanceId: string
  status: InstanceStatus
  qrCode?: string
  qrCodeExpires?: Date
  lastConnected?: Date
  errorMessage?: string
  stats?: {
    totalMessages: number
    unreadMessages: number
    uptime: number
  }
}

// Información de límites de una integración
export interface IntegrationLimits {
  maxInstances: number
  currentInstances: number
  remainingInstances: number
  description: string
  costPerInstance: number
  totalCost: number
}

// Tipo para la respuesta de listByClient
export interface Integration {
  id: string
  type: IntegrationType
  name: string
  description?: string | null
  icon?: string | null
  isActive: boolean
  isConfigurable: boolean
  isAvailable: boolean
  clientIntegration?: ClientIntegration & {
    evolutionApi?: EvolutionApiIntegration & {
      instances: EvolutionApiInstance[]
    }
  }
  maxInstances: number
  costPerInstance: number
  currentInstances: number
}

// 🔧 NUEVO: Tipos para respuestas de estado de instancia
export const InstanceStatusResponseSchema = z.object({
  containerStatus: z.enum(["running", "stopped", "unknown"]),
  connectionStatus: z.enum(["disconnected", "connecting", "connected"]),
  timestamp: z.date()
})

export type InstanceStatusResponse = z.infer<typeof InstanceStatusResponseSchema>

// 🔧 NUEVO: Tipos para respuestas de QR
export const QRCodeResponseSchema = z.object({
  qrCode: z.string().nullable(),
  isConnected: z.boolean(),
  timestamp: z.date(),
  error: z.string().nullable().optional()
})

export type QRCodeResponse = z.infer<typeof QRCodeResponseSchema>

// 🔧 NUEVO: Tipos para actualización de estado
export const UpdateInstanceStatusInputSchema = z.object({
  clientId: z.string().uuid(),
  instanceName: z.string().min(1),
  status: InstanceStatusSchema,
  phoneNumber: z.string().optional()
})

export type UpdateInstanceStatusInput = z.infer<typeof UpdateInstanceStatusInputSchema>

export const UpdateInstanceStatusResponseSchema = z.object({
  success: z.boolean(),
  updatedAt: z.date(),
  instance: z.object({
    id: z.string().uuid(),
    instanceName: z.string(),
    status: InstanceStatusSchema,
    lastConnected: z.date().nullable(),
    phoneNumber: z.string().nullable()
  }).optional()
})

export type UpdateInstanceStatusResponse = z.infer<typeof UpdateInstanceStatusResponseSchema> 