"use client"

import { createContext, useContext, useRef, useEffect, ReactNode } from 'react'
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime'
import { useRealtimeFallback } from '@/hooks/use-realtime-fallback'
import { useClientContext } from './ClientProvider'
import { logRealtimeEvent, logRealtimeError, useRealtimeDebug } from '@/lib/realtime-debug'

interface ConversationEvent {
  type: 'message:new' | 'message:update' | 'conversation:update' | 'conversation:new' | 'conversation:delete'
  conversationId: string
  messageId?: string
  clientId: string
  data?: any
}

interface RealtimeContextType {
  isConnected: boolean
  reconnect: () => void
  disconnect: () => void
  subscribe: (callback: (event: ConversationEvent) => void) => () => void
  connectionState: any
  // Fallback
  isUsingFallback: boolean
  fallbackState: any
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { clientId } = useClientContext()
  const subscribersRef = useRef<Set<(event: ConversationEvent) => void>>(new Set())
  const isInitializedRef = useRef(false)

  // Hook de fallback robusto
  const fallback = useRealtimeFallback(clientId, {
    enabled: true,
    pollInterval: 8000, // 8 segundos
    maxRetries: 3,
    retryDelay: 5000
  })

  // Handler que distribuye eventos a todos los suscriptores
  const handleEvent = (event: ConversationEvent) => {
    console.log(`[RealtimeProvider] Distributing event to ${subscribersRef.current.size} subscribers:`, event.type)
    
    // Logging para debugging
    logRealtimeEvent('event_distributed', {
      type: event.type,
      conversationId: event.conversationId,
      messageId: event.messageId,
      subscriberCount: subscribersRef.current.size,
      isMultimedia: event.data?.isMultimedia || false,
      messageType: event.data?.messageType
    })
    
    // Marcar evento realtime para fallback
    fallback.markRealtimeEvent()
    
    subscribersRef.current.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error(`[RealtimeProvider] Error in subscriber callback:`, error)
        logRealtimeError(`Subscriber callback error: ${error}`)
      }
    })
  }

  // Hook de realtime singleton
  const realtimeState = useSupabaseRealtime({
    clientId,
    onEvent: handleEvent,
    onConnectionChange: (connected) => {
      console.log(`[RealtimeProvider] Connection status: ${connected ? 'connected' : 'disconnected'}`)
      logRealtimeEvent('connection_change', { connected, clientId })
    },
    onError: (error) => {
      console.error('[RealtimeProvider] Realtime error:', error)
      logRealtimeError(`Realtime error: ${error}`)
    },
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  })

  // Debugging en desarrollo
  const debugInfo = useRealtimeDebug(clientId, realtimeState.isConnected, fallback.isUsingFallback)

  // Función para suscribirse a eventos
  const subscribe = (callback: (event: ConversationEvent) => void) => {
    console.log(`[RealtimeProvider] New subscriber added, total: ${subscribersRef.current.size + 1}`)
    subscribersRef.current.add(callback)

    // Retornar función de limpieza
    return () => {
      subscribersRef.current.delete(callback)
      console.log(`[RealtimeProvider] Subscriber removed, total: ${subscribersRef.current.size}`)
    }
  }

  // Limpiar suscriptores cuando el cliente cambia
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log(`[RealtimeProvider] ClientId changed, clearing ${subscribersRef.current.size} subscribers`)
      subscribersRef.current.clear()
    }
    isInitializedRef.current = true
  }, [clientId])

  const contextValue: RealtimeContextType = {
    isConnected: realtimeState.isConnected,
    reconnect: realtimeState.reconnect,
    disconnect: realtimeState.disconnect,
    subscribe,
    connectionState: realtimeState.connectionState,
    // Fallback
    isUsingFallback: fallback.isUsingFallback,
    fallbackState: {
      lastPollTime: fallback.lastPollTime,
      retryCount: fallback.retryCount,
      nextPollIn: fallback.nextPollIn
    }
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

// Hook simplificado para componentes que solo necesitan suscribirse
export function useRealtimeSubscription(callback: (event: ConversationEvent) => void) {
  const { subscribe } = useRealtime()
  
  useEffect(() => {
    const unsubscribe = subscribe(callback)
    return unsubscribe
  }, [subscribe, callback])
}
