/**
 * Card de oportunidad
 * Muestra información detallada de una oportunidad con acciones
 */

"use client"

import { Card, CardContent, CardFooter, Badge, Avatar, AvatarFallback, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
import { Calendar, AlertTriangle, CheckCircle, SquareArrowOutUpRight, MessageSquare, Clock } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, getDeadlineStatus } from "../../_utils"
import type { OpportunityCardProps } from "../../_types"
import { api } from "@/trpc/react"
import { useState } from "react"
import { SellerSelector } from "./components/seller-selector"
import { ConversationModal } from "../conversation-modal"

export function OpportunityCard({ opportunity, columnColor, columnName }: OpportunityCardProps) {
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false)
  const contactName = opportunity.contact?.name ?? "Contacto"
  const amountText = opportunity.amount ? formatCurrency(Number(opportunity.amount)) : null
  
  // Calcular estado del deadline
  const deadlineStatus = getDeadlineStatus(opportunity.expectedCloseDate ?? null)
  const expectedCloseDateText = opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : null
  const actualCloseDateText = opportunity.actualCloseDate ? formatDate(opportunity.actualCloseDate) : null

  // Buscar conversaciones del contacto
  const { data: conversations } = api.conversaciones.list.useQuery(
    { 
      clientId: opportunity.contact?.clientId ?? "", 
      filters: { contactId: opportunity.contact?.id }
    },
    { 
      enabled: !!opportunity.contact?.id && !!opportunity.contact?.clientId,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000
    }
  )

  const handleOpenConversation = () => {
    setIsConversationModalOpen(true)
  }
  
  const handleCloseConversation = () => {
    setIsConversationModalOpen(false)
  }

  // Obtener la primera conversación del contacto
  const firstConversation = conversations?.[0]

  return (
    <Card 
      className={`rounded-xl border p-3 shadow-xs hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing bg-white ${
        deadlineStatus.status === 'overdue' ? 'border-red-200 bg-red-50' : 
        deadlineStatus.status === 'due-soon' ? 'border-yellow-200 bg-yellow-50' : ''
      }`}
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="font-bold text-white bg-gradient-to-br from-violet-600 to-purple-400">{(contactName ?? "?").slice(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex flex-col items-start">
              <div className="flex items-center gap-2">
                <div className="text-lg font-medium truncate" title={contactName}>{contactName}</div>
                {opportunity.contact && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/saas/contactos/${opportunity.contact.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <SquareArrowOutUpRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ir a contacto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate" title={opportunity.title}>{opportunity.title}</div>
            </div>
          </div>
          {columnName && (
            <Badge
              className="text-[10px] px-1.5 py-0.5 flex-shrink-0"
              style={{ backgroundColor: `${columnColor}20`, color: columnColor }}
            >
              {columnName}
            </Badge>
          )}
        </div>
        {amountText && (
          <div className="py-4 text-2xl font-bold text-gray-900" title={amountText}>
            {amountText}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-4 p-0 space-y-2 flex flex-col">
        {/* Seller info */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Vendedor:</span>
            <SellerSelector opportunityId={opportunity.id} currentUserId={opportunity.assignedUser?.id ?? null} />
          </div>
        </div>

        {/* Fechas y deadlines */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {expectedCloseDateText && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Cierre: {expectedCloseDateText}</span>
              </div>
            )}
          </div>
          
          {deadlineStatus.status !== 'no-deadline' && (
            <Badge 
              variant={deadlineStatus.status === 'overdue' ? 'destructive' : 
                      deadlineStatus.status === 'due-soon' ? 'secondary' : 'outline'}
              className="text-[10px] px-1.5 py-0.5 flex items-center gap-1"
            >
              {deadlineStatus.status === 'overdue' && <AlertTriangle className="w-2 h-2" />}
              {deadlineStatus.status === 'due-soon' && <Clock className="w-2 h-2" />}
              {deadlineStatus.label}
            </Badge>
          )}
        </div>

        {/* Fecha de cierre real si existe */}
        {actualCloseDateText && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Cerrada: {actualCloseDateText}</span>
            </div>
          </div>
        )}

        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 w-full">
          {opportunity.status !== 'OPEN' && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              {String(opportunity.status)}
            </Badge>
          )}
          {opportunity.source && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              {String(opportunity.source)}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 w-full">
          {/* Botón para abrir conversación en modal */}
          {opportunity.contact && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-6 px-2 text-xs ${
                firstConversation 
                  ? "hover:bg-green-50 hover:text-green-600" 
                  : "hover:bg-gray-50 hover:text-gray-600"
              }`}
              onClick={handleOpenConversation}
              disabled={!firstConversation}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              {firstConversation ? "Chat" : "Sin chat"}
            </Button>
          )}
        </div>
      </CardFooter>
      
      {/* Modal de conversación */}
      {firstConversation && opportunity.contact && (
        <ConversationModal
          conversationId={firstConversation.id}
          contact={opportunity.contact}
          isOpen={isConversationModalOpen}
          onClose={handleCloseConversation}
        />
      )}
    </Card>
  )
}

