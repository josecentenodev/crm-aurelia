import { db } from '@/server/db'
import { type ProcessedMessage, type MessageRole, type MessageSenderType, type MessageType, type MessageStatus } from './types'
import { type BaseMessage } from '@/domain/Conversaciones'
import { type InputJsonValue } from '@prisma/client/runtime/library'
import { StatusMapper } from './status-mapper'
import { logger } from '@/lib/utils/server-logger'
import { ConversationCacheManager } from './conversation-cache'
import { QueryOptimizer } from './query-optimizer'

export class MessageStorage {
  async saveMessage(
    processedMessage: ProcessedMessage, 
    conversationId: string,
    evolutionInstanceId?: string
  ): Promise<BaseMessage> {
    logger.storage(`Guardando mensaje en conversación`, {
      conversationId,
      whatsappId: processedMessage.whatsappId,
      messageType: processedMessage.messageType,
      evolutionInstanceId
    })
    
    try {
      // Idempotencia: si tenemos whatsappId, evitamos duplicados por reintentos/fan-out
      if (processedMessage.whatsappId) {
        logger.storage(`Verificando idempotencia para whatsappId: ${processedMessage.whatsappId}`, {
          conversationId,
          whatsappId: processedMessage.whatsappId
        })
        
        const existing = await this.getMessageByWhatsAppId(processedMessage.whatsappId, conversationId)
        if (existing) {
          return await this.handleDuplicateMessage(existing, processedMessage, conversationId)
        }
        
        // Verificar duplicado en cualquier conversación del mismo cliente (para casos edge)
        const conversation = await db.conversation.findUnique({
          where: { id: conversationId },
          select: { clientId: true }
        })
        
        if (conversation) {
          const existingAnywhere = await this.getMessageByWhatsAppIdAnywhere(processedMessage.whatsappId, conversation.clientId)
          if (existingAnywhere && existingAnywhere.conversationId !== conversationId) {
            logger.warn(`Mensaje duplicado detectado en otra conversación`, {
              whatsappId: processedMessage.whatsappId,
              originalConversationId: existingAnywhere.conversationId,
              newConversationId: conversationId,
              clientId: conversation.clientId
            })
            
            // Invalidar cache de ambas conversaciones
            ConversationCacheManager.invalidateConversation(existingAnywhere.conversationId)
            ConversationCacheManager.invalidateConversation(conversationId)
            ConversationCacheManager.invalidateClient(conversation.clientId)
          }
        }
        
        logger.storage(`No se encontró mensaje duplicado, procediendo con creación`, {
          whatsappId: processedMessage.whatsappId,
          conversationId
        })
      }

      // Normalizar messageType a enum MessageType
      const normalizedMessageType = this.normalizeMessageType(processedMessage.messageType)
      
      logger.storage(`Creando nuevo mensaje en BD`, {
        conversationId,
        whatsappId: processedMessage.whatsappId,
        messageType: normalizedMessageType,
        evolutionInstanceId
      })
      
      const message = await db.message.create({
        data: {
          conversationId: conversationId,
          content: processedMessage.messageContent ?? 'Mensaje sin texto',
          role: processedMessage.messageRole,
          senderType: processedMessage.messageSenderType,
          
          // CAMPOS DEL PAYLOAD
          whatsappId: processedMessage.whatsappId,
          messageType: normalizedMessageType,
          messageSubType: processedMessage.messageSubType ?? undefined,
          messageStatus: StatusMapper.mapStatus(processedMessage.messageStatus) ?? null,
          source: processedMessage.source ?? 'whatsapp',
          evolutionInstanceId: evolutionInstanceId, // Agregar evolutionInstanceId
          
          // CAMPOS ESPECÍFICOS POR TIPO DE MENSAJE
          mediaUrl: processedMessage.mediaUrl ?? undefined,
          mediaFileName: processedMessage.mediaFileName ?? undefined,
          mediaSize: processedMessage.mediaSize ?? undefined,
          mediaDuration: processedMessage.mediaDuration ?? undefined,
          mediaWidth: processedMessage.mediaWidth ?? undefined,
          mediaHeight: processedMessage.mediaHeight ?? undefined,
          mediaThumbnail: processedMessage.mediaThumbnail ?? undefined,
          caption: processedMessage.caption ?? undefined,
          title: processedMessage.title ?? undefined,
          description: processedMessage.description ?? undefined,
          latitude: processedMessage.latitude ?? undefined,
          longitude: processedMessage.longitude ?? undefined,
          locationName: processedMessage.locationName ?? undefined,
          contactName: processedMessage.contactName ?? undefined,
          contactPhone: processedMessage.contactPhone ?? undefined,
          reaction: processedMessage.reaction ?? undefined,
          pollOptions: processedMessage.pollOptions ?? undefined,
          
          // METADATA ADICIONAL para información complementaria
          metadata: {
            phone: processedMessage.phoneNumber,
            pushName: processedMessage.pushName,
            isGroupMessage: processedMessage.isGroupMessage,
            isFromMe: processedMessage.isFromMe,
            timestamp: processedMessage.messageTimestamp,
            instanceName: processedMessage.instanceName,
            event: processedMessage.event,
            messageId: processedMessage.messageId
          }
        }
      })
      
      logger.storage(`Mensaje guardado exitosamente`, {
        messageId: message.id,
        conversationId,
        whatsappId: message.whatsappId ?? undefined,
        messageType: message.messageType,
        evolutionInstanceId: message.evolutionInstanceId,
        role: message.role,
        senderType: message.senderType
      })
      
      return message
    } catch (error) {
      logger.webhookError(`Error en saveMessage`, error as Error, {
        conversationId,
        whatsappId: processedMessage.whatsappId,
        messageType: processedMessage.messageType,
        evolutionInstanceId
      })
      
      throw error
    }
  }

  // Normalizar messageType a enum MessageType
  private normalizeMessageType(messageType: string): MessageType {
    if (!messageType) return 'UNKNOWN'
    
    const normalized = messageType.toUpperCase().trim()
    
    // Mapeo de tipos comunes
    const typeMap: Record<string, MessageType> = {
      'TEXT': 'TEXT',
      'CONVERSATION': 'TEXT',
      'IMAGE': 'IMAGE',
      'VIDEO': 'VIDEO',
      'AUDIO': 'AUDIO',
      'DOCUMENT': 'DOCUMENT',
      'STICKER': 'STICKER',
      'LOCATION': 'LOCATION',
      'CONTACT': 'CONTACT',
      'REACTION': 'REACTION',
      'POLL': 'POLL',
      'BUTTON': 'BUTTON',
      'LIST': 'LIST',
      'TEMPLATE': 'TEMPLATE',
      'UNKNOWN': 'UNKNOWN'
    }
    
    return typeMap[normalized] ?? 'UNKNOWN'
  }

  async saveAIResponse(
    conversationId: string, 
    response: string, 
    metadata?: Record<string, unknown>
  ): Promise<BaseMessage> {
    logger.storage(`Guardando respuesta de IA en conversación: ${conversationId}`)
    
    const message = await db.message.create({
      data: {
        conversationId: conversationId,
        content: response,
        role: 'ASSISTANT',
        senderType: 'AGENT',
        messageType: 'TEXT',
        messageStatus: 'SENT',
        source: 'ai_automated',
        metadata: {
          ...(metadata ?? {}),
          source: 'ai_automated',
          timestamp: new Date().toISOString()
        }
      }
    })
    
    logger.storage(`Respuesta de IA guardada: ${message.id}`)
    return message
  }

  async saveManualResponse(
    conversationId: string, 
    response: string, 
    metadata?: Record<string, unknown>
  ): Promise<BaseMessage> {
    logger.storage(`Guardando respuesta manual en conversación: ${conversationId}`)
    
    const message = await db.message.create({
      data: {
        conversationId: conversationId,
        content: response,
        role: 'USER',
        senderType: 'USER',
        messageType: 'TEXT',
        messageStatus: 'SENT',
        source: 'manual',
        metadata: {
          ...(metadata ?? {}),
          source: 'manual',
          timestamp: new Date().toISOString()
        }
      }
    })
    
    logger.storage(`Respuesta manual guardada: ${message.id}`)
    return message
  }

  async getMessagesByConversation(
    conversationId: string, 
    limit = 50
  ): Promise<BaseMessage[]> {
    return await db.message.findMany({
      where: { conversationId: conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit
    })
  }

  async getLastMessage(conversationId: string): Promise<BaseMessage | null> {
    return await db.message.findFirst({
      where: { conversationId: conversationId },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getMessageCount(conversationId: string): Promise<number> {
    return await db.message.count({
      where: { conversationId: conversationId }
    })
  }

  async updateMessageMetadata(messageId: string, metadata: InputJsonValue): Promise<BaseMessage> {
    logger.storage(`Actualizando metadata del mensaje: ${messageId}`)

    return await db.message.update({
      where: { id: messageId },
      data: {
        metadata,
        updatedAt: new Date()
      }
    })
  }

  async deleteMessage(messageId: string): Promise<void> {
    logger.storage(`Eliminando mensaje: ${messageId}`)
    
    await db.message.delete({
      where: { id: messageId }
    })
    
    logger.storage(`Mensaje eliminado: ${messageId}`)
  }

  async getMessagesByRole(
    conversationId: string, 
    role: MessageRole
  ): Promise<BaseMessage[]> {
    return await db.message.findMany({
      where: { 
        conversationId: conversationId,
        role: role
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  async getMessagesBySenderType(
    conversationId: string, 
    senderType: MessageSenderType
  ): Promise<BaseMessage[]> {
    return await db.message.findMany({
      where: { 
        conversationId: conversationId,
        senderType: senderType
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  async getMessagesByType(
    conversationId: string, 
    messageType: string
  ): Promise<BaseMessage[]> {
    return await db.message.findMany({
      where: { 
        conversationId: conversationId,
        messageType: messageType as MessageType
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  async getMessagesByStatus(
    conversationId: string, 
    messageStatus: MessageStatus
  ): Promise<BaseMessage[]> {
    return await db.message.findMany({
      where: { 
        conversationId: conversationId,
        messageStatus: messageStatus
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  async getConversationHistory(
    conversationId: string, 
    messageCount = 20
  ): Promise<BaseMessage[]> {
    logger.storage(`Obteniendo historial de conversación: ${conversationId} (últimos ${messageCount} mensajes)`)
    
    return await db.message.findMany({
      where: { conversationId: conversationId },
      orderBy: { createdAt: 'desc' },
      take: messageCount,
      include: {
        conversation: {
          include: {
            contact: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        }
      }
    })
  }

  // Método para buscar mensajes por WhatsApp ID
  async getMessageByWhatsAppId(whatsappId: string, conversationId: string): Promise<BaseMessage | null> {
    return await db.message.findFirst({
      where: {
        whatsappId: whatsappId,
        conversationId: conversationId
      }
    })
  }

  async getMessageByWhatsAppIdAnywhere(whatsappId: string, clientId: string): Promise<BaseMessage | null> {
    return await db.message.findFirst({
      where: {
        whatsappId: whatsappId,
        conversation: {
          clientId: clientId
        }
      },
      include: {
        conversation: {
          select: {
            id: true,
            clientId: true
          }
        }
      }
    })
  }

  /**
   * Maneja mensajes duplicados con invalidación de cache y actualización de estado
   */
  private async handleDuplicateMessage(
    existing: BaseMessage, 
    processedMessage: ProcessedMessage, 
    conversationId: string
  ): Promise<BaseMessage> {
    try {
      const nextStatus = StatusMapper.mapStatus(processedMessage.messageStatus)
      let wasUpdated = false

      // Actualizar solo el estado/metadata si cambió
      if (nextStatus !== existing.messageStatus) {
        await db.message.update({
          where: { id: existing.id },
          data: {
            messageStatus: nextStatus || undefined,
            updatedAt: new Date()
          }
        })
        
        wasUpdated = true
        logger.storage(`Estado de mensaje actualizado`, {
          messageId: existing.id,
          oldStatus: existing.messageStatus,
          newStatus: nextStatus
        })
      }

      // Invalidar cache relacionado para asegurar consistencia
      ConversationCacheManager.invalidateConversation(conversationId)
      
      // Si el mensaje fue actualizado, invalidar también el cache del cliente
      if (wasUpdated) {
        const conversation = await db.conversation.findUnique({
          where: { id: conversationId },
          select: { clientId: true }
        })
        
        if (conversation) {
          ConversationCacheManager.invalidateClient(conversation.clientId)
        }
      }
      
      logger.storage(`Mensaje duplicado detectado y procesado`, {
        messageId: existing.id,
        whatsappId: processedMessage.whatsappId,
        conversationId,
        wasUpdated
      })
      
      return existing
    } catch (updateError) {
      logger.warn(`Error actualizando estado de mensaje duplicado`, {
        messageId: existing.id,
        error: updateError instanceof Error ? updateError.message : 'Error desconocido'
      })
      
      // Invalidar cache en caso de error para evitar inconsistencias
      ConversationCacheManager.invalidateConversation(conversationId)
      
      return existing
    }
  }

  // Método para obtener estadísticas de tipos de mensaje
  async getMessageTypeStats(conversationId: string): Promise<Record<string, number>> {
    const messages = await db.message.findMany({
      where: { conversationId: conversationId },
      select: { messageType: true }
    })
    
    const stats: Record<string, number> = {}
    messages.forEach(msg => {
      if (msg.messageType) {
        stats[msg.messageType] = (stats[msg.messageType] ?? 0) + 1
      }
    })
    
    return stats
  }

  // Método para actualizar el estado de un mensaje por WhatsApp ID
  async updateMessageStatus(whatsappId: string, status: string, clientId: string): Promise<BaseMessage | null> {
    logger.storage(`Actualizando estado de mensaje`, {
      whatsappId,
      status,
      clientId
    })
    
    try {
      // Buscar el mensaje por WhatsApp ID en cualquier conversación del cliente
      const message = await db.message.findFirst({
        where: {
          whatsappId: whatsappId,
          conversation: {
            clientId: clientId
          }
        },
        include: {
          conversation: {
            select: {
              id: true,
              clientId: true
            }
          }
        }
      })
      
      if (!message) {
        logger.warn(`Mensaje no encontrado para actualizar estado`, {
          whatsappId,
          status,
          clientId
        })
        return null
      }
      
      // Mapear el estado a un valor válido de Prisma
      const mappedStatus = StatusMapper.mapStatus(status)
      
      // Actualizar el mensaje
      const updatedMessage = await db.message.update({
        where: { id: message.id },
        data: {
          messageStatus: mappedStatus ?? undefined,
          updatedAt: new Date()
        },
        include: {
          conversation: {
            select: {
              id: true,
              clientId: true
            }
          }
        }
      })
      
      logger.storage(`Estado de mensaje actualizado exitosamente`, {
        messageId: updatedMessage.id,
        whatsappId,
        oldStatus: message.messageStatus,
        newStatus: mappedStatus,
        conversationId: updatedMessage.conversationId
      })
      
      return updatedMessage
    } catch (error) {
      logger.webhookError('Error actualizando estado de mensaje', error as Error, {
        whatsappId,
        status,
        clientId
      })
      throw error
    }
  }

  /**
   * Obtiene mensajes de una conversación con caché y consultas optimizadas
   */
  async getConversationMessagesOptimized(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
    useCache: boolean = true
  ): Promise<BaseMessage[]> {
    // Intentar obtener del caché primero
    if (useCache) {
      const cachedMessages = ConversationCacheManager.getConversationMessages(
        conversationId, 
        limit, 
        offset
      )
      
      if (cachedMessages) {
        logger.storage(`Mensajes obtenidos del caché`, {
          conversationId,
          messageCount: cachedMessages.length,
          limit,
          offset
        })
        return cachedMessages
      }
    }

    // Si no hay caché, usar consulta optimizada
    const messages = await QueryOptimizer.getConversationMessagesOptimized(
      conversationId,
      limit,
      offset,
      true // includeMetadata
    )

    // Guardar en caché
    if (useCache && messages.length > 0) {
      ConversationCacheManager.setConversationMessages(
        conversationId,
        limit,
        offset,
        messages
      )
    }

    logger.storage(`Mensajes obtenidos con consulta optimizada`, {
      conversationId,
      messageCount: messages.length,
      limit,
      offset,
      fromCache: false
    })

    return messages
  }

  /**
   * Invalida caché cuando se crea un nuevo mensaje
   */
  async invalidateCacheOnNewMessage(conversationId: string, clientId: string): Promise<void> {
    ConversationCacheManager.invalidateOnNewMessage(conversationId, clientId)
    
    logger.storage(`Caché invalidado por nuevo mensaje`, {
      conversationId,
      clientId
    })
  }
}
