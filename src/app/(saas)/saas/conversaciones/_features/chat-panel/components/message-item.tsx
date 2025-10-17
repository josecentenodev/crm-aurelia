/**
 * Item individual de mensaje
 * Muestra un mensaje con avatar y metadatos
 */

"use client"

import { memo } from "react"
import { Bot, User, Check, Loader2, AlertTriangle } from "lucide-react"
import { MessageDisplay } from "@/components/ui/message-display"
import type { MessageItemProps } from '../../../_types/conversations.types'
import { api } from '@/trpc/react'
import { formatMessageTime } from '../../../_utils/date-formatter'

function MessageItemComponent({ message, isContact }: MessageItemProps) {
  // Si es un mensaje de media, usar MessageDisplay
  // Convertir null → undefined para compatibilidad con MessageDisplay
  if (message.messageType && ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LOCATION', 'CONTACT', 'STICKER'].includes(message.messageType)) {
    return (
      <div className={`flex ${isContact ? "justify-start" : "justify-end"}`}>
        <div className={`max-w-xs lg:max-w-md ${isContact ? "mr-auto" : "ml-auto"}`}>
          <MessageDisplay
            message={{
              id: message.id,
              content: message.content,
              messageType: message.messageType,
              messageSubType: message.messageSubType ?? undefined,
              mediaUrl: message.mediaUrl ?? undefined,
              mediaFileName: message.mediaFileName ?? undefined,
              mediaSize: message.mediaSize ?? undefined,
              mediaDuration: message.mediaDuration ?? undefined,
              mediaWidth: message.mediaWidth ?? undefined,
              mediaHeight: message.mediaHeight ?? undefined,
              mediaThumbnail: message.mediaThumbnail ?? undefined,
              caption: message.caption ?? undefined,
              title: message.title ?? undefined,
              description: message.description ?? undefined,
              latitude: message.latitude ?? undefined,
              longitude: message.longitude ?? undefined,
              locationName: message.locationName ?? undefined,
              contactName: message.contactName ?? undefined,
              contactPhone: message.contactPhone ?? undefined,
              reaction: message.reaction ?? undefined,
              pollOptions: message.pollOptions ?? undefined,
              createdAt: typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt,
              role: message.role ?? 'USER',
              senderType: message.senderType ?? 'USER'
            }}
            showMetadata={false}
          />
        </div>
      </div>
    )
  }

  // Acciones retry/delete
  const retryMutation = api.messages.retry.useMutation()
  const deleteMutation = api.messages.delete.useMutation()

  async function handleRetry() {
    try {
      await retryMutation.mutateAsync({ messageId: message.id, clientId: (message as any).clientId ?? '' })
    } catch (error) {
      console.error('Error retrying message:', error)
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync({ messageId: message.id, clientId: (message as any).clientId ?? '' })
      // Opcional: invalidar conversación actual si hay helper
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  // Para mensajes de texto, usar diseño con avatar fijo
  return (
    <div className={`flex gap-2 ${isContact ? "justify-start" : "justify-end"}`}>
      <div className={`flex gap-2 max-w-[70%] ${isContact ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar siempre alineado al top */}
        <div className="flex-shrink-0 pt-0.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isContact ? "bg-gray-200" : "bg-gradient-to-br from-purple-500 to-violet-600"
            }`}
          >
            {isContact ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4 text-white" />}
          </div>
        </div>

        {/* Contenido del mensaje */}
        <div className="flex flex-col gap-1">
          <div
            className={`rounded-2xl px-4 py-2 ${
              isContact 
                ? "bg-gray-100 text-gray-900 rounded-tl-sm" 
                : "bg-violet-500 text-white rounded-tr-sm"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          
          {/* Metadata debajo del mensaje */}
          <div className={`flex items-center gap-1.5 text-xs px-1 ${isContact ? "text-gray-500" : "text-gray-500 justify-end"}`}>
            <span>{formatMessageTime(message.createdAt)}</span>
            {!isContact && (
              <>
                {message.messageStatus === 'PENDING' && (
                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                )}
                {message.messageStatus === 'SENT' && (
                  <Check className="w-3 h-3 text-green-600" />
                )}
                {message.messageStatus === 'FAILED' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <button onClick={handleRetry} className="underline hover:text-red-700">Reintentar</button>
                    <span>·</span>
                    <button onClick={handleDelete} className="underline hover:text-red-700">Eliminar</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function areEqual(prev: MessageItemProps, next: MessageItemProps) {
  return (
    prev.isContact === next.isContact &&
    prev.message.id === next.message.id &&
    new Date(prev.message.updatedAt).getTime() === new Date(next.message.updatedAt).getTime() &&
    prev.message.content === next.message.content &&
    prev.message.messageType === next.message.messageType
  )
}

export const MessageItem = memo(MessageItemComponent, areEqual)
