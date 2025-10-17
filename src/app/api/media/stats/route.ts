import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { logger } from '@/lib/utils/server-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const messageType = searchParams.get('messageType')
    const limit = parseInt(searchParams.get('limit') || '50')

    logger.debug(`Solicitud de estadísticas de multimedia`, {
      clientId,
      messageType,
      limit
    })

    // Construir filtros
    const where: any = {}
    
    if (clientId) {
      where.conversation = {
        clientId: clientId
      }
    }

    if (messageType) {
      where.messageType = messageType
    }

    // Obtener estadísticas de multimedia
    const multimediaMessages = await db.message.findMany({
      where: {
        ...where,
        messageType: {
          in: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER']
        }
      },
      select: {
        id: true,
        messageType: true,
        mediaUrl: true,
        createdAt: true,
        conversation: {
          select: {
            clientId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Calcular estadísticas
    const stats = {
      total: multimediaMessages.length,
      byType: {} as Record<string, number>,
      byStorage: {
        supabase: 0,
        whatsapp: 0,
        unknown: 0
      },
      recent: multimediaMessages.slice(0, 10).map(msg => ({
        id: msg.id,
        messageType: msg.messageType,
        isStoredInSupabase: msg.mediaUrl?.includes('supabase') || false,
        createdAt: msg.createdAt,
        clientId: msg.conversation.clientId
      }))
    }

    // Procesar estadísticas
    multimediaMessages.forEach(msg => {
      // Por tipo
      stats.byType[msg.messageType] = (stats.byType[msg.messageType] || 0) + 1
      
      // Por almacenamiento
      if (msg.mediaUrl?.includes('supabase')) {
        stats.byStorage.supabase++
      } else if (msg.mediaUrl?.includes('whatsapp') || msg.mediaUrl?.startsWith('http')) {
        stats.byStorage.whatsapp++
      } else {
        stats.byStorage.unknown++
      }
    })

    // Calcular porcentajes
    const total = stats.total
    const percentages = {
      supabase: total > 0 ? Math.round((stats.byStorage.supabase / total) * 100) : 0,
      whatsapp: total > 0 ? Math.round((stats.byStorage.whatsapp / total) * 100) : 0,
      unknown: total > 0 ? Math.round((stats.byStorage.unknown / total) * 100) : 0
    }

    const response = {
      success: true,
      stats: {
        ...stats,
        percentages
      },
      filters: {
        clientId,
        messageType,
        limit
      },
      timestamp: new Date().toISOString()
    }

    logger.debug(`Estadísticas de multimedia generadas`, {
      total: stats.total,
      supabasePercentage: percentages.supabase,
      whatsappPercentage: percentages.whatsapp
    })

    return NextResponse.json(response)

  } catch (error) {
    logger.webhookError(`Error obteniendo estadísticas de multimedia`, error as Error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, force = false } = body

    if (!messageId) {
      return NextResponse.json({ 
        success: false, 
        error: 'messageId es requerido' 
      }, { status: 400 })
    }

    logger.debug(`Solicitud de almacenamiento manual de multimedia`, {
      messageId,
      force
    })

    // Obtener el mensaje
    const message = await db.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        messageType: true,
        mediaUrl: true,
        whatsappId: true,
        conversation: {
          select: {
            clientId: true
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Mensaje no encontrado' 
      }, { status: 404 })
    }

    // Verificar si ya está en Supabase
    if (!force && message.mediaUrl?.includes('supabase')) {
      return NextResponse.json({
        success: true,
        message: 'Multimedia ya está almacenado en Supabase',
        data: {
          messageId: message.id,
          mediaUrl: message.mediaUrl,
          alreadyStored: true
        }
      })
    }

    // Verificar si es multimedia
    const multimediaTypes = ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER']
    if (!multimediaTypes.includes(message.messageType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'El mensaje no es multimedia' 
      }, { status: 400 })
    }

    // Importar el servicio de almacenamiento
    const { mediaStorageService } = await import('@/lib/webhook/evolution/media-storage-service')
    
    // Obtener información del cliente para el container name
    const client = await db.client.findUnique({
      where: { id: message.conversation.clientId },
      select: { name: true }
    })

    if (!client) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente no encontrado' 
      }, { status: 404 })
    }

    const containerName = `evolution_${client.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    const instanceName = 'default' // Puedes personalizar esto

    // Almacenar multimedia
    const result = await mediaStorageService.storeMediaFromWebhook(
      message.whatsappId || message.id,
      message.mediaUrl || '',
      message.messageType,
      instanceName,
      containerName,
      message.conversation.clientId
    )

    if (result.success && result.publicUrl) {
      // Actualizar la URL en la base de datos
      await mediaStorageService.updateMessageMediaUrl(message.id, result.publicUrl)

      return NextResponse.json({
        success: true,
        message: 'Multimedia almacenado exitosamente',
        data: {
          messageId: message.id,
          filePath: result.filePath,
          publicUrl: result.publicUrl,
          fileSize: result.fileSize,
          fileHash: result.fileHash
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Error desconocido almacenando multimedia'
      }, { status: 500 })
    }

  } catch (error) {
    logger.webhookError(`Error en almacenamiento manual de multimedia`, error as Error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
