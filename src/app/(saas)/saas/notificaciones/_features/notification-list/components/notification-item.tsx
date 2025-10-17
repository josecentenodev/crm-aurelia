"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Trash2 } from "lucide-react"
import type { NotificationWithUser } from "@/domain/Notificaciones"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  getNotificationIcon,
  getNotificationIconClasses,
  getPriorityBadgeClasses,
  getUnreadNotificationClasses,
  translateNotificationPriority,
} from "../../../_lib"

interface NotificationItemProps {
  notification: NotificationWithUser
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  isMarkingAsRead: boolean
  isDeleting: boolean
}

/**
 * Componente individual de notificación
 * Muestra toda la información de una notificación con acciones
 */
export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting,
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type)
  const iconClasses = getNotificationIconClasses(notification.type)
  const priorityClasses = getPriorityBadgeClasses(notification.priority)
  const cardClasses = getUnreadNotificationClasses(notification.read)

  return (
    <Card className={`transition-all ${cardClasses}`}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${iconClasses}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Priority */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {notification.title}
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
              </div>
              <Badge variant="outline" className={priorityClasses}>
                {translateNotificationPriority(notification.priority)}
              </Badge>
            </div>

            {/* Footer: metadata and actions */}
            <div className="flex items-center justify-between mt-3">
              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
                {notification.category && (
                  <Badge variant="outline" className="text-xs">
                    {notification.category}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkAsRead(notification.id)}
                    disabled={isMarkingAsRead}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Marcar como leída
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(notification.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
