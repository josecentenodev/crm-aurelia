"use client"

import { useState, useCallback, useRef, useMemo } from 'react'
import type { UIMessage, TemporaryMessage } from '@/domain/Conversaciones'

interface UseOptimisticMessagesProps {
  serverMessages: UIMessage[]
}

interface UseOptimisticMessagesReturn {
  allMessages: Array<UIMessage | TemporaryMessage>
  addTemporaryMessage: (message: TemporaryMessage) => void
  removeTemporaryMessage: (messageId: string) => void
  updateTemporaryMessage: (messageId: string, updates: Partial<TemporaryMessage>) => void
  clearTemporaryMessages: () => void
}

/**
 * Hook especializado para manejo de mensajes temporales (optimistic UI)
 * SOLO responsable de gestionar el estado de mensajes temporales y combinarlos con los reales
 */
export function useOptimisticMessages({
  serverMessages
}: UseOptimisticMessagesProps): UseOptimisticMessagesReturn {
  const temporaryMessagesRef = useRef<TemporaryMessage[]>([])
  const [, forceUpdate] = useState(0)

  const addTemporaryMessage = useCallback((message: TemporaryMessage) => {
    const current = temporaryMessagesRef.current
    // Evitar duplicados
    if (current.some(m => m.id === message.id)) return

    temporaryMessagesRef.current = [...current, message]
    forceUpdate(v => v + 1)

    if (process.env.NODE_ENV === 'development') {
      console.log('[useOptimisticMessages] ➕ Temporal agregado:', message.id)
    }
  }, [])

  const removeTemporaryMessage = useCallback((messageId: string) => {
    temporaryMessagesRef.current = temporaryMessagesRef.current.filter(
      m => m.id !== messageId
    )
    forceUpdate(v => v + 1)

    if (process.env.NODE_ENV === 'development') {
      console.log('[useOptimisticMessages] ➖ Temporal removido:', messageId)
    }
  }, [])

  const updateTemporaryMessage = useCallback((messageId: string, updates: Partial<TemporaryMessage>) => {
    temporaryMessagesRef.current = temporaryMessagesRef.current.map(m =>
      m.id === messageId ? { ...m, ...updates } : m
    )
    forceUpdate(v => v + 1)

    if (process.env.NODE_ENV === 'development') {
      console.log('[useOptimisticMessages] 🔄 Temporal actualizado:', messageId, updates)
    }
  }, [])

  const clearTemporaryMessages = useCallback(() => {
    temporaryMessagesRef.current = []
    forceUpdate(v => v + 1)

    if (process.env.NODE_ENV === 'development') {
      console.log('[useOptimisticMessages] 🧹 Limpiando todos los temporales')
    }
  }, [])

  // Combinar mensajes del servidor + temporales
  const allMessages = useMemo(() => {
    // Indexar por ID para búsqueda rápida
    const serverIds = new Set(serverMessages.map(m => m.id))

    // Agregar solo temporales que NO existan en servidor
    const temporals = temporaryMessagesRef.current.filter(t => !serverIds.has(t.id))

    // Combinar
    const combined: Array<UIMessage | TemporaryMessage> = [...serverMessages, ...temporals]

    // Ordenar por fecha de creación
    combined.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    if (process.env.NODE_ENV === 'development') {
      console.log('[useOptimisticMessages] 📊 Mensajes:', {
        servidor: serverMessages.length,
        temporales: temporals.length,
        total: combined.length
      })
    }

    return combined
  }, [serverMessages])

  return {
    allMessages,
    addTemporaryMessage,
    removeTemporaryMessage,
    updateTemporaryMessage,
    clearTemporaryMessages
  }
}

