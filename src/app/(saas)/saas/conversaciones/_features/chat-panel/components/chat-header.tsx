/**
 * Header del chat individual
 * Muestra información de la conversación y controles
 */

"use client"

import { Button, Badge, Card, CardHeader, CardTitle, Switch } from "@/components/ui"
import { ExternalLink, X, Wifi, WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { getEstadoColor } from "@/lib/utils/client-utils"
import type { ChatHeaderProps } from '../../../_types/conversations.types'

export function ChatHeader({
  conversacion,
  iaActiva,
  onToggleIa,
  onClose,
  showCloseButton = true,
  onMarkRead,
  unreadCount,
}: ChatHeaderProps) {
  const router = useRouter()

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{conversacion.contact?.name?.charAt(0).toUpperCase() ?? "?"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{conversacion.contact?.name ?? "Sin nombre"}</CardTitle>
              {conversacion.contact?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 rounded-lg text-violet-600"
                  onClick={() => router.push(`/saas/contactos/${conversacion.contact!.id}`)}
                  title="Ver contacto"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={iaActiva}
                onCheckedChange={() => onToggleIa()}
              />
              <span className="text-sm text-gray-600">IA</span>
            </div>
            <Badge className={`${getEstadoColor(conversacion.status)} border-0`}>{conversacion.status}</Badge>
            {typeof unreadCount === 'number' && unreadCount > 0 && (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={onMarkRead}>
                Marcar como leída ({unreadCount})
              </Button>
            )}
            {showCloseButton && (
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
