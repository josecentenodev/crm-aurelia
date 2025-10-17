/**
 * Dropdown para asignar usuarios a conversaciones
 * Usa optimistic updates siguiendo el patrón de la nueva arquitectura
 */

"use client"

import { useState } from "react"
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui"
import { User, UserPlus, UserX, Loader2 } from "lucide-react"
import { api } from "@/trpc/react"
import { useClientContext } from '@/providers/ClientProvider'
import { useOptimisticConversationActions } from '../../../_hooks/use-optimistic-conversation-actions'
import { ConversationErrorDialog } from './conversation-error-dialog'
import type { ChatConversation } from '../../../_types/conversations.types'

interface UserAssignmentDropdownProps {
  conversation: ChatConversation
  onConversationUpdate?: (updatedConversation: ChatConversation) => void
}

export function UserAssignmentDropdown({ 
  conversation, 
  onConversationUpdate
}: UserAssignmentDropdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  // Obtener clientId del contexto
  const { clientId } = useClientContext()

  // Hook optimizado para acciones de conversación
  const {
    isAssigningUser,
    handleUserAssignment,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage
  } = useOptimisticConversationActions({
    conversation,
    onConversationUpdate
  })

  // Obtener usuarios del cliente actual
  const { data: users, isLoading: isLoadingUsers } = api.usuarios.getClientUsers.useQuery({
    clientId: clientId!
  }, {
    enabled: !!clientId
  })

  const handleUserSelect = (user: {id: string, name: string} | null) => {
    setSelectedUser(user)
    setIsModalOpen(false)
    setShowConfirmDialog(true)
  }

  const handleConfirmAssignment = async () => {
    if (selectedUser) {
      await handleUserAssignment(selectedUser.id)
    } else {
      await handleUserAssignment(null) // Quitar asignación
    }
    setShowConfirmDialog(false)
    setSelectedUser(null)
  }

  if (isLoadingUsers) {
    return (
      <Button variant="outline" size="sm" disabled className="rounded-xl">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Cargando...
      </Button>
    )
  }

  return (
    <>
      {/* Botón para abrir modal */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl text-xs"
        disabled={isAssigningUser}
        onClick={() => setIsModalOpen(true)}
      >
        {isAssigningUser ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <User className="w-4 h-4 mr-2" />
        )}
        {conversation.assignedUser ? conversation.assignedUser.name : "Sin asignar"}
      </Button>

      {/* Modal de selección de usuarios */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Usuario</DialogTitle>
            <DialogDescription>
              Selecciona el usuario al que deseas asignar esta conversación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {/* Opción para quitar asignación (solo si hay alguien asignado) */}
            {conversation.assignedUser && (
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleUserSelect(null)}
              >
                <UserX className="w-4 h-4 mr-2" />
                Quitar asignación
              </Button>
            )}

            {/* Lista de usuarios */}
            {users?.map((user) => (
              <Button
                key={user.id}
                variant={user.id === conversation.assignedUser?.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleUserSelect({id: user.id, name: user.name ?? 'Usuario sin nombre'})}
                disabled={user.id === conversation.assignedUser?.id}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {user.name}
                {user.id === conversation.assignedUser?.id && " (Actual)"}
              </Button>
            ))}

            {(!users || users.length === 0) && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay usuarios disponibles
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Confirmar Asignación" : "Confirmar Remoción"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? `¿Estás seguro de que deseas asignar esta conversación a ${selectedUser.name}?`
                : "¿Estás seguro de que deseas quitar la asignación de esta conversación?"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false)
                setSelectedUser(null)
              }}
              disabled={isAssigningUser}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAssignment}
              disabled={isAssigningUser}
              variant={selectedUser ? "default" : "destructive"}
            >
              {isAssigningUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                selectedUser ? "Asignar" : "Quitar Asignación"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de error */}
      <ConversationErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        errorMessage={errorMessage}
      />
    </>
  )
}
