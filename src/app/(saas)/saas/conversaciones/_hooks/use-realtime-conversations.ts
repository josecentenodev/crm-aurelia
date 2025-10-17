"use client"

import { useEffect, useRef, useCallback } from 'react'
import { realtimeManager } from '../_lib'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeConversationsProps {
  clientId: string | null
  enabled: boolean
  onInvalidate: () => void
}

interface UseRealtimeConversationsReturn {
  cleanup: () => void
}

export function useRealtimeConversations({
  clientId,
  enabled,
  onInvalidate
}: UseRealtimeConversationsProps): UseRealtimeConversationsReturn {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isMountedRef = useRef(true)

  const invalidateRef = useRef(onInvalidate)

  useEffect(() => {
    invalidateRef.current = onInvalidate
  }, [onInvalidate])
  
  useEffect(() => {
    isMountedRef.current = true

    if (!clientId || !enabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useRealtimeConversations] ⏸️ Deshabilitado', { clientId, enabled })
      }
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[useRealtimeConversations] 🚀 Iniciando suscripción')
    }

    const channelName = `conversations:sidebar:${clientId}`

    const setupChannel = async () => {
      try {
        const channel = await realtimeManager.getOrCreateChannel(channelName, (ch) => ch
        // Cambios en Conversation
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'Conversation',
            filter: `clientId=eq.${clientId}`
          },
          (payload) => {
            // Check if still mounted before processing events
            if (!isMountedRef.current) return

            if (process.env.NODE_ENV === 'development') {
              console.log('[useRealtimeConversations] 📝 Conversation:', payload.eventType)
            }
            invalidateRef.current()
          }
        )
        // Nuevos mensajes
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Message'
          },
          () => {
            // Check if still mounted before processing events
            if (!isMountedRef.current) return

            if (process.env.NODE_ENV === 'development') {
              console.log('[useRealtimeConversations] 💬 Nuevo mensaje')
            }
            invalidateRef.current()
          }
        )
        .subscribe((status) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useRealtimeConversations] 📡 Estado:', status)
          }
        })
      )

      channelRef.current = channel
      } catch (error) {
        console.error('[useRealtimeConversations] Error en setup:', error)
      }
    }

    void setupChannel()

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useRealtimeConversations] 🧹 Cleanup effect')
      }

      // Mark as unmounted IMMEDIATELY (synchronous)
      isMountedRef.current = false

      // Synchronous unsubscribe to stop receiving events immediately
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe()
        } catch (error) {
          console.warn('[useRealtimeConversations] Error in sync unsubscribe:', error)
        }
      }

      // Async cleanup can happen in background
      realtimeManager.removeChannel(channelName).catch(error => {
        console.warn('[useRealtimeConversations] Error in async cleanup:', error)
      })

      channelRef.current = null
    }
  }, [clientId, enabled])
  
  const manualCleanup = useCallback(async () => {
    if (clientId) {
      const channelName = `conversations:sidebar:${clientId}`
      await realtimeManager.removeChannel(channelName)
      channelRef.current = null
    }
  }, [clientId])
  
  return {
    cleanup: manualCleanup
  }
}

