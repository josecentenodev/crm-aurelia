"use client"

import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"

export function useAgentesByClient() {
  const { clientId } = useClientContext()

  return api.agentes.getAgentesByClient.useQuery(
    { clientId },
    { enabled: !!clientId }
  )
}

export function useTemplatesByClient() {
  const { clientId } = useClientContext()

  return api.agentes.getTemplatesByClient.useQuery(
    { clientId },
    { enabled: !!clientId }
  )
}

export function useCreateAgente() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.agentes.createAgente.useMutation({
    onSuccess: () => {
      utils.agentes.getAgentesByClient.invalidate({ clientId })
    }
  })
}

export function useUpdateAgente() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.agentes.updateAgente.useMutation({
    onSuccess: () => {
      utils.agentes.getAgentesByClient.invalidate({ clientId })
    }
  })
}

