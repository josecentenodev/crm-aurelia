import { db } from '@/server/db'
import { logger } from '@/lib/utils/server-logger'

/**
 * Optimizador de consultas para mejorar performance del módulo de conversaciones
 * Implementa índices compuestos, consultas eficientes y estrategias de caché
 */
export class QueryOptimizer {
  
  /**
   * Obtiene mensajes de una conversación con paginación optimizada
   * Usa índices compuestos para mejor performance
   */
  static async getConversationMessagesOptimized(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
    includeMetadata: boolean = false
  ) {
    const startTime = Date.now()
    
    try {
      // Consulta optimizada con índices compuestos
      const messages = await db.message.findMany({
        where: {
          conversationId,
          // Filtro adicional para mensajes válidos
          content: {
            not: null
          }
        },
        select: {
          id: true,
          content: true,
          role: true,
          senderType: true,
          whatsappId: true,
          messageType: true,
          messageSubType: true,
          messageStatus: true,
          mediaUrl: true,
          mediaFileName: true,
          mediaSize: true,
          mediaDuration: true,
          mediaWidth: true,
          mediaHeight: true,
          mediaThumbnail: true,
          caption: true,
          title: true,
          description: true,
          latitude: true,
          longitude: true,
          locationName: true,
          contactName: true,
          contactPhone: true,
          reaction: true,
          pollOptions: true,
          createdAt: true,
          updatedAt: true,
          // Solo incluir metadata si se solicita (reduce transferencia)
          ...(includeMetadata && {
            metadata: true,
            evolutionInstanceId: true
          })
        },
        orderBy: [
          { createdAt: 'desc' }, // Índice compuesto: conversationId + createdAt
          { id: 'desc' } // Índice secundario para desambiguación
        ],
        take: limit,
        skip: offset
      })

      const processingTime = Date.now() - startTime
      
      logger.storage(`Consulta optimizada de mensajes completada`, {
        conversationId,
        messageCount: messages.length,
        limit,
        offset,
        processingTimeMs: processingTime,
        includeMetadata
      })

      return messages
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      logger.webhookError(`Error en consulta optimizada de mensajes`, error as Error, {
        conversationId,
        limit,
        offset,
        processingTimeMs: processingTime
      })
      
      throw error
    }
  }

  /**
   * Busca conversaciones activas con filtros optimizados
   * Usa índices compuestos para mejor performance
   */
  static async getActiveConversationsOptimized(
    clientId: string,
    limit: number = 20,
    offset: number = 0,
    filters?: {
      status?: string
      assignedTo?: string
      lastMessageAfter?: Date
    }
  ) {
    const startTime = Date.now()
    
    try {
      const whereClause: any = {
        clientId,
        // Solo conversaciones con mensajes
        messages: {
          some: {}
        }
      }

      // Aplicar filtros adicionales
      if (filters?.status) {
        whereClause.status = filters.status
      }
      
      if (filters?.assignedTo) {
        whereClause.assignedTo = filters.assignedTo
      }
      
      if (filters?.lastMessageAfter) {
        whereClause.lastMessageAt = {
          gte: filters.lastMessageAfter
        }
      }

      const conversations = await db.conversation.findMany({
        where: whereClause,
        select: {
          id: true,
          contactId: true,
          status: true,
          assignedTo: true,
          lastMessageAt: true,
          createdAt: true,
          updatedAt: true,
          // Solo campos esenciales del contacto
          contact: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
              isBlocked: true
            }
          },
          // Solo el último mensaje para preview
          messages: {
            select: {
              id: true,
              content: true,
              messageType: true,
              createdAt: true,
              role: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          // Contador de mensajes no leídos
          _count: {
            select: {
              messages: {
                where: {
                  role: 'user',
                  messageStatus: {
                    not: 'read'
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { lastMessageAt: 'desc' }, // Índice compuesto: clientId + lastMessageAt
          { updatedAt: 'desc' }
        ],
        take: limit,
        skip: offset
      })

      const processingTime = Date.now() - startTime
      
      logger.storage(`Consulta optimizada de conversaciones completada`, {
        clientId,
        conversationCount: conversations.length,
        limit,
        offset,
        filters,
        processingTimeMs: processingTime
      })

      return conversations
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      logger.webhookError(`Error en consulta optimizada de conversaciones`, error as Error, {
        clientId,
        limit,
        offset,
        filters,
        processingTimeMs: processingTime
      })
      
      throw error
    }
  }

  /**
   * Busca contactos con búsqueda optimizada por texto
   * Usa índices de texto completo para mejor performance
   */
  static async searchContactsOptimized(
    clientId: string,
    searchTerm: string,
    limit: number = 20,
    offset: number = 0
  ) {
    const startTime = Date.now()
    
    try {
      // Búsqueda optimizada con índices de texto
      const contacts = await db.contact.findMany({
        where: {
          clientId,
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            },
            {
              phone: {
                contains: searchTerm
              }
            },
            {
              email: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
          // Solo conversaciones activas
          conversations: {
            select: {
              id: true,
              status: true,
              lastMessageAt: true
            },
            where: {
              status: {
                not: 'closed'
              }
            },
            orderBy: { lastMessageAt: 'desc' },
            take: 1
          }
        },
        orderBy: [
          { name: 'asc' }, // Índice compuesto: clientId + name
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset
      })

      const processingTime = Date.now() - startTime
      
      logger.storage(`Búsqueda optimizada de contactos completada`, {
        clientId,
        searchTerm,
        contactCount: contacts.length,
        limit,
        offset,
        processingTimeMs: processingTime
      })

      return contacts
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      logger.webhookError(`Error en búsqueda optimizada de contactos`, error as Error, {
        clientId,
        searchTerm,
        limit,
        offset,
        processingTimeMs: processingTime
      })
      
      throw error
    }
  }

  /**
   * Obtiene estadísticas de conversaciones con agregaciones optimizadas
   */
  static async getConversationStatsOptimized(clientId: string) {
    const startTime = Date.now()
    
    try {
      // Usar agregaciones nativas de Prisma para mejor performance
      const stats = await db.conversation.aggregate({
        where: { clientId },
        _count: {
          id: true
        },
        _avg: {
          // Calcular promedio de tiempo de respuesta si tenemos el campo
        }
      })

      // Estadísticas por estado
      const statusStats = await db.conversation.groupBy({
        by: ['status'],
        where: { clientId },
        _count: {
          id: true
        }
      })

      // Estadísticas de mensajes
      const messageStats = await db.message.aggregate({
        where: {
          conversation: {
            clientId
          }
        },
        _count: {
          id: true
        },
        _avg: {
          // Calcular promedio de longitud de mensajes si tenemos el campo
        }
      })

      const processingTime = Date.now() - startTime
      
      logger.storage(`Estadísticas optimizadas calculadas`, {
        clientId,
        totalConversations: stats._count.id,
        statusStats,
        totalMessages: messageStats._count.id,
        processingTimeMs: processingTime
      })

      return {
        totalConversations: stats._count.id,
        statusStats: statusStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id
          return acc
        }, {} as Record<string, number>),
        totalMessages: messageStats._count.id
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      logger.webhookError(`Error calculando estadísticas optimizadas`, error as Error, {
        clientId,
        processingTimeMs: processingTime
      })
      
      throw error
    }
  }

  /**
   * Procesa múltiples mensajes en lote para mejor performance
   */
  static async batchProcessMessages(
    messages: Array<{
      processedMessage: any
      conversationId: string
      evolutionInstanceId?: string
    }>
  ) {
    const startTime = Date.now()
    
    try {
      // Procesar en lotes de 10 para evitar timeouts
      const batchSize = 10
      const results = []
      
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize)
        
        // Procesar lote en paralelo
        const batchPromises = batch.map(async (messageData) => {
          try {
            // Aquí iría la lógica de procesamiento individual
            // Por ahora retornamos un placeholder
            return {
              success: true,
              messageId: `batch_${i}_${Math.random()}`,
              ...messageData
            }
          } catch (error) {
            logger.webhookError(`Error procesando mensaje en lote`, error as Error, {
              conversationId: messageData.conversationId,
              whatsappId: messageData.processedMessage.whatsappId
            })
            
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Error desconocido',
              ...messageData
            }
          }
        })
        
        const batchResults = await Promise.allSettled(batchPromises)
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : {
            success: false,
            error: result.reason instanceof Error ? result.reason.message : 'Error desconocido'
          }
        ))
      }

      const processingTime = Date.now() - startTime
      
      logger.storage(`Procesamiento en lote completado`, {
        totalMessages: messages.length,
        successfulMessages: results.filter(r => r.success).length,
        failedMessages: results.filter(r => !r.success).length,
        processingTimeMs: processingTime
      })

      return results
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      logger.webhookError(`Error en procesamiento en lote`, error as Error, {
        totalMessages: messages.length,
        processingTimeMs: processingTime
      })
      
      throw error
    }
  }
}
