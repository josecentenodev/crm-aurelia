import { db } from '@/server/db'
import { type Conversation, type ConversationStatus, type ConversationType, type ContactChannel } from './types'
import { logger } from '@/lib/utils/server-logger'

export class ConversationManager {
  /**
   * Obtiene el agente principal del cliente para asignación automática
   */
  private async getLeadAgent(clientId: string): Promise<string | null> {
    try {
      const leadAgent = await db.agente.findFirst({
        where: { 
          clientId,
          isLeadAgent: true,
          isActive: true
        },
        select: { id: true, name: true }
      })
      
      if (leadAgent) {
        logger.conversation(`Agente principal encontrado: ${leadAgent.name} (${leadAgent.id})`, {
          clientId,
          agentId: leadAgent.id,
          agentName: leadAgent.name
        })
        return leadAgent.id
      }
      
      logger.warn(`No se encontró agente principal para cliente ${clientId}`, {
        clientId,
        message: 'Cliente sin agente principal activo - conversación sin agente asignado'
      })
      return null
    } catch (error) {
      logger.webhookError(`Error obteniendo agente principal`, error as Error, {
        clientId
      })
      return null
    }
  }

  async getOrCreateConversation(
    contactId: string, 
    clientId: string, 
    messageTimestamp: number,
    instanceName: string,        // Nombre de la instancia (body.instance)
    instanceId: string           // ID de Evolution API (body.data.instanceId) - NO nuestro ID
  ): Promise<Conversation> {
    // Validar parámetros de entrada
    if (!contactId || contactId.trim() === '') {
      throw new Error('contactId es requerido')
    }
    
    if (!clientId || clientId.trim() === '') {
      throw new Error('clientId es requerido')
    }
    
    if (!messageTimestamp || messageTimestamp <= 0) {
      throw new Error('messageTimestamp debe ser un número positivo')
    }
    
    if (!instanceName || instanceName.trim() === '') {
      throw new Error('instanceName es requerido')
    }
    
    // Validar que el timestamp no sea del futuro
    const messageDate = new Date(messageTimestamp * 1000)
    const now = new Date()
    if (messageDate > now) {
      throw new Error('messageTimestamp no puede ser del futuro')
    }
    
    logger.conversation(`Buscando conversación existente para contacto: ${contactId}`)
    logger.conversation(`Información de instancia:`, {
      instanceName,
      instanceId,
      timestamp: messageTimestamp
    })
    
    try {
      // BUSCAR LA INSTANCIA EN NUESTRA BD por nombre y cliente
      const evolutionInstance = await db.evolutionApiInstance.findFirst({
        where: {
          instanceName: instanceName,
          evolutionApi: {
            integration: {
              clientId: clientId
            }
          }
        },
        include: {
          evolutionApi: {
            include: {
              integration: true
            }
          }
        }
      })
      
      if (evolutionInstance) {
        logger.conversation(`Instancia encontrada en BD: ${evolutionInstance.id} (${evolutionInstance.instanceName})`)
      } else {
        logger.warn(`Instancia NO encontrada en BD: ${instanceName} para cliente ${clientId}`)
      }
    
    // Buscar conversación activa existente
    let conversation = await db.conversation.findFirst({
      where: {
        contactId: contactId,
        clientId: clientId,
        status: 'ACTIVA'
      }
    })
    
    if (!conversation) {
      // Crear nueva conversación con asignación automática del agente principal
      logger.conversation(`Creando nueva conversación para contacto: ${contactId}`)
      
      // Obtener agente principal del cliente para asignación automática
      const leadAgentId = await this.getLeadAgent(clientId)
      
      const conversationData = {
        contactId: contactId,
        clientId: clientId,
        status: 'ACTIVA' as const,
        type: 'LEAD' as const,
        channel: 'WHATSAPP' as const,
        channelInstance: instanceName,              // DEPRECATED: Nombre de la instancia (compatibilidad)
        evolutionInstanceId: evolutionInstance?.id, // NUEVO: FK a EvolutionApiInstance
        lastMessageAt: new Date(messageTimestamp * 1000),
        agentId: undefined as string | undefined,
        isAiActive: false
      }
      
      // LÓGICA REFINADA: Solo activar IA si existe agente principal
      if (leadAgentId) {
        // Cliente tiene agente principal → Asignar agente y activar IA
        conversationData.agentId = leadAgentId
        conversationData.isAiActive = true
        logger.conversation(`Asignando agente principal automáticamente y activando IA: ${leadAgentId}`, {
          clientId,
          contactId,
          agentId: leadAgentId,
          isAiActive: true,
          reason: 'Cliente tiene agente principal activo'
        })
      } else {
        // Cliente sin agente principal → Gestión manual, NO activar IA
        conversationData.isAiActive = false
        logger.conversation(`Nueva conversación para gestión manual - cliente sin agente principal`, {
          clientId,
          contactId,
          isAiActive: false,
          reason: 'Cliente sin agente principal - gestión manual'
        })
      }
      
      conversation = await db.conversation.create({
        data: conversationData
      })
      
      logger.conversation(`Conversación creada con agente asignado: ${conversation.id}`, {
        conversationId: conversation.id,
        contactId,
        clientId,
        agentId: conversation.agentId,
        isAiActive: conversation.isAiActive
      })
    } else {
      // Conversación existente - actualizar timestamp de último mensaje
      logger.conversation(`Conversación existente encontrada: ${conversation.id}`)
      
      const updateData: {
        lastMessageAt: Date
        updatedAt: Date
        channelInstance?: string
        evolutionInstanceId?: string
        agentId?: string
        isAiActive?: boolean
      } = {
        lastMessageAt: new Date(messageTimestamp * 1000),
        updatedAt: new Date()
      }
      
      // Actualizar información de instancia si cambió
      if (conversation.channelInstance !== instanceName) {
        updateData.channelInstance = instanceName
        logger.conversation(`Actualizando instancia: ${conversation.channelInstance} → ${instanceName}`)
      }
      
      // Actualizar evolutionInstanceId si encontramos la instancia en nuestra BD
      if (evolutionInstance && conversation.evolutionInstanceId !== evolutionInstance.id) {
        updateData.evolutionInstanceId = evolutionInstance.id
        logger.conversation(`Actualizando evolutionInstanceId: ${conversation.evolutionInstanceId} → ${evolutionInstance.id}`)
      }
      
      // LÓGICA REFINADA: Asignar agente principal y activar IA solo si existe agente principal
      if (!conversation.agentId) {
        const leadAgentId = await this.getLeadAgent(clientId)
        if (leadAgentId) {
          // Cliente tiene agente principal → Asignar agente y activar IA
          updateData.agentId = leadAgentId
          updateData.isAiActive = true
          logger.conversation(`Asignando agente principal y activando IA en conversación existente: ${leadAgentId}`, {
            conversationId: conversation.id,
            clientId,
            agentId: leadAgentId,
            isAiActive: true,
            reason: 'Cliente tiene agente principal activo'
          })
        } else {
          // Cliente sin agente principal → Mantener IA desactivada para gestión manual
          if (conversation.isAiActive === null || conversation.isAiActive === true) {
            updateData.isAiActive = false
            logger.conversation(`Desactivando IA en conversación existente - cliente sin agente principal`, {
              conversationId: conversation.id,
              clientId,
              previousIsAiActive: conversation.isAiActive,
              isAiActive: false,
              reason: 'Cliente sin agente principal - gestión manual'
            })
          }
        }
      }
      
      conversation = await db.conversation.update({
        where: { id: conversation.id },
        data: updateData
      })
      
      logger.conversation(`Conversación actualizada: ${conversation.id}`, {
        conversationId: conversation.id,
        lastMessageAt: conversation.lastMessageAt,
        agentId: conversation.agentId,
        isAiActive: conversation.isAiActive
      })
    }
    
      return conversation
    } catch (error) {
      logger.webhookError(`Error en getOrCreateConversation`, error as Error, {
        contactId,
        clientId,
        instanceName,
        messageTimestamp
      })
      throw error
    }
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    return await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50
        }
      }
    })
  }

  async getConversationsByContact(contactId: string): Promise<Conversation[]> {
    return await db.conversation.findMany({
      where: { contactId: contactId },
      orderBy: { lastMessageAt: 'desc' }
    })
  }

  async getActiveConversations(clientId: string): Promise<Conversation[]> {
    return await db.conversation.findMany({
      where: {
        clientId: clientId,
        status: 'ACTIVA'
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        contact: {
          select: {
            name: true,
            phone: true,
            status: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })
  }

  async updateConversationStatus(conversationId: string, status: ConversationStatus): Promise<Conversation> {
    logger.conversation(`Actualizando estado de conversación ${conversationId} a: ${status}`)
    
    // Validar que la conversación existe
    const existingConversation = await db.conversation.findUnique({
      where: { id: conversationId }
    })
    
    if (!existingConversation) {
      throw new Error(`Conversación no encontrada: ${conversationId}`)
    }
    
    // Validar transición de estado
    const isValidTransition = this.validateStatusTransition(existingConversation.status, status)
    if (!isValidTransition) {
      throw new Error(`Transición de estado inválida: ${existingConversation.status} → ${status}`)
    }
    
    return await db.conversation.update({
      where: { id: conversationId },
      data: { 
        status: status,
        updatedAt: new Date()
      }
    })
  }

  private validateStatusTransition(currentStatus: ConversationStatus, newStatus: ConversationStatus): boolean {
    const validTransitions: Record<ConversationStatus, ConversationStatus[]> = {
      'ACTIVA': ['PAUSADA', 'FINALIZADA', 'ARCHIVADA'],
      'PAUSADA': ['ACTIVA', 'FINALIZADA', 'ARCHIVADA'],
      'FINALIZADA': ['ACTIVA', 'ARCHIVADA'],
      'ARCHIVADA': ['ACTIVA']
    }
    
    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  async updateConversationType(conversationId: string, type: ConversationType): Promise<Conversation> {
    logger.conversation(`Actualizando tipo de conversación ${conversationId} a: ${type}`)
    
    return await db.conversation.update({
      where: { id: conversationId },
      data: { 
        type: type,
        updatedAt: new Date()
      }
    })
  }

  async assignConversation(conversationId: string, userId: string): Promise<Conversation> {
    logger.conversation(`Asignando conversación ${conversationId} a usuario ${userId}`)
    
    // Validar que la conversación existe
    const existingConversation = await db.conversation.findUnique({
      where: { id: conversationId }
    })
    
    if (!existingConversation) {
      throw new Error(`Conversación no encontrada: ${conversationId}`)
    }
    
    return await db.conversation.update({
      where: { id: conversationId },
      data: {
        assignedUserId: userId,
        updatedAt: new Date()
      }
    })
  }

  async closeConversation(conversationId: string): Promise<Conversation> {
    logger.conversation(`Cerrando conversación: ${conversationId}`)
    
    return await this.updateConversationStatus(conversationId, 'FINALIZADA')
  }

  async archiveConversation(conversationId: string): Promise<Conversation> {
    logger.conversation(`Archivando conversación: ${conversationId}`)
    
    return await this.updateConversationStatus(conversationId, 'ARCHIVADA')
  }

  async getActiveConversationsCount(clientId: string): Promise<number> {
    return await db.conversation.count({
      where: {
        clientId: clientId,
        status: 'ACTIVA'
      }
    })
  }

  async getConversationsByChannel(channel: ContactChannel, clientId: string): Promise<Conversation[]> {
    return await db.conversation.findMany({
      where: {
        channel: channel,
        clientId: clientId
      },
      orderBy: { lastMessageAt: 'desc' }
    })
  }

  // NUEVO: Obtener conversaciones agrupadas por instancia para el frontend
  async getConversationsGroupedByInstance(clientId: string, limit: number = 50) {
    const conversations = await db.conversation.findMany({
      where: { clientId: clientId },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      include: {
        contact: {
          select: {
            name: true,
            phone: true,
            status: true
          }
        },
        evolutionInstance: {
          select: {
            id: true,
            instanceName: true,
            phoneNumber: true,
            status: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    // Agrupar por instancia
    const groupedConversations = conversations.reduce((groups, conversation) => {
      const instanceKey = conversation.evolutionInstance?.instanceName ?? conversation.channelInstance ?? 'unknown'
      if (!groups[instanceKey]) {
        groups[instanceKey] = {
          instanceName: instanceKey,
          phoneNumber: conversation.evolutionInstance?.phoneNumber,
          status: conversation.evolutionInstance?.status,
          conversations: []
        }
      }
      groups[instanceKey].conversations.push(conversation)
      return groups
    }, {} as Record<string, { instanceName: string; phoneNumber?: string; status?: string; conversations: any[] }>)

    return Object.values(groupedConversations)
  }

  async searchConversations(
    clientId: string,
    filters: {
      status?: ConversationStatus
      channel?: ContactChannel
      type?: ConversationType
      assignedTo?: string
      searchTerm?: string
      dateFrom?: Date
      dateTo?: Date
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<Conversation[]> {
    try {
      const whereClause: any = { clientId }
      
      // Aplicar filtros
      if (filters.status) {
        whereClause.status = filters.status
      }
      
      if (filters.channel) {
        whereClause.channel = filters.channel
      }
      
      if (filters.type) {
        whereClause.type = filters.type
      }
      
      if (filters.assignedTo) {
        whereClause.assignedTo = filters.assignedTo
      }
      
      if (filters.dateFrom || filters.dateTo) {
        whereClause.lastMessageAt = {}
        if (filters.dateFrom) {
          whereClause.lastMessageAt.gte = filters.dateFrom
        }
        if (filters.dateTo) {
          whereClause.lastMessageAt.lte = filters.dateTo
        }
      }
      
      // Búsqueda por término
      if (filters.searchTerm) {
        whereClause.OR = [
          {
            contact: {
              name: {
                contains: filters.searchTerm,
                mode: 'insensitive'
              }
            }
          },
          {
            contact: {
              phone: {
                contains: filters.searchTerm
              }
            }
          }
        ]
      }
      
      const conversations = await db.conversation.findMany({
        where: whereClause,
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              phone: true,
              status: true,
              avatar: true
            }
          },
          evolutionInstance: {
            select: {
              id: true,
              instanceName: true,
              phoneNumber: true,
              status: true
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        }
      })
      
      logger.conversation(`Búsqueda de conversaciones completada`, {
        clientId,
        filters,
        limit,
        offset,
        resultsCount: conversations.length
      })
      
      return conversations
    } catch (error) {
      logger.webhookError(`Error buscando conversaciones`, error as Error, {
        clientId,
        filters,
        limit,
        offset
      })
      throw error
    }
  }

  async getConversationStats(clientId: string): Promise<{
    total: number
    active: number
    paused: number
    closed: number
    archived: number
    byChannel: Record<string, number>
    byType: Record<string, number>
  }> {
    try {
      // Estadísticas generales
      const total = await db.conversation.count({
        where: { clientId }
      })
      
      const active = await db.conversation.count({
        where: { clientId, status: 'ACTIVA' }
      })
      
      const paused = await db.conversation.count({
        where: { clientId, status: 'PAUSADA' }
      })
      
      const closed = await db.conversation.count({
        where: { clientId, status: 'FINALIZADA' }
      })
      
      const archived = await db.conversation.count({
        where: { clientId, status: 'ARCHIVADA' }
      })
      
      // Estadísticas por canal
      const byChannel = await db.conversation.groupBy({
        by: ['channel'],
        where: { clientId },
        _count: { id: true }
      })
      
      // Estadísticas por tipo
      const byType = await db.conversation.groupBy({
        by: ['type'],
        where: { clientId },
        _count: { id: true }
      })
      
      const stats = {
        total,
        active,
        paused,
        closed,
        archived,
        byChannel: byChannel.reduce((acc, item) => {
          acc[item.channel] = item._count.id
          return acc
        }, {} as Record<string, number>),
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.id
          return acc
        }, {} as Record<string, number>)
      }
      
      logger.conversation(`Estadísticas de conversaciones calculadas`, {
        clientId,
        stats
      })
      
      return stats
    } catch (error) {
      logger.webhookError(`Error calculando estadísticas de conversaciones`, error as Error, {
        clientId
      })
      throw error
    }
  }
}

