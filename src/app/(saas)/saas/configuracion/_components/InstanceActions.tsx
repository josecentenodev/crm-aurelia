"use client"

import { Button } from "@/components/ui/button"
import { QrCode, WifiOff, Webhook, Trash2 } from "lucide-react"

interface InstanceActionsProps {
  status: string
  instanceName: string
  instanceId: string
  isDisconnecting: boolean
  isDeleting: boolean
  onConnect: (instanceId: string) => void
  onDisconnect: (instanceId: string) => void
  onDelete: (instanceId: string) => void
  onShowWebhookConfig: (instanceId: string) => void
}

export function InstanceActions({
  status,
  instanceName,
  instanceId,
  isDisconnecting,
  isDeleting,
  onConnect,
  onDisconnect,
  onDelete,
  onShowWebhookConfig
}: InstanceActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      {status === "DISCONNECTED" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onConnect(instanceId)}
          className="rounded-xl"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Conectar
        </Button>
      )}
      
      {status === "CONNECTING" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConnect(instanceId)}
            className="rounded-xl"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Ver QR
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDisconnect(instanceId)}
            disabled={isDisconnecting}
            className="rounded-xl"
          >
            <WifiOff className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </>
      )}
      
      {status === "CONNECTED" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDisconnect(instanceId)}
          disabled={isDisconnecting}
          className="rounded-xl"
        >
          <WifiOff className="w-4 h-4 mr-2" />
          Desconectar
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onShowWebhookConfig(instanceId)}
        className="rounded-xl"
      >
        <Webhook className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(instanceId)}
        disabled={isDeleting}
        className="rounded-xl text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
