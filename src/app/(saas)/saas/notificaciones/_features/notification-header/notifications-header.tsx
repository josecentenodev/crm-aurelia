"use client"

import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NotificationStats } from "@/domain/Notificaciones"

interface NotificationsHeaderProps {
  stats?: NotificationStats
  onMarkAllAsRead: () => void
  isMarkingAllAsRead: boolean
}

/**
 * Header del módulo de notificaciones
 * Muestra título, descripción y botón para marcar todas como leídas
 */
export function NotificationsHeader({
  stats,
  onMarkAllAsRead,
  isMarkingAllAsRead,
}: NotificationsHeaderProps) {
  const hasUnread = stats && stats.unread > 0

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="w-8 h-8" />
          Centro de Notificaciones
        </h1>
        <p className="text-gray-500 mt-1">
          Mantente al día con todas tus notificaciones
        </p>
      </div>
      {hasUnread && (
        <Button
          onClick={onMarkAllAsRead}
          variant="outline"
          disabled={isMarkingAllAsRead}
        >
          <CheckCheck className="w-4 h-4 mr-2" />
          Marcar todas como leídas
        </Button>
      )}
    </div>
  )
}
