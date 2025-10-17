"use client"

import { Badge } from "@/components/ui/badge"
import { NotificationType, NotificationPriority } from "@/domain/Notificaciones"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  type?: NotificationType
  priority?: NotificationPriority
  variant?: "type" | "priority"
  className?: string
}

/**
 * Badge component para mostrar el tipo o prioridad de una notificación
 * con colores apropiados
 */
export function NotificationBadge({
  type,
  priority,
  variant = "type",
  className
}: NotificationBadgeProps) {
  if (variant === "type" && type) {
    const typeColors = {
      [NotificationType.INFO]: "bg-blue-100 text-blue-800 border-blue-200",
      [NotificationType.SUCCESS]: "bg-green-100 text-green-800 border-green-200",
      [NotificationType.WARNING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
      [NotificationType.ERROR]: "bg-red-100 text-red-800 border-red-200",
      [NotificationType.SYSTEM]: "bg-purple-100 text-purple-800 border-purple-200"
    }

    return (
      <Badge
        variant="outline"
        className={cn(typeColors[type], className)}
      >
        {type}
      </Badge>
    )
  }

  if (variant === "priority" && priority) {
    const priorityColors = {
      [NotificationPriority.LOW]: "bg-gray-100 text-gray-800 border-gray-200",
      [NotificationPriority.MEDIUM]: "bg-yellow-100 text-yellow-800 border-yellow-200",
      [NotificationPriority.HIGH]: "bg-orange-100 text-orange-800 border-orange-200",
      [NotificationPriority.URGENT]: "bg-red-100 text-red-800 border-red-200"
    }

    return (
      <Badge
        variant="outline"
        className={cn(priorityColors[priority], className)}
      >
        {priority}
      </Badge>
    )
  }

  return null
}
