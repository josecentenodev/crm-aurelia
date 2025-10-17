"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter } from "lucide-react"
import { NotificationType, NotificationPriority } from "@/domain/Notificaciones"
import { translateNotificationType, translateNotificationPriority } from "../../_lib"

interface NotificationFiltersProps {
  selectedType?: NotificationType
  selectedPriority?: NotificationPriority
  showOnlyUnread: boolean
  onTypeChange: (type?: NotificationType) => void
  onPriorityChange: (priority?: NotificationPriority) => void
  onUnreadToggle: () => void
  onClearFilters: () => void
}

/**
 * Componente de filtros para notificaciones
 * Permite filtrar por tipo, prioridad y estado de lectura
 */
export function NotificationFilters({
  selectedType,
  selectedPriority,
  showOnlyUnread,
  onTypeChange,
  onPriorityChange,
  onUnreadToggle,
  onClearFilters,
}: NotificationFiltersProps) {
  const hasActiveFilters = selectedType || selectedPriority || showOnlyUnread

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Filtro de no leídas */}
          <Button
            variant={showOnlyUnread ? "default" : "outline"}
            size="sm"
            onClick={onUnreadToggle}
          >
            Solo no leídas
          </Button>

          {/* Filtros por tipo */}
          {Object.values(NotificationType).map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onTypeChange(selectedType === type ? undefined : type)
              }
            >
              {translateNotificationType(type)}
            </Button>
          ))}

          {/* Filtros por prioridad */}
          {Object.values(NotificationPriority).map((priority) => (
            <Button
              key={priority}
              variant={selectedPriority === priority ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onPriorityChange(
                  selectedPriority === priority ? undefined : priority
                )
              }
            >
              {translateNotificationPriority(priority)}
            </Button>
          ))}

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
