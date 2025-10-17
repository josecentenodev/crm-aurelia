"use client"

import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

export function useIntegrationActions(refetch: () => Promise<unknown>) {
  const { toast } = useToast()

  const activate = api.integraciones.activateForClient.useMutation({
    onSuccess: async () => {
      toast({ title: "Integración activada", description: "Se activó correctamente" })
      await refetch()
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  const deactivate = api.integraciones.deactivateForClient.useMutation({
    onSuccess: async () => {
      toast({ title: "Integración desactivada", description: "Se eliminó la configuración del cliente" })
      await refetch()
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  async function toggle(clientId: string, type: "EVOLUTION_API", enable: boolean) {
    if (enable) {
      await activate.mutateAsync({ clientId, type, config: {} })
    } else {
      await deactivate.mutateAsync({ clientId, type })
    }
  }

  return { toggle, activate, deactivate }
}


