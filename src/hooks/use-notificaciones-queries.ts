"use client"

import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import { useNotificationStore } from "@/store/notifications-store"
import type { NotificationFilters } from "@/domain/Notificaciones"

/**
 * Hook para obtener lista de notificaciones con filtros
 */
export function useNotificacionesList(customFilters?: Partial<NotificationFilters>) {
  const { clientId } = useClientContext()
  const storeFilters = useNotificationStore((state) => state.filters)

  // Combinar filtros del store con filtros personalizados
  const filters: NotificationFilters = {
    ...storeFilters,
    ...customFilters,
    clientId: clientId ?? undefined
  }

  return api.notificaciones.list.useQuery(
    filters,
    {
      enabled: !!clientId,
      refetchInterval: 30000, // Refetch cada 30 segundos
      staleTime: 10000 // Considerar datos frescos por 10 segundos
    }
  )
}

/**
 * Hook para obtener una notificación por ID
 */
export function useNotificacionById(id: string) {
  return api.notificaciones.byId.useQuery(
    { id },
    { enabled: !!id }
  )
}

/**
 * Hook para crear una notificación
 */
export function useCreateNotificacion() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.notificaciones.create.useMutation({
    onSuccess: () => {
      void utils.notificaciones.list.invalidate()
      void utils.notificaciones.getStats.invalidate({ clientId: clientId ?? undefined })
      void utils.notificaciones.getUnreadCount.invalidate({ clientId: clientId ?? undefined })
    }
  })
}

/**
 * Hook para actualizar una notificación
 */
export function useUpdateNotificacion() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.notificaciones.update.useMutation({
    onSuccess: () => {
      void utils.notificaciones.list.invalidate()
      void utils.notificaciones.getStats.invalidate({ clientId: clientId ?? undefined })
    }
  })
}

/**
 * Hook para marcar notificaciones como leídas
 */
export function useMarkNotificacionesAsRead() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()
  const decrementUnreadCount = useNotificationStore((state) => state.decrementUnreadCount)

  return api.notificaciones.markAsRead.useMutation({
    onSuccess: (data) => {
      void utils.notificaciones.list.invalidate()
      void utils.notificaciones.getUnreadCount.invalidate({ clientId: clientId ?? undefined })
      decrementUnreadCount(data.count)
    }
  })
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarkAllNotificacionesAsRead() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount)

  return api.notificaciones.markAllAsRead.useMutation({
    onSuccess: () => {
      void utils.notificaciones.list.invalidate()
      void utils.notificaciones.getUnreadCount.invalidate({ clientId: clientId ?? undefined })
      setUnreadCount(0)
    }
  })
}

/**
 * Hook para eliminar una notificación
 */
export function useDeleteNotificacion() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.notificaciones.delete.useMutation({
    onSuccess: () => {
      void utils.notificaciones.list.invalidate()
      void utils.notificaciones.getStats.invalidate({ clientId: clientId ?? undefined })
      void utils.notificaciones.getUnreadCount.invalidate({ clientId: clientId ?? undefined })
    }
  })
}

/**
 * Hook para eliminar múltiples notificaciones
 */
export function useDeleteManyNotificaciones() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.notificaciones.deleteMany.useMutation({
    onSuccess: () => {
      void utils.notificaciones.list.invalidate()
      void utils.notificaciones.getStats.invalidate({ clientId: clientId ?? undefined })
      void utils.notificaciones.getUnreadCount.invalidate({ clientId: clientId ?? undefined })
    }
  })
}

/**
 * Hook para obtener estadísticas de notificaciones
 */
export function useNotificacionesStats(userId?: string | null) {
  const { clientId } = useClientContext()

  return api.notificaciones.getStats.useQuery(
    { clientId: clientId ?? undefined, userId: userId ?? undefined },
    {
      enabled: !!clientId,
      refetchInterval: 60000 // Refetch cada minuto
    }
  )
}

/**
 * Hook para obtener contador de notificaciones no leídas
 * Se actualiza automáticamente
 * Nota: La sincronización con el store debe hacerse externamente con useEffect
 */
export function useNotificacionesUnreadCount(userId?: string | null) {
  const { clientId } = useClientContext()

  return api.notificaciones.getUnreadCount.useQuery(
    { clientId: clientId ?? undefined, userId: userId ?? undefined },
    {
      enabled: !!clientId,
      refetchInterval: 15000, // Refetch cada 15 segundos
    }
  )
}

/**
 * Hook para limpiar notificaciones expiradas
 * Solo disponible para usuarios AURELIA/ADMIN
 */
export function useCleanExpiredNotificaciones() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.notificaciones.cleanExpired.useMutation({
    onSuccess: () => {
      if (clientId) {
        void utils.notificaciones.list.invalidate()
        void utils.notificaciones.getStats.invalidate({ clientId: clientId ?? undefined })
        void utils.notificaciones.getUnreadCount.invalidate({ clientId: clientId ?? undefined })
      }
    }
  })
}
