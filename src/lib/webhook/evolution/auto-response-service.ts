import { Ai } from '@/lib/ai'
import { Encryptor } from '@/lib/encryptor/functions'
import { logger } from '@/lib/utils/server-logger'
import { db } from '@/server/db'
import { randomUUID } from 'crypto'
import { getSupabaseClient } from '@/lib/supabase'
import type { ProcessedMessage } from './types'
import type { Conversation } from '@/domain/Conversaciones'

export class AutoResponseService {
  async shouldTriggerAutoResponse(
    message: ProcessedMessage,
    conversation: Conversation,
    clientId: string
  ): Promise<boolean> {
    // 1. Solo mensajes entrantes (fromMe = false)
    if (message.isFromMe) {
      logger.debug(`Respuesta automática no aplicable: mensaje saliente`, {
        clientId,
        conversationId: conversation.id,
        isFromMe: message.isFromMe
      })
      return false
    }
    
    // 2. Solo mensajes de texto por ahora (para evitar procesar multimedia)
    if (message.messageType !== 'TEXT') {
      logger.debug(`Respuesta automática no aplicable: mensaje no es texto`, {
        clientId,
        conversationId: conversation.id,
        messageType: message.messageType
      })
      return false
    }
    
    // 3. Verificar que la IA está activa en la conversación
    if (!conversation.isAiActive) {
      logger.debug(`Respuesta automática no aplicable: IA inactiva en conversación`, {
        clientId,
        conversationId: conversation.id,
        isAiActive: conversation.isAiActive
      })
      return false
    }
    
    // 4. Verificar que la conversación tiene agente asignado
    if (!conversation.agentId) {
      logger.debug(`Respuesta automática no aplicable: sin agente asignado`, {
        clientId,
        conversationId: conversation.id,
        agentId: conversation.agentId
      })
      return false
    }
    
    // 5. Verificar que el agente está activo
    const agent = await db.agente.findUnique({
      where: { id: conversation.agentId },
      select: { isActive: true, name: true }
    })
    
    if (!agent?.isActive) {
      logger.debug(`Respuesta automática no aplicable: agente inactivo`, {
        clientId,
        conversationId: conversation.id,
        agentId: conversation.agentId,
        agentIsActive: agent?.isActive
      })
      return false
    }
    
    // 6. Verificar que no hay respuesta pendiente del agente (último mensaje del agente)
    const lastAgentMessage = await db.message.findFirst({
      where: {
        conversationId: conversation.id,
        role: 'SYSTEM',
        senderType: 'AGENT'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Si el último mensaje del agente es muy reciente (menos de 30 segundos), no responder automáticamente
    if (lastAgentMessage) {
      const timeSinceLastMessage = Date.now() - lastAgentMessage.createdAt.getTime()
      if (timeSinceLastMessage < 30000) { // 30 segundos
        logger.debug(`Respuesta automática no aplicable: respuesta reciente del agente`, {
          clientId,
          conversationId: conversation.id,
          lastMessageId: lastAgentMessage.id,
          timeSinceLastMessage
        })
        return false
      }
    }
    
    // 7. Verificar que el cliente tiene configuración de IA
    const aiInfo = await db.clientAiInfo.findUnique({
      where: { clientId }
    })
    
    if (!aiInfo) {
      logger.debug(`Respuesta automática no aplicable: sin configuración de IA`, {
        clientId,
        conversationId: conversation.id
      })
      return false
    }
    
    logger.info(`Respuesta automática aplicable`, {
      clientId,
      conversationId: conversation.id,
      agentId: conversation.agentId,
      agentName: agent.name,
      messageType: message.messageType,
      isFromMe: message.isFromMe,
      isAiActive: conversation.isAiActive
    })
    
    return true
  }

  async triggerAutoResponse(
    message: ProcessedMessage,
    conversation: Conversation,
    clientId: string,
    instanceName: string
  ): Promise<void> {
    try {
      // Obtener agente y configuración de IA
      const [agent, aiInfo] = await Promise.all([
        db.agente.findUnique({
          where: { id: conversation.agentId! },
          include: { template: true }
        }),
        db.clientAiInfo.findUnique({
          where: { clientId }
        })
      ])

      if (!agent || !aiInfo) {
        logger.warn(`No se puede generar respuesta automática - agente o AI info no encontrado`, {
          clientId,
          conversationId: conversation.id,
          agentId: conversation.agentId,
          hasAgent: !!agent,
          hasAiInfo: !!aiInfo
        })
        return
      }

      // Crear o usar aiConversationId existente
      let aiConversationId = conversation.aiConversationId
      if (!aiConversationId) {
        const apikey = Encryptor.decrypt(aiInfo.apiKeyValue)
        const aiPrompt = agent.aiPrompt || ""
        aiConversationId = await Ai.createConversationId(apikey, aiPrompt)
        
        // Actualizar conversación con aiConversationId
        await db.conversation.update({
          where: { id: conversation.id },
          data: { aiConversationId }
        })
        
        logger.info(`aiConversationId creado para conversación`, {
          clientId,
          conversationId: conversation.id,
          aiConversationId
        })
      }

      // 1. Notificar que IA empezó a escribir
      await this.notifyAiTyping(conversation.id, true)

      console.log("🔍 [triggerAutoResponse] Notified AI typing started");

      // 2. Llamar a IA de forma asíncrona
      const requestId = randomUUID()
      await Ai.fetch({
        aiApiKey: aiInfo.apiKeyValue,
        aiModel: agent.aiModel as string,
        aiConversationId: aiConversationId,
        agentId: agent.id,
        agentName: agent.name,
        message: message.messageContent,
        from: "conversation",
        conversationId: conversation.id,
        requestId,
        // Contexto adicional para el agente
        aiMetadata: {
          phoneNumber: message.phoneNumber,
          contactName: message.pushName,
          instanceName,
          clientId,
          messageType: message.messageType,
          source: message.source
        }
      }).then(async () => {
        // 3. Notificar que IA terminó de escribir
        await this.notifyAiTyping(conversation.id, false)
      }).catch(async (error: Error) => {
        // 4. En caso de error, notificar que terminó
        await this.notifyAiTyping(conversation.id, false)
        
        logger.webhookError(`Error en llamada a IA para respuesta automática`, error)
      })

      logger.info(`Respuesta automática iniciada`, {
        clientId,
        instanceName,
        conversationId: conversation.id,
        agentId: agent.id,
        agentName: agent.name,
        requestId,
        aiConversationId,
        messageContent: message.messageContent 
          ? String(message.messageContent).substring(0, 100) + '...' 
          : 'Sin contenido'
      })

    } catch (error) {
      logger.webhookError(`Error configurando respuesta automática`, error as Error, {
        clientId,
        instanceName,
        conversationId: conversation.id
      })
      throw error
    }
  }

  /**
   * Notifica el estado de typing de la IA via Supabase Realtime
   */
  private async notifyAiTyping(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      
      logger.debug(`Notificando estado de typing de IA`, {
        conversationId,
        isTyping
      })

      // Enviar notificación via Realtime
      await supabase.channel(`conversation_${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'ai_typing',
          payload: {
            conversationId,
            isTyping,
            timestamp: Date.now()
          }
        })

      logger.debug(`Estado de typing notificado exitosamente`, {
        conversationId,
        isTyping
      })

    } catch (error) {
      logger.webhookError(`Error notificando estado de typing de IA`, error as Error, {
        conversationId,
        isTyping
      })
    }
  }
}
