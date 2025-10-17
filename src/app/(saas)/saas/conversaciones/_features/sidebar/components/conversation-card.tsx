"use client"

import { Card, CardContent } from "@/components/ui"
import { memo, useMemo } from "react"
import { Bot, Phone, Smartphone } from "lucide-react"
import type { ConversationCardProps } from '../../../_types/conversations.types'
import { formatConversationTime } from '../../../_utils/date-formatter'

function ConversationCardComponent({
  conversation,
  isSelected,
  onClick,
  showInstanceInfo = false
}: ConversationCardProps) {
  const contactInitial = useMemo(() => {
    return conversation.contact?.name?.charAt(0).toUpperCase() ?? "?"
  }, [conversation.contact?.name])

  const displayName = useMemo(() => {
    return conversation.contact?.name ?? "Sin nombre"
  }, [conversation.contact?.name])

  const formattedTime = useMemo(() => {
    return formatConversationTime(conversation.lastMessageAt)
  }, [conversation.lastMessageAt])

  const hasUnreadMessages = conversation.unreadCount > 0

  const cardClassName = useMemo(() => {
    return `rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-all cursor-pointer ${
      isSelected ? "ring-2 ring-violet-600" : ""
    }`
  }, [isSelected])

  const titleClassName = useMemo(() => {
    return `text-sm truncate ${
      hasUnreadMessages
        ? "font-semibold text-gray-900"
        : "font-medium text-gray-900"
    }`
  }, [hasUnreadMessages])

  return (
    <Card className={cardClassName} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {contactInitial}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={titleClassName}>
                {displayName}
              </h3>
              <span className="text-xs text-gray-400">
                {formattedTime}
              </span>
            </div>

            {conversation.contact?.phone && (
              <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {conversation.contact.phone}
              </p>
            )}

            {showInstanceInfo && conversation.evolutionInstance && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Smartphone className="w-3 h-3" />
                {conversation.evolutionInstance.instanceName}
                {conversation.evolutionInstance.phoneNumber && (
                  <span className="text-gray-400">({conversation.evolutionInstance.phoneNumber})</span>
                )}
              </p>
            )}

            {conversation.agent && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Bot className="w-3 h-3" />
                {conversation.agent.name}
              </p>
            )}

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{conversation.channel}</span>
                {conversation._count?.messages && (
                  <>
                    <span>•</span>
                    <span>{conversation._count.messages} mensajes</span>
                  </>
                )}
              </div>
              {hasUnreadMessages && (
                <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-violet-600 text-white text-[10px]">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Comparador personalizado para optimizar el memo
function areEqual(prevProps: ConversationCardProps, nextProps: ConversationCardProps) {
  // Comparar props primitivas
  if (prevProps.isSelected !== nextProps.isSelected) return false
  if (prevProps.showInstanceInfo !== nextProps.showInstanceInfo) return false
  if (prevProps.onClick !== nextProps.onClick) return false

  const prevConv = prevProps.conversation
  const nextConv = nextProps.conversation

  // Comparar ID de conversación (si cambia, es otra conversación)
  if (prevConv.id !== nextConv.id) return false

  // Comparar campos que pueden cambiar frecuentemente
  if (prevConv.unreadCount !== nextConv.unreadCount) return false
  if (prevConv.status !== nextConv.status) return false
  
  // Comparar lastMessageAt usando timestamp para mejor performance
  const prevTime = prevConv.lastMessageAt ? new Date(prevConv.lastMessageAt).getTime() : 0
  const nextTime = nextConv.lastMessageAt ? new Date(nextConv.lastMessageAt).getTime() : 0
  if (prevTime !== nextTime) return false

  // Comparar información del contacto
  if (prevConv.contact?.name !== nextConv.contact?.name) return false
  if (prevConv.contact?.phone !== nextConv.contact?.phone) return false

  // Comparar conteo de mensajes
  if (prevConv._count?.messages !== nextConv._count?.messages) return false

  // Para showInstanceInfo, comparar información de instancia
  if (prevProps.showInstanceInfo) {
    if (prevConv.evolutionInstance?.instanceName !== nextConv.evolutionInstance?.instanceName) return false
    if (prevConv.evolutionInstance?.phoneNumber !== nextConv.evolutionInstance?.phoneNumber) return false
  }

  // Comparar información del agente
  if (prevConv.agent?.name !== nextConv.agent?.name) return false

  return true
}

export const ConversationCard = memo(ConversationCardComponent, areEqual)