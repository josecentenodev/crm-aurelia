/**
 * Hook para fetching de mensajes via tRPC
 * Responsabilidad única: proporcionar acceso al cache de tRPC
 * RESPETA EL CACHE - no resetea innecesariamente
 * NO maneja realtime, NO maneja optimistic updates
 */

"use client"

import { useMemo } from 'react'
import { api } from '@/trpc/react'
import type { UIMessage } from '@/domain/Conversaciones'

interface UseMessagesDataProps {
  conversationId: string
  clientId: string
  enabled: boolean
}

interface UseMessagesDataReturn {
  messages: UIMessage[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Normaliza fecha createdAt a Date con timezone UTC si falta
 */
function normalizeMessageDate(message: UIMessage): UIMessage {
  const created = typeof message.createdAt === 'string'
    ? message.createdAt
    : (message.createdAt as unknown as Date).toISOString()

  const hasZone = /Z|[+-]\d{2}:?\d{2}$/.test(created)
  const iso = hasZone ? created : `${created}Z`

  return { ...message, createdAt: new Date(iso) }
}

export function useMessagesData({
  conversationId,
  clientId,
  enabled
}: UseMessagesDataProps): UseMessagesDataReturn {

  // tRPC query - RESPETA EL CACHE automáticamente
  // React Query mantiene cache por [conversationId, clientId]
  const {
    data: cachedMessages,
    isLoading,
    error: queryError,
    refetch: refetchQuery
  } = api.conversaciones.listMessages.useQuery(
    { conversationId, clientId },
    {
      enabled,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache válido por 5 minutos
      cacheTime: 30 * 60 * 1000, // Mantener en memoria 30 minutos
      retry: 2,
    }
  )

  // Normalizar mensajes solo cuando cambian (memoizado)
  const messages = useMemo(() => {
    if (!cachedMessages) return []

    if (process.env.NODE_ENV === 'development') {
      console.log('[useMessagesData] 📦 Mensajes desde cache/servidor:', cachedMessages.length)
    }

    return (cachedMessages as UIMessage[]).map(normalizeMessageDate)
  }, [cachedMessages])

  return {
    messages,
    isLoading,
    error: queryError as Error | null,
    refetch: refetchQuery
  }
}
