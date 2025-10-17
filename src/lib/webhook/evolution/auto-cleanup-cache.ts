import { logger } from '@/lib/utils/server-logger'

interface CacheEntry<T = any> {
  value: T
  timestamp: number
  accessCount: number
  lastAccessed: number
}

interface CacheConfig {
  ttl: number // Time to live en ms
  maxSize: number // Máximo número de entradas
  cleanupInterval: number // Intervalo de limpieza en ms
  accessThreshold: number // Número mínimo de accesos para mantener entrada
}

export class AutoCleanupCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private cleanupTimer?: NodeJS.Timeout
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutos por defecto
      maxSize: 1000,
      cleanupInterval: 60 * 1000, // 1 minuto
      accessThreshold: 1,
      ...config
    }
    
    this.startCleanupTimer()
  }

  /**
   * Obtiene un valor del cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return undefined
    }
    
    // Verificar si ha expirado
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return undefined
    }
    
    // Actualizar estadísticas de acceso
    entry.accessCount++
    entry.lastAccessed = Date.now()
    
    return entry.value
  }

  /**
   * Establece un valor en el cache
   */
  set(key: string, value: T): void {
    const now = Date.now()
    
    // Verificar límite de tamaño
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed()
    }
    
    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    })
    
    logger.debug('Entrada agregada al cache', {
      key,
      cacheSize: this.cache.size,
      maxSize: this.config.maxSize
    })
  }

  /**
   * Verifica si una entrada ha expirado
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl
  }

  /**
   * Elimina la entrada menos usada cuando se alcanza el límite
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | undefined
    let leastUsedScore = Infinity
    
    for (const [key, entry] of this.cache.entries()) {
      // Calcular score basado en acceso y tiempo
      const timeSinceLastAccess = Date.now() - entry.lastAccessed
      const score = entry.accessCount / (timeSinceLastAccess / 1000 + 1)
      
      if (score < leastUsedScore) {
        leastUsedScore = score
        leastUsedKey = key
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
      logger.debug('Entrada menos usada eliminada del cache', {
        key: leastUsedKey,
        score: leastUsedScore
      })
    }
  }

  /**
   * Limpia entradas expiradas
   */
  private cleanupExpired(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key))
    
    if (expiredKeys.length > 0) {
      logger.debug('Entradas expiradas limpiadas', {
        cleanedCount: expiredKeys.length,
        remainingCacheSize: this.cache.size
      })
    }
  }

  /**
   * Limpia entradas con pocos accesos
   */
  private cleanupLowAccess(): void {
    const lowAccessKeys: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < this.config.accessThreshold) {
        lowAccessKeys.push(key)
      }
    }
    
    lowAccessKeys.forEach(key => this.cache.delete(key))
    
    if (lowAccessKeys.length > 0) {
      logger.debug('Entradas con pocos accesos limpiadas', {
        cleanedCount: lowAccessKeys.length,
        threshold: this.config.accessThreshold
      })
    }
  }

  /**
   * Inicia el timer de limpieza automática
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
      this.cleanupLowAccess()
    }, this.config.cleanupInterval)
  }

  /**
   * Detiene el timer de limpieza
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  /**
   * Verifica si una clave existe en el cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry ? !this.isExpired(entry) : false
  }

  /**
   * Elimina una entrada específica
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear()
    logger.debug('Cache limpiado completamente')
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): {
    size: number
    maxSize: number
    ttl: number
    cleanupInterval: number
    accessThreshold: number
    averageAccessCount: number
    oldestEntry: number
    newestEntry: number
  } {
    const entries = Array.from(this.cache.values())
    const accessCounts = entries.map(e => e.accessCount)
    const timestamps = entries.map(e => e.timestamp)
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      cleanupInterval: this.config.cleanupInterval,
      accessThreshold: this.config.accessThreshold,
      averageAccessCount: accessCounts.length > 0 
        ? accessCounts.reduce((a, b) => a + b, 0) / accessCounts.length 
        : 0,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    }
  }

  /**
   * Obtiene todas las claves del cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Obtiene todas las entradas del cache
   */
  entries(): Array<[string, T]> {
    const result: Array<[string, T]> = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        result.push([key, entry.value])
      }
    }
    
    return result
  }

  /**
   * Destruye el cache y limpia recursos
   */
  destroy(): void {
    this.stopCleanupTimer()
    this.clear()
  }
}

// Cache específico para validaciones de acceso del webhook
export const webhookAccessCache = new AutoCleanupCache<boolean>({
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 500,
  cleanupInterval: 30 * 1000, // 30 segundos
  accessThreshold: 2 // Mantener entradas con al menos 2 accesos
})

// Cache para clientes
export const clientCache = new AutoCleanupCache<any>({
  ttl: 10 * 60 * 1000, // 10 minutos
  maxSize: 100,
  cleanupInterval: 60 * 1000, // 1 minuto
  accessThreshold: 1
})

// Cache para instancias
export const instanceCache = new AutoCleanupCache<any>({
  ttl: 15 * 60 * 1000, // 15 minutos
  maxSize: 200,
  cleanupInterval: 60 * 1000, // 1 minuto
  accessThreshold: 1
})
