/**
 * Componente de botón de notificaciones
 * Muestra contador de notificaciones pendientes y permite navegar al centro de notificaciones
 */

"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button, Badge } from "@/components/ui"
import { Bell } from "lucide-react"
import { useClientContext } from "@/providers/ClientProvider"
import { useNotificationStore } from "@/store/notifications-store"
import { useNotificacionesUnreadCount } from "@/hooks/use-notificaciones-queries"

export function NotificationsButton() {
  const router = useRouter()
  const { data: session } = useSession()
  const { clientId } = useClientContext()
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount)

  // Obtener contador de notificaciones no leídas
  const { data: unreadData } = useNotificacionesUnreadCount(session?.user?.id)

  // Sincronizar contador con el store
  useEffect(() => {
    if (unreadData?.count !== undefined) {
      setUnreadCount(unreadData.count)
    }
  }, [unreadData?.count, setUnreadCount])

  const handleClick = () => {
    router.push("/saas/notificaciones")
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="rounded-xl p-2"
        onClick={handleClick}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-purple-600 text-white text-xs rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  )
}

