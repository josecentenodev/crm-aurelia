"use client"

import { memo } from "react"
import { useClientContext } from "@/providers/ClientProvider"
import { useClientStore } from "@/store/client-store"
import { useClientSelection } from "./_hooks/use-client-selection"
import { ClientSelectorLoading } from "./client-selector-loading"
import { ClientSelect } from "./client-select"

function ClientSelectorComponent() {
  const { isAureliaUser, isLoading: contextLoading } = useClientContext()
  const { isHydrated } = useClientStore()
  
  const {
    clients,
    selectedClientId,
    isLocalSwitching,
    isLoading: clientsLoading,
    handleClientChange
  } = useClientSelection({ enabled: isAureliaUser })

  // Solo mostrar para usuarios AURELIA
  if (!isAureliaUser) {
    return null
  }

  // Mostrar loading si el contexto está cargando o el store no está hidratado
  if (contextLoading || !isHydrated) {
    return (
      <ClientSelectorLoading 
        message={contextLoading ? 'Cargando contexto...' : 'Inicializando store...'} 
      />
    )
  }

  if (clientsLoading) {
    return <ClientSelectorLoading message="Cargando clientes..." />
  }

  return (
    <ClientSelect
      clients={clients}
      selectedClientId={selectedClientId}
      isLocalSwitching={isLocalSwitching}
      onClientChange={handleClientChange}
    />
  )
}

// Memoizar el componente para evitar re-renders innecesarios
export const ClientSelector = memo(ClientSelectorComponent, (prevProps, nextProps) => {
  // Como no tiene props, solo re-renderizar si es necesario
  // El componente se re-renderizará solo cuando cambien los hooks internos
  return false
}) 