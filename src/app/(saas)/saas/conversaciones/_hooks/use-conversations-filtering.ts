/**
 * Hook de lógica de negocio para filtrado y conteo de conversaciones
 * Separa la lógica de cálculo del renderizado
 * Memoiza cálculos pesados para performance
 */

"use client"

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import type { ConversationCategory, ChatConversationsByInstance, ChatConversation } from '../_types/conversations.types'

interface UseConversationsFilteringProps {
  conversationsData: ChatConversationsByInstance[]
  selectedCategory: ConversationCategory
}

interface CategoryCounts {
  all: number
  unassigned: number
  mine: number
  new: number
  archived: number
}

interface UseConversationsFilteringReturn {
  filteredGroups: ChatConversationsByInstance[]
  categoryCounts: CategoryCounts
}

/**
 * Calcula conteos de categorías a partir de los datos
 * Los conteos se calculan sobre todos los datos (sin filtrar por categoría)
 * para mostrar la cantidad real de conversaciones en cada categoría
 */
function calculateCategoryCounts(
  grouped: ChatConversationsByInstance[],
  currentUserId?: string
): CategoryCounts {
  let all = 0
  let unassigned = 0
  let mine = 0
  let newly = 0
  let archived = 0

  for (const group of grouped) {
    for (const c of (group.conversations ?? [])) {
      const conv = c as ChatConversation
      all++

      // Conteo de asignación
      if (!conv.assignedUser) {
        unassigned++
      } else if (conv.assignedUser.id === currentUserId) {
        mine++
      }

      // Conteo de status
      if (conv.status === 'ACTIVA') newly++
      if (conv.status === 'ARCHIVADA') archived++
    }
  }

  return { all, unassigned, mine, new: newly, archived }
}

/**
 * Filtra conversaciones según la categoría seleccionada
 */
function filterConversationsByCategory(
  grouped: ChatConversationsByInstance[],
  category: ConversationCategory,
  currentUserId?: string
): ChatConversationsByInstance[] {
  if (!grouped?.length) return []

  // Si es 'all', retornar todos los grupos sin filtrar
  if (category === 'all') {
    return grouped
  }

  // Para otras categorías, filtrar conversaciones dentro de cada grupo
  return grouped
    .map(group => {
      const filteredConversations = group.conversations.filter(conversation => {
        switch (category) {
          case 'unassigned':
            return !conversation.assignedUser
          case 'mine':
            // Filtrar por conversaciones asignadas al usuario actual
            return conversation.assignedUser?.id === currentUserId
          case 'new':
            return conversation.status === 'ACTIVA'
          case 'archived':
            return conversation.status === 'ARCHIVADA'
          default:
            return true
        }
      })

      return {
        ...group,
        conversations: filteredConversations,
        stats: {
          ...group.stats,
          total: filteredConversations.length
        }
      }
    })
    .filter(group => group.conversations.length > 0) // Solo grupos con conversaciones
}

/**
 * Hook que encapsula la lógica de filtrado y conteo
 */
export function useConversationsFiltering({
  conversationsData,
  selectedCategory
}: UseConversationsFilteringProps): UseConversationsFilteringReturn {
  // Obtener el ID del usuario actual de la sesión
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  // Calcular conteos (memoizado) - incluye currentUserId para calcular "mine" correctamente
  const categoryCounts = useMemo(
    () => calculateCategoryCounts(conversationsData, currentUserId),
    [conversationsData, currentUserId]
  )

  // Filtrar grupos (memoizado)
  const filteredGroups = useMemo(
    () => filterConversationsByCategory(conversationsData, selectedCategory, currentUserId),
    [conversationsData, selectedCategory, currentUserId]
  )

  return {
    filteredGroups,
    categoryCounts
  }
}

