"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useClientContext } from "@/providers/ClientProvider"
import {
  useNotificacionesList,
  useNotificacionesStats,
} from "@/hooks/use-notificaciones-queries"
import { useSupabaseRealtimeNotifications } from "@/hooks/use-supabase-realtime-notifications"
import { useNotificationStore } from "@/store/notifications-store"
import {
  NotificationType,
  NotificationPriority,
  type NotificationFilters as NotificationFiltersType,
} from "@/domain/Notificaciones"
import { useNotificationActions } from "./_hooks"
import { NotificationsHeader } from "./_features/notification-header"
import { StatsCards } from "./_features/notification-stats"
import { NotificationFilters } from "./_features/notification-filters"
import { NotificationList } from "./_features/notification-list"

/**
 * Página principal del módulo de notificaciones
 * Orquesta las diferentes features y maneja el estado global
 */
export default function NotificacionesPage() {
  const { data: session } = useSession()
  const { clientId } = useClientContext()
  const { filters, setFilters, clearFilters } = useNotificationStore()

  // Estado local de filtros (no persistido)
  const [selectedType, setSelectedType] = useState<NotificationType | undefined>()
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | undefined>()
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  // Combinar filtros del store con filtros locales
  const currentFilters: NotificationFiltersType = {
    ...filters,
    type: selectedType,
    priority: selectedPriority,
    read: showOnlyUnread ? false : undefined,
  }

  // Queries
  const { data, isLoading, error } = useNotificacionesList(currentFilters)
  const { data: stats } = useNotificacionesStats(session?.user?.id)

  // Actions
  const { markAsRead, markAllAsRead, deleteNotification, isMarkingAsRead, isMarkingAllAsRead, isDeleting } =
    useNotificationActions()

  // Realtime subscription
  useSupabaseRealtimeNotifications({
    clientId: clientId ?? "",
    userId: session?.user?.id,
    enabled: !!clientId,
  })

  // Handlers
  const handleMarkAllAsRead = async () => {
    if (!clientId) return
    await markAllAsRead(clientId, session?.user?.id)
  }

  const handleLoadMore = () => {
    setFilters({
      offset: (filters.offset ?? 0) + (filters.limit ?? 50),
    })
  }

  const handleClearFilters = () => {
    setSelectedType(undefined)
    setSelectedPriority(undefined)
    setShowOnlyUnread(false)
    clearFilters()
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <NotificationsHeader
        stats={stats}
        onMarkAllAsRead={handleMarkAllAsRead}
        isMarkingAllAsRead={isMarkingAllAsRead}
      />

      {/* Stats */}
      {stats && <StatsCards stats={stats} />}

      {/* Filters */}
      <NotificationFilters
        selectedType={selectedType}
        selectedPriority={selectedPriority}
        showOnlyUnread={showOnlyUnread}
        onTypeChange={setSelectedType}
        onPriorityChange={setSelectedPriority}
        onUnreadToggle={() => setShowOnlyUnread(!showOnlyUnread)}
        onClearFilters={handleClearFilters}
      />

      {/* Notifications List */}
      <NotificationList
        notifications={data?.notifications}
        total={data?.total}
        hasMore={data?.hasMore}
        isLoading={isLoading}
        error={error}
        filters={currentFilters}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
        onLoadMore={handleLoadMore}
        isMarkingAsRead={isMarkingAsRead}
        isDeleting={isDeleting}
      />
    </div>
  )
}
