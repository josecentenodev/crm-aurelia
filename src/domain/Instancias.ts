import { z } from "zod"

// Estados de instancia de WhatsApp
export const InstanceStatusSchema = z.enum([
  "DISCONNECTED",    // ← Cambio: alinear con Prisma
  "CONNECTING",      // ← Cambio: alinear con Prisma  
  "CONNECTED",       // ← Cambio: alinear con Prisma
  "ERROR",           // ← Cambio: alinear con Prisma
  "MAINTENANCE"      // ← Cambio: alinear con Prisma
])

export type InstanceStatus = z.infer<typeof InstanceStatusSchema>

// Esquema para crear una instancia de WhatsApp
export const CreateInstanceSchema = z.object({
  clientId: z.string().uuid(),
  instanceName: z.string().min(1).max(50),
  description: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  webhookEvents: z.array(z.string()).optional(),
  qrCodeTimeout: z.number().min(30).max(300).default(60),
  number: z.string().optional(),
  token: z.string().optional()
})

export type CreateInstanceInput = z.infer<typeof CreateInstanceSchema>

// Esquema para respuesta de creación de instancia
export const CreateInstanceResponseSchema = z.object({
  success: z.boolean(),
  instance: z.object({
    id: z.string().uuid(),
    instanceName: z.string(),
    description: z.string().nullable(),
    status: InstanceStatusSchema,
    qrCode: z.string().nullable(),
    qrCodeExpiresAt: z.date().nullable(),
    webhookUrl: z.string().nullable(),
    webhookEvents: z.array(z.string()).nullable(),
    metadata: z.record(z.any()),
    containerId: z.string().uuid(),
    clientId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    lastStatusCheck: z.date().nullable()
  }),
  message: z.string()
})

export type CreateInstanceResponse = z.infer<typeof CreateInstanceResponseSchema>

// Esquema para datos de QR
export const QRCodeSchema = z.object({
  qrCode: z.string(),
  qrCodeExpiresAt: z.date(),
  instanceId: z.string().uuid()
})

export type QRCodeData = z.infer<typeof QRCodeSchema>

// Esquema para estado de instancia
export const InstanceStatusDataSchema = z.object({
  status: InstanceStatusSchema,
  connectionData: z.object({
    isConnected: z.boolean(),
    phoneNumber: z.string().optional(),
    deviceInfo: z.object({
      platform: z.string().optional(),
      version: z.string().optional(),
      manufacturer: z.string().optional()
    }).optional(),
    lastSeen: z.date().optional(),
    batteryLevel: z.number().optional(),
    isCharging: z.boolean().optional()
  }).optional(),
  lastStatusCheck: z.date()
})

export type InstanceStatusData = z.infer<typeof InstanceStatusDataSchema>

// Esquema para instancia completa
export const WhatsAppInstanceSchema = z.object({
  id: z.string().uuid(),
  instanceName: z.string(),
  description: z.string().nullable(),
  status: InstanceStatusSchema,
  qrCode: z.string().nullable(),
  qrCodeExpiresAt: z.date().nullable(),
  webhookUrl: z.string().nullable(),
  webhookEvents: z.array(z.string()).nullable(),
  metadata: z.record(z.any()),
  containerId: z.string().uuid(),
  clientId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastStatusCheck: z.date().nullable(),
  container: z.object({
    id: z.string().uuid(),
    containerName: z.string(),
    status: z.string(),
    evolutionApiUrl: z.string(),
    managerUrl: z.string()
  }).optional()
})

export type WhatsAppInstance = z.infer<typeof WhatsAppInstanceSchema>

// Esquema para respuesta de instancias del cliente
export const ClientInstancesResponseSchema = z.object({
  instances: z.array(WhatsAppInstanceSchema),
  containerExists: z.boolean(),
  planLimits: z.object({
    maxInstances: z.number(),
    currentInstances: z.number(),
    canCreateMore: z.boolean()
  })
})

export type ClientInstancesResponse = z.infer<typeof ClientInstancesResponseSchema>

// Esquema para estadísticas de instancias
export const InstanceStatsSchema = z.object({
  total: z.number(),
  connected: z.number(),
  disconnected: z.number(),
  creating: z.number(),
  error: z.number(),
  recent: z.number(),
  connectionRate: z.number()
})

export type InstanceStats = z.infer<typeof InstanceStatsSchema>

// Esquema para eventos de webhook
export const WebhookEventSchema = z.enum([
  "connection.update",
  "messages.upsert",
  "messages.update",
  "messages.delete",
  "groups.upsert",
  "groups.update",
  "groups.delete",
  "presence.update",
  "contacts.upsert",
  "contacts.update",
  "chats.upsert",
  "chats.update",
  "chats.delete"
])

export type WebhookEvent = z.infer<typeof WebhookEventSchema>

// Esquema para configuración de webhook
export const WebhookConfigSchema = z.object({
  url: z.string().url(),
  events: z.array(WebhookEventSchema),
  enabled: z.boolean().default(true)
})

export type WebhookConfig = z.infer<typeof WebhookConfigSchema>

// Esquema para filtros de instancias
export const InstanceFiltersSchema = z.object({
  status: InstanceStatusSchema.optional(),
  search: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(["createdAt", "instanceName", "status", "lastStatusCheck"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

export type InstanceFilters = z.infer<typeof InstanceFiltersSchema>

// Esquema para paginación de instancias
export const InstancePaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  filters: InstanceFiltersSchema.optional()
})

export type InstancePagination = z.infer<typeof InstancePaginationSchema>

// Esquema para respuesta paginada de instancias
export const PaginatedInstancesResponseSchema = z.object({
  instances: z.array(WhatsAppInstanceSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  stats: InstanceStatsSchema
})

export type PaginatedInstancesResponse = z.infer<typeof PaginatedInstancesResponseSchema>

// ============================================
// MAPEO ENTRE CAPAS DE SERVICIO Y DOMINIO  
// ============================================

// Mapear estados del servicio Evolution API a estados de dominio
export const mapEvolutionApiStatusToDomain = (serviceStatus: string): InstanceStatus => {
  const statusMap: Record<string, InstanceStatus> = {
    'open': 'CONNECTED',
    'connected': 'CONNECTED', 
    'connecting': 'CONNECTING',
    'disconnected': 'DISCONNECTED',
    'closed': 'DISCONNECTED',
    'close': 'DISCONNECTED'
  }
  return statusMap[serviceStatus.toLowerCase()] ?? 'DISCONNECTED'
}

// Utilidades para validación de estados
export const isInstanceConnected = (status: InstanceStatus): boolean => {
  return status === "CONNECTED"
}

export const isInstanceCreating = (status: InstanceStatus): boolean => {
  return status === "CREATING" || status === "CONNECTING"
}

export const isInstanceInError = (status: InstanceStatus): boolean => {
  return status === "ERROR" || status === "EXPIRED"
}

export const isInstanceDisconnected = (status: InstanceStatus): boolean => {
  return status === "DISCONNECTED"
}

// Utilidades para colores de estado
export const getInstanceStatusColor = (status: InstanceStatus): string => {
  switch (status) {
    case "CONNECTED":
      return "success"
    case "CREATING":
    case "CONNECTING":
    case "RESTARTING":
      return "warning"
    case "DISCONNECTED":
      return "secondary"
    case "ERROR":
    case "EXPIRED":
      return "destructive"
    default:
      return "default"
  }
}

// Utilidades para texto de estado
export const getInstanceStatusText = (status: InstanceStatus): string => {
  switch (status) {
    case "CONNECTED":
      return "Conectado"
    case "CREATING":
      return "Creando"
    case "CONNECTING":
      return "Conectando"
    case "DISCONNECTED":
      return "Desconectado"
    case "RESTARTING":
      return "Reiniciando"
    case "ERROR":
      return "Error"
    case "EXPIRED":
      return "Expirado"
    default:
      return "Desconocido"
  }
}

// Utilidades para iconos de estado
export const getInstanceStatusIcon = (status: InstanceStatus): string => {
  switch (status) {
    case "CONNECTED":
      return "CheckCircle"
    case "CREATING":
    case "CONNECTING":
    case "RESTARTING":
      return "Loader"
    case "DISCONNECTED":
      return "XCircle"
    case "ERROR":
    case "EXPIRED":
      return "AlertCircle"
    default:
      return "HelpCircle"
  }
} 