"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/trpc/react'
import { realtimeManager } from '../../_lib'
import type { UIMessage } from '@/domain/Conversaciones'

interface UseMessagesRealtimeProps {
  conversationId: string
  clientId: string
  enabled: boolean
  onMessageInserted?: (message: UIMessage) => void
  onMessageUpdated?: (message: UIMessage) => void
  onMessageDeleted?: (messageId: string) => void
}

interface UseMessagesRealtimeReturn {
  connectionError: string | null
  reconnect: () => void
}

/**
 * Hook especializado para suscripción Realtime de mensajes
 * SOLO responsable de gestionar la conexión en tiempo real y notificar cambios
 */
export function useMessagesRealtime({
  conversationId,
  clientId,
  enabled,
  onMessageInserted,
  onMessageUpdated,
  onMessageDeleted
}: UseMessagesRealtimeProps): UseMessagesRealtimeReturn {
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [reconnectTrigger, setReconnectTrigger] = useState(0)

  const utils = api.useUtils()
  const utilsRef = useRef(utils)

  // Sincronizar ref cuando utils cambia
  useEffect(() => {
    utilsRef.current = utils
  }, [utils])

  // Setup del canal Realtime
  useEffect(() => {
    if (!enabled || !conversationId?.trim() || !clientId?.trim()) return

    // Limpiar error de conexión al inicio
    setConnectionError(null)

    const channelName = `pipelines-messages:${conversationId}`
    let mounted = true

    const setupChannel = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Pipelines-useMessagesRealtime] 🚀 Suscribiendo canal:', channelName)
        }

        await realtimeManager.getOrCreateChannel(
          channelName,
          (ch) => ch
            // INSERT - Nuevo mensaje
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'Message',
                filter: `conversationId=eq.${conversationId}`
              },
              (payload) => {
                if (!mounted) return

                const newMessage = payload.new as UIMessage

                if (process.env.NODE_ENV === 'development') {
                  console.log('[Pipelines-useMessagesRealtime] ➕ Nuevo mensaje realtime:', newMessage.id)
                }

                // Notificar al callback
                onMessageInserted?.(newMessage)

                // Invalidar React Query para que refresque
                void utilsRef.current.conversaciones.listMessages.invalidate({
                  conversationId,
                  clientId
                })
              }
            )
            // UPDATE - Mensaje actualizado
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'Message',
                filter: `conversationId=eq.${conversationId}`
              },
              (payload) => {
                if (!mounted) return

                const updatedMessage = payload.new as UIMessage

                if (process.env.NODE_ENV === 'development') {
                  console.log('[Pipelines-useMessagesRealtime] 🔄 Mensaje actualizado:', updatedMessage.id)
                }

                // Notificar al callback
                onMessageUpdated?.(updatedMessage)

                // Invalidar React Query
                void utilsRef.current.conversaciones.listMessages.invalidate({
                  conversationId,
                  clientId
                })
              }
            )
            // DELETE - Mensaje eliminado
            .on(
              'postgres_changes',
              {
                event: 'DELETE',
                schema: 'public',
                table: 'Message',
                filter: `conversationId=eq.${conversationId}`
              },
              (payload) => {
                if (!mounted) return

                const deletedMessageId = (payload.old as { id: string }).id

                if (process.env.NODE_ENV === 'development') {
                  console.log('[Pipelines-useMessagesRealtime] 🗑️ Mensaje eliminado:', deletedMessageId)
                }

                // Notificar al callback
                onMessageDeleted?.(deletedMessageId)

                // Invalidar React Query
                void utilsRef.current.conversaciones.listMessages.invalidate({
                  conversationId,
                  clientId
                })
              }
            )
            .subscribe((status) => {
              if (!mounted) return

              if (process.env.NODE_ENV === 'development') {
                console.log('[Pipelines-useMessagesRealtime] 📡 Canal:', status)
              }

              // Si la suscripción fue exitosa, limpiar error
              if (status === 'SUBSCRIBED') {
                setConnectionError(null)
              }
            })
        )

      } catch (error) {
        if (!mounted) return

        console.error('[Pipelines-useMessagesRealtime] ❌ Error canal:', error)

        const errorMessage = error instanceof Error
          ? error.message
          : 'Error de conexión con el servidor de mensajes'

        setConnectionError(errorMessage)
      }
    }

    void setupChannel()

    // Cleanup
    return () => {
      mounted = false

      if (process.env.NODE_ENV === 'development') {
        console.log('[Pipelines-useMessagesRealtime] 🧹 Cleanup canal:', channelName)
      }

      // Cleanup asíncrono sin bloquear
      void realtimeManager.removeChannel(channelName)
    }
  }, [conversationId, clientId, enabled, reconnectTrigger, onMessageInserted, onMessageUpdated, onMessageDeleted])

  const reconnect = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Pipelines-useMessagesRealtime] 🔄 Forzando reconexión...')
    }
    setReconnectTrigger(v => v + 1)
  }, [])

  return {
    connectionError,
    reconnect
  }
}

