/**
 * Configuración centralizada del módulo de notificaciones
 */

export const NOTIFICATION_CONFIG = {
  /**
   * Configuración de paginación
   */
  pagination: {
    defaultLimit: 50,
    maxLimit: 100,
    defaultOffset: 0,
  },

  /**
   * Configuración de polling (refetch intervals)
   * Con realtime activo, estos valores pueden ser más altos
   */
  polling: {
    listInterval: 60000, // 60 segundos
    statsInterval: 120000, // 2 minutos
    unreadInterval: 30000, // 30 segundos
  },

  /**
   * Configuración de cache
   */
  cache: {
    staleTime: 20000, // 20 segundos
    gcTime: 300000, // 5 minutos (antes cacheTime)
  },

  /**
   * Configuración de limpieza automática
   */
  cleanup: {
    autoMarkReadAfterDays: 30,
    deleteExpiredAfterDays: 90,
  },

  /**
   * Configuración de UI
   */
  ui: {
    skeletonCount: 3,
    dropdownPreviewLimit: 5,
  },
} as const

export type NotificationConfig = typeof NOTIFICATION_CONFIG
