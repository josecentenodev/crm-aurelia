/**
 * Hook para acciones de conversación con invalidaciones correctas
 * Maneja archivar, desarchivar, marcar como importante y asignar usuarios
 */

"use client"

import { useState, useCallback } from 'react'
import { api } from '@/trpc/react'
import { useToast } from '@/hooks/use-toast'
import { useClientContext } from '@/providers/ClientProvider'
import { useChatsFiltersStore } from '../_store/chats-filters-store'
import { invalidateConversationData } from '../_utils/trpc-invalidations'
import { getUserFriendlyErrorMessage } from '../_utils/error-messages'
import type { ChatConversation } from '../_types/conversations.types'
import type { ConversationStatus } from '@/domain/Conversaciones'

interface UseOptimisticConversationActionsProps {
  conversation: ChatConversation
  onConversationUpdate?: (updatedConversation: ChatConversation) => void
}

interface UseOptimisticConversationActionsReturn {
  isArchiving: boolean
  isTogglingImportant: boolean
  isAssigningUser: boolean
  isChangingStatus: boolean
  handleArchiveToggle: () => Promise<void>
  handleImportantToggle: () => Promise<void>
  handleUserAssignment: (userId: string | null) => Promise<void>
  handleStatusChange: (newStatus: ConversationStatus, reason?: string) => Promise<void>
  showErrorDialog: boolean
  setShowErrorDialog: (show: boolean) => void
  errorMessage: string
}

export function useOptimisticConversationActions({
  conversation,
  onConversationUpdate: _onConversationUpdate
}: UseOptimisticConversationActionsProps): UseOptimisticConversationActionsReturn {
  const [isArchiving, setIsArchiving] = useState(false)
  const [isTogglingImportant, setIsTogglingImportant] = useState(false)
  const [isAssigningUser, setIsAssigningUser] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { toast } = useToast()
  const utils = api.useUtils()
  const { clientId } = useClientContext()
  const { getTrpcFilters } = useChatsFiltersStore() // Obtener filtros actuales para invalidación precisa

  // Mutación para archivar/desarchivar
  const archiveMutation = api.conversaciones.update.useMutation({
    onSuccess: (updatedConversation) => {
      // Invalidar usando helper centralizado
      if (clientId) {
        const currentFilters = getTrpcFilters()
        invalidateConversationData(utils, clientId, updatedConversation.id, currentFilters)
      }

      toast({
        title: updatedConversation.status === 'ARCHIVADA' ? 'Conversación archivada' : 'Conversación desarchivada',
        description: updatedConversation.status === 'ARCHIVADA'
          ? 'La conversación se movió a la sección de archivadas'
          : 'La conversación volvió a estar activa'
      })
    },

    onError: (error) => {
      const errorMsg = getUserFriendlyErrorMessage(error)
      setErrorMessage(errorMsg)
      setShowErrorDialog(true)

      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive'
      })
    },

    onSettled: () => {
      setIsArchiving(false)
    }
  })

  // Mutación para marcar como importante
  const importantMutation = api.conversaciones.update.useMutation({
    onSuccess: (updatedConversation) => {
      // Invalidar usando helper centralizado
      if (clientId) {
        const currentFilters = getTrpcFilters()
        invalidateConversationData(utils, clientId, updatedConversation.id, currentFilters)
      }

      toast({
        title: updatedConversation.isImportant ? 'Marcada como importante' : 'Removida de importantes',
        description: updatedConversation.isImportant
          ? 'La conversación ahora está marcada como importante'
          : 'La conversación ya no está marcada como importante'
      })
    },

    onError: (error) => {
      const errorMsg = getUserFriendlyErrorMessage(error)
      setErrorMessage(errorMsg)
      setShowErrorDialog(true)

      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive'
      })
    },

    onSettled: () => {
      setIsTogglingImportant(false)
    }
  })

  const handleArchiveToggle = useCallback(async () => {
    if (!conversation) return

    setIsArchiving(true)
    setShowErrorDialog(false)

    try {
      await archiveMutation.mutateAsync({
        id: conversation.id,
        status: conversation.status === 'ARCHIVADA' ? 'ACTIVA' : 'ARCHIVADA'
      })
    } catch (error) {
      // Error ya manejado en onError
      console.error('Archive toggle failed:', error)
    }
  }, [conversation, archiveMutation])

  const handleImportantToggle = useCallback(async () => {
    if (!conversation) return

    setIsTogglingImportant(true)
    setShowErrorDialog(false)

    try {
      await importantMutation.mutateAsync({
        id: conversation.id,
        isImportant: !conversation.isImportant
      })
    } catch (error) {
      // Error ya manejado en onError
      console.error('Important toggle failed:', error)
    }
  }, [conversation, importantMutation])

  // Mutación para asignación de usuarios
  const userAssignmentMutation = api.conversaciones.update.useMutation({
    onSuccess: (updatedConversation) => {
      // Invalidar usando helper centralizado
      if (clientId) {
        const currentFilters = getTrpcFilters()
        invalidateConversationData(utils, clientId, updatedConversation.id, currentFilters)
      }

      const isAssigning = !!updatedConversation.assignedUserId

      toast({
        title: isAssigning ? 'Usuario asignado' : 'Asignación removida',
        description: isAssigning
          ? 'La conversación fue asignada correctamente'
          : 'Se removió la asignación de la conversación'
      })
    },

    onError: (error) => {
      const errorMsg = getUserFriendlyErrorMessage(error)
      setErrorMessage(errorMsg)
      setShowErrorDialog(true)

      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive'
      })
    },

    onSettled: () => {
      setIsAssigningUser(false)
    }
  })

  const handleUserAssignment = useCallback(async (userId: string | null) => {
    if (!conversation) return

    setIsAssigningUser(true)
    setShowErrorDialog(false)

    try {
      await userAssignmentMutation.mutateAsync({
        id: conversation.id,
        assignedUserId: userId
      })
    } catch (error) {
      // Error ya manejado en onError
      console.error('User assignment failed:', error)
    }
  }, [conversation, userAssignmentMutation])

  // Mutación para cambio de estado
  const statusMutation = api.conversaciones.update.useMutation({
    onSuccess: (updatedConversation) => {
      // Invalidar usando helper centralizado
      if (clientId) {
        const currentFilters = getTrpcFilters()
        invalidateConversationData(utils, clientId, updatedConversation.id, currentFilters)
      }

      toast({
        title: 'Estado actualizado',
        description: `La conversación está ahora ${updatedConversation.status.toLowerCase()}`
      })
    },

    onError: (error) => {
      const errorMsg = getUserFriendlyErrorMessage(error)
      setErrorMessage(errorMsg)
      setShowErrorDialog(true)

      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive'
      })
    },

    onSettled: () => {
      setIsChangingStatus(false)
    }
  })

  const handleStatusChange = useCallback(async (newStatus: ConversationStatus, reason?: string) => {
    if (!conversation) return

    setIsChangingStatus(true)
    setShowErrorDialog(false)

    try {
      await statusMutation.mutateAsync({
        id: conversation.id,
        status: newStatus,
        ...(reason && { metadata: { statusChangeReason: reason } })
      })
    } catch (error) {
      console.error('Status change failed:', error)
    }
  }, [conversation, statusMutation])

  return {
    isArchiving,
    isTogglingImportant,
    isAssigningUser,
    isChangingStatus,
    handleArchiveToggle,
    handleImportantToggle,
    handleUserAssignment,
    handleStatusChange,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage
  }
}
