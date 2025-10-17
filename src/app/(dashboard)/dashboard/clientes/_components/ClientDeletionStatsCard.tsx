"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { api } from "@/trpc/react"

export function ClientDeletionStatsCard() {
  const { data: stats, isLoading, error } = api.superadmin.getClientDeletionStats.useQuery()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Estadísticas de Eliminación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Error al cargar estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Estadísticas de Eliminación (30 días)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total de clientes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Total de clientes:</span>
          </div>
          <Badge variant="outline" className="font-bold">
            {stats.totalClients}
          </Badge>
        </div>

        {/* Eliminaciones exitosas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Eliminaciones exitosas:</span>
          </div>
          <Badge variant="outline" className="font-bold text-green-600">
            {stats.recentDeletions}
          </Badge>
        </div>

        {/* Eliminaciones fallidas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Eliminaciones fallidas:</span>
          </div>
          <Badge variant="outline" className="font-bold text-red-600">
            {stats.failedDeletions}
          </Badge>
        </div>

        {/* Tasa de éxito */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {stats.deletionSuccessRate >= 80 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">Tasa de éxito:</span>
          </div>
          <Badge 
            variant="outline" 
            className={`font-bold ${
              stats.deletionSuccessRate >= 80 
                ? 'text-green-600' 
                : stats.deletionSuccessRate >= 60 
                ? 'text-yellow-600' 
                : 'text-red-600'
            }`}
          >
            {stats.deletionSuccessRate}%
          </Badge>
        </div>

        {/* Clientes con integraciones activas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Con integraciones activas:</span>
          </div>
          <Badge variant="outline" className="font-bold text-orange-600">
            {stats.clientsWithActiveIntegrations}
          </Badge>
        </div>

        {/* Resumen */}
        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Los clientes con integraciones activas requieren detener servicios antes de eliminar</p>
            <p>• La tasa de éxito considera eliminaciones completadas vs fallidas</p>
            <p>• Se recomienda hacer backup antes de eliminar clientes importantes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
