import { api } from '@/trpc/react'

export function useInstances() {
  const utils = api.useUtils()

  const getClientInstances = (clientId: string) => {
    return api.integraciones.getClientIntegrations.useQuery(
      { clientId },
      {
        enabled: !!clientId,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    )
  }

  const getInstanceStatus = (clientId: string, instanceName: string) => {
    return api.integraciones.getInstanceStatus.useQuery(
      { clientId, instanceName },
      {
        enabled: !!clientId && !!instanceName,
        refetchInterval: 10 * 1000, // Refetch cada 10 segundos
        staleTime: 5 * 1000, // Considerar datos frescos por 5 segundos
        refetchOnWindowFocus: false
      }
    )
  }

  const createWhatsAppInstance = () => {
    return api.integraciones.createWhatsAppInstance.useMutation({
      onSuccess: (result) => {
        void utils.integraciones.invalidate()
        // Log del resultado del webhook para debugging
        if (result.webhookConfigured) {
          console.log('✅ Webhook configurado automáticamente para instancia:', result.instanceName)
        } else if (result.webhookError) {
          console.warn('⚠️ Error configurando webhook automáticamente:', result.webhookError)
        }
      }
    })
  }

  const deleteWhatsAppInstance = () => {
    return api.integraciones.deleteWhatsAppInstance?.useMutation?.({
      onSuccess: () => {
        void utils.integraciones.invalidate()
      }
    })
  }

  return {
    getClientInstances,
    getInstanceStatus,
    createWhatsAppInstance,
    deleteWhatsAppInstance
  }
}
