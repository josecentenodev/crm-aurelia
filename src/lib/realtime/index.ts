/**
 * Sistema centralizado de gestión de canales Realtime de Supabase
 * 
 * Este módulo exporta:
 * - SupabaseChannelManager: Singleton para gestionar canales
 * - Helpers: Funciones de utilidad para nombres de canales
 * - Types: Tipos TypeScript compartidos
 * - Constants: Constantes y configuraciones
 */

export { SupabaseChannelManager, getChannelManager } from "./channel-manager"
export type {
  RealtimeEventType,
  PostgresChangesConfig,
  RealtimeCallback,
  UnsubscribeFn,
  ChannelConfig,
  Subscriber,
  ChannelState,
  ChannelManagerOptions,
} from "./types"
export {
  CHANNEL_PREFIXES,
  CHANNEL_ENTITIES,
  DEFAULT_CHANNEL_MANAGER_OPTIONS,
  buildChannelName,
  buildNotificationsChannelName,
} from "./constants"

