"use client"

import { useCallback } from "react"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"

export function useClientInvalidation() {
  const { clientId } = useClientContext()
  const utils = api.useUtils()

  const invalidateClient = useCallback(async () => {
    if (!clientId) return
    
    await utils.clientes.getClient.invalidate({ id: clientId })
    await utils.clientes.getClients.invalidate()
  }, [clientId, utils])

  const invalidateClientInstances = useCallback(async () => {
    if (!clientId) return
    
    await utils.instancias.getClientInstances.invalidate({ clientId })
  }, [clientId, utils])

  const invalidateClientIntegrations = useCallback(async () => {
    if (!clientId) return
    
    await utils.integraciones.getClientIntegrations.invalidate({ clientId })
  }, [clientId, utils])

  const invalidateAll = useCallback(async () => {
    await Promise.all([
      invalidateClient(),
      invalidateClientInstances(),
      invalidateClientIntegrations()
    ])
  }, [invalidateClient, invalidateClientInstances, invalidateClientIntegrations])

  return {
    invalidateClient,
    invalidateClientInstances,
    invalidateClientIntegrations,
    invalidateAll
  }
}

