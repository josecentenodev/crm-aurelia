/**
 * Componente de grupo de conversaciones por instancia
 * Permite colapsar/expandir para mejor organización
 */

"use client"

import { ChevronDown, ChevronRight, Smartphone, Circle } from "lucide-react"
import { Badge } from "@/components/ui"
import { ConversationCard } from "./conversation-card"
import { useUIStateStore } from "../../../_store/ui-state-store"
import { useChatsSelectionStore } from "../../../_store/chats-selection-store"
import type { ChatConversation } from "../../../_types/conversations.types"

interface InstanceGroupProps {
  instanceId: string
  instanceName: string
  phoneNumber?: string | null
  instanceStatus?: string
  conversations: ChatConversation[]
  stats: {
    total: number
    active: number
    paused: number
    finished: number
  }
}

export function InstanceGroup({
  instanceId,
  instanceName,
  phoneNumber,
  instanceStatus,
  conversations,
  stats
}: InstanceGroupProps) {
  const { selectedConversationId, setSelectedConversationId } = useChatsSelectionStore()
  const { toggleInstanceCollapse, isInstanceCollapsed } = useUIStateStore()
  
  const isCollapsed = isInstanceCollapsed(instanceId)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'bg-green-500'
      case 'DISCONNECTED':
        return 'bg-red-500'
      case 'CONNECTING':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="mb-3">
      {/* Header del Grupo */}
      <button
        onClick={() => toggleInstanceCollapse(instanceId)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* Icono de colapso */}
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}

          {/* Icono de instancia con estado */}
          <div className="relative flex-shrink-0">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <Circle 
              className={`w-2 h-2 absolute -top-0.5 -right-0.5 ${getStatusColor(instanceStatus)} rounded-full`} 
              fill="currentColor"
            />
          </div>

          {/* Nombre e info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                {instanceName}
              </span>
              {phoneNumber && (
                <span className="text-xs text-gray-500 truncate">
                  ({phoneNumber})
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {stats.active > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1.5 py-0">
                {stats.active}
              </Badge>
            )}
            {stats.paused > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0">
                {stats.paused}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {stats.total}
            </Badge>
          </div>
        </div>
      </button>

      {/* Conversaciones del Grupo */}
      {!isCollapsed && (
        <div className="mt-1 ml-6 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-xs text-gray-400 italic px-3 py-2">
              No hay conversaciones en esta instancia
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                showInstanceInfo={false}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

