/**
 * Modal de conversación compartido
 * Componente reutilizable para ver y gestionar conversaciones desde diferentes features
 * 
 * SHARED: Este componente es usado por:
 * - contact-integration/contact-card.tsx
 * - opportunity-management/opportunity-card.tsx
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Input, Badge, Switch, Avatar, AvatarFallback } from "@/components/ui"
import { Send, Bot, User, X, Minimize2, Maximize2 } from "lucide-react"
import { api } from "@/trpc/react"
import { getEstadoColor } from "@/lib/utils/client-utils"
import { useMessages } from "../../_hooks/messages"
import { useClientContext } from "@/providers/ClientProvider"
import type { UIMessage, TemporaryMessage } from "@/domain/Conversaciones"
import type { ConversationModalProps } from "../../_types"

export function ConversationModal({ conversationId, contact, isOpen, onClose }: ConversationModalProps) {
  const { clientId } = useClientContext()
  const [isAiActive, setIsAiActive] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversation data
  const { data: conversation, isLoading } = api.conversaciones.byId.useQuery(
    { id: conversationId },
    { enabled: isOpen && !!conversationId }
  )

  // Real-time messages hook - optimized for single conversation (Pipelines Architecture)
  const {
    messages,
    isLoading: messagesLoading,
    connectionError,
    reconnect,
    addTemporaryMessage,
    updateTemporaryMessage
  } = useMessages({
    conversationId,
    clientId: clientId!,
    enabled: isOpen && !!conversationId && !!clientId
  })

  // Mutation para enviar mensajes
  const sendTextMutation = api.messages.sendText.useMutation()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messages && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Scroll to bottom when modal opens and messages are loaded
  useEffect(() => {
    if (isOpen && !messagesLoading && messages && messages.length > 0) {
      // Multiple attempts to ensure scroll works
      const scrollToBottom = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }
      
      // Immediate scroll
      scrollToBottom()
      
      // Delayed scroll to ensure DOM is ready
      setTimeout(scrollToBottom, 100)
      setTimeout(scrollToBottom, 300)
    }
  }, [isOpen, messagesLoading, messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isAiActive) return

    const tempId = crypto.randomUUID()
    const messageContent = newMessage.trim()
    
    // 1. Crear mensaje temporal (Optimistic UI)
    const tempMessage: TemporaryMessage = {
      id: tempId,
      conversationId,
      content: messageContent,
      role: "USER" as const,
      senderType: "USER" as const,
      messageType: "TEXT",
      messageStatus: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemporary: true,
      metadata: { isTemporary: true }
    }

    // 2. Mostrar mensaje inmediatamente
    addTemporaryMessage(tempMessage)
    setNewMessage("")

    try {
      // 3. Enviar al backend
      const evolutionInstanceId = conversation?.evolutionInstance?.id
      if (!evolutionInstanceId) {
        throw new Error("No se encontró la instancia de Evolution API")
      }

      await sendTextMutation.mutateAsync({
        messageId: tempId,
        instanceId: evolutionInstanceId,
        to: contact.phone ?? "",
        message: messageContent,
        clientId: clientId!
      })
      
      // 4. Actualizar estado a enviado
      updateTemporaryMessage(tempId, { messageStatus: "SENT" })
    } catch (error) {
      console.error("Error sending message:", error)
      // 5. Marcar como fallido
      updateTemporaryMessage(tempId, { messageStatus: "FAILED" })
    }
  }

  const formatMessageTime = (createdAt: string | Date): string => {
    try {
      const date = new Date(createdAt)
      if (isNaN(date.getTime())) return 'Hora no disponible'
      return date.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return 'Hora no disponible'
    }
  }

  const renderMessage = (message: UIMessage) => {
    const isContactMessage = message.role === "USER" && message.senderType === "CONTACT"
    const isAgentMessage = message.role === "ASSISTANT"
    const isUserMessage = message.role === "USER" && message.senderType === "USER"

    return (
      <div key={message.id} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start space-x-2 max-w-xs ${isUserMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {isContactMessage ? contact.name?.charAt(0).toUpperCase() ?? "?" : 
               isAgentMessage ? "AI" : "U"}
            </AvatarFallback>
          </Avatar>
          <div className={`rounded-2xl px-4 py-2 ${
            isUserMessage 
              ? 'bg-violet-500 text-white' 
              : isAgentMessage 
                ? 'bg-green-100 text-green-900' 
                : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm">{message.content}</p>
            <p className={`text-xs mt-1 ${
              isUserMessage ? 'text-violet-100' : 'text-gray-500'
            }`}>
              {formatMessageTime(message.createdAt)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Drawer positioned in bottom-right - NO overlay */}
      <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-t-2xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out ${
        isMinimized 
          ? 'w-80 h-16' 
          : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-semibold text-sm">
                {contact.name?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{contact.name ?? "Sin nombre"}</h3>
              <p className="text-xs text-gray-600 truncate">
                {contact.phone && `📱 ${contact.phone}`}
                {contact.email && ` • ✉️ ${contact.email}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {conversation && (
              <Badge className={`${getEstadoColor(conversation.status)} border-0 text-xs`}>
                {conversation.status}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title={isMinimized ? "Expandir conversación" : "Minimizar conversación"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Cerrar conversación"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Connection Error Alert */}
            {connectionError && (
              <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Error de conexión: {connectionError}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reconnect}
                    className="text-xs underline text-yellow-800 hover:text-yellow-900"
                  >
                    Reconectar
                  </Button>
                </div>
              </div>
            )}

            {/* AI Control */}
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isAiActive ? (
                    <Bot className="w-4 h-4 text-green-500" />
                  ) : (
                    <User className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium">
                    Chat {isAiActive ? "Automático" : "Manual"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={isAiActive} 
                    onCheckedChange={setIsAiActive}
                    disabled={sendTextMutation.isPending}
                    className="scale-75"
                  />
                  <span className="text-xs text-gray-600">IA</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[400px]">
              {isLoading || messagesLoading ? (
                <div className="text-center text-gray-400 py-8">
                  Cargando conversación...
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No hay mensajes en esta conversación aún.
                </div>
              ) : (
                messages.map(renderMessage)
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white rounded-b-2xl">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  placeholder={isAiActive ? "Para tomar conversación apagar IA" : "Escribe un mensaje..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isAiActive || sendTextMutation.isPending}
                  className={`flex-1 rounded-xl text-sm ${
                    isAiActive ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                <Button
                  type="submit"
                  disabled={isAiActive || sendTextMutation.isPending || !newMessage.trim()}
                  className={`rounded-xl h-10 px-3 ${
                    isAiActive || sendTextMutation.isPending || !newMessage.trim()
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-violet-500 hover:bg-violet-600"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  )
}

