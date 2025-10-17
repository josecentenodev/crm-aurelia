"use client"

import { api } from "@/trpc/react"
import { mapInstances } from "../mappers/map-instances"
import type { UIInstance } from "../types"

interface ClientIntegrationsOptions {
  integrationType: "EVOLUTION_API" | "WHATSAPP_BUSINESS" | "TELEGRAM_BOT" | "EMAIL_SMTP" | "SMS_TWILIO"
  enabled: boolean
  staleTime?: number
}

export function useClientsIntegrations(opts: ClientIntegrationsOptions) {
  const { integrationType, enabled, staleTime = 30_000 } = opts

  const query = api.integraciones.getClientIntegrationsByType.useQuery(
    { integrationType },
    { enabled, refetchOnWindowFocus: false, staleTime }
  )

  function getClientIntegrationStatus(clientId: string): boolean {
    const list = query.data
    if (!list) return false
    const it = list.find((i) => i.clientId === clientId && i.type === integrationType)
    return it?.isActive ?? false
  }

  function getClientInstances(clientId: string): UIInstance[] {
    const list = query.data
    console.log("list", list)
    if (!list) return []
    const it = list.find((i) => i.clientId === clientId && i.type === integrationType)
    return mapInstances(it?.evolutionApi?.instances)
  }

  function getClientInstancesCount(clientId: string): number {
    const list = query.data
    if (!list) return 0
    const it = list.find((i) => i.clientId === clientId && i.type === integrationType)
    return it?.evolutionApi?.instances?.length ?? 0
  }

  return {
    ...query,
    getClientIntegrationStatus,
    getClientInstances,
    getClientInstancesCount,
  }
}


