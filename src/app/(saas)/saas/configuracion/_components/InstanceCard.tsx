"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Phone, Clock } from "lucide-react"
import { InstanceStatus } from "./InstanceStatus"
import { InstanceActions } from "./InstanceActions"

interface Instance {
  id: string
  instanceName: string
  phoneNumber: string | null
  status: string
  lastConnected: Date | null
  lastMessageAt: Date | null
  createdAt: Date
  updatedAt: Date
  integrationId: string
  config: Record<string, unknown>
  webhooks: Array<{
    id: string
    name: string | null
    url: string
    events: string[]
    enabled: boolean
    headers: unknown
    secret: string | null
  }>
}

interface InstanceCardProps {
  instance: Instance
  isExpanded: boolean
  isDisconnecting: boolean
  isDeleting: boolean
  onToggleExpand: (instanceId: string) => void
  onConnect: (instanceId: string) => void
  onDisconnect: (instanceId: string) => void
  onDelete: (instanceId: string) => void
  onShowWebhookConfig: (instanceId: string) => void
}

export function InstanceCard({
  instance,
  isExpanded,
  isDisconnecting,
  isDeleting,
  onToggleExpand,
  onConnect,
  onDisconnect,
  onDelete,
  onShowWebhookConfig
}: InstanceCardProps) {
  return (
    <Card className="rounded-2xl border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {instance.instanceName}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {instance.phoneNumber && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{instance.phoneNumber}</span>
                  </span>
                )}
                {instance.lastConnected && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Última conexión: {new Date(instance.lastConnected).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <InstanceStatus status={instance.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleExpand(instance.id)}
              className="rounded-xl"
            >
              {isExpanded ? "Contraer" : "Expandir"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>0 conversaciones</span>
            </div>
          </div>
          <InstanceActions
            status={instance.status}
            instanceName={instance.instanceName}
            instanceId={instance.id}
            isDisconnecting={isDisconnecting}
            isDeleting={isDeleting}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onDelete={onDelete}
            onShowWebhookConfig={onShowWebhookConfig}
          />
        </div>

        {/* Sección expandible con detalles */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Estado:</span>
                <div className="text-gray-600">
                  <InstanceStatus status={instance.status} />
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Creada:</span>
                <p className="text-gray-600">{new Date(instance.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {instance.config && Object.keys(instance.config).length > 0 && (
              <div>
                <span className="font-medium text-gray-700 text-sm">Configuración:</span>
                <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(instance.config, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
