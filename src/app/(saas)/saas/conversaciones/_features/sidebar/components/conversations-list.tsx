/**
 * Lista de conversaciones agrupadas por instancia
 * Maneja estados de loading y empty
 * Componente presentacional que delega renderizado a InstanceGroup
 */

"use client"

import { MessageSquare } from "lucide-react"
import { Skeleton, Card, CardContent } from "@/components/ui"
import { InstanceGroup } from "./instance-group"
import type { ChatConversationsByInstance } from '../../../_types/conversations.types'

interface ConversationsListProps {
  groups: ChatConversationsByInstance[]
  isLoading: boolean
  emptyMessage?: string
}

export function ConversationsList({
  groups,
  isLoading,
  emptyMessage = "No hay conversaciones en esta categoría"
}: ConversationsListProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="rounded-2xl shadow-sm border-0 bg-white">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  // Groups list
  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <InstanceGroup
          key={group.instanceId ?? group.instanceName}
          instanceId={group.instanceId ?? group.instanceName}
          instanceName={group.instanceName}
          phoneNumber={group.phoneNumber}
          instanceStatus={group.instanceStatus}
          conversations={group.conversations}
          stats={group.stats}
        />
      ))}
    </div>
  )
}

