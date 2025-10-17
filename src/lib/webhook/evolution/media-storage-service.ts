import { logger } from '@/lib/utils/server-logger'

interface MediaStorageResult {
  success: boolean
  filePath?: string
  publicUrl?: string
  fileSize?: number
  fileHash?: string
  error?: string
}

interface EvolutionApiResponse {
  base64?: string
  mimetype?: string
  [key: string]: unknown
}

export class MediaStorageService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    // Obtener configuración desde variables de entorno
    this.baseUrl = process.env.EVOLUTION_API_URL ?? 'http://localhost:5000'
    this.apiKey = process.env.EVOLUTION_API_KEY ?? 'EVO_API_2024_SUPER_SECRET_TOKEN_CHANGE_IN_PRODUCTION'
  }


  /**
   * Almacena automáticamente multimedia en Supabase cuando se procesa un webhook
   */
  async storeMediaFromWebhook(
    messageId: string,
    mediaUrl: string,
    messageType: string,
    instanceName: string,
    containerName: string,
    clientTag?: string,
    whatsappMessageId?: string,
    remoteJid?: string
  ): Promise<MediaStorageResult> {
    try {
      logger.storage(`Iniciando almacenamiento automático de multimedia`, {
        messageId,
        mediaUrl,
        messageType,
        instanceName,
        containerName,
        clientTag
      })

      // Verificar si es multimedia
      const multimediaTypes = ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER']
      if (!multimediaTypes.includes(messageType)) {
        logger.debug(`Mensaje no es multimedia, saltando almacenamiento`, {
          messageId,
          messageType
        })
        return { success: true }
      }

      // Verificar si ya tenemos la URL de Supabase
      if (mediaUrl.startsWith('supabase://') || mediaUrl.includes('supabase')) {
        logger.debug(`Archivo ya está en Supabase, saltando almacenamiento`, {
          messageId,
          mediaUrl
        })
        return { success: true }
      }

      // Llamar al backend Evolution API para obtener base64 y almacenar
      const evolutionUrl = `${this.baseUrl}/evolution-api/${containerName}/chat/getBase64FromMediaMessage/${instanceName}`
      
      logger.storage(`🔗 Llamando a Evolution API`, {
        messageId,
        evolutionUrl,
        containerName,
        instanceName,
        clientTag,
        apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'NO_API_KEY'
      })

      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Client-Tag': clientTag ?? '',
        'X-Instance-Name': instanceName,
        'X-Container-Name': containerName
      }

      logger.storage(`📤 Headers enviados`, {
        messageId,
        headers: {
          'Content-Type': headers['Content-Type'],
          'X-API-Key': headers['X-API-Key'] ? `${headers['X-API-Key'].substring(0, 8)}...` : 'NO_API_KEY',
          'X-Client-Tag': headers['X-Client-Tag'],
          'X-Instance-Name': headers['X-Instance-Name'],
          'X-Container-Name': headers['X-Container-Name']
        }
      })

      // Construir el body con el formato correcto esperado por Evolution API
      const requestBody = {
        message: {
          key: {
            remoteJid: remoteJid ?? '',
            id: whatsappMessageId ?? messageId
          }
        }
      }

      logger.storage(`📤 Enviando request body`, {
        messageId,
        requestBody,
        remoteJid,
        whatsappMessageId
      })

      const response = await fetch(evolutionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      logger.storage(`📡 Respuesta de Evolution API recibida`, {
        messageId,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json() as EvolutionApiResponse

      logger.storage(`📋 Resultado de Evolution API procesado`, {
        messageId,
        hasBase64: !!result.base64,
        hasMimetype: !!result.mimetype,
        resultKeys: Object.keys(result)
      })

      if (result.base64 && result.mimetype) {
        // Convertir base64 a buffer
        const buffer = Buffer.from(result.base64, 'base64')
        
        logger.storage(`🔄 Convirtiendo base64 a buffer`, {
          messageId,
          bufferSize: buffer.length,
          mimetype: result.mimetype
        })

        // Guardar en Supabase Storage
        const { getAdminSupabase, getClientStoragePath } = await import('@/lib/supabase')
        const adminClient = getAdminSupabase()
        
        // Determinar extensión basada en mimetype
        const getExtension = (mimetype: string): string => {
          const extMap: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif',
            'image/bmp': '.bmp'
          }
          return extMap[mimetype] || '.jpg'
        }
        
        const extension = getExtension(result.mimetype ?? 'image/jpeg')
        const storagePath = getClientStoragePath('image', clientTag ?? '', messageId, extension)
        
        logger.storage(`💾 Subiendo a Supabase Storage`, {
          messageId,
          storagePath,
          bufferSize: buffer.length,
          mimetype: result.mimetype
        })
        
        const { data: uploadData, error: uploadError } = await adminClient.storage
          .from('media')
          .upload(storagePath, buffer, {
            contentType: result.mimetype ?? 'image/jpeg',
            cacheControl: '31536000' // 1 año
          })
        
        if (uploadError) {
          logger.webhookError(`Error subiendo a Supabase Storage`, uploadError, {
            messageId,
            storagePath,
            bufferSize: buffer.length
          })
          throw new Error(`Error subiendo a Supabase: ${uploadError.message}`)
        }
        
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${storagePath}`
        
        logger.storage(`✅ Multimedia guardado exitosamente en Supabase`, {
          messageId,
          storagePath,
          publicUrl,
          fileSize: buffer.length,
          uploadData
        })

        return {
          success: true,
          filePath: storagePath,
          publicUrl: publicUrl,
          fileSize: buffer.length
        }
      } else {
        logger.warn(`Backend no devolvió base64 válido`, {
          messageId,
          hasBase64: !!result.base64,
          hasMimetype: !!result.mimetype
        })

        return { success: false, error: 'Backend no devolvió base64 válido' }
      }

    } catch (error) {
      logger.webhookError(`Error almacenando multimedia automáticamente`, error as Error, {
        messageId,
        mediaUrl,
        messageType,
        instanceName,
        containerName
      })

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Actualiza la URL del mensaje en la base de datos con la referencia de Supabase
   */
  async updateMessageMediaUrl(
    messageId: string,
    supabaseUrl: string
  ): Promise<boolean> {
    try {
      logger.storage(`Actualizando URL de multimedia en BD`, {
        messageId,
        oldUrl: 'WhatsApp URL',
        newUrl: supabaseUrl
      })

      // Actualizar en la base de datos usando Prisma
      const { db } = await import('@/server/db')
      
      await db.message.update({
        where: { id: messageId },
        data: { 
          mediaUrl: supabaseUrl,
          updatedAt: new Date()
        }
      })

      logger.storage(`URL de multimedia actualizada exitosamente`, {
        messageId,
        supabaseUrl
      })

      return true
    } catch (error) {
      logger.webhookError(`Error actualizando URL de multimedia`, error as Error, {
        messageId,
        supabaseUrl
      })
      return false
    }
  }


  /**
   * Procesa multimedia directamente - sin background processing innecesario
   * Usa Evolution API para obtener y almacenar archivos multimedia
   */
  async processMedia(
    messageId: string,
    mediaUrl: string,
    messageType: string,
    instanceName: string,
    containerName: string,
    clientTag?: string,
    whatsappMessageId?: string,
    remoteJid?: string
  ): Promise<void> {
    try {
      logger.storage(`🚀 Iniciando procesamiento de multimedia`, {
        messageId,
        mediaUrl,
        messageType,
        instanceName,
        containerName,
        clientTag
      })

      // Verificar si el archivo ya está almacenado
      const { db } = await import('@/server/db')
      const message = await db.message.findUnique({
        where: { id: messageId },
        select: { mediaUrl: true }
      })

      if (message?.mediaUrl?.startsWith('supabase://')) {
        logger.storage(`✅ Archivo ya está almacenado en Supabase`, {
          messageId,
          existingUrl: message.mediaUrl
        })
        return
      }

      // Procesar multimedia usando Evolution API
      const result = await this.storeMediaFromWebhook(
        messageId,
        mediaUrl,
        messageType,
        instanceName,
        containerName,
        clientTag,
        whatsappMessageId,
        remoteJid
      )

      if (result.success && result.publicUrl) {
        logger.storage(`✅ Multimedia almacenado exitosamente`, {
          messageId,
          filePath: result.filePath,
          publicUrl: result.publicUrl,
          fileSize: result.fileSize
        })
        
        await this.updateMessageMediaUrl(messageId, result.publicUrl)
        
        logger.storage(`🔄 URL de multimedia actualizada en BD`, {
          messageId,
          newUrl: result.publicUrl
        })
      } else {
        logger.warn(`⚠️ Fallo en almacenamiento de multimedia`, {
          messageId,
          error: result.error,
          success: result.success
        })
      }
    } catch (error) {
      logger.webhookError(`❌ Error procesando multimedia`, error as Error, {
        messageId,
        messageType,
        mediaUrl,
        instanceName,
        containerName,
        clientTag
      })
    }
  }

}

// Instancia singleton
export const mediaStorageService = new MediaStorageService()
