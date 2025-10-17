/**
 * Botones de acción para conversaciones
 * Maneja archivar/desarchivar y marcar como importante con optimistic rendering
 */

"use client"

import { Button } from "@/components/ui"
import { Star, Archive, Loader2 } from "lucide-react"
import { useOptimisticConversationActions } from "../../../_hooks/use-optimistic-conversation-actions"
import { ConversationErrorDialog } from "./conversation-error-dialog"
import type { ChatConversation } from "../../../_types/conversations.types"

interface ConversationActionButtonsProps {
  conversation: ChatConversation
  onConversationUpdate?: (updatedConversation: ChatConversation) => void
  className?: string
}

export function ConversationActionButtons({
  conversation,
  onConversationUpdate,
  className = ""
}: ConversationActionButtonsProps) {
  const {
    isArchiving,
    isTogglingImportant,
    handleArchiveToggle,
    handleImportantToggle,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage
  } = useOptimisticConversationActions({
    conversation,
    onConversationUpdate
  })

  const isArchived = conversation.status === 'ARCHIVADA'
  const isImportant = conversation.isImportant

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleImportantToggle}
            disabled={isTogglingImportant}
            className={`rounded-xl text-xs transition-all ${
              isImportant
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                : 'hover:bg-gray-50'
            }`}
          >
            {isTogglingImportant ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Star className={`w-3 h-3 mr-1 ${isImportant ? 'fill-current' : ''}`} />
            )}
            {isImportant ? "Importante" : "Marcar Importante"}
          </Button>

          <Button
            variant="outline"
            onClick={handleArchiveToggle}
            disabled={isArchiving}
            className={`rounded-xl text-xs transition-all ${
              isArchived
                ? 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                : 'hover:bg-gray-50'
            }`}
          >
            {isArchiving ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Archive className="w-3 h-3 mr-1" />
            )}
            {isArchived ? 'Desarchivar' : 'Archivar'}
          </Button>
        </div>
      </div>

      <ConversationErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        errorMessage={errorMessage}
      />
    </>
  )
}
