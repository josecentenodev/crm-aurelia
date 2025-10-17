import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Settings,
  Info,
  type LucideIcon,
} from "lucide-react"
import { NotificationType, NotificationPriority } from "@/domain/Notificaciones"

/**
 * Helpers para el módulo de notificaciones
 */

/**
 * Obtiene el icono correspondiente según el tipo de notificación
 */
export function getNotificationIcon(type: NotificationType): LucideIcon {
  const iconMap: Record<NotificationType, LucideIcon> = {
    [NotificationType.SUCCESS]: CheckCircle,
    [NotificationType.WARNING]: AlertTriangle,
    [NotificationType.ERROR]: AlertCircle,
    [NotificationType.SYSTEM]: Settings,
    [NotificationType.INFO]: Info,
  }

  return iconMap[type]
}

/**
 * Obtiene las clases CSS del icono según el tipo
 */
export function getNotificationIconClasses(type: NotificationType): string {
  const classMap: Record<NotificationType, string> = {
    [NotificationType.SUCCESS]: "text-green-500",
    [NotificationType.WARNING]: "text-yellow-500",
    [NotificationType.ERROR]: "text-red-500",
    [NotificationType.SYSTEM]: "text-blue-500",
    [NotificationType.INFO]: "text-gray-500",
  }

  return classMap[type]
}

/**
 * Obtiene las clases CSS para el badge de prioridad
 */
export function getPriorityBadgeClasses(
  priority: NotificationPriority
): string {
  const classMap: Record<NotificationPriority, string> = {
    [NotificationPriority.URGENT]: "bg-red-100 text-red-800 border-red-200",
    [NotificationPriority.HIGH]:
      "bg-orange-100 text-orange-800 border-orange-200",
    [NotificationPriority.MEDIUM]:
      "bg-yellow-100 text-yellow-800 border-yellow-200",
    [NotificationPriority.LOW]: "bg-gray-100 text-gray-800 border-gray-200",
  }

  return classMap[priority]
}

/**
 * Obtiene las clases CSS para el fondo de la notificación no leída
 */
export function getUnreadNotificationClasses(read: boolean): string {
  return read ? "" : "bg-blue-50 border-blue-200"
}

/**
 * Traduce el tipo de notificación a texto legible
 */
export function translateNotificationType(type: NotificationType): string {
  const translations: Record<NotificationType, string> = {
    [NotificationType.INFO]: "Información",
    [NotificationType.SUCCESS]: "Éxito",
    [NotificationType.WARNING]: "Advertencia",
    [NotificationType.ERROR]: "Error",
    [NotificationType.SYSTEM]: "Sistema",
  }

  return translations[type]
}

/**
 * Traduce la prioridad de notificación a texto legible
 */
export function translateNotificationPriority(
  priority: NotificationPriority
): string {
  const translations: Record<NotificationPriority, string> = {
    [NotificationPriority.LOW]: "Baja",
    [NotificationPriority.MEDIUM]: "Media",
    [NotificationPriority.HIGH]: "Alta",
    [NotificationPriority.URGENT]: "Urgente",
  }

  return translations[priority]
}
