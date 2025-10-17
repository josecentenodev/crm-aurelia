import { useMemo } from "react"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { InstanceData } from "../types"

export function useInstancesData(integrationId?: string) {
  const { clientId, isLoading: isClientLoading } = useClientContext()

  const { data: instancesData, isLoading: isInstancesLoading } = api.instances.listByClient.useQuery({
    clientId: clientId!,
    integrationId
  }, {
    enabled: !!clientId && !isClientLoading
  })

  const { data: integrationsData } = api.integraciones.getClientIntegrations.useQuery({
    clientId: clientId!
  }, {
    enabled: !!clientId
  })

  const isLoading = isClientLoading || isInstancesLoading

  const instances = useMemo((): InstanceData[] => {
    return instancesData?.instances || []
  }, [instancesData?.instances])

  const connectedInstances = useMemo((): InstanceData[] => {
    return instances.filter(instance => instance.status === "CONNECTED")
  }, [instances])

  const connectingInstances = useMemo((): InstanceData[] => {
    return instances.filter(instance => instance.status === "CONNECTING")
  }, [instances])

  const errorInstances = useMemo((): InstanceData[] => {
    return instances.filter(instance => instance.status === "ERROR")
  }, [instances])

  const instancesByIntegration = useMemo(() => {
    const grouped: Record<string, InstanceData[]> = {}
    instances.forEach(instance => {
      if (!grouped[instance.integrationId]) {
        grouped[instance.integrationId] = []
      }
      grouped[instance.integrationId].push(instance)
    })
    return grouped
  }, [instances])

  const getIntegrationName = (integrationId: string) => {
    const integration = integrationsData?.integrations.find(i => i.id === integrationId)
    return integration?.name || "Integración"
  }

  const getIntegrationType = (integrationId: string) => {
    const integration = integrationsData?.integrations.find(i => i.id === integrationId)
    return integration?.type || "UNKNOWN"
  }

  const instancesWithIntegrationInfo = useMemo(() => {
    return instances.map(instance => ({
      ...instance,
      integrationName: getIntegrationName(instance.integrationId),
      integrationType: getIntegrationType(instance.integrationId)
    }))
  }, [instances, integrationsData?.integrations])

  return {
    instances,
    connectedInstances,
    connectingInstances,
    errorInstances,
    instancesByIntegration,
    instancesWithIntegrationInfo,
    isLoading,
    clientId,
    getIntegrationName,
    getIntegrationType,
    refetch: instancesData ? () => {} : () => {} // TODO: Implementar refetch
  }
}
