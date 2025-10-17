"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { NotificationWithUser, NotificationFilters } from "@/domain/Notificaciones"
import { NotificationItem, EmptyState, LoadingSkeleton } from "./components"

interface NotificationListProps {
  notifications?: NotificationWithUser[]
  total?: number
  hasMore?: boolean
  isLoading: boolean
  error?: { message: string } | null
  filters: NotificationFilters
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onLoadMore: () => void
  isMarkingAsRead: boolean
  isDeleting: boolean
}

/**
 * Lista principal de notificaciones
 * Maneja estados de carga, error, vacío y muestra los items
 */
export function NotificationList({
  notifications,
  total,
  hasMore,
  isLoading,
  error,
  filters,
  onMarkAsRead,
  onDelete,
  onLoadMore,
  isMarkingAsRead,
  isDeleting,
}: NotificationListProps) {
  // Estado de error
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar notificaciones: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  // Estado de carga
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Estado vacío
  if (!notifications || notifications.length === 0) {
    return <EmptyState />
  }

  // Estado con datos
  return (
    <div className="space-y-3">
      {/* Lista de notificaciones */}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          isMarkingAsRead={isMarkingAsRead}
          isDeleting={isDeleting}
        />
      ))}

      {/* Botón cargar más */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore}>
            Cargar más
          </Button>
        </div>
      )}
    </div>
  )
}
