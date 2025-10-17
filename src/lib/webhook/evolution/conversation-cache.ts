import { logger } from '@/lib/utils/server-logger'

/**
 * Sistema de caché en memoria para optimizar performance del módulo de conversaciones
 * Implementa estrategias de caché inteligente con TTL y invalidación automática
 */
export class ConversationCache {
  private static cache = new Map<string, { data: any; expires: number; hits: number }>()
  private static readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos
  private static readonly MAX_CACHE_SIZE = 1000 // Máximo 1000 entradas
  private static readonly CLEANUP_INTERVAL = 60 * 1000 // Limpiar cada minuto

  static {
    // Iniciar limpieza automática
    setInterval(() => {
      this.cleanup()
    }, this.CLEANUP_INTERVAL)
  }

  /**
   * Obtiene un valor del caché
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar si ha expirado
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    // Incrementar contador de hits
    entry.hits++
    
    logger.storage(`Cache hit para clave: ${key}`, {
      key,
      hits: entry.hits,
      ttl: entry.expires - Date.now()
    })

    return entry.data as T
  }

  /**
   * Establece un valor en el caché
   */
  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Verificar límite de caché
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsed()
    }

    const expires = Date.now() + ttl
    
    this.cache.set(key, {
      data,
      expires,
      hits: 0
    })

    logger.storage(`Cache set para clave: ${key}`, {
      key,
      ttl,
      cacheSize: this.cache.size
    })
  }

  /**
   * Invalida una entrada específica del caché
   */
  static invalidate(key: string): void {
    const deleted = this.cache.delete(key)
    
    if (deleted) {
      logger.storage(`Cache invalidado para clave: ${key}`, {
        key,
        cacheSize: this.cache.size
      })
    }
  }

  /**
   * Invalida múltiples entradas que coincidan con un patrón
   */
  static invalidatePattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    )

    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })

    if (keysToDelete.length > 0) {
      logger.storage(`Cache invalidado por patrón: ${pattern}`, {
        pattern,
        deletedKeys: keysToDelete.length,
        cacheSize: this.cache.size
      })
    }
  }

  /**
   * Limpia entradas expiradas
   */
  private static cleanup(): void {
    const now = Date.now()
    const keysToDelete = Array.from(this.cache.entries())
      .filter(([_, entry]) => now > entry.expires)
      .map(([key, _]) => key)

    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })

    if (keysToDelete.length > 0) {
      logger.storage(`Cache cleanup completado`, {
        deletedKeys: keysToDelete.length,
        cacheSize: this.cache.size
      })
    }
  }

  /**
   * Elimina la entrada menos usada cuando el caché está lleno
   */
  private static evictLeastUsed(): void {
    let leastUsedKey = ''
    let leastHits = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits
        leastUsedKey = key
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
      logger.storage(`Cache eviction: eliminada entrada menos usada`, {
        key: leastUsedKey,
        hits: leastHits,
        cacheSize: this.cache.size
      })
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  static getStats(): {
    size: number
    maxSize: number
    hitRate: number
    totalHits: number
  } {
    const totalHits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.hits, 0)

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      totalHits
    }
  }

  /**
   * Limpia todo el caché
   */
  static clear(): void {
    const size = this.cache.size
    this.cache.clear()
    
    logger.storage(`Cache limpiado completamente`, {
      previousSize: size
    })
  }
}

/**
 * Caché específico para conversaciones con estrategias optimizadas
 */
export class ConversationCacheManager {
  private static readonly CONVERSATION_TTL = 10 * 60 * 1000 // 10 minutos
  private static readonly CONTACT_TTL = 30 * 60 * 1000 // 30 minutos
  private static readonly MESSAGE_TTL = 5 * 60 * 1000 // 5 minutos

  /**
   * Obtiene conversaciones activas del caché
   */
  static getActiveConversations(clientId: string): any[] | null {
    const key = `conversations:active:${clientId}`
    return ConversationCache.get(key)
  }

  /**
   * Establece conversaciones activas en el caché
   */
  static setActiveConversations(clientId: string, conversations: any[]): void {
    const key = `conversations:active:${clientId}`
    ConversationCache.set(key, conversations, this.CONVERSATION_TTL)
  }

  /**
   * Obtiene mensajes de una conversación del caché
   */
  static getConversationMessages(conversationId: string, limit: number, offset: number): any[] | null {
    const key = `messages:${conversationId}:${limit}:${offset}`
    return ConversationCache.get(key)
  }

  /**
   * Establece mensajes de una conversación en el caché
   */
  static setConversationMessages(conversationId: string, limit: number, offset: number, messages: any[]): void {
    const key = `messages:${conversationId}:${limit}:${offset}`
    ConversationCache.set(key, messages, this.MESSAGE_TTL)
  }

  /**
   * Obtiene un contacto del caché
   */
  static getContact(contactId: string): any | null {
    const key = `contact:${contactId}`
    return ConversationCache.get(key)
  }

  /**
   * Establece un contacto en el caché
   */
  static setContact(contactId: string, contact: any): void {
    const key = `contact:${contactId}`
    ConversationCache.set(key, contact, this.CONTACT_TTL)
  }

  /**
   * Invalida caché relacionado con una conversación
   */
  static invalidateConversation(conversationId: string): void {
    // Invalidar mensajes de la conversación
    ConversationCache.invalidatePattern(`messages:${conversationId}`)
    
    // Invalidar conversaciones activas del cliente
    ConversationCache.invalidatePattern('conversations:active')
    
    logger.storage(`Cache invalidado para conversación: ${conversationId}`, {
      conversationId
    })
  }

  /**
   * Invalida caché relacionado con un contacto
   */
  static invalidateContact(contactId: string): void {
    ConversationCache.invalidate(`contact:${contactId}`)
    
    // Invalidar conversaciones activas ya que pueden incluir este contacto
    ConversationCache.invalidatePattern('conversations:active')
    
    logger.storage(`Cache invalidado para contacto: ${contactId}`, {
      contactId
    })
  }

  /**
   * Invalida caché relacionado con un cliente
   */
  static invalidateClient(clientId: string): void {
    ConversationCache.invalidatePattern(`conversations:active:${clientId}`)
    ConversationCache.invalidatePattern(`messages:${clientId}`)
    
    logger.storage(`Cache invalidado para cliente: ${clientId}`, {
      clientId
    })
  }

  /**
   * Invalida caché cuando se crea un nuevo mensaje
   */
  static invalidateOnNewMessage(conversationId: string, clientId: string): void {
    // Invalidar mensajes de la conversación
    ConversationCache.invalidatePattern(`messages:${conversationId}`)
    
    // Invalidar conversaciones activas del cliente
    ConversationCache.invalidate(`conversations:active:${clientId}`)
    
    logger.storage(`Cache invalidado por nuevo mensaje`, {
      conversationId,
      clientId
    })
  }
}
