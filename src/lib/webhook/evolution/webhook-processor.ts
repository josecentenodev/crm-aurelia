import { type EvolutionWebhookPayload } from '@/services/evolution-api-types'
import { MessageProcessor } from './message-processor'
import { ClientCacheManager } from './client-cache'
import { ContactManager } from './contact-manager'
import { ConversationManager } from './conversation-manager'
import { MessageStorage } from './message-storage'
import { mediaStorageService } from './media-storage-service'
import { AutoResponseService } from './auto-response-service'
import { type Contact, type Conversation, type ProcessedMessage, type WebhookResult, type ProcessedMessageResult } from './types'
import { type BaseMessage } from '@/domain/Conversaciones'
// Notifications handled automatically by Supabase Realtime for messages
import { logger } from '@/lib/utils/server-logger'

export class WebhookProcessor {
  private messageProcessor: MessageProcessor
  private clientCacheManager: ClientCacheManager
  private contactManager: ContactManager
  private conversationManager: ConversationManager
  private messageStorage: MessageStorage
  private autoResponseService: AutoResponseService

  constructor() {
    this.messageProcessor = new MessageProcessor()
    this.clientCacheManager = new ClientCacheManager()
    this.contactManager = new ContactManager()
    this.conversationManager = new ConversationManager()
    this.messageStorage = new MessageStorage()
    this.autoResponseService = new AutoResponseService()
  }

  async processWebhook(
    body: EvolutionWebhookPayload,
    clientId: string,
    instanceName: string
  ): Promise<WebhookResult> {
    const startTime = Date.now()

    try {
      logger.webhook(body.event || 'unknown', `Iniciando procesamiento de webhook`, body, {
        clientId,
        instanceName,
        event: body.event
      })

      // 1. Validar consistencia entre URL y payload
      if (body.instance !== instanceName) {
        logger.warn(`Inconsistencia entre URL y payload`, {
          clientId,
          instanceName,
          urlInstance: instanceName,
          payloadInstance: body.instance,
          event: body.event
        })

        return {
          success: false,
          error: `Instance mismatch: expected ${instanceName}, got ${body.instance}`,
          messageType: 'validation_error'
        }
      }

      // 2. Obtener cliente desde cache
      logger.info(`Obteniendo cliente desde cache`, {
        clientId,
        instanceName
      })

      const client = await this.clientCacheManager.getClient(clientId)

      logger.info(`Cliente obtenido exitosamente`, {
        clientId,
        instanceName,
        clientName: client.name
      })

      // 2.b Manejo de eventos de actualización de mensajes (messages.update)
      if (body.event === 'messages.update') {
        logger.webhook(body.event, `Procesando evento de actualización de mensaje`, body, {
          clientId,
          instanceName,
          event: body.event
        })

        const messageId = body.data.key?.id
        const status = body.data.status

        if (!messageId || !status) {
          logger.warn('Evento messages.update sin messageId o status válido, ignorando', {
            clientId,
            instanceName,
            event: body.event,
            messageId,
            status
          })

          return {
            success: true,
            messageType: 'message_update_ignored',
            data: { reason: 'messageId o status vacío' }
          }
        }

        try {
          // Actualizar el estado del mensaje en la base de datos
          const updatedMessage = await this.messageStorage.updateMessageStatus(messageId, status, clientId) as BaseMessage | null

          if (updatedMessage?.id && updatedMessage?.conversationId) {
            logger.messageProcessed(`Estado de mensaje actualizado exitosamente`, {
              clientId,
              instanceName,
              messageId,
              status,
              conversationId: updatedMessage.conversationId
            })

            return {
              success: true,
              messageType: 'message_status_updated',
              data: {
                messageId: updatedMessage.id,
                conversationId: updatedMessage.conversationId,
                status: status
              }
            }
          } else {
            logger.warn(`Mensaje no encontrado para actualizar estado`, {
              clientId,
              instanceName,
              messageId,
              status
            })

            return {
              success: true,
              messageType: 'message_not_found',
              data: { reason: 'Mensaje no encontrado para actualizar' }
            }
          }
        } catch (err) {
          logger.webhookError('Error actualizando estado de mensaje', err as Error, {
            clientId,
            instanceName,
            event: body.event,
            messageId,
            status
          })

          return {
            success: false,
            messageType: 'message_update_error',
            error: err instanceof Error ? err.message : 'Error desconocido'
          }
        }
      }

      // 2.c Manejo de eventos de contactos (CONTACTS_*)
      if (this.isContactEvent(body.event)) {
        logger.webhook(body.event, `Procesando evento de contacto`, body, {
          clientId,
          instanceName,
          event: body.event
        })

        const remoteJid = body.data.key?.remoteJid
        const pushName = body.data.pushName
        const phoneNumber = this.extractPhoneFromRemoteJid(remoteJid)

        logger.info(`Datos de contacto extraídos`, {
          clientId,
          instanceName,
          remoteJid,
          pushName,
          phoneNumber,
          event: body.event
        })

        if (!remoteJid || !phoneNumber) {
          logger.warn('Evento de contacto sin remoteJid válido, ignorando', {
            clientId,
            instanceName,
            event: body.event,
            remoteJid
          })

          return {
            success: true,
            messageType: 'contact_event_ignored',
            data: { reason: 'remoteJid vacío o inválido' }
          }
        }

        try {
          const contact = await this.contactManager.upsertContact(
            phoneNumber,
            pushName ?? 'Sin nombre',
            clientId,
            remoteJid,
            'whatsapp'
          )

          logger.contact(`Contacto procesado exitosamente`, {
            clientId,
            instanceName,
            contactId: contact.id,
            phone: contact.phone,
            name: contact.name,
            event: body.event
          })

          return {
            success: true,
            messageType: 'contact_upserted',
            data: {
              contactId: contact.id,
              phoneNumber: contact.phone,
              name: contact.name,
              instance: instanceName
            }
          }
        } catch (err) {
          logger.webhookError('Error procesando evento de contacto', err as Error, {
            clientId,
            instanceName,
            event: body.event,
            remoteJid,
            phoneNumber
          })

          return {
            success: false,
            messageType: 'contact_error',
            error: err instanceof Error ? err.message : 'Error desconocido'
          }
        }
      }

      // 3. Procesar mensaje
      const remoteJid = body.data.key?.remoteJid
      logger.messageProcessed(`Iniciando procesamiento de mensaje`, {
        clientId,
        instanceName,
        event: body.event,
        remoteJid: remoteJid
      })

      const processedMessage = await this.messageProcessor.processWebhook(body)
      this.messageProcessor.logMessageDetails(processedMessage)

      // 3. Si no se debe procesar, retornar resultado con información detallada
      if (!processedMessage.shouldProcess) {
        const isLidMessage = remoteJid?.includes('@lid') ?? false
        const isInvalidFormat = remoteJid ? !remoteJid.includes('@s.whatsapp.net') : false

        logger.messageProcessed(`Mensaje ignorado: ${processedMessage.reason}`, {
          clientId,
          instanceName,
          event: body.event,
          reason: processedMessage.reason,
          whatsappId: processedMessage.whatsappId ?? undefined,
          remoteJid: remoteJid,
          isLidMessage: isLidMessage,
          isInvalidFormat: isInvalidFormat,
          messageType: processedMessage.messageType
        })

        // Clasificar el tipo de ignorado para mejor tracking
        let messageType = 'message_ignored'
        if (isLidMessage) {
          messageType = 'mobile_message_ignored'
        } else if (isInvalidFormat) {
          messageType = 'invalid_remotejid_ignored'
        } else if (processedMessage.reason?.includes('grupo')) {
          messageType = 'group_message_ignored'
        } else if (processedMessage.reason?.includes('reacción')) {
          messageType = 'reaction_ignored'
        }

        return {
          success: true,
          messageType: messageType,
          data: {
            reason: processedMessage.reason,
            remoteJid: remoteJid,
            whatsappId: processedMessage.whatsappId,
            isLidMessage: isLidMessage,
            isInvalidFormat: isInvalidFormat
          }
        }
      }

      // 4. Verificación temprana de idempotencia para evitar procesamiento innecesario
      if (processedMessage.whatsappId) {
        logger.messageProcessed(`Verificando idempotencia para whatsappId: ${processedMessage.whatsappId}`, {
          clientId,
          instanceName,
          whatsappId: processedMessage.whatsappId,
          event: body.event
        })

        // Buscar si ya existe un mensaje con este whatsappId en cualquier conversación del cliente
        const existingMessage = await this.messageStorage.getMessageByWhatsAppIdAnywhere(
          processedMessage.whatsappId,
          clientId
        )

        if (existingMessage) {
          logger.messageProcessed(`Mensaje ya procesado anteriormente - IDEMPOTENCIA`, {
            clientId,
            instanceName,
            whatsappId: processedMessage.whatsappId,
            existingMessageId: existingMessage.id,
            conversationId: existingMessage.conversationId,
            event: body.event
          })

          // Para eventos de actualización, permitir actualizar el estado
          if (body.event === 'messages.update' && processedMessage.whatsappId && processedMessage.messageStatus) {
            try {
              await this.messageStorage.updateMessageStatus(
                processedMessage.whatsappId,
                processedMessage.messageStatus,
                clientId
              )

              return {
                success: true,
                messageType: 'duplicate_status_updated',
                data: {
                  messageId: existingMessage.id,
                  whatsappId: processedMessage.whatsappId,
                  reason: 'Mensaje duplicado - estado actualizado'
                }
              }
            } catch (updateError) {
              logger.warn(`Error actualizando estado de mensaje duplicado`, {
                whatsappId: processedMessage.whatsappId,
                error: updateError instanceof Error ? updateError.message : 'Error desconocido'
              })
            }
          }

          return {
            success: true,
            messageType: 'duplicate_skipped',
            data: {
              messageId: existingMessage.id,
              whatsappId: processedMessage.whatsappId,
              reason: 'Mensaje ya procesado anteriormente'
            }
          }
        }
      }

      // 5. Procesar mensaje completo (contacto, conversación, mensaje)
      const result = await this.processIncomingMessage(processedMessage, body, clientId, instanceName)

      const processingTime = Date.now() - startTime

      logger.webhook(body.event || 'unknown', `Webhook procesado exitosamente en ${processingTime}ms`, result, {
        clientId,
        instanceName,
        event: body.event,
        processingTimeMs: processingTime,
        contactId: result.contactId,
        conversationId: result.conversationId,
        messageId: result.messageId
      })

      return {
        success: true,
        messageType: 'message_processed',
        data: result
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      const errorInstance = error as Error

      // Clasificar el tipo de error para mejor debugging y manejo
      let errorType = "unknown_error"
      let errorMessage = errorInstance.message || 'Error desconocido'

      if (errorInstance.name === "ValidationError" || errorInstance.message.includes("validation")) {
        errorType = "validation_error"
        errorMessage = "Error de validación en el payload del webhook"
      } else if (errorInstance.name === "DatabaseError" || errorInstance.message.includes("database")) {
        errorType = "database_error"
        errorMessage = "Error de conexión a la base de datos"
      } else if (errorInstance.name === "NetworkError" || errorInstance.message.includes("network")) {
        errorType = "network_error"
        errorMessage = "Error de conexión de red"
      } else if (errorInstance.message.includes("duplicate") || errorInstance.message.includes("idempotency")) {
        errorType = "duplicate_error"
        errorMessage = "Error de idempotencia - mensaje duplicado"
      } else if (errorInstance.message.includes("contact") || errorInstance.message.includes("ContactManager")) {
        errorType = "contact_error"
        errorMessage = "Error procesando información del contacto"
      } else if (errorInstance.message.includes("conversation") || errorInstance.message.includes("ConversationManager")) {
        errorType = "conversation_error"
        errorMessage = "Error procesando conversación"
      } else if (errorInstance.message.includes("message") || errorInstance.message.includes("MessageStorage")) {
        errorType = "message_error"
        errorMessage = "Error almacenando mensaje"
      }

      logger.webhookError(`Error procesando webhook (${errorType})`, errorInstance, {
        clientId,
        instanceName,
        event: body.event,
        processingTimeMs: processingTime,
        errorType,
        errorMessage: errorInstance.message,
        errorStack: errorInstance.stack
      })

      return {
        success: false,
        messageType: errorType,
        error: errorMessage
      }
    }
  }

  private isContactEvent(event?: string): boolean {
    if (!event) return false
    const e = event.toUpperCase()
    return e === 'CONTACTS_UPSERT' || e === 'CONTACTS_SET' || e === 'CONTACTS_UPDATE'
  }

  /**
   * Valida el formato del remoteJid y determina si el mensaje debe ser procesado
   * @param remoteJid - El remoteJid del mensaje
   * @returns Objeto con información de validación
   */
  private validateRemoteJid(remoteJid?: string): {
    isValid: boolean
    isLidMessage: boolean
    isGroupMessage: boolean
    isWhatsAppMessage: boolean
    reason?: string
  } {
    if (!remoteJid) {
      return {
        isValid: false,
        isLidMessage: false,
        isGroupMessage: false,
        isWhatsAppMessage: false,
        reason: 'remoteJid vacío'
      }
    }

    const isLidMessage = remoteJid.includes('@lid')
    const isGroupMessage = remoteJid.includes('@g.us')
    const isWhatsAppMessage = remoteJid.includes('@s.whatsapp.net')

    if (isLidMessage) {
      return {
        isValid: false,
        isLidMessage: true,
        isGroupMessage: false,
        isWhatsAppMessage: false,
        reason: 'Mensaje desde celular (@lid) - ignorado para evitar duplicados'
      }
    }

    if (isGroupMessage) {
      return {
        isValid: false,
        isLidMessage: false,
        isGroupMessage: true,
        isWhatsAppMessage: false,
        reason: 'Mensaje de grupo - no procesamos grupos por ahora'
      }
    }

    if (!isWhatsAppMessage) {
      return {
        isValid: false,
        isLidMessage: false,
        isGroupMessage: false,
        isWhatsAppMessage: false,
        reason: `remoteJid inválido (${remoteJid}) - solo procesamos @s.whatsapp.net`
      }
    }

    return {
      isValid: true,
      isLidMessage: false,
      isGroupMessage: false,
      isWhatsAppMessage: true
    }
  }

  private extractPhoneFromRemoteJid(remoteJid?: string): string | undefined {
    if (!remoteJid) return undefined
    // Usar normalización consistente con ContactManager
    const normalized = this.normalizePhoneNumber(remoteJid)
    return normalized || undefined
  }

  /**
   * Normaliza un número de teléfono para búsqueda consistente
   * Maneja diferentes formatos de WhatsApp (@lid, @s.whatsapp.net, etc.)
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return ''

    // Remover sufijos de WhatsApp
    let normalized = phoneNumber
      .replace('@s.whatsapp.net', '')
      .replace('@g.us', '')
      .replace('@lid', '')

    // Remover caracteres no numéricos excepto +
    normalized = normalized.replace(/[^\d+]/g, '')

    // Si empieza con +, mantenerlo; si no, agregarlo si es internacional
    if (normalized.startsWith('+')) {
      return normalized
    }

    // Si es un número largo sin +, probablemente es internacional
    if (normalized.length >= 10) {
      return '+' + normalized
    }

    return normalized
  }

  private async processIncomingMessage(
    processedMessage: ProcessedMessage,
    body: EvolutionWebhookPayload,
    clientId: string,
    instanceName: string
  ): Promise<ProcessedMessageResult> {
    logger.messageProcessed(`Procesando mensaje entrante`, {
      clientId,
      instanceName,
      phoneNumber: processedMessage.phoneNumber,
      isFromMe: processedMessage.isFromMe,
      whatsappId: processedMessage.whatsappId ?? undefined
    })

    let contact: Contact;

    try {
      if (processedMessage.isFromMe) {
        // MENSAJE SALIENTE: NO actualizar contacto, solo buscar/crear sin pushName
        logger.messageProcessed(`Mensaje saliente detectado - NO actualizando información del contacto`, {
          clientId,
          instanceName,
          phoneNumber: processedMessage.phoneNumber,
          whatsappId: processedMessage.whatsappId ?? undefined
        })

        contact = await this.contactManager.getOrCreateContactWithoutUpdate(
          processedMessage.phoneNumber ?? '',
          clientId,
          body.data.key.remoteJid,
          body.data.source
        )
      } else {
        // MENSAJE ENTRANTE: SÍ actualizar contacto con pushName del remitente
        logger.messageProcessed(`Mensaje entrante detectado - actualizando información del contacto`, {
          clientId,
          instanceName,
          phoneNumber: processedMessage.phoneNumber,
          pushName: processedMessage.pushName,
          whatsappId: processedMessage.whatsappId ?? undefined
        })

        contact = await this.contactManager.upsertContact(
          processedMessage.phoneNumber ?? '',
          processedMessage.pushName ?? '',
          clientId,
          body.data.key.remoteJid,
          body.data.source
        )
      }

      logger.contact(`Contacto procesado`, {
        clientId,
        instanceName,
        contactId: contact.id,
        name: contact.name,
        phone: contact.phone,
        isFromMe: processedMessage.isFromMe
      })

      // 2. Get or create conversación con información de instancia
      logger.conversation(`Iniciando búsqueda/creación de conversación`, {
        clientId,
        instanceName,
        contactId: contact.id,
        phoneNumber: processedMessage.phoneNumber
      })

      const conversation: Conversation = await this.conversationManager.getOrCreateConversation(
        contact.id,
        clientId,
        processedMessage.messageTimestamp!,
        instanceName,
        body.data.instanceId
      )

      logger.conversation(`Conversación procesada`, {
        clientId,
        instanceName,
        conversationId: conversation.id,
        contactId: contact.id,
        evolutionInstanceId: conversation.evolutionInstanceId
      })

      // 3. Guardar mensaje con todos los campos del payload y evolutionInstanceId
      logger.storage(`Iniciando guardado de mensaje`, {
        clientId,
        instanceName,
        conversationId: conversation.id,
        whatsappId: processedMessage.whatsappId ?? undefined,
        messageType: processedMessage.messageType
      })

      const message = await this.messageStorage.saveMessage(
        processedMessage,
        conversation.id,
        conversation.evolutionInstanceId ?? undefined // Pasar el evolutionInstanceId de la conversación
      )

      // Verificar que el mensaje se guardó correctamente
      if (!message?.id) {
        throw new Error('Error: mensaje no se guardó correctamente')
      }

      logger.storage(`Mensaje guardado exitosamente`, {
        clientId,
        instanceName,
        messageId: message.id,
        conversationId: conversation.id,
        whatsappId: processedMessage.whatsappId ?? undefined,
        evolutionInstanceId: message.evolutionInstanceId
      })

      // 4. ALMACENAMIENTO AUTOMÁTICO DE MULTIMEDIA EN BACKGROUND
      // Procesar multimedia en background para no bloquear el webhook
      if (processedMessage.mediaUrl && processedMessage.messageType && this.isMultimediaMessage(processedMessage.messageType)) {
        logger.storage(`Iniciando almacenamiento automático de multimedia en background`, {
          clientId,
          instanceName,
          messageId: message.id,
          messageType: processedMessage.messageType,
          mediaUrl: processedMessage.mediaUrl
        })

        // Obtener información del contenedor desde el cliente con manejo robusto de errores
        try {
          const containerName = await this.getContainerNameFromClient(clientId)

          if (containerName) {
            // Procesar multimedia directamente
            await mediaStorageService.processMedia(
              message.id,
              processedMessage.mediaUrl,
              processedMessage.messageType,
              instanceName,
              containerName,
              clientId, // Usar clientId como clientTag
              processedMessage.whatsappId, // WhatsApp message ID
              body.data.key.remoteJid // Remote JID del mensaje
            )

            logger.storage(`Multimedia procesado exitosamente en background`, {
              clientId,
              instanceName,
              messageId: message.id,
              messageType: processedMessage.messageType,
              containerName
            })
          } else {
            logger.warn(`No se pudo obtener containerName para almacenamiento automático`, {
              clientId,
              instanceName,
              messageId: message.id,
              messageType: processedMessage.messageType
            })
          }
        } catch (mediaError) {
          // No fallar el webhook completo por errores de multimedia
          logger.webhookError(`Error procesando multimedia en background`, mediaError as Error, {
            clientId,
            instanceName,
            messageId: message.id,
            messageType: processedMessage.messageType,
            mediaUrl: processedMessage.mediaUrl
          })
        }
      }

      // 5. NOTIFICACIONES EN TIEMPO REAL
      // Las notificaciones de mensajes se manejan automáticamente por Supabase Realtime
      // cuando se inserta un nuevo mensaje en la base de datos.

      logger.info(`Mensaje guardado - Supabase Realtime notificará automáticamente`, {
        clientId,
        instanceName,
        messageId: message.id,
        conversationId: conversation.id
      })

      // 6. RESPUESTA AUTOMÁTICA POR IA
      if (!processedMessage.isFromMe && conversation.isAiActive) {
        try {
          await this.autoResponseService.triggerAutoResponse(
            processedMessage,
            conversation,
            clientId,
            instanceName
          )

          logger.info(`Respuesta automática iniciada`, {
            clientId,
            instanceName,
            conversationId: conversation.id,
            messageId: message.id
          })
        } catch (error) {
          logger.webhookError(`Error iniciando respuesta automática`, error as Error, {
            clientId,
            instanceName,
            conversationId: conversation.id,
            messageId: message.id
          })
          // No lanzar error para no afectar el procesamiento del mensaje
        }
      }

      return {
        contactId: contact.id,
        conversationId: conversation.id,
        messageId: message.id,
        phoneNumber: processedMessage.phoneNumber,
        pushName: contact.name
      }

    } catch (error) {
      logger.webhookError(`Error en processIncomingMessage`, error as Error, {
        clientId,
        instanceName,
        phoneNumber: processedMessage.phoneNumber,
        whatsappId: processedMessage.whatsappId ?? undefined,
        isFromMe: processedMessage.isFromMe
      })
      throw error
    }
  }

  // Método para obtener estadísticas del cache
  getCacheStats() {
    return this.clientCacheManager.getCacheStats()
  }

  // Método para limpiar cache manualmente
  clearCache() {
    this.clientCacheManager.clearCache()
  }

  /**
   * Verifica si un mensaje es de tipo multimedia
   */
  private isMultimediaMessage(messageType: string): boolean {
    const multimediaTypes = ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER']
    return multimediaTypes.includes(messageType)
  }

  /**
   * Obtiene el nombre del contenedor desde el cliente
   */
  private async getContainerNameFromClient(clientId: string): Promise<string | null> {
    try {
      // Buscar la integración de Evolution API para obtener el nombre real del contenedor
      const { db } = await import('@/server/db')

      logger.debug(`Buscando integración Evolution API para cliente`, {
        clientId
      })

      // Primero buscar la ClientIntegration para Evolution API
      const clientIntegration = await db.clientIntegration.findFirst({
        where: {
          clientId: clientId,
          type: 'EVOLUTION_API',
          isActive: true
        },
        select: {
          id: true,
          client: {
            select: {
              name: true
            }
          },
          evolutionApi: {
            select: {
              containerName: true,
              containerStatus: true
            }
          }
        }
      })

      if (!clientIntegration) {
        logger.warn(`No se encontró integración Evolution API activa para cliente`, {
          clientId
        })
        return null
      }

      if (!clientIntegration.evolutionApi) {
        logger.warn(`Cliente tiene integración Evolution API pero sin datos específicos`, {
          clientId,
          integrationId: clientIntegration.id,
          clientName: clientIntegration.client.name
        })
        return null
      }

      if (clientIntegration.evolutionApi.containerName) {
        logger.debug(`Container name obtenido de BD para cliente`, {
          clientId,
          clientName: clientIntegration.client.name,
          containerName: clientIntegration.evolutionApi.containerName,
          containerStatus: clientIntegration.evolutionApi.containerStatus
        })

        return clientIntegration.evolutionApi.containerName
      }

      logger.warn(`Integración Evolution API encontrada pero sin containerName`, {
        clientId,
        clientName: clientIntegration.client.name,
        integrationId: clientIntegration.id,
        containerStatus: clientIntegration.evolutionApi.containerStatus
      })

      return null
    } catch (error) {
      logger.webhookError(`Error obteniendo container name`, error as Error, {
        clientId,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error)
      })
      return null
    }
  }
}
