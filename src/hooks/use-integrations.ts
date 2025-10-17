import { api } from "@/trpc/react"

export function useIntegrations() {
  // Load existing configuration with proper enabled condition
  const { data: integrations, isLoading: isLoadingIntegrations, error: integrationsError } = api.integraciones.listGlobal.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Load clients with proper enabled condition
  const { data: clientsData, isLoading: isLoadingClients, error: clientsError } = api.clientes.list.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const clients = clientsData?.clients || []

  const isLoading = isLoadingIntegrations || isLoadingClients
  const error = integrationsError || clientsError

  return {
    integrations: integrations || [],
    clients,
    isLoading,
    error
  }
}
