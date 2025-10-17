"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, RefreshCw, QrCode, MessageSquare } from "lucide-react"
import type { UIClientLite } from "@/lib/mappers/integrations"
import type { UIInstance } from "@/app/(dashboard)/dashboard/integraciones/[id]/_components/EvolutionAPI/ClientsTab/types"
import { useInstanceStatus } from "../hooks/use-instance-status"
import { AutoQrDisplay } from "../AutoQrDisplay"
import { WebhookConfigSection } from "./WebhookConfigSection"

interface Props {
  client: UIClientLite
  instance: UIInstance
}

export function InstanceCard({ client, instance }: Props) {
  const statusQuery = useInstanceStatus({ clientId: client.id, instanceName: instance.instanceName, enabled: true })
  const status = statusQuery.data as { connectionStatus?: 'connected' | 'connecting' | 'disconnected'; timestamp?: Date } | undefined

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            {instance.instanceName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={status?.connectionStatus === 'connected' ? 'default' : 'secondary'}>
              {status?.connectionStatus === 'connected' ? 'Conectado' : status?.connectionStatus === 'connecting' ? 'Conectando' : 'Desconectado'}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => statusQuery.refetch()} disabled={statusQuery.isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${statusQuery.isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div>
              <p className="text-sm font-medium">Instancia</p>
              <p className="text-xs text-gray-500">{instance.instanceName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div>
              <p className="text-sm font-medium">Contenedor</p>
              <p className="text-xs text-gray-500">Ejecutándose</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
              status?.connectionStatus === 'connected' ? 'bg-green-500' : status?.connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <div>
              <p className="text-sm font-medium">WhatsApp</p>
              <p className="text-xs text-gray-500">
                {status?.connectionStatus === 'connected' ? 'Conectado' : status?.connectionStatus === 'connecting' ? 'Conectando' : 'Desconectado'}
              </p>
            </div>
          </div>
        </div>

        {status?.connectionStatus !== 'connected' && (
          <AutoQrDisplay clientId={client.id} instanceName={instance.instanceName} />
        )}

        <div className="border-t pt-4">
          <CardHeader className="px-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-base">Webhooks de esta instancia</CardTitle>
            </div>
          </CardHeader>
          <WebhookConfigSection client={client} instanceName={instance.instanceName} />
        </div>
      </CardContent>
    </Card>
  )
}


