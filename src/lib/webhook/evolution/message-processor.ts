import { type EvolutionWebhookPayload } from '@/services/evolution-api-types'
import { type ProcessedMessage, type MessageRole, type MessageSenderType } from './types'
import { StatusMapper } from './status-mapper'
import { logger } from '@/lib/utils/server-logger'
import { MediaFileProcessor } from './media-file-processor'

export class MessageProcessor {
  private async extractMessageContent(messageData: any): Promise<{
    content: string
    messageType: string
    messageSubType?: string
    mediaUrl?: string
    mediaFileName?: string
    mediaSize?: number
    mediaDuration?: number
    mediaWidth?: number
    mediaHeight?: number
    mediaThumbnail?: string
    caption?: string
    title?: string
    description?: string
    latitude?: number
    longitude?: number
    locationName?: string
    contactName?: string
    contactPhone?: string
    reaction?: string
    pollOptions?: string[]
  }> {
    const message = messageData.message
    
    if (!message) {
      return { 
        content: 'Mensaje sin contenido', 
        messageType: 'UNKNOWN' 
      }
    }
    
    // Texto simple
    if (message.conversation) {
      return { 
        content: message.conversation, 
        messageType: 'TEXT' 
      }
    }
    
    // Imagen
    if (message.imageMessage) {
      const img = message.imageMessage
      const processedMedia = await MediaFileProcessor.processMediaFile(img, 'IMAGE')
      
      return {
        content: img.caption || '📷 Imagen',
        messageType: 'IMAGE',
        messageSubType: processedMedia.processedMimetype || img.mimetype,
        mediaUrl: processedMedia.processedUrl || img.url,
        mediaFileName: processedMedia.processedFileName || img.fileName,
        mediaSize: processedMedia.fileSize || (img.fileLength ? parseInt(img.fileLength) : undefined),
        mediaWidth: img.width,
        mediaHeight: img.height,
        mediaThumbnail: processedMedia.thumbnail || img.jpegThumbnail,
        caption: img.caption
      }
    }
    
    // Video
    if (message.videoMessage) {
      const vid = message.videoMessage
      const processedMedia = await MediaFileProcessor.processMediaFile(vid, 'VIDEO')
      
      return {
        content: vid.caption || '🎥 Video',
        messageType: 'VIDEO',
        messageSubType: processedMedia.processedMimetype || vid.mimetype,
        mediaUrl: processedMedia.processedUrl || vid.url,
        mediaFileName: processedMedia.processedFileName || vid.fileName,
        mediaSize: processedMedia.fileSize || (vid.fileLength ? parseInt(vid.fileLength) : undefined),
        mediaDuration: vid.seconds,
        mediaWidth: vid.width,
        mediaHeight: vid.height,
        mediaThumbnail: processedMedia.thumbnail || vid.jpegThumbnail,
        caption: vid.caption
      }
    }
    
    // Audio
    if (message.audioMessage) {
      const aud = message.audioMessage
      const processedMedia = await MediaFileProcessor.processMediaFile(aud, 'AUDIO')
      
      return {
        content: '🎵 Audio',
        messageType: 'AUDIO',
        messageSubType: processedMedia.processedMimetype || aud.mimetype,
        mediaUrl: processedMedia.processedUrl || aud.url,
        mediaFileName: processedMedia.processedFileName || aud.fileName,
        mediaSize: processedMedia.fileSize || (aud.fileLength ? parseInt(aud.fileLength) : undefined),
        mediaDuration: aud.seconds
      }
    }
    
    // Documento
    if (message.documentMessage) {
      const doc = message.documentMessage
      const processedMedia = await MediaFileProcessor.processMediaFile(doc, 'DOCUMENT')
      
      return {
        content: `📄 ${doc.title || doc.fileName || 'Documento'}`,
        messageType: 'DOCUMENT',
        messageSubType: processedMedia.processedMimetype || doc.mimetype,
        mediaUrl: processedMedia.processedUrl || doc.url,
        mediaFileName: processedMedia.processedFileName || doc.fileName,
        mediaSize: processedMedia.fileSize || (doc.fileLength ? parseInt(doc.fileLength) : undefined),
        title: doc.title,
        description: doc.description
      }
    }
    
    // Sticker
    if (message.stickerMessage) {
      const stk = message.stickerMessage
      const processedMedia = await MediaFileProcessor.processMediaFile(stk, 'STICKER')
      
      return {
        content: '😀 Sticker',
        messageType: 'STICKER',
        messageSubType: processedMedia.processedMimetype || stk.mimetype,
        mediaUrl: processedMedia.processedUrl || stk.url,
        mediaFileName: processedMedia.processedFileName || stk.fileName,
        mediaSize: processedMedia.fileSize || (stk.fileLength ? parseInt(stk.fileLength) : undefined),
        mediaWidth: stk.width,
        mediaHeight: stk.height
      }
    }
    
    // Ubicación
    if (message.locationMessage) {
      const loc = message.locationMessage
      return {
        content: '📍 Ubicación',
        messageType: 'LOCATION',
        latitude: loc.degreesLatitude,
        longitude: loc.degreesLongitude,
        locationName: loc.name
      }
    }
    
    // Contacto
    if (message.contactMessage) {
      const contact = message.contactMessage
      return {
        content: '👤 Contacto',
        messageType: 'CONTACT',
        contactName: contact.displayName,
        contactPhone: contact.vcard
      }
    }
    
    // Reacción
    if (message.reactionMessage) {
      return {
        content: `Reacción: ${message.reactionMessage.text}`,
        messageType: 'REACTION',
        reaction: message.reactionMessage.text
      }
    }
    
    // Encuesta
    if (message.pollMessage) {
      return {
        content: '📊 Encuesta',
        messageType: 'POLL',
        pollOptions: message.pollMessage.options?.map((opt: any) => opt.optionName) || []
      }
    }
    
    // Botón
    if (message.buttonMessage) {
      return {
        content: '🔘 Botón',
        messageType: 'BUTTON'
      }
    }
    
    // Lista
    if (message.listMessage) {
      return {
        content: '📋 Lista',
        messageType: 'LIST'
      }
    }
    
    // Template
    if (message.templateMessage) {
      return {
        content: '📝 Template',
        messageType: 'TEMPLATE'
      }

    }
    
    // Si no se reconoce el tipo, convertir a string
    return {
      content: JSON.stringify(message),
      messageType: 'UNKNOWN'
    }
  }

  async processWebhook(body: EvolutionWebhookPayload): Promise<ProcessedMessage> {
    logger.debug(`Procesando webhook`, {
      event: body.event,
      instance: body.instance,
      hasData: !!body.data,
      dataKeys: body.data ? Object.keys(body.data) : []
    })

    // Validar payload básico
    if (!body.event || !body.data) {
      logger.warn(`Payload inválido`, {
        event: body.event,
        hasData: !!body.data
      })
      
      return {
        shouldProcess: false,
        event: body.event ?? 'unknown',
        instanceName: body.instance ?? 'unknown',
        instanceId: body.data?.instanceId ?? 'unknown',
        whatsappId: '',
        messageType: '',
        messageStatus: '',
        source: '',
        messageRole: 'USER',
        messageSenderType: 'CONTACT',
        isGroupMessage: false,
        isFromMe: false,
        reason: 'Payload inválido - falta event o data'
      }
    }

    // 🚫 FILTRO TEMPRANO: Ignorar reacciones completamente
    if (body.data.message?.reactionMessage) {
      logger.debug(`Reacción ignorada tempranamente`, {
        whatsappId: body.data.key?.id,
        event: body.event
      })
      
      return {
        shouldProcess: false,
        event: body.event,
        instanceName: body.instance,
        instanceId: body.data.instanceId,
        whatsappId: body.data.key?.id ?? '',
        messageType: 'REACTION',
        messageStatus: body.data.status ?? '',
        source: body.data.source ?? '',
        messageRole: 'USER',
        messageSenderType: 'CONTACT',
        isGroupMessage: false,
        isFromMe: false,
        reason: 'Reacción ignorada - no procesamos reacciones'
      }
    }

    // 🚫 FILTRO TEMPRANO: Ignorar otros tipos de mensajes no deseados
    const message = body.data.message
    if (message) {
      const unwantedTypes = [
        'protocolMessage',
        'senderKeyDistributionMessage',
        'messageSecret'
      ]
      
      for (const unwantedType of unwantedTypes) {
        if (message[unwantedType]) {
          logger.debug(`${unwantedType} ignorado tempranamente`, {
            whatsappId: body.data.key?.id,
            event: body.event,
            unwantedType
          })
          
          return {
            shouldProcess: false,
            event: body.event,
            instanceName: body.instance,
            instanceId: body.data.instanceId,
            whatsappId: body.data.key?.id ?? '',
            messageType: unwantedType.toUpperCase(),
            messageStatus: body.data.status ?? '',
            source: body.data.source ?? '',
            messageRole: 'USER',
            messageSenderType: 'CONTACT',
            isGroupMessage: false,
            isFromMe: false,
            reason: `${unwantedType} ignorado - no procesamos este tipo`
          }
        }
      }
    }

    // Validar campos críticos del payload - soporte para diferentes estructuras
    const remoteJid = body.data.key?.remoteJid || body.data.remoteJid
    const messageId = body.data.key?.id || body.data.messageId || body.data.keyId
    
    if (!remoteJid || !messageId) {
      logger.warn(`Payload sin campos críticos`, {
        hasRemoteJid: !!remoteJid,
        hasId: !!messageId,
        hasKeyRemoteJid: !!body.data.key?.remoteJid,
        hasKeyId: !!body.data.key?.id,
        hasDataRemoteJid: !!body.data.remoteJid,
        hasDataMessageId: !!body.data.messageId,
        hasDataKeyId: !!body.data.keyId,
        event: body.event
      })
      
      return {
        shouldProcess: false,
        event: body.event,
        instanceName: body.instance,
        instanceId: body.data.instanceId,
        whatsappId: messageId ?? '',
        messageType: body.data.messageType ?? '',
        messageStatus: body.data.status ?? '',
        source: body.data.source ?? '',
        messageRole: 'USER',
        messageSenderType: 'CONTACT',
        isGroupMessage: false,
        isFromMe: false,
        reason: 'Payload sin campos críticos (remoteJid o id)'
      }
    }

    // 🚫 FILTRO CRÍTICO: Aplicar filtros de validación centralizados
    const filterResult = this.applyMessageFilters(remoteJid, messageId, body)
    if (!filterResult.shouldProcess) {
      return filterResult.result!
    }

    // Solo procesar eventos de mensajes relevantes
    if (!this.isMessageEvent(body.event)) {
      logger.debug(`Evento no es de mensaje`, {
        event: body.event
      })
      
      return {
        shouldProcess: false,
        event: body.event,
        instanceName: body.instance,
        instanceId: body.data.instanceId,
        whatsappId: '',
        messageType: '',
        messageStatus: '',
        source: '',
        messageRole: 'USER',
        messageSenderType: 'CONTACT',
        isGroupMessage: false,
        isFromMe: false,
        reason: 'Evento no es de mensaje'
      }
    }

    const messageData = body.data
    const eventLower = (body.event || '').toLowerCase()
    const isSendMessageEvent = eventLower === 'send.message'
    const isGroupMessage = this.isGroupMessage(messageData)
    const isFromMe = isSendMessageEvent ? true : this.isFromMe(messageData)

    logger.debug(`Análisis del mensaje`, {
      remoteJid: remoteJid,
      isGroup: isGroupMessage,
      isFromMe: isFromMe,
      messageType: messageData.messageType,
      source: messageData.source,
      event: body.event
    })

    // No procesar mensajes de grupo
    if (isGroupMessage) {
      logger.debug(`Mensaje de grupo ignorado`, {
        remoteJid: remoteJid,
        event: body.event
      })
      
      return {
        shouldProcess: false,
        event: body.event,
        instanceName: body.instance,
        instanceId: body.data.instanceId,
        whatsappId: messageId,
        messageType: messageData.messageType ?? '',
        messageStatus: messageData.status ?? '',
        source: messageData.source ?? '',
        messageRole: 'USER',
        messageSenderType: 'CONTACT',
        isGroupMessage: true,
        isFromMe: false,
        reason: 'Mensaje de grupo - no procesamos grupos por ahora'
      }
    }

    // NUEVA LÓGICA: Procesar mensajes desde la instancia también
    if (isFromMe) {
      logger.debug(`Mensaje enviado desde instancia - PROCESANDO`, {
        remoteJid: remoteJid,
        event: body.event
      })
      
      // Extraer datos del mensaje
      const phoneNumber = this.extractPhoneNumber(messageData)
      if (!phoneNumber) {
        logger.warn(`No se pudo extraer número de teléfono`, {
          remoteJid: remoteJid,
          event: body.event
        })
        
        return {
          shouldProcess: false,
          event: body.event,
          instanceName: body.instance,
          instanceId: body.data.instanceId,
          whatsappId: messageId,
          messageType: messageData.messageType ?? '',
          messageStatus: messageData.status ?? '',
          source: messageData.source ?? '',
          messageRole: 'USER',
          messageSenderType: 'USER',
          isGroupMessage: false,
          isFromMe: true,
          reason: 'No se pudo extraer número de teléfono'
        }
      }

      // Mensaje saliente
      const extractedContent = await this.extractMessageContent(messageData)
      const processedMessage: ProcessedMessage = {
        shouldProcess: true,
        phoneNumber,
        pushName: messageData.pushName ?? 'Usuario',
        messageContent: extractedContent.content,
        messageTimestamp: messageData.messageTimestamp,
        messageId: messageId,
        
        // CAMPOS DEL PAYLOAD - VALIDADOS
        whatsappId: messageId,
        messageType: extractedContent.messageType,
        messageStatus: StatusMapper.mapStatus(messageData.status),
        source: messageData.source ?? 'whatsapp',
        
        // CAMPOS DE INSTANCIA - VALIDADOS
        instanceName: body.instance,
        instanceId: body.data.instanceId,
        
        // TIPOS DE PRISMA - MENSAJE SALIENTE
        messageRole: 'USER',
        messageSenderType: 'USER',
        
        isGroupMessage: false,
        isFromMe: true,
        event: body.event,
        
        // CAMPOS ESPECÍFICOS POR TIPO DE MENSAJE
        messageSubType: extractedContent.messageSubType,
        mediaUrl: extractedContent.mediaUrl,
        mediaFileName: extractedContent.mediaFileName,
        mediaSize: extractedContent.mediaSize,
        mediaDuration: extractedContent.mediaDuration,
        mediaWidth: extractedContent.mediaWidth,
        mediaHeight: extractedContent.mediaHeight,
        mediaThumbnail: extractedContent.mediaThumbnail,
        caption: extractedContent.caption,
        title: extractedContent.title,
        description: extractedContent.description,
        latitude: extractedContent.latitude,
        longitude: extractedContent.longitude,
        locationName: extractedContent.locationName,
        contactName: extractedContent.contactName,
        contactPhone: extractedContent.contactPhone,
        reaction: extractedContent.reaction,
        pollOptions: extractedContent.pollOptions
      }

      logger.debug(`Mensaje saliente procesable creado`, {
        phoneNumber: processedMessage.phoneNumber,
        pushName: processedMessage.pushName,
        whatsappId: processedMessage.whatsappId,
        messageType: processedMessage.messageType,
        source: processedMessage.source,
        isFromMe: processedMessage.isFromMe
      })

      return processedMessage
    }

    // Extraer datos del mensaje
    const phoneNumber = this.extractPhoneNumber(messageData)
    if (!phoneNumber) {
      logger.warn(`No se pudo extraer número de teléfono`, {
        remoteJid: remoteJid,
        event: body.event
      })
      
      return {
        shouldProcess: false,
        event: body.event,
        instanceName: body.instance,
        instanceId: body.data.instanceId,
        whatsappId: messageId,
        messageType: messageData.messageType ?? '',
        messageStatus: messageData.status ?? '',
        source: messageData.source ?? '',
        messageRole: 'USER',
        messageSenderType: 'CONTACT',
        isGroupMessage: false,
        isFromMe: false,
        reason: 'No se pudo extraer número de teléfono'
      }
    }

    const extractedContent = await this.extractMessageContent(messageData)

    const processedMessage: ProcessedMessage = {
      shouldProcess: true,
      phoneNumber,
      pushName: messageData.pushName ?? 'Sin nombre',
      messageContent: extractedContent.content,
      messageTimestamp: messageData.messageTimestamp,
      messageId: messageId,
      
      // CAMPOS DEL PAYLOAD - VALIDADOS
      whatsappId: messageId,
      messageType: extractedContent.messageType,
      messageStatus: StatusMapper.mapStatus(messageData.status),
      source: messageData.source ?? 'whatsapp',
      
      // CAMPOS DE INSTANCIA - VALIDADOS
      instanceName: body.instance,
      instanceId: body.data.instanceId,
      
      // TIPOS DE PRISMA
      messageRole: 'USER',
      messageSenderType: 'CONTACT',
      
      isGroupMessage: false,
      isFromMe: false,
      event: body.event,
      
      // CAMPOS ESPECÍFICOS DEL CONTENIDO
      ...extractedContent
    }

    logger.debug(`Contenido del mensaje extraído`, {
      messageType: messageData.messageType,
      hasMessage: !!messageData.message,
      messageKeys: messageData.message ? Object.keys(messageData.message) : [],
      extractedContent: processedMessage.messageContent,
      phoneNumber: processedMessage.phoneNumber,
      whatsappId: processedMessage.whatsappId
    })

    return processedMessage
  }

  private isMessageEvent(event: string): boolean {
    const e = (event || '').toLowerCase()
    return (
      e === 'messages.upsert' ||
      e === 'messages.set' ||
      e === 'send.message' ||
      e === 'messages_upsert' ||
      e === 'messages_set'
    )
  }

  private isGroupMessage(messageData: { key?: { remoteJid?: string }; remoteJid?: string }): boolean {
    const remoteJid = messageData.key?.remoteJid || messageData.remoteJid
    return remoteJid?.includes('@g.us') ?? false
  }

  private isFromMe(messageData: { key?: { fromMe?: boolean }; fromMe?: boolean }): boolean {
    return messageData.key?.fromMe === true || messageData.fromMe === true
  }

  private extractPhoneNumber(messageData: { key?: { remoteJid?: string }; remoteJid?: string }): string | null {
    const remoteJid = messageData.key?.remoteJid || messageData.remoteJid
    if (!remoteJid) return null
    
    // Usar normalización consistente con ContactManager
    return this.normalizePhoneNumber(remoteJid)
  }

  /**
   * Aplica todos los filtros de validación de mensajes de forma centralizada
   * Elimina la lógica duplicada entre webhook y MessageProcessor
   */
  private applyMessageFilters(
    remoteJid: string, 
    messageId: string, 
    body: EvolutionWebhookPayload
  ): { shouldProcess: boolean; reason?: string; result?: ProcessedMessage } {
    
    // 🚫 FILTRO 1: Ignorar mensajes con @lid (mensajes desde celular)
    if (remoteJid.includes('@lid')) {
      logger.debug(`Mensaje desde celular ignorado (@lid)`, {
        remoteJid: remoteJid,
        whatsappId: messageId,
        event: body.event,
        isFromMe: body.data.key?.fromMe || body.data.fromMe
      })
      
      return {
        shouldProcess: false,
        reason: 'Mensaje desde celular (@lid) - ignorado para evitar duplicados',
        result: {
          shouldProcess: false,
          event: body.event,
          instanceName: body.instance,
          instanceId: body.data.instanceId,
          whatsappId: messageId,
          messageType: body.data.messageType ?? '',
          messageStatus: body.data.status ?? '',
          source: body.data.source ?? '',
          messageRole: 'USER',
          messageSenderType: 'CONTACT',
          isGroupMessage: false,
          isFromMe: false,
          reason: 'Mensaje desde celular (@lid) - ignorado para evitar duplicados'
        }
      }
    }

    // 🚫 FILTRO 2: Solo procesar mensajes con @s.whatsapp.net (contactos reales)
    if (!remoteJid.includes('@s.whatsapp.net')) {
      logger.debug(`Mensaje con remoteJid inválido ignorado`, {
        remoteJid: remoteJid,
        whatsappId: messageId,
        event: body.event,
        expectedFormat: '@s.whatsapp.net'
      })
      
      return {
        shouldProcess: false,
        reason: `remoteJid inválido (${remoteJid}) - solo procesamos @s.whatsapp.net`,
        result: {
          shouldProcess: false,
          event: body.event,
          instanceName: body.instance,
          instanceId: body.data.instanceId,
          whatsappId: messageId,
          messageType: body.data.messageType ?? '',
          messageStatus: body.data.status ?? '',
          source: body.data.source ?? '',
          messageRole: 'USER',
          messageSenderType: 'CONTACT',
          isGroupMessage: false,
          isFromMe: false,
          reason: `remoteJid inválido (${remoteJid}) - solo procesamos @s.whatsapp.net`
        }
      }
    }

    // ✅ Todos los filtros pasaron
    return { shouldProcess: true }
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

  // Método helper para logging mejorado
  logMessageDetails(processedMessage: ProcessedMessage): void {
    if (processedMessage.shouldProcess) {
      const direction = processedMessage.isFromMe ? 'SALIENTE' : 'ENTRANTE'
      const preview = typeof processedMessage.messageContent === 'string'
        ? processedMessage.messageContent.substring(0, 50) + '...'
        : JSON.stringify(processedMessage.messageContent ?? '').substring(0, 50) + '...'
      
      logger.debug(`Mensaje procesable: ${direction}`, {
        phoneNumber: processedMessage.phoneNumber,
        pushName: processedMessage.pushName,
        content: preview,
        timestamp: processedMessage.messageTimestamp,
        messageType: processedMessage.messageType,
        source: processedMessage.source,
        instance: processedMessage.instanceName,
        whatsappId: processedMessage.whatsappId,
        senderType: processedMessage.messageSenderType
      })
    } else {
      logger.debug(`Mensaje ignorado: ${processedMessage.reason}`, {
        reason: processedMessage.reason,
        event: processedMessage.event,
        whatsappId: processedMessage.whatsappId
      })
    }
  }
}

