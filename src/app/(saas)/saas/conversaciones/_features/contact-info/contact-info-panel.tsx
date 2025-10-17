"use client"

import { CardTitle, Badge } from "@/components/ui"
import {
  Mail,
  Phone,
  Bot,
  User,
  Clock
} from "lucide-react"
import { ConversationActionButtons } from "./components/conversation-action-buttons"
import { UserAssignmentDropdown } from "./components/user-assignment-dropdown"
import { ConversationStatusSelector } from "./components/conversation-status-selector"
import type { ContactInfoPanelProps, ChatConversation } from '../../_types/conversations.types'
import { api } from '@/trpc/react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate } from '../../_utils/date-formatter'
import { useOptimisticConversationActions } from '../../_hooks/use-optimistic-conversation-actions'
import { ConversationErrorDialog } from './components/conversation-error-dialog'

export function ContactInfoPanel({
  conversationId,
  onConversationUpdate,
  onCategoryCountsUpdate
}: ContactInfoPanelProps) {
  const { data: conversation, isPending } = api.conversaciones.byId.useQuery(
    { id: conversationId! },
    { enabled: !!conversationId }
  )

  const {
    isChangingStatus,
    handleStatusChange,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage
  } = useOptimisticConversationActions({
    conversation,
    onConversationUpdate
  })

  if (!conversationId) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Selecciona una conversación para ver la información del contacto</p>
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
        {/* Contact Information Skeleton */}
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>

        {/* Status and Assignment Skeleton */}
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Skeleton */}
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="p-6 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 rounded-xl" />
            <Skeleton className="h-8 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // Estado vacío
  if (!conversationId || !conversation) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Selecciona una conversación para ver la información del contacto</p>
        </div>
      </div>
    )
  }

  const contact = conversation.contact

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-4">
          Información del Contacto
        </CardTitle>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {contact?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{contact?.name ?? "Sin nombre"}</h3>
              <p className="text-sm text-gray-500">{conversation.channel}</p>
            </div>
          </div>

          <div className="space-y-3">
            {contact?.email && (
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{contact.email}</span>
              </div>
            )}

            {contact?.phone && (
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{contact.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-4">
          Estado y Asignación
        </CardTitle>

        <div className="space-y-3">
          <ConversationStatusSelector
            currentStatus={conversation.status}
            onStatusChange={handleStatusChange}
            isChanging={isChangingStatus}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Asignado a:</span>
            <UserAssignmentDropdown
              conversation={conversation as unknown as ChatConversation}
              onConversationUpdate={onConversationUpdate}
            />
          </div>

          {conversation.agent && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">IA:</span>
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Activa</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-4">
          Estadísticas
        </CardTitle>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total mensajes:</span>
            <span className="text-sm font-medium text-gray-900">
              {conversation._count?.messages ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Primer contacto:</span>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                {formatFullDate(conversation.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Canal:</span>
            <span className="text-sm text-gray-900">{conversation.channel}</span>
          </div>

          {conversation.evolutionInstance && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Instancia:</span>
              <span className="text-sm text-gray-900">{conversation.evolutionInstance.instanceName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex-shrink-0">
        <ConversationActionButtons
          conversation={conversation as unknown as ChatConversation}
          onConversationUpdate={onConversationUpdate}
          onCategoryCountsUpdate={onCategoryCountsUpdate}
        />
      </div>

      <ConversationErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        errorMessage={errorMessage}
      />
    </div>
  )
}