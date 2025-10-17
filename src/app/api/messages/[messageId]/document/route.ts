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
    
    logger.storage(`Solicitud de documento recibida`, {
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
        mediaFileName: true,
        conversation: {
          select: {
            clientId: true
          }
        }
      }
    })
    
    if (!message || message.messageType !== 'DOCUMENT') {
      logger.warn(`Documento no encontrado o tipo incorrecto`, {
        messageId,
        messageType: message?.messageType,
        hasMessage: !!message
      })
      
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }
    
    logger.storage(`Mensaje de documento encontrado`, {
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
      if (!mimetype) return '.pdf'
      
      const extMap: Record<string, string> = {
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
      
      return extMap[mimetype] || '.pdf'
    }
    
    const extension = getExtension(message.messageSubType, message.mediaFileName)
    const clientId = message.conversation?.clientId
    
    if (!clientId) {
      logger.error(`ClientId no encontrado para el mensaje`, { messageId })
      return NextResponse.json({ error: 'ClientId no encontrado' }, { status: 400 })
    }
    
    // Usar la nueva estructura consistente con clientId
    const storagePath = getClientStoragePath('document', clientId, messageId, extension)
    
    // Verificar si ya tenemos el documento en Supabase Storage
    const adminClient = getAdminSupabase()
    try {
      const { data: existingFile, error: downloadError } = await adminClient.storage
        .from('media')
        .download(storagePath)
      
      if (existingFile && !downloadError) {
        const processingTime = Date.now() - startTime
        
        logger.storage(`Documento encontrado en S3 Storage`, {
          messageId,
          storagePath,
          fileSize: existingFile.size,
          processingTimeMs: processingTime
        })
        
        return new NextResponse(existingFile, {
          headers: {
            'Content-Type': message.messageSubType ?? 'application/pdf',
            'Cache-Control': 'public, max-age=31536000',
            'Content-Length': existingFile.size.toString(),
            'Content-Disposition': `attachment; filename="${message.mediaFileName || 'documento'}"`
          }
        })
      }
    } catch (storageError) {
      logger.warn(`Error verificando archivo de documento en S3`, {
        messageId,
        storagePath,
        error: storageError instanceof Error ? storageError.message : 'Error desconocido'
      })
    }
    
    // Si tenemos URL de WhatsApp, intentar descargar y guardar en S3
    if (message.mediaUrl && !message.mediaUrl.startsWith('supabase://')) {
      try {
        logger.storage(`Descargando documento original desde WhatsApp`, {
          messageId,
          mediaUrl: message.mediaUrl,
          extension,
          fileName: message.mediaFileName
        })
        
        const response = await fetch(message.mediaUrl, {
          headers: {
            'User-Agent': 'WhatsApp/2.23.24.78 A',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(60000) // 60 segundos timeout para documentos
        })
        
        if (response.ok) {
          const buffer = await response.arrayBuffer()
          
          logger.storage(`Documento descargado exitosamente`, {
            messageId,
            size: buffer.byteLength,
            extension,
            fileName: message.mediaFileName
          })
          
          // Guardar en S3 Storage
          const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('media')
            .upload(storagePath, buffer, {
              contentType: message.messageSubType ?? 'application/pdf',
              cacheControl: '31536000' // 1 año
            })
          
          if (uploadError) {
            logger.webhookError(`Error subiendo documento a S3`, uploadError, {
              messageId,
              storagePath,
              size: buffer.byteLength
            })
            throw new Error(`Error subiendo a S3: ${uploadError.message}`)
          }
          
          logger.storage(`Documento guardado en S3 Storage`, {
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
          
          // Devolver el documento
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': message.messageSubType ?? 'application/pdf',
              'Cache-Control': 'public, max-age=31536000',
              'Content-Length': buffer.byteLength.toString(),
              'Content-Disposition': `attachment; filename="${message.mediaFileName || 'documento'}"`
            }
          })
        } else {
          logger.warn(`Error descargando documento desde WhatsApp`, {
            messageId,
            status: response.status,
            statusText: response.statusText
          })
        }
      } catch (error) {
        logger.webhookError(`Error procesando documento original`, error as Error, {
          messageId,
          mediaUrl: message.mediaUrl
        })
      }
    }
    
    const processingTime = Date.now() - startTime
    
    logger.warn(`No hay documento disponible`, {
      messageId,
      hasMediaUrl: !!message.mediaUrl,
      processingTimeMs: processingTime
    })
    
    return NextResponse.json({ error: 'No hay documento disponible' }, { status: 404 })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    logger.webhookError(`Error en endpoint de documento`, error as Error, {
      messageId: params.messageId,
      processingTimeMs: processingTime
    })
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
