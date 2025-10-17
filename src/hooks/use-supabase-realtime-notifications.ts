"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getQueryKey } from "@trpc/react-query"
import { Logger } from "@/lib/utils/client-utils"
import { useNotificationStore } from "@/store/notifications-store"
import { api } from "@/trpc/react"
import type { Notification } from "@/domain/Notificaciones"
import { getChannelManager, buildNotificationsChannelName } from "@/lib/realtime"
import type { UnsubscribeFn } from "@/lib/realtime"

interface UseSupabaseRealtimeNotificationsOptions {
  clientId: string
  userId?: string | null
  enabled?: boolean
}

/**
 * Hook para suscribirse a cambios en tiempo real de notificaciones usando Supabase Realtime
 *
 * Este hook utiliza el Channel Manager centralizado para gestión eficiente de canales.
 * 
 * Este hook:
 * - Se suscribe a INSERT, UPDATE y DELETE en la tabla `Notification`
 * - Invalida queries de tRPC cuando detecta cambios
 * - Actualiza el contador de no leídas en el store
 * - Maneja la suscripción y limpieza automáticamente via Channel Manager
 * - Previene duplicación de canales si múltiples componentes usan el hook
 */
export function useSupabaseRealtimeNotifications({
  clientId,
  userId,
  enabled = true
}: UseSupabaseRealtimeNotificationsOptions) {
  const queryClient = useQueryClient()
  const unsubscribersRef = useRef<UnsubscribeFn[]>([])
  const { incrementUnreadCount, decrementUnreadCount } = useNotificationStore()

  useEffect(() => {
    if (!enabled || !clientId) {
      return
    }

    // Obtener instancia del Channel Manager
    const channelManager = getChannelManager()

    // Generar nombre del canal siguiendo convención
    const channelName = buildNotificationsChannelName(clientId, userId)

    Logger.log(`🔔 [Realtime] Subscribing to notifications channel: ${channelName}`)

    // Filtro para notificaciones del cliente (y opcionalmente del usuario)
    const filter = userId
      ? `clientId=eq.${clientId}&userId=eq.${userId}`
      : `clientId=eq.${clientId}`

    // Función helper para invalidar queries
    function invalidateNotificationQueries() {
      // Invalidar lista de notificaciones
      queryClient.invalidateQueries({
        queryKey: getQueryKey(
          // @ts-expect-error - tRPC types
          api.notificaciones.list,
          undefined,
          "query"
        )
      })

      // Invalidar estadísticas
      queryClient.invalidateQueries({
        queryKey: getQueryKey(
          // @ts-expect-error - tRPC types
          api.notificaciones.getStats,
          { clientId, userId },
          "query"
        )
      })

      // Invalidar contador de no leídas
      queryClient.invalidateQueries({
        queryKey: getQueryKey(
          // @ts-expect-error - tRPC types
          api.notificaciones.getUnreadCount,
          { clientId, userId },
          "query"
        )
      })
    }

    // Suscribirse a INSERTS usando Channel Manager
    const unsubscribeInsert = channelManager.subscribe<Notification>(
      channelName,
      {
        event: "INSERT",
        schema: "public",
        table: "Notification",
        filter
      },
      (payload) => {
        Logger.log("🔔 [Realtime] New notification received:", payload.new)
        invalidateNotificationQueries()

        if (!payload.new.read) {
          incrementUnreadCount()
        }
      }
    )

    // Suscribirse a UPDATES usando Channel Manager
    const unsubscribeUpdate = channelManager.subscribe<Notification>(
      channelName,
      {
        event: "UPDATE",
        schema: "public",
        table: "Notification",
        filter
      },
      (payload) => {
        Logger.log("🔔 [Realtime] Notification updated:", payload.new)
        invalidateNotificationQueries()

        if (payload.old && payload.new) {
          const wasUnread = !payload.old.read
          const isUnread = !payload.new.read

          if (wasUnread && !isUnread) {
            decrementUnreadCount()
          } else if (!wasUnread && isUnread) {
            incrementUnreadCount()
          }
        }
      }
    )

    // Suscribirse a DELETES usando Channel Manager
    const unsubscribeDelete = channelManager.subscribe<Notification>(
      channelName,
      {
        event: "DELETE",
        schema: "public",
        table: "Notification",
        filter
      },
      (payload) => {
        Logger.log("🔔 [Realtime] Notification deleted:", payload.old)
        invalidateNotificationQueries()

        if (payload.old && !payload.old.read) {
          decrementUnreadCount()
        }
      }
    )

    // Guardar funciones de limpieza
    unsubscribersRef.current = [unsubscribeInsert, unsubscribeUpdate, unsubscribeDelete]

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      Logger.log(`🔔 [Realtime] Unsubscribing from ${channelName}`)
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe())
      unsubscribersRef.current = []
    }
  }, [clientId, userId, enabled, queryClient, incrementUnreadCount, decrementUnreadCount])

  return {
    isSubscribed: unsubscribersRef.current.length > 0
  }
}
