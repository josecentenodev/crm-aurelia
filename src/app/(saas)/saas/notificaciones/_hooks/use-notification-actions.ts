"use client"

import {
  useMarkNotificacionesAsRead,
  useMarkAllNotificacionesAsRead,
  useDeleteNotificacion,
} from "@/hooks/use-notificaciones-queries"

/**
 * Hook centralizado para todas las acciones de notificaciones
 * Encapsula la lógica de mutaciones y manejo de estados
 */
export function useNotificationActions() {
  const markAsReadMutation = useMarkNotificacionesAsRead()
  const markAllAsReadMutation = useMarkAllNotificacionesAsRead()
  const deleteMutation = useDeleteNotificacion()

  /**
   * Marca una notificación como leída
   */
  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync({
        notificationIds: [notificationId],
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  const markAllAsRead = async (clientId: string, userId?: string | null) => {
    try {
      await markAllAsReadMutation.mutateAsync({
        clientId,
        userId,
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  /**
   * Elimina una notificación
   */
  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteMutation.mutateAsync({ id: notificationId })
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }

  return {
    // Funciones
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // Estados de loading
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Estados generales
    isLoading:
      markAsReadMutation.isPending ||
      markAllAsReadMutation.isPending ||
      deleteMutation.isPending,
  }
}
