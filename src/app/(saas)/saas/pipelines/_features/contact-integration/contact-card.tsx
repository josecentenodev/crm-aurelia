/**
 * Card de contacto
 * Muestra información de contacto con sus conversaciones
 */

"use client"

import type { Contact } from "@/domain/Contactos"
import { Card, CardContent, CardFooter, Badge, Avatar, AvatarFallback, Button } from "@/components/ui"
import { MessageCircle, MessageSquare } from "lucide-react"
import { formatAmount } from "../../_utils"
import { useState } from "react"
import { ConversationModal } from "../../_shared"
import type { ContactCardProps } from "../../_types"

export function ContactCard({ contact, columnColor, columnName, amount, currency }: ContactCardProps) {
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false)
  const amountText = formatAmount(amount ?? undefined, currency ?? undefined)
  
  const handleOpenConversation = () => {
    setIsConversationModalOpen(true)
  }
  
  const handleCloseConversation = () => {
    setIsConversationModalOpen(false)
  }

  return (
    <Card 
      className={`rounded-xl border p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing bg-white ${
        columnColor ? 'border-l-3' : ''
      }`}
      style={{
        borderLeftColor: columnColor ?? undefined
      }}
    >
      <CardContent className="p-0">
        {columnName && (
          <div className="flex justify-end">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5"
              style={{ backgroundColor: `${columnColor}20`, color: columnColor, borderColor: columnColor }}
            >
              {columnName}
            </Badge>
          </div>
        )}
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">{(contact.name ?? "?").slice(0,1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate" title={contact.name}>{contact.name}</div>
            {amountText && (
              <div className="text-[13px] font-bold text-gray-800 mt-0.5">
                {amountText}
              </div>
            )}
            {contact.phone && (
              <div className="text-xs text-gray-500 truncate" title={contact.phone}>{contact.phone}</div>
            )}
            {contact.email && (
              <div className="text-xs text-gray-500 truncate" title={contact.email}>{contact.email}</div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-3 p-0 gap-1 flex flex-wrap">
        {contact.status && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
            {String(contact.status)}
          </Badge>
        )}
        {contact.channel && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
            {String(contact.channel)}
          </Badge>
        )}
        
        {/* Información de conversaciones */}
        {contact.conversations && contact.conversations.length > 0 ? (
          <div className="flex items-center gap-2 mt-2 w-full">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MessageCircle className="w-3 h-3" />
              <span>{contact.conversations[0]?._count.messages ?? 0} mensajes</span>
            </div>
            
            {/* Botón para abrir conversación en modal */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs hover:bg-green-50 hover:text-green-600 ml-auto"
              onClick={handleOpenConversation}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Chat
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <MessageCircle className="w-3 h-3" />
            <span>Sin conversaciones</span>
          </div>
        )}
      </CardFooter>
      
      {/* Modal de conversación */}
      {contact.conversations && contact.conversations.length > 0 && (
        <ConversationModal
          conversationId={contact.conversations[0].id}
          contact={contact}
          isOpen={isConversationModalOpen}
          onClose={handleCloseConversation}
        />
      )}
    </Card>
  )
}

