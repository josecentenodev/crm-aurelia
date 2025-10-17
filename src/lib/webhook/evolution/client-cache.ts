import { db } from '@/server/db'
import { logger } from '@/lib/utils/server-logger'

export interface CachedClient {
  id: string
  name: string
  status: { name: string }
  plan: { name: string }
}

export class ClientCacheManager {
  private cache = new Map<string, { client: CachedClient; timestamp: number }>()
  private readonly TTL = 30 * 60 * 1000 // 30 minutos (aumentado de 5 minutos)
  private readonly MAX_CACHE_SIZE = 500 // Aumentado de 100 para evitar limpiezas prematuras

  constructor() {
    // Limpiar cache cada 30 minutos para mejor balance entre performance y memoria
    setInterval(() => this.cleanup(), 30 * 60 * 1000)
    
    // Cleanup más agresivo si el cache está muy lleno
    setInterval(() => {
      if (this.cache.size >= this.MAX_CACHE_SIZE * 0.8) {
        this.aggressiveCleanup()
      }
    }, 5 * 60 * 1000) // Cada 5 minutos
  }

  async getClient(clientId: string): Promise<CachedClient> {
    const now = Date.now()
    const cached = this.cache.get(clientId)
    
    if (cached && (now - cached.timestamp) < this.TTL) {
      logger.info(`Cache hit para cliente ${clientId}`, {
        clientId,
        cacheAge: now - cached.timestamp,
        cacheSize: this.cache.size,
        maxCacheSize: this.MAX_CACHE_SIZE
      })
      return cached.client
    }
    
    logger.info(`Cache miss para cliente ${clientId}, consultando BD`, {
      clientId,
      cacheSize: this.cache.size,
      maxCacheSize: this.MAX_CACHE_SIZE,
      ttlMinutes: this.TTL / (60 * 1000)
    })
    
    try {
      const client = await db.client.findUnique({
        where: { id: clientId },
        select: { 
          id: true, 
          name: true,
          status: { select: { name: true } },
          plan: { select: { name: true } }
        }
      })
      
      logger.info(`Resultado de consulta BD para cliente ${clientId}:`, {
        found: !!client,
        clientId: client?.id,
        name: client?.name,
        hasStatus: !!client?.status,
        hasPlan: !!client?.plan
      })
      
      if (!client) {
        logger.error(`Cliente ${clientId} no encontrado en la base de datos`)
        throw new Error(`Cliente ${clientId} no encontrado`)
      }
      
      // Limpiar cache si está muy lleno
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.cleanup()
      }
      
      this.cache.set(clientId, { client, timestamp: now })
      return client
    } catch (error) {
      logger.error(`Error consultando cliente ${clientId}:`, error as Error)
      throw error
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    const totalEntries = this.cache.size
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key))
    
    if (expiredKeys.length > 0) {
      logger.info(`Cache limpiado: ${expiredKeys.length} entradas expiradas`, {
        expiredCount: expiredKeys.length,
        remainingCount: this.cache.size,
        totalBeforeCleanup: totalEntries,
        cleanupIntervalMinutes: 30,
        ttlMinutes: this.TTL / (60 * 1000)
      })
    } else {
      logger.info(`Cache cleanup ejecutado - no hay entradas expiradas`, {
        totalEntries: this.cache.size,
        maxCacheSize: this.MAX_CACHE_SIZE,
        ttlMinutes: this.TTL / (60 * 1000)
      })
    }
  }

  /**
   * Cleanup agresivo cuando el cache está cerca del límite
   */
  private aggressiveCleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    const totalEntries = entries.length
    
    // Ordenar por timestamp (más antiguos primero)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Eliminar el 20% más antiguo
    const toDelete = Math.floor(totalEntries * 0.2)
    const keysToDelete = entries.slice(0, toDelete).map(([key]) => key)
    
    keysToDelete.forEach(key => this.cache.delete(key))
    
    logger.info(`Cache cleanup agresivo ejecutado`, {
      deletedCount: keysToDelete.length,
      remainingCount: this.cache.size,
      totalBeforeCleanup: totalEntries,
      utilizationPercent: Math.round((this.cache.size / this.MAX_CACHE_SIZE) * 100)
    })
  }

  clearCache(): void {
    this.cache.clear()
    logger.info('Cache completamente limpiado')
  }

  getCacheStats(): { 
    size: number; 
    maxSize: number; 
    ttlMinutes: number;
    cleanupIntervalMinutes: number;
    utilizationPercent: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttlMinutes: this.TTL / (60 * 1000),
      cleanupIntervalMinutes: 60,
      utilizationPercent: Math.round((this.cache.size / this.MAX_CACHE_SIZE) * 100)
    }
  }
}
