"use client"

import { useSupabaseRealtimeNotifications } from "@/hooks/use-supabase-realtime-notifications"
import { useClientContext } from "@/providers/ClientProvider"
import { useSession } from "next-auth/react"

/**
 * Provider de Notificaciones Realtime
 * 
 * Este componente se encarga de mantener activa la suscripción a notificaciones
 * en tiempo real para toda la aplicación SaaS.
 * 
 * Características:
 * - Se monta una vez en el layout raíz
 * - Persiste durante la navegación (no se desmonta)
 * - Usa el Channel Manager para gestión eficiente de canales
 * - Actualiza automáticamente el NotificationsButton via invalidación de queries
 */
export function RealtimeNotificationsProvider() {
  const { data: session } = useSession()
  const { clientId } = useClientContext()
  
  // Suscribirse a notificaciones en tiempo real
  useSupabaseRealtimeNotifications({
    clientId: clientId ?? "",
    userId: session?.user?.id ?? null,
    enabled: !!clientId && !!session?.user?.id,
  })
  
  // Este componente no renderiza nada, solo gestiona la suscripción
  return null
}

