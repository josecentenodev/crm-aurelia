"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  QrCode, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
} from "lucide-react"
import { AutoQrDisplay } from "./AutoQrDisplay"
import { InstancesManagementSection } from "./sections/InstancesManagementSection"
import { useClientsIntegrations } from "@/app/(dashboard)/dashboard/integraciones/[id]/_components/EvolutionAPI/ClientsTab/hooks/use-clients-integrations"
import { useInstanceStatus } from "./hooks/use-instance-status"
import type { UIInstance } from "@/app/(dashboard)/dashboard/integraciones/[id]/_components/EvolutionAPI/ClientsTab/types"
import type { UIGlobalIntegration, UIClientLite } from "@/lib/mappers/integrations"
import { WebhookConfigSection } from "./sections/WebhookConfigSection"
import { InstanceCard } from "./sections/InstanceCard"

interface Props {
  integration: UIGlobalIntegration
  client: UIClientLite
}

export function ClientEvolutionApiConfig({ integration, client }: Props) {

  const { getClientInstances } = useClientsIntegrations({
    integrationType: "EVOLUTION_API",
    enabled: true,
    staleTime: 30_000
  })

  const realInstances = getClientInstances(client.id)
  const [selectedInstanceName, setSelectedInstanceName] = useState<string | null>(null)
  const instanceName: string | null = useMemo(() => {
    if (selectedInstanceName) return selectedInstanceName
    return realInstances[0]?.instanceName ?? null
  }, [selectedInstanceName, realInstances])

  const instanceStatusQuery = useInstanceStatus({ clientId: client.id, instanceName: instanceName ?? "", enabled: Boolean(instanceName) })
  const safeInstanceStatus = instanceStatusQuery.data as { connectionStatus?: 'connected' | 'connecting' | 'disconnected'; timestamp?: Date } | undefined

  if (!instanceName) {
    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <AlertCircle className="w-5 h-5" />
              <span>Configuración de Instancias WhatsApp</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700 mb-4">
              Este cliente no tiene ninguna instancia de WhatsApp configurada. Crea una nueva instancia para comenzar.
            </p>
          </CardContent>
        </Card>
        
        {/* Gestión de Instancias integrada */}
        <InstancesManagementSection 
          client={client} 
          integration={integration} 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards por instancia */}
      <div className="space-y-4">
        {realInstances.length === 0 ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">No hay instancias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">Crea una instancia para comenzar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {realInstances.map((inst) => (
              <InstanceCard key={inst.id} client={client} instance={inst} />
            ))}
          </div>
        )}
      </div>

      {/* Gestión de instancias al final */}
      <div className="border-t border-gray-300 my-8"></div>
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Gestión de Instancias</h2>
          <p className="text-gray-600 mt-1">Crea y administra las instancias de este cliente</p>
        </div>
        <InstancesManagementSection client={client} integration={integration} />
      </div>
    </div>
  )
}