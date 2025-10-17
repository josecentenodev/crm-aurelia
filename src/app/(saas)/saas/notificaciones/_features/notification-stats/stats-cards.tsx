"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertCircle, AlertTriangle } from "lucide-react"
import type { NotificationStats } from "@/domain/Notificaciones"

interface StatsCardsProps {
  stats: NotificationStats
}

/**
 * Tarjetas de estadísticas de notificaciones
 * Muestra: Total, No leídas, Urgentes, Errores
 */
export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* No leídas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">No leídas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <Badge variant="default" className="text-lg">
              {stats.unread}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Urgentes */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Urgentes</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.byPriority.URGENT}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </CardContent>
      </Card>

      {/* Errores */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Errores</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.byType.ERROR}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
