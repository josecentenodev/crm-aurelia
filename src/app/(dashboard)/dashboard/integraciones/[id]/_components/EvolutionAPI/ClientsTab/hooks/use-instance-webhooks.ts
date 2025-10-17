"use client"

import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import type { SetWebhookResponse, SetWebhookRequest } from "@/services/evolution-api-types"

export function useInstanceWebhooks({ clientId, instanceName, enabled = true }: { clientId: string, instanceName: string, enabled?: boolean }) {
    const { toast } = useToast()
  
    const {
      data: webhooks,
      isLoading,
      isError,
      refetch,
    } = api.integraciones.getInstanceWebhooks.useQuery(
      { clientId, instanceName },
      { enabled }
    )
  
    const create = api.integraciones.createInstanceWebhook.useMutation({
      onSuccess: async () => {
        toast({ title: "Webhook creado", description: "El webhook fue creado correctamente" })
        await refetch()
      },
      onError: (error) => {
        toast({ title: "Error al crear webhook", description: error.message, variant: "destructive" })
      }
    })
  
    const createWebhook = async (webhook: SetWebhookRequest) => {
      await create.mutateAsync({
        clientId,
        instanceName,
        url: webhook.url,
        events: webhook.events ?? [],
      })
    }
  
    return {
      webhooks,
      isLoading,
      isError,
      refetch,
      createWebhook,
    }
  }
  
