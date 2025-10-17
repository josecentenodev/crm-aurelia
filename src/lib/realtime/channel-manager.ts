import { getSupabaseClient } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type {
  ChannelConfig,
  ChannelState,
  PostgresChangesConfig,
  RealtimeCallback,
  UnsubscribeFn,
  ChannelManagerOptions,
  Subscriber,
} from "./types"
import { DEFAULT_CHANNEL_MANAGER_OPTIONS } from "./constants"

/**
 * Channel Manager Singleton
 * 
 * Gestiona todos los canales de Supabase Realtime de forma centralizada.
 * 
 * Características:
 * - Singleton para evitar múltiples instancias
 * - Reutilización de canales para reducir overhead
 * - Cleanup automático de canales inactivos
 * - Logging centralizado para debugging
 * - Prevención de memory leaks
 * 
 * @example
 * ```typescript
 * const manager = SupabaseChannelManager.getInstance()
 * 
 * const unsubscribe = manager.subscribe(
 *   'global:notifications:client-123',
 *   {
 *     event: 'INSERT',
 *     schema: 'public',
 *     table: 'Notification',
 *     filter: 'clientId=eq.123'
 *   },
 *   (payload) => console.log('New notification:', payload.new)
 * )
 * 
 * // Cleanup
 * unsubscribe()
 * ```
 */
export class SupabaseChannelManager {
  private static instance: SupabaseChannelManager | null = null
  
  private channels: Map<string, ChannelState> = new Map()
  private cleanupIntervalId: NodeJS.Timeout | null = null
  private options: Required<ChannelManagerOptions>
  
  private constructor(options: ChannelManagerOptions = {}) {
    this.options = {
      ...DEFAULT_CHANNEL_MANAGER_OPTIONS,
      ...options,
    }
    
    if (this.options.autoCleanup) {
      this.startAutoCleanup()
    }
    
    this.log("Channel Manager initialized")
  }
  
  /**
   * Obtener instancia singleton del Channel Manager
   */
  public static getInstance(options?: ChannelManagerOptions): SupabaseChannelManager {
    if (!SupabaseChannelManager.instance) {
      SupabaseChannelManager.instance = new SupabaseChannelManager(options)
    }
    return SupabaseChannelManager.instance
  }
  
  /**
   * Resetear instancia (útil para testing)
   */
  public static resetInstance(): void {
    if (SupabaseChannelManager.instance) {
      SupabaseChannelManager.instance.cleanup()
      SupabaseChannelManager.instance = null
    }
  }
  
  /**
   * Suscribirse a cambios en un canal
   * 
   * @param channelName - Nombre único del canal (ej: 'global:notifications:client-123')
   * @param config - Configuración de postgres_changes
   * @param callback - Función callback para eventos
   * @param channelConfig - Configuración opcional del canal
   * @returns Función para cancelar suscripción
   */
  public subscribe<T = any>(
    channelName: string,
    config: PostgresChangesConfig,
    callback: RealtimeCallback<T>,
    channelConfig?: ChannelConfig
  ): UnsubscribeFn {
    this.log(`Subscribing to channel: ${channelName}`)
    
    // Obtener o crear canal
    let channelState = this.channels.get(channelName)
    
    if (!channelState) {
      channelState = this.createChannel(channelName, channelConfig)
    }
    
    // Generar ID único para este suscriptor
    const subscriberId = this.generateSubscriberId()
    
    // Registrar suscriptor
    const subscriber: Subscriber<T> = {
      id: subscriberId,
      callback,
      config,
    }
    
    channelState.subscribers.set(subscriberId, subscriber)
    channelState.lastActivityAt = new Date()
    
    // Configurar listener en el canal
    this.setupChannelListener(channelState, subscriber)
    
    this.log(`Subscriber ${subscriberId} added to ${channelName}. Total subscribers: ${channelState.subscribers.size}`)
    
    // Retornar función de cleanup
    return () => this.unsubscribe(channelName, subscriberId)
  }
  
  /**
   * Cancelar suscripción
   */
  private unsubscribe(channelName: string, subscriberId: string): void {
    const channelState = this.channels.get(channelName)
    
    if (!channelState) {
      this.log(`Channel ${channelName} not found for unsubscribe`)
      return
    }
    
    // Remover suscriptor
    channelState.subscribers.delete(subscriberId)
    channelState.lastActivityAt = new Date()
    
    this.log(`Subscriber ${subscriberId} removed from ${channelName}. Remaining: ${channelState.subscribers.size}`)
    
    // Si no quedan suscriptores, remover canal
    if (channelState.subscribers.size === 0) {
      this.removeChannel(channelName)
    }
  }
  
  /**
   * Crear nuevo canal
   */
  private createChannel(channelName: string, config?: ChannelConfig): ChannelState {
    this.log(`Creating channel: ${channelName}`)
    
    const supabase = getSupabaseClient()
    
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: config?.broadcast ?? { self: false },
        presence: config?.presence ?? { key: "" },
      },
    })
    
    const channelState: ChannelState = {
      channel,
      subscribers: new Map(),
      status: "SUBSCRIBING",
      createdAt: new Date(),
      lastActivityAt: new Date(),
    }
    
    // Suscribirse al canal con manejo de estado
    channel.subscribe((status, error) => {
      channelState.status = status as ChannelState["status"]
      
      if (status === "SUBSCRIBED") {
        this.log(`Channel ${channelName} successfully subscribed`)
      } else if (status === "CHANNEL_ERROR") {
        this.error(`Channel ${channelName} error:`, error)
      } else if (status === "TIMED_OUT") {
        this.warn(`Channel ${channelName} subscription timed out`)
      } else if (status === "CLOSED") {
        this.log(`Channel ${channelName} closed`)
      }
    })
    
    this.channels.set(channelName, channelState)
    
    return channelState
  }
  
  /**
   * Configurar listener para un suscriptor en un canal
   */
  private setupChannelListener<T>(channelState: ChannelState, subscriber: Subscriber<T>): void {
    const { config, callback } = subscriber
    
    channelState.channel.on(
      "postgres_changes",
      {
        event: config.event,
        schema: config.schema,
        table: config.table,
        filter: config.filter,
      },
      (payload) => {
        channelState.lastActivityAt = new Date()
        
        try {
          callback(payload as any)
        } catch (error) {
          this.error(`Error in subscriber callback:`, error)
        }
      }
    )
  }
  
  /**
   * Remover canal completamente
   */
  private removeChannel(channelName: string): void {
    const channelState = this.channels.get(channelName)
    
    if (!channelState) {
      return
    }
    
    this.log(`Removing channel: ${channelName}`)
    
    const supabase = getSupabaseClient()
    
    supabase.removeChannel(channelState.channel).catch((error) => {
      this.error(`Error removing channel ${channelName}:`, error)
    })
    
    this.channels.delete(channelName)
  }
  
  /**
   * Limpiar canales inactivos
   */
  private cleanupInactiveChannels(): void {
    const now = Date.now()
    const channelsToRemove: string[] = []
    
    this.channels.forEach((channelState, channelName) => {
      const inactiveTime = now - channelState.lastActivityAt.getTime()
      
      // Si no tiene suscriptores O ha estado inactivo por mucho tiempo
      if (
        channelState.subscribers.size === 0 ||
        inactiveTime > this.options.maxInactiveTime
      ) {
        channelsToRemove.push(channelName)
      }
    })
    
    if (channelsToRemove.length > 0) {
      this.log(`Cleaning up ${channelsToRemove.length} inactive channels`)
      channelsToRemove.forEach((name) => this.removeChannel(name))
    }
  }
  
  /**
   * Iniciar limpieza automática periódica
   */
  private startAutoCleanup(): void {
    if (this.cleanupIntervalId) {
      return
    }
    
    this.cleanupIntervalId = setInterval(() => {
      this.cleanupInactiveChannels()
    }, this.options.cleanupInterval)
    
    this.log(`Auto-cleanup started (interval: ${this.options.cleanupInterval}ms)`)
  }
  
  /**
   * Detener limpieza automática
   */
  private stopAutoCleanup(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId)
      this.cleanupIntervalId = null
      this.log("Auto-cleanup stopped")
    }
  }
  
  /**
   * Limpiar todos los canales y recursos
   */
  public cleanup(): void {
    this.log("Cleaning up all channels")
    
    this.stopAutoCleanup()
    
    const channelNames = Array.from(this.channels.keys())
    channelNames.forEach((name) => this.removeChannel(name))
    
    this.channels.clear()
  }
  
  /**
   * Obtener estadísticas del Channel Manager
   */
  public getStats() {
    const stats = {
      totalChannels: this.channels.size,
      totalSubscribers: 0,
      channels: [] as Array<{
        name: string
        subscribers: number
        status: string
        createdAt: Date
        lastActivityAt: Date
      }>,
    }
    
    this.channels.forEach((channelState, channelName) => {
      stats.totalSubscribers += channelState.subscribers.size
      stats.channels.push({
        name: channelName,
        subscribers: channelState.subscribers.size,
        status: channelState.status,
        createdAt: channelState.createdAt,
        lastActivityAt: channelState.lastActivityAt,
      })
    })
    
    return stats
  }
  
  /**
   * Generar ID único para suscriptores
   */
  private generateSubscriberId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
  
  /**
   * Logging helpers
   */
  private log(...args: any[]): void {
    if (this.options.enableLogging) {
      console.log("[ChannelManager]", ...args)
    }
  }
  
  private warn(...args: any[]): void {
    if (this.options.enableLogging) {
      console.warn("[ChannelManager]", ...args)
    }
  }
  
  private error(...args: any[]): void {
    console.error("[ChannelManager]", ...args)
  }
}

/**
 * Helper para obtener instancia del Channel Manager
 */
export function getChannelManager(options?: ChannelManagerOptions): SupabaseChannelManager {
  return SupabaseChannelManager.getInstance(options)
}

