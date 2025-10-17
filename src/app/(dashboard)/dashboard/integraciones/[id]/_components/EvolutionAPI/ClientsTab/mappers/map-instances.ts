import type { UIInstance } from "../types"
import type { InstanceStatus } from "@/domain/Instancias"

interface BackendInstance {
  id: string
  instanceName: string
  status: string
  lastConnected: Date | null
  phoneNumber: string | null
  qrCode: string | null
}

// Mapper de estados de dominio - estos vienen de la BD, no del servicio
function mapDomainStatus(status: string): InstanceStatus {
  const statusMap: Record<string, InstanceStatus> = {
    'CREATING': 'CREATING',
    'CONNECTED': 'CONNECTED',
    'DISCONNECTED': 'DISCONNECTED',
    'CONNECTING': 'CONNECTING',
    'RESTARTING': 'RESTARTING',
    'ERROR': 'ERROR',
    'EXPIRED': 'EXPIRED'
  }
  return statusMap[status] ?? 'DISCONNECTED'
}

export function mapInstances(items: BackendInstance[] | undefined | null): UIInstance[] {
  const list = items ?? []
  return list.map((i) => ({
    id: i.id,
    instanceName: i.instanceName,
    status: mapDomainStatus(i.status),
    lastConnected: i.lastConnected ?? null,
    phoneNumber: i.phoneNumber ?? null,
    qrCode: i.qrCode ?? null,
  }))
}


