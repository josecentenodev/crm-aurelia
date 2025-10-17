"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface PlaygroundMessage {
  id: string
  sessionId: string
  content: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  senderId?: string | null
  senderName?: string | null
  senderType?: string | null
  metadata?: any
  createdAt: Date
  updatedAt: Date
  rating?: number | null
  feedback?: string | null
}

interface UsePlaygroundRealtimeParams {
  sessionId: string | null
  onNewMessage?: (message: PlaygroundMessage) => void
  onMessageDelete?: (messageId: string) => void
  enabled?: boolean
}

interface UsePlaygroundRealtimeReturn {
  isConnected: boolean
  connectionError: string | null
  subscribe: () => void
  unsubscribe: () => void
}

/**
 * Hook personalizado para manejar realtime de mensajes del playground
 * 
 * Características:
 * - Suscripción a cambios en PlaygroundMessage para una sesión específica
 * - Manejo automático de conexión/desconexión
 * - Callbacks para diferentes tipos de eventos
 * - Compatible con Vercel (sin WebSockets)
 */
export function usePlaygroundRealtime({
  sessionId,
  onNewMessage,
  onMessageDelete,
  enabled = true
}: UsePlaygroundRealtimeParams): UsePlaygroundRealtimeReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isSubscribedRef = useRef(false)

  // Callbacks refs para evitar dependencias en useEffect
  const onNewMessageRef = useRef(onNewMessage)
  const onMessageDeleteRef = useRef(onMessageDelete)

  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  useEffect(() => {
    onMessageDeleteRef.current = onMessageDelete
  }, [onMessageDelete])

  // Handler para cambios en tiempo real
  const handleRealtimeChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    try {
      console.log('[usePlaygroundRealtime] Received change:', payload.eventType, payload)
      if (payload.eventType === "INSERT"
        && payload.new
        && onNewMessageRef.current
      ) {
        onNewMessageRef.current({
          id: payload.new.id,
          sessionId: payload.new.sessionId,
          content: payload.new.content,
          role: payload.new.role,
          senderId: payload.new.senderId,
          senderName: payload.new.senderName,
          senderType: payload.new.senderType,
          metadata: payload.new.metadata,
          createdAt: new Date(payload.new.createdAt),
          updatedAt: new Date(payload.new.updatedAt),
          rating: payload.new.rating,
          feedback: payload.new.feedback
        });
      }
    } catch (error) {
      console.error('[usePlaygroundRealtime] Error handling realtime change:', error)
      setConnectionError(error instanceof Error ? error.message : 'Error desconocido')
    }
  }, [])

  // Función para suscribirse
  const subscribe = useCallback(() => {
    if (!sessionId || !enabled || isSubscribedRef.current) {
      return
    }

    console.log('[usePlaygroundRealtime] Subscribing to session:', sessionId)

    try {
      // Crear canal específico para esta sesión
      const supabase = getSupabaseClient()
      const channel = supabase.channel(
        `playground-messages-${sessionId}`
      ).on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'PlaygroundMessage',
          filter: `sessionId=eq.${sessionId}`
        },
        handleRealtimeChange
      ).subscribe((status) => {
        console.log('[usePlaygroundRealtime] Subscription status:', status)

        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setConnectionError(null)
          isSubscribedRef.current = true
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          setConnectionError(`Error de conexión: ${status}`)
          isSubscribedRef.current = false
        }
      })

      channelRef.current = channel
    } catch (error) {
      console.error('[usePlaygroundRealtime] Error subscribing:', error)
      setConnectionError(error instanceof Error ? error.message : 'Error de suscripción')
      setIsConnected(false)
    }
  }, [sessionId, enabled, handleRealtimeChange])

  // Función para desuscribirse
  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      console.log('[usePlaygroundRealtime] Unsubscribing from session:', sessionId)
      
      try {
        const supabase = getSupabaseClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        isSubscribedRef.current = false
        setIsConnected(false)
        setConnectionError(null)
      } catch (error) {
        console.error('[usePlaygroundRealtime] Error unsubscribing:', error)
      }
    }
  }, [sessionId])

  // Suscribirse cuando cambia sessionId o enabled
  useEffect(() => {
    if (sessionId && enabled) {
      subscribe()
    } else {
      unsubscribe()
    }

    // Cleanup al desmontar o cambiar dependencias
    return () => {
      unsubscribe()
    }
  }, [sessionId, enabled, subscribe, unsubscribe])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      unsubscribe()
    }
  }, [unsubscribe])

  return {
    isConnected,
    connectionError,
    subscribe,
    unsubscribe
  }
}

