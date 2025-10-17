"use client"

import { api } from "@/trpc/react"
import { Building2, CheckCircle, AlertCircle } from "lucide-react"
import { useClientContext } from "@/providers/ClientProvider"

export function CurrentClientInfo() {
  const { clientId, isAureliaUser } = useClientContext()

  // Solo mostrar para usuarios que no son AURELIA (ya que AURELIA usa el selector)
  if (isAureliaUser) {
    return null
  }

  const { data: client, isLoading } = api.clientes.getCurrent.useQuery(undefined, {
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutos - evita refetches innecesarios
    gcTime: 10 * 60 * 1000 // 10 minutos de cache
  })

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 border-b border-gray-200">
        <Building2 className="h-4 w-4 animate-pulse" />
        <span className="text-sm text-gray-500">Cargando cliente...</span>
      </div>
    )
  }

  if (!client) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'inactivo':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <AlertCircle className="h-3 w-3 text-yellow-500" />
    }
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 border-b border-gray-200">
      <Building2 className="h-4 w-4 text-aurelia-primary" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {client.name}
          </span>
          {getStatusIcon(client.status.name)}
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">
            {client.plan.name}
          </span>
        </div>
      </div>
    </div>
  )
} 