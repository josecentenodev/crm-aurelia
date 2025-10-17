import type { GlobalIntegration } from "@/domain"

export interface UIGlobalIntegration {
  id: string
  type: string
  name: string
  description?: string
  icon?: string
  isActive: boolean
  isConfigurable: boolean
  backendUrl?: string
  apiKey?: string
}

export function mapGlobalIntegrationToUI(i: GlobalIntegration): UIGlobalIntegration {
  return {
    id: i.id,
    type: i.type,
    name: i.name,
    description: i.description ?? undefined,
    icon: i.icon ?? undefined,
    isActive: i.isActive,
    isConfigurable: i.isConfigurable,
    backendUrl: i.backendUrl ?? undefined,
    apiKey: i.apiKey ?? undefined,
  }
}

export interface UIClientLite {
  id: string
  name: string
  statusId: string
}

export function mapClientToLiteUI(c: { id: string; name: string; statusId?: string; status?: { id: string } }): UIClientLite {
  return {
    id: c.id,
    name: c.name,
    statusId: c.statusId ?? c.status?.id ?? "",
  }
}


