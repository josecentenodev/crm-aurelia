import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { getAdminSupabase, getStoragePath, getClientStoragePath, getPublicUrl } from '@/lib/supabase'
import { logger } from '@/lib/utils/server-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const startTime = Date.now()
  
  try {
    const { messageId } = params
    
    logger.storage(`Solicitud de imagen recibida`, {
      messageId,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })
    
    // Obtener el mensaje
    const message = await db.message.findUnique({
      where: { id: messageId },
      select: {
        mediaUrl: true,
        messageType: true,
        messageSubType: true,
        mediaThumbnail: true,
        conversation: {
          select: {
            clientId: true
          }
        }
      }
    })
    
    if (!message || message.messageType !== 'IMAGE') {
      logger.warn(`Imagen no encontrada o tipo incorrecto`, {
        messageId,
        messageType: message?.messageType,
        hasMessage: !!message
      })
      
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }
    
    logger.storage(`Mensaje de imagen encontrado`, {
      messageId,
      messageType: message.messageType,
      hasMediaUrl: !!message.mediaUrl,
      hasThumbnail: !!message.mediaThumbnail,
      clientId: message.conversation?.clientId
    })
    
    // Determinar extensión basada en mimetype
    const getExtension = (mimetype?: string): string => {
      if (!mimetype) return '.jpg'
      
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
    
    const extension = getExtension(message.messageSubType)
    const clientId = message.conversation?.clientId
    
    if (!clientId) {
      logger.error(`ClientId no encontrado para el mensaje`, { messageId })
      return NextResponse.json({ error: 'ClientId no encontrado' }, { status: 400 })
    }
    
    // Usar la nueva estructura consistente con clientId
    const storagePath = getClientStoragePath('image', clientId, messageId, extension)
    
    // Verificar si ya tenemos la imagen en Supabase Storage (S3)
    const adminClient = getAdminSupabase()
    try {
      const { data: existingFile, error: downloadError } = await adminClient.storage
        .from('media')
        .download(storagePath)
      
      if (existingFile && !downloadError) {
        const processingTime = Date.now() - startTime
        
        logger.storage(`Imagen encontrada en S3 Storage`, {
          messageId,
          storagePath,
          fileSize: existingFile.size,
          processingTimeMs: processingTime
        })
        
        return new NextResponse(existingFile, {
          headers: {
            'Content-Type': message.messageSubType ?? 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
            'Content-Length': existingFile.size.toString()
          }
        })
      }
    } catch (storageError) {
      logger.warn(`Error verificando archivo en S3`, {
        messageId,
        storagePath,
        error: storageError instanceof Error ? storageError.message : 'Error desconocido'
      })
    }
    
    // Si tenemos URL de WhatsApp, la imagen aún no está procesada
    if (message.mediaUrl && !message.mediaUrl.startsWith('supabase://')) {
      logger.storage(`Imagen aún no procesada, usando thumbnail`, {
        messageId,
        mediaUrl: message.mediaUrl,
        hasThumbnail: !!message.mediaThumbnail
      })
      
      // NO procesar aquí - el background processing se encarga
      // Solo usar thumbnail como fallback temporal
      if (message.mediaThumbnail) {
        logger.storage(`Usando thumbnail como fallback temporal`, {
          messageId,
          thumbnailSize: message.mediaThumbnail.length
        })
        
        const buffer = Buffer.from(message.mediaThumbnail, 'base64')
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': message.messageSubType ?? 'image/jpeg',
            'Cache-Control': 'public, max-age=60', // Cache corto para thumbnails temporales
            'Content-Length': buffer.byteLength.toString()
          }
        })
      }
      
      // Si no hay thumbnail, devolver error 202 (Accepted) - imagen en procesamiento
      return NextResponse.json({ 
        error: 'Imagen en procesamiento', 
        status: 'processing' 
      }, { status: 202 })
    }
    
    // Fallback: usar thumbnail existente
    if (message.mediaThumbnail) {
      logger.storage(`Usando thumbnail como fallback`, {
        messageId,
        thumbnailSize: message.mediaThumbnail.length
      })
      
      const buffer = Buffer.from(message.mediaThumbnail, 'base64')
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': message.messageSubType ?? 'image/jpeg',
          'Cache-Control': 'public, max-age=3600', // Cache por 1 hora para thumbnails
          'Content-Length': buffer.byteLength.toString()
        }
      })
    }
    
    const processingTime = Date.now() - startTime
    
    logger.warn(`No hay imagen disponible`, {
      messageId,
      hasMediaUrl: !!message.mediaUrl,
      hasThumbnail: !!message.mediaThumbnail,
      processingTimeMs: processingTime
    })
    
    return NextResponse.json({ error: 'No hay imagen disponible' }, { status: 404 })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    logger.webhookError(`Error en endpoint de imagen`, error as Error, {
      messageId: params.messageId,
      processingTimeMs: processingTime
    })
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
