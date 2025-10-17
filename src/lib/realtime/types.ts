import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

/**
 * Tipo de evento de Realtime
 */
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE"

/**
 * Configuración para suscripción a cambios de Postgres
 */
export interface PostgresChangesConfig {
  event: RealtimeEventType | "*"
  schema: string
  table: string
  filter?: string
}

/**
 * Callback genérico para eventos de Realtime
 */
export type RealtimeCallback<T = any> = (payload: RealtimePostgresChangesPayload<T>) => void

/**
 * Función para cancelar suscripción
 */
export type UnsubscribeFn = () => void

/**
 * Configuración de canal
 */
export interface ChannelConfig {
  broadcast?: {
    self?: boolean
  }
  presence?: {
    key?: string
  }
  private?: boolean
}

/**
 * Información de suscriptor
 */
export interface Subscriber<T = any> {
  id: string
  callback: RealtimeCallback<T>
  config: PostgresChangesConfig
}

/**
 * Estado de canal
 */
export interface ChannelState {
  channel: RealtimeChannel
  subscribers: Map<string, Subscriber>
  status: "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED" | "SUBSCRIBING"
  createdAt: Date
  lastActivityAt: Date
}

/**
 * Opciones del Channel Manager
 */
export interface ChannelManagerOptions {
  enableLogging?: boolean
  autoCleanup?: boolean
  cleanupInterval?: number // en ms
  maxInactiveTime?: number // en ms
}

