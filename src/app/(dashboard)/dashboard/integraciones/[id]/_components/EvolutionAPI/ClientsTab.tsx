"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, MessageSquare, Settings } from "lucide-react"
import Link from "next/link"

import { useClientsIntegrations } from "./ClientsTab/hooks/use-clients-integrations"
import { useIntegrationActions } from "./ClientsTab/hooks/use-integration-actions"
import { ClientIntegrationToggle } from "./ClientsTab/components/client-integration-toggle"
import { ClientGrid } from "./ClientsTab/components/client-grid"
import { ClientCard } from "./ClientsTab/components/client-card"
// Nota: No usar variables de entorno ni servicios del servidor directamente en client components

interface ClientsTabProps {
  integrationId: string
  integrationType: string
  clients: Array<{
    id: string
    name: string
    statusId: string
  }>
}

// Tipos locales se gestionan en ClientsTab/types.ts para subcomponentes

export function ClientsTab({ integrationId, integrationType, clients }: ClientsTabProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // Query integraciones (refactor en hook)
  const { refetch, getClientIntegrationStatus, getClientInstances, getClientInstancesCount } = useClientsIntegrations({
    integrationType: integrationType as "EVOLUTION_API",
    enabled: clients.length > 0,
    staleTime: 30_000
  })

  // Acciones integraciones
  const { toggle } = useIntegrationActions(async () => { await refetch() })

  const handleToggleIntegration = async (clientId: string, isActive: boolean) => {
    setLoadingStates(prev => ({ ...prev, [clientId]: true }))
    
    try {
      await toggle(clientId, integrationType as "EVOLUTION_API", isActive)
    } finally {
      setLoadingStates(prev => ({ ...prev, [clientId]: false }))
    }
  }



  // colores/iconos se manejan en subcomponentes

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes con WhatsApp API</h2>
          <p className="text-gray-600 mt-1">
            Gestiona qué clientes tienen WhatsApp API habilitada y sus contenedores
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} total
          </span>
        </div>
      </div>

      {/* Grid Layout for Clients */}
      <ClientGrid>
        {clients.map((client) => {
          const isActive = getClientIntegrationStatus(client.id)
          const instancesCount = getClientInstancesCount(client.id)
          const instances = getClientInstances(client.id)
          const isLoading = loadingStates[client.id] ?? false
          const connectedInstances = instances.filter(i => i.status === "CONNECTED").length

          return (
            <ClientCard
              key={client.id}
              client={{ id: client.id, name: client.name }}
              isActive={isActive}
              isExpanded={false}
              onToggleExpand={() => undefined}
            >
                <div className="space-y-4">
                  {/* Stats Preview - Grid mejorado */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-gray-900">{instancesCount}</span>
                      </div>
                      <span className="text-xs text-gray-500">Instancias</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-semibold text-gray-900">{connectedInstances}</span>
                      </div>
                      <span className="text-xs text-gray-500">Conectadas</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="font-semibold text-gray-900">{instancesCount - connectedInstances}</span>
                      </div>
                      <span className="text-xs text-gray-500">Desconectadas</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <ClientIntegrationToggle isActive={isActive} isLoading={isLoading} onToggle={(checked) => handleToggleIntegration(client.id, checked)} />

                  {/* Gestionar Cliente */}
                  {isActive && (
                    <div className="pt-3 border-t border-gray-100">
                      <Link href={`/dashboard/integraciones/${integrationId}/clientes/${client.id}`}>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>Gestionar</span>
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </ClientCard>
          )
        })}
      </ClientGrid>

      {/* Empty State */}
      {clients.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold text-gray-700 mb-2">No hay clientes disponibles</p>
              <p className="text-gray-500">Los clientes aparecerán aquí una vez que sean creados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
