import { z } from "zod"

// Enum para estados de contenedor
export const ContainerStatusSchema = z.enum([
  "RUNNING",
  "STOPPED", 
  "ERROR",
  "DEPLOYING",
  "MAINTENANCE"
])

export type ContainerStatus = z.infer<typeof ContainerStatusSchema>

// Schema para contenedores de cliente
export const ClientContainerSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  containerName: z.string(),
  hostPort: z.number().int().positive(),
  status: ContainerStatusSchema,
  evolutionApiUrl: z.string().url().optional().nullable(),
  managerUrl: z.string().url().optional().nullable(),
  lastDeployedAt: z.date().optional().nullable(),
  lastHealthCheck: z.date().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type ClientContainer = z.infer<typeof ClientContainerSchema>

// Schema para crear un contenedor
export const CreateClientContainerSchema = ClientContainerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  evolutionApiUrl: true,
  managerUrl: true,
  lastDeployedAt: true,
  lastHealthCheck: true
})

export type CreateClientContainer = z.infer<typeof CreateClientContainerSchema>

// Schema para actualizar un contenedor
export const UpdateClientContainerSchema = CreateClientContainerSchema.partial()

export type UpdateClientContainer = z.infer<typeof UpdateClientContainerSchema>

// Información de estado del contenedor
export interface ContainerStatusInfo {
  containerName: string
  status: ContainerStatus
  hostPort: number
  evolutionApiUrl: string
  managerUrl: string
  isHealthy: boolean
  lastHealthCheck?: Date
  errorMessage?: string
}

// Estadísticas del contenedor
export interface ContainerStats {
  containerName: string
  uptime: number // en segundos
  memoryUsage: number // en MB
  cpuUsage: number // porcentaje
  activeInstances: number
  totalInstances: number
}

// Filtros para búsqueda de contenedores
export interface ContainerFilters {
  clientId?: string
  status?: ContainerStatus
  isHealthy?: boolean
}

// Eventos de contenedor
export interface ContainerEvent {
  type: "DEPLOYED" | "STARTED" | "STOPPED" | "ERROR" | "HEALTH_CHECK"
  containerName: string
  clientId: string
  timestamp: Date
  message: string
  metadata?: Record<string, any>
} 