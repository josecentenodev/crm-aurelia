// Importar tipos de dominio para consistencia
import type { InstanceStatus } from "@/domain/Instancias"

export interface UIInstance {
  id: string
  instanceName: string
  status: InstanceStatus  // Usar tipos de dominio, no de servicio
  lastConnected: Date | null
  phoneNumber: string | null
  qrCode: string | null
}

export interface UIClient {
  id: string
  name: string
  statusId: string
}


