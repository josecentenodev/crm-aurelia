import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, getStoragePath } from '@/lib/supabase'
import { logger } from '@/lib/utils/server-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string; mediaType: string } }
) {
  try {
    const { messageId, mediaType } = params
    
    logger.storage(`Solicitud de archivo multimedia`, {
      messageId,
      mediaType,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })
    
    // Validar tipo de media
    const validTypes = ['image', 'video', 'audio', 'document']
    if (!validTypes.includes(mediaType)) {
      return NextResponse.json({ error: 'Tipo de media inválido' }, { status: 400 })
    }
    
    // Obtener información del mensaje desde la base de datos
    const { db } = await import('@/server/db')
    const message = await db.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        messageType: true,
        messageSubType: true,
        mediaFileName: true,
        conversation: {
          select: {
            clientId: true
          }
        }
      }
    })
    
    if (!message) {
      logger.warn(`Mensaje no encontrado`, { messageId })
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }
    
    // Verificar que el tipo de media coincida
    const expectedType = message.messageType?.toLowerCase()
    if (expectedType !== mediaType) {
      logger.warn(`Tipo de media no coincide`, {
        messageId,
        expectedType,
        requestedType: mediaType
      })
      return NextResponse.json({ error: 'Tipo de media no coincide' }, { status: 400 })
    }
    
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
          'image': '.jpg',
          'video': '.mp4',
          'audio': '.ogg',
          'document': '.pdf'
        }
        return defaultExt[mediaType] || '.txt' // Cambiado de .bin a .txt
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
    const storagePath = getStoragePath(mediaType as 'image' | 'video' | 'audio' | 'document', messageId, extension)
    
    // Obtener archivo desde Supabase Storage
    const adminClient = getAdminSupabase()
    
    try {
      const { data: fileData, error: downloadError } = await adminClient.storage
        .from('media')
        .download(storagePath)
      
      if (downloadError || !fileData) {
        logger.warn(`Archivo no encontrado en Supabase Storage`, {
          messageId,
          storagePath,
          error: downloadError?.message
        })
        return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
      }
      
      // Convertir a buffer
      const buffer = await fileData.arrayBuffer()
      
      // Determinar content type
      const contentType = message.messageSubType || 
        (mediaType === 'image' ? 'image/jpeg' :
         mediaType === 'video' ? 'video/mp4' :
         mediaType === 'audio' ? 'audio/ogg' :
         'application/octet-stream')
      
      logger.storage(`Archivo servido exitosamente`, {
        messageId,
        storagePath,
        contentType,
        size: buffer.byteLength
      })
      
      // Retornar archivo con headers apropiados
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000', // 1 año
          'Content-Disposition': `inline; filename="${message.mediaFileName || `media_${messageId}${extension}`}"`
        }
      })
      
    } catch (storageError) {
      logger.error(`Error obteniendo archivo desde Supabase Storage`, storageError, {
        messageId,
        storagePath
      })
      return NextResponse.json({ error: 'Error obteniendo archivo' }, { status: 500 })
    }
    
  } catch (error) {
    logger.webhookError(`Error en endpoint de archivo multimedia`, error as Error, {
      messageId: params.messageId,
      mediaType: params.mediaType
    })
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
