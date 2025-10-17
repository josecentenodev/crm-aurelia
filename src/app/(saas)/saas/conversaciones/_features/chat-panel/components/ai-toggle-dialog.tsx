/**
 * Diálogo de confirmación para activar/desactivar IA
 * Muestra información detallada sobre la acción
 */

"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, User, Loader2, AlertTriangle } from "lucide-react"
import type { ChatConversation } from '../../../_types/conversations.types'
import type { ConversationWithDetails } from '@/domain/Conversaciones'

interface AiToggleDialogProps {
  isOpen: boolean
  onClose: () => void
  conversation: ChatConversation | ConversationWithDetails
  currentAiState: boolean
  onConfirm: (newState: boolean) => void
  isLoading?: boolean
}

export function AiToggleDialog({
  isOpen,
  onClose,
  conversation,
  currentAiState,
  onConfirm,
  isLoading = false
}: AiToggleDialogProps) {
  const newState = !currentAiState

  const handleConfirm = () => {
    onConfirm(newState)
  }

  const getDialogContent = () => {
    if (newState) {
      // Activando IA
      return {
        title: "¿Activar Inteligencia Artificial?",
        description: `¿Estás seguro de que quieres activar la IA para la conversación con ${conversation.contact?.name || 'este contacto'}?`,
        icon: <Bot className="w-6 h-6 text-green-600" />,
        confirmText: "Activar IA",
        confirmVariant: "default" as const,
        alert: {
          type: "info" as const,
          message: "La IA manejará automáticamente esta conversación. Podrás desactivarla en cualquier momento."
        }
      }
    } else {
      // Desactivando IA
      return {
        title: "¿Desactivar Inteligencia Artificial?",
        description: `¿Estás seguro de que quieres desactivar la IA para la conversación con ${conversation.contact?.name || 'este contacto'}?`,
        icon: <User className="w-6 h-6 text-blue-600" />,
        confirmText: "Desactivar IA",
        confirmVariant: "destructive" as const,
        alert: {
          type: "warning" as const,
          message: "Deberás manejar esta conversación manualmente. Podrás reactivar la IA en cualquier momento."
        }
      }
    }
  }

  const content = getDialogContent()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {content.icon}
            <span>{content.title}</span>
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {/* Información de la conversación */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {conversation.contact?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{conversation.contact?.name ?? 'Sin nombre'}</p>
              <p className="text-sm text-gray-600">
                Canal: {conversation.channel} • Estado: {conversation.status}
              </p>
            </div>
          </div>
        </div>

        {/* Alerta informativa */}
        <Alert variant={content.alert.type}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {content.alert.message}
          </AlertDescription>
        </Alert>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={content.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              content.confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
