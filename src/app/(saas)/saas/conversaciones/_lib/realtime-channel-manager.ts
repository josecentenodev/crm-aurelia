import { getSupabaseClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

class RealtimeChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map<string, RealtimeChannel>()
  private channelClients: Map<string, ReturnType<typeof getSupabaseClient>> = new Map()
  private pendingCleanups: Set<string> = new Set<string>()
  private subscriptionCounts: Map<string, number> = new Map<string, number>()
  
  // ✅ COLA GLOBAL: Garantiza que TODAS las operaciones se ejecuten EN SERIE
  // Esto previene que canales diferentes se creen/destruyan en paralelo
  private globalOperationQueue: Promise<any> = Promise.resolve()
  
  private readonly CLEANUP_DELAY_MS = 200 // Reducido porque la cola previene race conditions
  private readonly MAX_CHANNELS_WARNING = 10
  private readonly MAX_CHANNELS_HARD_LIMIT = 100

  async getOrCreateChannel(
    channelName: string,
    setupCallback: (channel: RealtimeChannel) => RealtimeChannel
  ): Promise<RealtimeChannel> {
    // ✅ Usar cola global - todas las operaciones en serie
    return this.enqueueOperation(async () => {
      return this._doGetOrCreateChannel(channelName, setupCallback)
    })
  }

  async removeChannel(channelName: string): Promise<void> {
    // ✅ Usar cola global - todas las operaciones en serie
    return this.enqueueOperation(async () => {
      return this._doRemoveChannel(channelName)
    })
  }

  // ✅ Cola global: UNA operación a la vez para TODO el manager
  private async enqueueOperation<T>(operation: () => Promise<T>): Promise<T> {
    // Obtener la última operación en la cola
    const previousOperation = this.globalOperationQueue
    
    // Crear nueva operación que espera a la anterior
    const currentOperation = previousOperation
      .catch(() => {}) // Ignorar errores de operaciones previas
      .then(() => operation()) // Ejecutar la operación actual
    
    // Actualizar la cola global
    this.globalOperationQueue = currentOperation.catch(() => {})
    
    // Retornar el resultado
    return currentOperation
  }

  // ✅ Lógica interna de getOrCreateChannel (sin manejo de cola)
  private async _doGetOrCreateChannel(
    channelName: string,
    setupCallback: (channel: RealtimeChannel) => RealtimeChannel
  ): Promise<RealtimeChannel> {
    // Increment reference count
    const currentCount = this.subscriptionCounts.get(channelName) || 0
    this.subscriptionCounts.set(channelName, currentCount + 1)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[RealtimeManager] 📈 Channel refs: ${channelName} = ${currentCount + 1}`)
    }

    // Reutilizar canal si existe y está join
    const existing = this.channels.get(channelName)
    if (existing) {
      const state = String(existing.state)
      if (state === 'joined') {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[RealtimeManager] ♻️ Reutilizando canal activo: ${channelName}`)
        }
        return existing
      }

      console.warn(`[RealtimeManager] 🔄 Canal en estado ${state}, limpiando antes de crear: ${channelName}`)
      // Limpiar el canal antiguo de forma segura
      try {
        const supabase = getSupabaseClient()
        await existing.unsubscribe().catch(err => {
          console.warn(`[RealtimeManager] warn: unsubscribe failed for ${channelName}`, err)
        })
        await supabase.removeChannel(existing).catch(err => {
          console.warn(`[RealtimeManager] warn: removeChannel failed for ${channelName}`, err)
        })
      } catch (error) {
        console.error(`[RealtimeManager] Error limpiando canal obsoleto:`, error)
      } finally {
        this.channels.delete(channelName)
      }
    }

    // Protección: no permitir crear masivamente
    if (this.channels.size >= this.MAX_CHANNELS_HARD_LIMIT) {
      this.decrementRefCount(channelName)
      throw new Error(`[RealtimeManager] CRITICAL: Reached hard limit of ${this.MAX_CHANNELS_HARD_LIMIT} channels`)
    }

    // Crear canal
    try {
      const channel = await this._createChannel(channelName, setupCallback)
      return channel
    } catch (err) {
      this.decrementRefCount(channelName)
      throw err
    }
  }

  private async _createChannel(
    channelName: string,
    setupCallback: (channel: RealtimeChannel) => RealtimeChannel
  ): Promise<RealtimeChannel> {
    console.log(`[RealtimeManager] 🆕 Creando nuevo canal: ${channelName}`)
    const supabase = getSupabaseClient()
    const channel = supabase.channel(channelName)
    const configuredChannel = setupCallback(channel)

    // Store client used to create channel (used on cleanup)
    this.channelClients.set(channelName, supabase)

    // Espera robusta al estado joined
    await new Promise<void>((resolve, reject) => {
      const TIMEOUT_MS = 30000
      const start = Date.now()

      const check = () => {
        const state = String((configuredChannel as any).state)
        if (state === 'joined' || state === 'subscribed' || state === 'open') {
          resolve()
          return
        }
        if (state === 'errored' || state === 'closed') {
          reject(new Error(`Channel ${channelName} failed to subscribe: ${state}`))
          return
        }
        if (Date.now() - start > TIMEOUT_MS) {
          reject(new Error(`Channel ${channelName} subscription timeout after ${TIMEOUT_MS}ms`))
          return
        }
        setTimeout(check, 100)
      }

      check()
    })

    // Canal conectado correctamente
    this.channels.set(channelName, configuredChannel)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RealtimeManager] ✅ Canal conectado y registrado: ${channelName}`)
      console.log(`[RealtimeManager] 📊 Canales activos: ${this.channels.size}`)
    }

    return configuredChannel
  }

  // ✅ Lógica interna de removeChannel (sin manejo de cola)
  private async _doRemoveChannel(channelName: string): Promise<void> {
    // Decrement reference count
    const currentCount = this.subscriptionCounts.get(channelName) || 0
    const newCount = Math.max(0, currentCount - 1)
    this.subscriptionCounts.set(channelName, newCount)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[RealtimeManager] 📉 Channel refs: ${channelName} = ${newCount}`)
    }

    // Only cleanup when no more refs
    if (newCount > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[RealtimeManager] ⏳ Channel still in use: ${channelName} (${newCount} refs)`)
      }
      return
    }

    const channel = this.channels.get(channelName)

    if (!channel) {
      console.log(`[RealtimeManager] ⚠️ Canal no encontrado para remover: ${channelName}`)
      this.subscriptionCounts.delete(channelName)
      return
    }

    this.pendingCleanups.add(channelName)
    console.log(`[RealtimeManager] 🧹 Iniciando limpieza de canal: ${channelName}`)

    try {
      const supabase = getSupabaseClient()

      console.log(`[RealtimeManager] 📤 Unsubscribing canal: ${channelName}`)
      await channel.unsubscribe().catch(err => {
        console.warn(`[RealtimeManager] warn: unsubscribe failed for ${channelName}`, err)
      })

      // Espera para asegurar que el socket tenga tiempo de limpiar
      await new Promise(resolve => setTimeout(resolve, this.CLEANUP_DELAY_MS))

      console.log(`[RealtimeManager] 🗑️ Removiendo canal del cliente: ${channelName}`)
      await supabase.removeChannel(channel).catch(err => {
        console.warn(`[RealtimeManager] warn: removeChannel failed for ${channelName}`, err)
      })

      this.channels.delete(channelName)
      this.subscriptionCounts.delete(channelName)

      console.log(`[RealtimeManager] ✅ Canal limpiado exitosamente: ${channelName}`)
      console.log(`[RealtimeManager] 📊 Canales restantes: ${this.channels.size}`)

    } catch (error) {
      console.error(`[RealtimeManager] ❌ Error limpiando canal ${channelName}:`, error)
      this.channels.delete(channelName)
      this.subscriptionCounts.delete(channelName)
    } finally {
      this.pendingCleanups.delete(channelName)
    }
  }

  getActiveChannels(): string[] {
    return Array.from(this.channels.keys())
  }

  getStatus(): {
    activeChannels: number
    pendingCleanups: number
    hasQueuedOperations: boolean
    channels: string[]
    cleaningUp: string[]
  } {
    return {
      activeChannels: this.channels.size,
      pendingCleanups: this.pendingCleanups.size,
      hasQueuedOperations: this.globalOperationQueue !== Promise.resolve(),
      channels: Array.from(this.channels.keys()),
      cleaningUp: Array.from(this.pendingCleanups)
    }
  }

  getHealthStatus(): {
    activeChannels: number
    pendingCleanups: number
    channelRefs: Record<string, number>
    isHealthy: boolean
    warning: string | null
  } {
    const channelCount = this.channels.size
    const isHealthy = channelCount < this.MAX_CHANNELS_WARNING

    let warning: string | null = null
    if (channelCount >= this.MAX_CHANNELS_WARNING && channelCount < 20) {
      warning = `High channel count: ${channelCount}/${this.MAX_CHANNELS_WARNING} - possible leak`
    } else if (channelCount >= 20) {
      warning = `CRITICAL: ${channelCount} channels active - connection may fail soon!`
    }

    return {
      activeChannels: channelCount,
      pendingCleanups: this.pendingCleanups.size,
      channelRefs: Object.fromEntries(this.subscriptionCounts),
      isHealthy,
      warning
    }
  }

  hasChannel(channelName: string): boolean {
    return this.channels.has(channelName)
  }

  async cleanupAll(): Promise<void> {
    console.log(`[RealtimeManager] 🧹 Limpieza total de ${this.channels.size} canales`)

    const channelNames = Array.from(this.channels.keys())

    for (const channelName of channelNames) {
      // Reset ref counts a 1 para forzar la limpieza
      this.subscriptionCounts.set(channelName, 1)
      await this.removeChannel(channelName)
    }

    console.log('[RealtimeManager] ✅ Limpieza total completada')
  }

  async forceCleanupAll(): Promise<void> {
    console.warn('[RealtimeManager] ⚠️ Force cleaning all channels')

    // Clear all ref counts
    this.subscriptionCounts.clear()

    await this.cleanupAll()
  }

  // Helper para decrementar el contador de forma segura
  private decrementRefCount(channelName: string) {
    const current = this.subscriptionCounts.get(channelName) || 0
    const next = Math.max(0, current - 1)
    if (next === 0) {
      this.subscriptionCounts.delete(channelName)
    } else {
      this.subscriptionCounts.set(channelName, next)
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RealtimeManager] 🔽 Decrement ref: ${channelName} => ${next}`)
    }
  }
}

export const realtimeManager = new RealtimeChannelManager()
