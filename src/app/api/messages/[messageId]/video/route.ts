import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { getAdminSupabase, getStoragePath, getClientStoragePath } from '@/lib/supabase'
import { logger } from '@/lib/utils/server-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const startTime = Date.now()
  
  try {
    const { messageId } = params
    
    logger.storage(`Solicitud de video recibida`, {
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
        conversation: {
          select: {
            clientId: true
          }
        }
      }
    })
    
    if (!message || message.messageType !== 'VIDEO') {
      logger.warn(`Video no encontrado o tipo incorrecto`, {
        messageId,
        messageType: message?.messageType,
        hasMessage: !!message
      })
      
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }
    
    logger.storage(`Mensaje de video encontrado`, {
      messageId,
      messageType: message.messageType,
      hasMediaUrl: !!message.mediaUrl,
      clientId: message.conversation?.clientId
    })
    
    // Determinar extensión basada en mimetype
    const getExtension = (mimetype?: string): string => {
      if (!mimetype) return '.mp4'
      
      const extMap: Record<string, string> = {
        'video/mp4': '.mp4',
        'video/avi': '.avi',
        'video/mov': '.mov',
        'video/wmv': '.wmv',
        'video/flv': '.flv',
        'video/webm': '.webm',
        'video/mkv': '.mkv',
        'video/3gp': '.3gp'
      }
      
      return extMap[mimetype] || '.mp4'
    }
    
    const extension = getExtension(message.messageSubType)
    const clientId = message.conversation?.clientId
    
    if (!clientId) {
      logger.error(`ClientId no encontrado para el mensaje`, { messageId })
      return NextResponse.json({ error: 'ClientId no encontrado' }, { status: 400 })
    }
    
    // Usar la nueva estructura consistente con clientId
    const storagePath = getClientStoragePath('video', clientId, messageId, extension)
    
    // Verificar si ya tenemos el video en Supabase Storage
    const adminClient = getAdminSupabase()
    try {
      const { data: existingFile, error: downloadError } = await adminClient.storage
        .from('media')
        .download(storagePath)
      
      if (existingFile && !downloadError) {
        const processingTime = Date.now() - startTime
        
        logger.storage(`Video encontrado en S3 Storage`, {
          messageId,
          storagePath,
          fileSize: existingFile.size,
          processingTimeMs: processingTime
        })
        
        return new NextResponse(existingFile, {
          headers: {
            'Content-Type': message.messageSubType ?? 'video/mp4',
            'Cache-Control': 'public, max-age=31536000',
            'Content-Length': existingFile.size.toString()
          }
        })
      }
    } catch (storageError) {
      logger.warn(`Error verificando archivo de video en S3`, {
        messageId,
        storagePath,
        error: storageError instanceof Error ? storageError.message : 'Error desconocido'
      })
    }
    
    // Si tenemos URL de WhatsApp, intentar descargar y guardar en S3
    if (message.mediaUrl && !message.mediaUrl.startsWith('supabase://')) {
      try {
        logger.storage(`Descargando video original desde WhatsApp`, {
          messageId,
          mediaUrl: message.mediaUrl,
          extension
        })
        
        const response = await fetch(message.mediaUrl, {
          headers: {
            'User-Agent': 'WhatsApp/2.23.24.78 A',
            'Accept': 'video/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(60000) // 60 segundos timeout para video
        })
        
        if (response.ok) {
          const buffer = await response.arrayBuffer()
          
          logger.storage(`Video descargado exitosamente`, {
            messageId,
            size: buffer.byteLength,
            extension
          })
          
          // Guardar en S3 Storage
          const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('media')
            .upload(storagePath, buffer, {
              contentType: message.messageSubType ?? 'video/mp4',
              cacheControl: '31536000' // 1 año
            })
          
          if (uploadError) {
            logger.webhookError(`Error subiendo video a S3`, uploadError, {
              messageId,
              storagePath,
              size: buffer.byteLength
            })
            throw new Error(`Error subiendo a S3: ${uploadError.message}`)
          }
          
          logger.storage(`Video guardado en S3 Storage`, {
            messageId,
            storagePath,
            size: buffer.byteLength,
            uploadData
          })
          
          // Actualizar la base de datos con la referencia
          await db.message.update({
            where: { id: messageId },
            data: { 
              mediaUrl: `supabase://${storagePath}` // Referencia a Supabase
            }
          })
          
          logger.storage(`Base de datos actualizada con referencia S3`, {
            messageId,
            newMediaUrl: `supabase://${storagePath}`
          })
          
          const processingTime = Date.now() - startTime
          
          // Devolver el video
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': message.messageSubType ?? 'video/mp4',
              'Cache-Control': 'public, max-age=31536000',
              'Content-Length': buffer.byteLength.toString()
            }
          })
        } else {
          logger.warn(`Error descargando video desde WhatsApp`, {
            messageId,
            status: response.status,
            statusText: response.statusText
          })
        }
      } catch (error) {
        logger.webhookError(`Error procesando video original`, error as Error, {
          messageId,
          mediaUrl: message.mediaUrl
        })
      }
    }
    
    const processingTime = Date.now() - startTime
    
    logger.warn(`No hay video disponible`, {
      messageId,
      hasMediaUrl: !!message.mediaUrl,
      processingTimeMs: processingTime
    })
    
    return NextResponse.json({ error: 'No hay video disponible' }, { status: 404 })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    logger.webhookError(`Error en endpoint de video`, error as Error, {
      messageId: params.messageId,
      processingTimeMs: processingTime
    })
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
