"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, QrCode } from "lucide-react"

interface InstanceStatusProps {
  status: string
}

export function InstanceStatus({ status }: InstanceStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "CONNECTING":
        return <QrCode className="w-4 h-4 text-yellow-500" />
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "bg-green-100 text-green-800"
      case "CONNECTING":
        return "bg-yellow-100 text-yellow-800"
      case "ERROR":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "Conectada"
      case "CONNECTING":
        return "Conectando"
      case "ERROR":
        return "Error"
      default:
        return "Desconectada"
    }
  }

  return (
    <Badge className={`border-0 text-xs flex items-center gap-1 ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {getStatusText(status)}
    </Badge>
  )
}
