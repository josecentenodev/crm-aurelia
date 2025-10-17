/**
 * Hook orquestador para manejo de mensajes con Realtime
 *
 * ARQUITECTURA REFACTORIZADA:
 * 1. React Query es la SOURCE OF TRUTH para los datos (useMessagesQuery)
 * 2. Estado local SOLO para mensajes temporales (useOptimisticMessages)
 * 3. Canal realtime en hook separado (useMessagesRealtime)
 * 4. Este hook orquesta los 3 componentes especializados
 */

"use client"

import { useCallback, useEffect } from 'react'
import { useMessagesQuery } from './use-messages-query'
import { useOptimisticMessages } from './use-optimistic-messages'
import { useMessagesRealtime } from './use-messages-realtime'
import type { UIMessage, TemporaryMessage } from '@/domain/Conversaciones'

interface UseMessagesProps {
  conversationId: string
  clientId: string
  enabled?: boolean
}

interface UseMessagesReturn {
  messages: Array<UIMessage | TemporaryMessage>
  isLoading: boolean
  error: Error | null
  connectionError: string | null
  reconnect: () => void
  addTemporaryMessage: (message: TemporaryMessage) => void
  removeTemporaryMessage: (messageId: string) => void
  updateTemporaryMessage: (messageId: string, updates: Partial<TemporaryMessage>) => void
}

export function useMessages({
  conversationId,
  clientId,
  enabled = true
}: UseMessagesProps): UseMessagesReturn {

  // ============================================
  // 1. QUERY - Obtener mensajes del servidor
  // ============================================
  const { messages: serverMessages, isLoading, error } = useMessagesQuery({
    conversationId,
    clientId,
    enabled
  })

  // ============================================
  // 2. OPTIMISTIC UI - Gestionar mensajes temporales
  // ============================================
  const {
    allMessages,
    addTemporaryMessage,
    removeTemporaryMessage,
    updateTemporaryMessage,
    clearTemporaryMessages
  } = useOptimisticMessages({
    serverMessages
  })

  // ============================================
  // 3. REALTIME - Suscripción a cambios en tiempo real
  // ============================================
  const handleMessageInserted = useCallback((newMessage: UIMessage) => {
    // Remover temporal si existe (ya llegó el real)
    removeTemporaryMessage(newMessage.id)
  }, [removeTemporaryMessage])

  const { connectionError, reconnect } = useMessagesRealtime({
    conversationId,
    clientId,
    enabled,
    onMessageInserted: handleMessageInserted
  })

  // ============================================
  // CLEANUP - Limpiar temporales al cambiar conversación
  // ============================================
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Pipelines-useMessages] 🧹 Limpiando temporales para conversación:', conversationId)
    }
    clearTemporaryMessages()
  }, [conversationId, clearTemporaryMessages])

  return {
    messages: allMessages,
    isLoading,
    error,
    connectionError,
    reconnect,
    addTemporaryMessage,
    removeTemporaryMessage,
    updateTemporaryMessage,
  }
}

