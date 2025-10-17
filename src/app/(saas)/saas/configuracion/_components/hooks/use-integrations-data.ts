import { useMemo } from "react"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { IntegrationData } from "../types"

export function useIntegrationsData() {
  const { clientId, isLoading: isClientLoading } = useClientContext()

  const { data: integrationsData, isLoading: isIntegrationsLoading, refetch } = api.integraciones.getClientIntegrations.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId && !isClientLoading }
  )

  const isLoading = isClientLoading || isIntegrationsLoading

  const integrations = useMemo((): IntegrationData[] => {
    return integrationsData?.integrations || []
  }, [integrationsData?.integrations])

  const activeIntegrations = useMemo((): IntegrationData[] => {
    return integrations.filter(integration => integration.isActive)
  }, [integrations])

  const availableIntegrations = useMemo((): IntegrationData[] => {
    return integrations.filter(integration => integration.isAvailable)
  }, [integrations])

  const evolutionApiIntegration = useMemo((): IntegrationData | undefined => {
    return integrations.find(integration => 
      integration.type === "EVOLUTION_API" && integration.isActive
    )
  }, [integrations])

  const integrationsByType = useMemo(() => {
    const grouped: Record<string, IntegrationData[]> = {}
    integrations.forEach(integration => {
      if (!grouped[integration.type]) {
        grouped[integration.type] = []
      }
      grouped[integration.type].push(integration)
    })
    return grouped
  }, [integrations])

  return {
    integrations,
    activeIntegrations,
    availableIntegrations,
    evolutionApiIntegration,
    integrationsByType,
    isLoading,
    clientId,
    refetch
  }
}