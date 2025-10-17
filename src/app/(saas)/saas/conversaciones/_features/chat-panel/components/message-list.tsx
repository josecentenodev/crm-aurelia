/**
 * Lista de mensajes del chat
 * Muestra los mensajes con indicadores de typing
 */

"use client"

import { memo, useEffect, useRef } from "react"
import { Bot } from "lucide-react"
import { MessageItem } from "./message-item"
import { AiTypingIndicator } from "./ai-typing-indicator"
import type { MessageListProps } from '../../../_types/conversations.types'
import type { UIMessage, TemporaryMessage } from '@/domain/Conversaciones'

function isContactMessage(message: UIMessage | TemporaryMessage) {
  return message.senderType === "CONTACT"
}

function MessageListComponent({ messages, isTyping, isAiTyping, typingStartTime }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, isAiTyping])

  const noMessages = !messages || messages.length === 0

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {noMessages ? (
        <div className="text-center text-gray-400 py-12">No hay mensajes en esta conversación aún.</div>
      ) : (
        messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message as UIMessage | TemporaryMessage} 
            isContact={isContactMessage(message as UIMessage | TemporaryMessage)} 
          />
        ))
      )}

      {/* Indicador de IA escribiendo */}
      <AiTypingIndicator
        isTyping={isAiTyping ?? false}
        typingStartTime={typingStartTime}
      />

      {/* Indicador de usuario escribiendo (manual) */}
      {isTyping && (
        <div className="flex gap-2 justify-end">
          <div className="flex gap-2 max-w-[70%] flex-row-reverse">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="rounded-2xl rounded-tr-sm px-4 py-2 bg-violet-500 text-white">
                <p className="text-sm">Aurelia AI está escribiendo...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}

function areEqual(prev: MessageListProps, next: MessageListProps) {
  if (prev.isTyping !== next.isTyping) return false
  if (prev.isAiTyping !== next.isAiTyping) return false
  if (prev.typingStartTime !== next.typingStartTime) return false
  if (prev.messages.length !== next.messages.length) return false
  const lastPrev = prev.messages[prev.messages.length - 1]
  const lastNext = next.messages[next.messages.length - 1]
  if (!lastPrev && !lastNext) return true
  if (!lastPrev || !lastNext) return false
  return lastPrev.id === lastNext.id && lastPrev.content === lastNext.content && String(lastPrev.updatedAt) === String(lastNext.updatedAt)
}

export const MessageList = memo(MessageListComponent, areEqual)
