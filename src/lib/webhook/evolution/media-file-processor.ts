import { logger } from '@/lib/utils/server-logger'

/**
 * Procesador especializado para archivos de media de WhatsApp
 * Maneja correctamente la descarga, conversión y almacenamiento de archivos
 */
export class MediaFileProcessor {
  private static readonly SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  private static readonly SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/webm']
  private static readonly SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4']
  private static readonly SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'text/plain']

  /**
   * Procesa un archivo de media y determina su tipo correcto
   */
  static async processMediaFile(
    mediaData: {
      url?: string
      fileName?: string
      mimetype?: string
      fileLength?: string
      jpegThumbnail?: string
    },
    messageType: string
  ): Promise<{
    processedUrl?: string
    processedFileName?: string
    processedMimetype?: string
    fileSize?: number
    thumbnail?: string
    isValid: boolean
    error?: string
  }> {
    try {
      logger.storage(`Procesando archivo de media`, {
        messageType,
        originalFileName: mediaData.fileName,
        originalMimetype: mediaData.mimetype,
        hasUrl: !!mediaData.url,
        hasThumbnail: !!mediaData.jpegThumbnail
      })

      // Validar que tenemos datos básicos
      if (!mediaData.url && !mediaData.fileName) {
        return {
          isValid: false,
          error: 'No se proporcionó URL ni nombre de archivo'
        }
      }

      // Determinar el tipo de archivo correcto basado en el mimetype
      const processedMimetype = this.determineCorrectMimetype(
        mediaData.mimetype, 
        mediaData.fileName, 
        messageType
      )

      // Generar nombre de archivo correcto
      const processedFileName = this.generateCorrectFileName(
        mediaData.fileName,
        processedMimetype,
        messageType
      )

      // Procesar la URL si es necesario
      const processedUrl = await this.processMediaUrl(mediaData.url, processedMimetype)

      // Calcular tamaño del archivo
      const fileSize = mediaData.fileLength ? parseInt(mediaData.fileLength) : undefined

      // Procesar thumbnail si existe
      const thumbnail = await this.processThumbnail(mediaData.jpegThumbnail, processedMimetype)

      logger.storage(`Archivo de media procesado exitosamente`, {
        messageType,
        originalFileName: mediaData.fileName,
        processedFileName,
        originalMimetype: mediaData.mimetype,
        processedMimetype,
        fileSize,
        hasProcessedUrl: !!processedUrl
      })

      return {
        processedUrl,
        processedFileName,
        processedMimetype,
        fileSize,
        thumbnail,
        isValid: true
      }

    } catch (error) {
      logger.webhookError(`Error procesando archivo de media`, error as Error, {
        messageType,
        originalFileName: mediaData.fileName,
        originalMimetype: mediaData.mimetype
      })

      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Determina el tipo MIME correcto basado en el contexto
   */
  private static determineCorrectMimetype(
    originalMimetype?: string,
    fileName?: string,
    messageType: string
  ): string {
    // Si ya tenemos un mimetype válido, usarlo
    if (originalMimetype && this.isValidMimetype(originalMimetype, messageType)) {
      return originalMimetype
    }

    // Determinar por extensión del archivo
    if (fileName) {
      const extension = fileName.toLowerCase().split('.').pop()
      const mimetypeByExtension = this.getMimetypeByExtension(extension || '', messageType)
      if (mimetypeByExtension) {
        return mimetypeByExtension
      }
    }

    // Fallback por tipo de mensaje
    return this.getDefaultMimetype(messageType)
  }

  /**
   * Genera un nombre de archivo correcto
   */
  private static generateCorrectFileName(
    originalFileName?: string,
    mimetype?: string,
    messageType: string
  ): string {
    if (originalFileName && !originalFileName.endsWith('.bin')) {
      return originalFileName
    }

    // Generar nombre basado en tipo y timestamp
    const timestamp = Date.now()
    const extension = this.getExtensionFromMimetype(mimetype, messageType)
    
    return `${messageType.toLowerCase()}_${timestamp}${extension}`
  }

  /**
   * Procesa la URL del archivo de media
   */
  private static async processMediaUrl(url?: string, mimetype?: string): Promise<string | undefined> {
    if (!url) return undefined

    // Si la URL ya es válida, devolverla
    if (url.startsWith('http') && !url.includes('.bin')) {
      return url
    }

    // Si es una URL de Evolution API, procesarla
    if (url.includes('evolution')) {
      return await this.processEvolutionApiUrl(url, mimetype)
    }

    return url
  }

  /**
   * Procesa URLs de Evolution API para obtener el archivo correcto
   */
  private static async processEvolutionApiUrl(url: string, mimetype?: string): Promise<string> {
    try {
      // Aquí iría la lógica para procesar URLs de Evolution API
      // Por ahora, devolvemos la URL original
      logger.storage(`Procesando URL de Evolution API`, {
        url,
        mimetype
      })

      return url
    } catch (error) {
      logger.webhookError(`Error procesando URL de Evolution API`, error as Error, {
        url,
        mimetype
      })
      
      return url
    }
  }

  /**
   * Procesa el thumbnail del archivo
   */
  private static async processThumbnail(
    thumbnail?: string, 
    mimetype?: string
  ): Promise<string | undefined> {
    if (!thumbnail) return undefined

    // Si es base64, mantenerlo
    if (thumbnail.startsWith('data:')) {
      return thumbnail
    }

    // Si es una URL, procesarla
    if (thumbnail.startsWith('http')) {
      return thumbnail
    }

    return thumbnail
  }

  /**
   * Verifica si un mimetype es válido para el tipo de mensaje
   */
  private static isValidMimetype(mimetype: string, messageType: string): boolean {
    switch (messageType) {
      case 'IMAGE':
        return this.SUPPORTED_IMAGE_TYPES.includes(mimetype)
      case 'VIDEO':
        return this.SUPPORTED_VIDEO_TYPES.includes(mimetype)
      case 'AUDIO':
        return this.SUPPORTED_AUDIO_TYPES.includes(mimetype)
      case 'DOCUMENT':
        return this.SUPPORTED_DOCUMENT_TYPES.includes(mimetype)
      default:
        return true
    }
  }

  /**
   * Obtiene el mimetype por extensión de archivo
   */
  private static getMimetypeByExtension(extension: string, messageType: string): string | null {
    const extensionMap: Record<string, Record<string, string>> = {
      IMAGE: {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      },
      VIDEO: {
        'mp4': 'video/mp4',
        'avi': 'video/avi',
        'mov': 'video/mov',
        'webm': 'video/webm'
      },
      AUDIO: {
        'mp3': 'audio/mpeg',
        'ogg': 'audio/ogg',
        'wav': 'audio/wav',
        'm4a': 'audio/mp4'
      },
      DOCUMENT: {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain'
      }
    }

    return extensionMap[messageType]?.[extension] || null
  }

  /**
   * Obtiene el mimetype por defecto para un tipo de mensaje
   */
  private static getDefaultMimetype(messageType: string): string {
    const defaultMimetypes: Record<string, string> = {
      IMAGE: 'image/jpeg',
      VIDEO: 'video/mp4',
      AUDIO: 'audio/mpeg',
      DOCUMENT: 'application/octet-stream',
      STICKER: 'image/webp'
    }

    return defaultMimetypes[messageType] || 'application/octet-stream'
  }

  /**
   * Obtiene la extensión de archivo basada en el mimetype
   */
  private static getExtensionFromMimetype(mimetype?: string, messageType: string): string {
    if (!mimetype) {
      const defaultExtensions: Record<string, string> = {
        IMAGE: '.jpg',
        VIDEO: '.mp4',
        AUDIO: '.mp3',
        DOCUMENT: '.pdf', // Cambiado de .bin a .pdf para documentos
        STICKER: '.webp'
      }
      return defaultExtensions[messageType] || this.getFallbackExtension(messageType)
    }

    const mimetypeToExtension: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/bmp': '.bmp',
      'video/mp4': '.mp4',
      'video/avi': '.avi',
      'video/mov': '.mov',
      'video/webm': '.webm',
      'video/3gp': '.3gp',
      'audio/mpeg': '.mp3',
      'audio/mp3': '.mp3',
      'audio/ogg': '.ogg',
      'audio/wav': '.wav',
      'audio/mp4': '.m4a',
      'audio/aac': '.aac',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'text/plain': '.txt',
      'text/csv': '.csv',
      'application/zip': '.zip',
      'application/x-rar-compressed': '.rar',
      'application/json': '.json',
      'application/xml': '.xml',
      'text/xml': '.xml'
    }

    return mimetypeToExtension[mimetype] || this.getFallbackExtension(messageType)
  }

  /**
   * Obtiene la extensión de fallback apropiada según el tipo de mensaje
   */
  private static getFallbackExtension(messageType: string): string {
    const fallbackExtensions: Record<string, string> = {
      IMAGE: '.jpg',
      VIDEO: '.mp4',
      AUDIO: '.mp3',
      DOCUMENT: '.pdf',
      STICKER: '.webp'
    }
    
    return fallbackExtensions[messageType] || '.txt' // Cambiado de .bin a .txt como último recurso
  }

  /**
   * Valida que un archivo de media sea procesable
   */
  static validateMediaFile(mediaData: {
    url?: string
    fileName?: string
    mimetype?: string
    fileLength?: string
  }): { isValid: boolean; error?: string } {
    // Verificar que tenemos datos básicos
    if (!mediaData.url && !mediaData.fileName) {
      return {
        isValid: false,
        error: 'No se proporcionó URL ni nombre de archivo'
      }
    }

    // Verificar tamaño del archivo (máximo 100MB)
    if (mediaData.fileLength) {
      const fileSize = parseInt(mediaData.fileLength)
      if (fileSize > 100 * 1024 * 1024) { // 100MB
        return {
          isValid: false,
          error: 'Archivo demasiado grande (máximo 100MB)'
        }
      }
    }

    return { isValid: true }
  }
}
