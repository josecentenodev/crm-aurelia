"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare, Trash2 } from "lucide-react"
import type { UIInstance } from "../types"

interface Props {
  instance: UIInstance
  onDelete: (instanceName: string) => Promise<void> | void
  isDeleting?: boolean
}

// Importar utilidades del dominio para colores consistentes
import { getInstanceStatusColor } from "@/domain/Instancias"
import type { InstanceStatus } from "@/domain/Instancias"

function statusColor(status: InstanceStatus) {
  const colorMap = {
    "CONNECTED": "bg-green-100 text-green-800",
    "CONNECTING": "bg-yellow-100 text-yellow-800", 
    "CREATING": "bg-blue-100 text-blue-800",
    "RESTARTING": "bg-yellow-100 text-yellow-800",
    "DISCONNECTED": "bg-red-100 text-red-800",
    "ERROR": "bg-red-100 text-red-800",
    "EXPIRED": "bg-gray-100 text-gray-800"
  }
  return colorMap[status] ?? "bg-gray-100 text-gray-600"
}

export function InstanceRow({ instance, onDelete, isDeleting }: Props) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <MessageSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{instance.instanceName}</p> 
          <p className="text-sm text-gray-500">
            Última conexión: {instance.lastConnected ? new Date(instance.lastConnected).toLocaleDateString() : "Nunca"}
          </p>
          {instance.phoneNumber && (
            <p className="text-xs text-gray-400">Número: {instance.phoneNumber}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Badge className={statusColor(instance.status)}>{instance.status}</Badge>
        <Button variant="destructive" size="sm" onClick={() => onDelete(instance.instanceName)} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}


