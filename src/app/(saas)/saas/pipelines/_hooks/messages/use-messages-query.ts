"use client"

import { api } from '@/trpc/react'
import type { UIMessage } from '@/domain/Conversaciones'

interface UseMessagesQueryProps {
  conversationId: string
  clientId: string
  enabled: boolean
}

interface UseMessagesQueryReturn {
  messages: UIMessage[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook especializado para la query de mensajes
 * SOLO responsable de obtener datos del servidor vía tRPC
 */
export function useMessagesQuery({
  conversationId,
  clientId,
  enabled
}: UseMessagesQueryProps): UseMessagesQueryReturn {
  const {
    data: messagesFromServer,
    isLoading,
    error: queryError,
  } = api.conversaciones.listMessages.useQuery(
    { conversationId, clientId },
    {
      enabled: enabled && !!conversationId && !!clientId,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 segundos
    }
  )

  return {
    messages: (messagesFromServer as UIMessage[] | undefined) ?? [],
    isLoading,
    error: queryError as Error | null
  }
}

