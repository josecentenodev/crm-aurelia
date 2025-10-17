"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Phone,
  MessageSquare,
  Clock,
  Settings,
  Trash2,
  QrCode,
  Wifi,
  WifiOff,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils/client-utils"
import type { InstanceCardProps } from "../types"
import { 
  getInstanceStatusColor, 
  getInstanceStatusText,
  formatDate
} from "../utils"

export function InstanceCard({ instance, onUpdate }: InstanceCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return <Wifi className="w-4 h-4 text-green-500" />
      case "CONNECTING":
        return <QrCode className="w-4 h-4 text-yellow-500" />
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "MAINTENANCE":
        return <Settings className="w-4 h-4 text-blue-500" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />
    }
  }

  const handleConnect = () => {
    // TODO: Implementar conexión de instancia
    console.log('Connect instance:', instance.id)
  }

  const handleDisconnect = () => {
    // TODO: Implementar desconexión de instancia
    console.log('Disconnect instance:', instance.id)
  }

  const handleShowQR = () => {
    // TODO: Implementar mostrar QR
    console.log('Show QR for instance:', instance.id)
  }

  const handleDelete = () => {
    // TODO: Implementar eliminación de instancia
    console.log('Delete instance:', instance.id)
  }

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
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  Instancia
                </span>
                {instance.phoneNumber && (
                  <span className="flex items-center space-x-1 text-xs">
                    <Phone className="w-3 h-3" />
                    <span>{instance.phoneNumber}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={cn("border-0 text-xs flex items-center gap-1", getInstanceStatusColor(instance.status))}>
              {getStatusIcon(instance.status)}
              {getInstanceStatusText(instance.status)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <ChevronDown className="w-4 h-4" />
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
            {instance.lastConnected && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>
                  Última conexión: {formatDate(instance.lastConnected)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {instance.status === "DISCONNECTED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnect}
                className="rounded-xl"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Conectar
              </Button>
            )}
            {instance.status === "CONNECTING" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowQR}
                  className="rounded-xl"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Ver QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="rounded-xl"
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
            {instance.status === "CONNECTED" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowQR}
                  className="rounded-xl"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Ver QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="rounded-xl"
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  Desconectar
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="rounded-xl text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
