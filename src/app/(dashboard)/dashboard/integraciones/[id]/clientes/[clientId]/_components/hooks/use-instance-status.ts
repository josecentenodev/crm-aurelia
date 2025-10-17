"use client"

import { api } from "@/trpc/react"

interface UseInstanceStatusOptions {
  clientId: string
  instanceName: string
  enabled?: boolean
}

export function useInstanceStatus({ clientId, instanceName, enabled = true }: UseInstanceStatusOptions) {
  return api.integraciones.getInstanceStatus.useQuery(
    { clientId, instanceName },
    {
      enabled: enabled && Boolean(clientId) && Boolean(instanceName),
      refetchInterval: 10_000,
      staleTime: 5_000,
      refetchOnWindowFocus: false,
    }
  )
}


