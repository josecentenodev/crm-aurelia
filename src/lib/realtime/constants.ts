/**
 * Constantes para el sistema de Realtime
 */

/**
 * Prefijos para nombres de canales siguiendo convención:
 * {scope}:{entity}:{id}
 */
export const CHANNEL_PREFIXES = {
  GLOBAL: "global",
  PRIVATE: "private",
  PUBLIC: "public",
} as const

/**
 * Tipos de entidades
 */
export const CHANNEL_ENTITIES = {
  NOTIFICATIONS: "notifications",
  CONVERSATION: "conversation",
  PLAYGROUND: "playground",
  MESSAGES: "messages",
} as const

/**
 * Configuración por defecto del Channel Manager
 */
export const DEFAULT_CHANNEL_MANAGER_OPTIONS = {
  enableLogging: process.env.NODE_ENV === "development",
  autoCleanup: true,
  cleanupInterval: 5 * 60 * 1000, // 5 minutos
  maxInactiveTime: 10 * 60 * 1000, // 10 minutos
} as const

/**
 * Helper para generar nombres de canales consistentes
 */
export function buildChannelName(
  scope: keyof typeof CHANNEL_PREFIXES,
  entity: keyof typeof CHANNEL_ENTITIES,
  ...ids: string[]
): string {
  const prefix = CHANNEL_PREFIXES[scope]
  const entityName = CHANNEL_ENTITIES[entity]
  const idParts = ids.filter(Boolean).join(":")
  
  return idParts ? `${prefix}:${entityName}:${idParts}` : `${prefix}:${entityName}`
}

/**
 * Helper para crear nombre de canal de notificaciones
 */
export function buildNotificationsChannelName(clientId: string, userId?: string | null): string {
  return userId
    ? buildChannelName("GLOBAL", "NOTIFICATIONS", `client-${clientId}`, `user-${userId}`)
    : buildChannelName("GLOBAL", "NOTIFICATIONS", `client-${clientId}`)
}

