import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { getAdminSupabase, getStoragePath, getPublicUrl } from '@/lib/supabase'
import { logger } from '@/lib/utils/server-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params
    
    logger.storage(`Solicitud de información multimedia recibida`, {
      messageId,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })
    
    // Obtener el mensaje
    const message = await db.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        mediaUrl: true,
        messageType: true,
        messageSubType: true,
        mediaFileName: true,
        mediaSize: true,
        mediaDuration: true,
        mediaWidth: true,
        mediaHeight: true,
        mediaThumbnail: true,
        caption: true,
        title: true,
        description: true,
        conversation: {
          select: {
            clientId: true
          }
        }
      }
    })
    
    if (!message) {
      logger.warn(`Mensaje no encontrado`, {
        messageId
      })
      
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }
    
    // Solo procesar mensajes multimedia
    const multimediaTypes = ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER']
    if (!multimediaTypes.includes(message.messageType)) {
      logger.warn(`Mensaje no es multimedia`, {
        messageId,
        messageType: message.messageType
      })
      
      return NextResponse.json({ error: 'Mensaje no es multimedia' }, { status: 400 })
    }
    
    logger.storage(`Mensaje multimedia encontrado`, {
      messageId,
      messageType: message.messageType,
      hasMediaUrl: !!message.mediaUrl,
      fileName: message.mediaFileName,
      clientId: message.conversation?.clientId
    })
    
    // Determinar extensión basada en mimetype o nombre de archivo
    const getExtension = (mimetype?: string, fileName?: string): string => {
      // Primero intentar extraer del nombre de archivo
      if (fileName && fileName.includes('.')) {
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (ext) return `.${ext}`
      }
      
      // Luego usar mimetype
      if (!mimetype) {
        // Extensiones por defecto según tipo
        const defaultExt: Record<string, string> = {
          'IMAGE': '.jpg',
          'VIDEO': '.mp4',
          'AUDIO': '.ogg',
          'DOCUMENT': '.pdf',
          'STICKER': '.webp'
        }
        return defaultExt[message.messageType] || '.txt' // Cambiado de .bin a .txt
      }
      
      const extMap: Record<string, string> = {
        // Imágenes
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'image/bmp': '.bmp',
        // Videos
        'video/mp4': '.mp4',
        'video/avi': '.avi',
        'video/mov': '.mov',
        'video/wmv': '.wmv',
        'video/flv': '.flv',
        'video/webm': '.webm',
        'video/mkv': '.mkv',
        'video/3gp': '.3gp',
        // Audio
        'audio/ogg': '.ogg',
        'audio/mpeg': '.mp3',
        'audio/mp3': '.mp3',
        'audio/wav': '.wav',
        'audio/aac': '.aac',
        'audio/m4a': '.m4a',
        'audio/webm': '.webm',
        // Documentos
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        'text/plain': '.txt',
        'text/csv': '.csv',
        'application/zip': '.zip',
        'application/x-rar-compressed': '.rar',
        'application/json': '.json',
        'application/xml': '.xml',
        'text/xml': '.xml'
      }
      
      return extMap[mimetype] || '.txt' // Cambiado de .bin a .txt como fallback
    }
    
    const extension = getExtension(message.messageSubType, message.mediaFileName)
    const storagePath = getStoragePath(message.messageType.toLowerCase(), messageId, extension)
    
    // Verificar si tenemos el archivo en Supabase Storage
    const adminClient = getAdminSupabase()
    let publicUrl: string | null = null
    let isStoredInSupabase = false
    
    try {
      const { data: existingFile, error: downloadError } = await adminClient.storage
        .from('media')
        .download(storagePath)
      
      if (existingFile && !downloadError) {
        isStoredInSupabase = true
        publicUrl = getPublicUrl('media', storagePath)
        
        logger.storage(`Archivo encontrado en Supabase Storage`, {
          messageId,
          storagePath,
          fileSize: existingFile.size,
          publicUrl
        })
      }
    } catch (storageError) {
      logger.warn(`Error verificando archivo en Supabase Storage`, {
        messageId,
        storagePath,
        error: storageError instanceof Error ? storageError.message : 'Error desconocido'
      })
    }
    
    // Preparar respuesta
    const response = {
      messageId: message.id,
      messageType: message.messageType,
      messageSubType: message.messageSubType,
      fileName: message.mediaFileName,
      fileSize: message.mediaSize,
      duration: message.mediaDuration,
      width: message.mediaWidth,
      height: message.mediaHeight,
      caption: message.caption,
      title: message.title,
      description: message.description,
      hasThumbnail: !!message.mediaThumbnail,
      hasOriginalUrl: !!message.mediaUrl,
      isStoredInSupabase,
      storagePath: isStoredInSupabase ? storagePath : null,
      publicUrl: isStoredInSupabase ? publicUrl : null,
      endpoints: {
        thumbnail: message.mediaThumbnail ? `data:image/jpeg;base64,${message.mediaThumbnail}` : null,
        original: message.mediaUrl && !message.mediaUrl.startsWith('supabase://') ? message.mediaUrl : null,
        stored: isStoredInSupabase ? `/api/messages/${messageId}/${message.messageType.toLowerCase()}` : null
      }
    }
    
    logger.storage(`Información multimedia preparada`, {
      messageId,
      messageType: message.messageType,
      isStoredInSupabase,
      hasPublicUrl: !!publicUrl
    })
    
    return NextResponse.json(response)
    
  } catch (error) {
    logger.webhookError(`Error en endpoint de información multimedia`, error as Error, {
      messageId: params.messageId
    })
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
