import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/server-logger'

// Configuración de archivos permitidos
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
}

const MAX_FILE_SIZE = 16 * 1024 * 1024 // 16MB (límite de WhatsApp)

interface UploadResponse {
  success: boolean
  filePath?: string
  publicUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const messageType = formData.get('messageType') as string || 'image'

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      }, { status: 400 })
    }

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'ClientId es requerido'
      }, { status: 400 })
    }

    logger.info(`Solicitud de subida de archivo`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      clientId,
      messageType
    })

    // Validar tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 })
    }

    // Validar tipo de archivo
    const allAllowedTypes = [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents]
    if (!allAllowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo de archivo no soportado. Solo se permiten imágenes y documentos.'
      }, { status: 400 })
    }

    // Determinar el tipo de archivo
    const isImage = ALLOWED_FILE_TYPES.images.includes(file.type)
    const isDocument = ALLOWED_FILE_TYPES.documents.includes(file.type)

    if (!isImage && !isDocument) {
      return NextResponse.json({
        success: false,
        error: 'Tipo de archivo no válido'
      }, { status: 400 })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${timestamp}_${randomId}.${fileExtension}`

    // Determinar la carpeta según el tipo
    const folder = isImage ? 'images' : 'documents'
    const filePath = `uploads/${clientId}/${folder}/${uniqueFileName}`

    // Subir a Supabase Storage
    const adminClient = getAdminSupabase()
    
    const { data, error } = await adminClient.storage
      .from('media')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      logger.error(`Error subiendo archivo a Supabase`, error, {
        fileName: file.name,
        filePath,
        clientId
      })
      
      return NextResponse.json({
        success: false,
        error: `Error subiendo archivo: ${error.message}`
      }, { status: 500 })
    }

    // Obtener URL pública
    const { data: { publicUrl } } = adminClient.storage
      .from('media')
      .getPublicUrl(filePath)

    logger.info(`Archivo subido exitosamente`, {
      fileName: file.name,
      filePath,
      publicUrl,
      fileSize: file.size,
      fileType: file.type,
      clientId
    })

    const response: UploadResponse = {
      success: true,
      filePath,
      publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }

    return NextResponse.json(response)

  } catch (error) {
    logger.error(`Error en endpoint de subida de archivos`, error as Error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// Endpoint para obtener información de archivos subidos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const filePath = searchParams.get('filePath')

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'ClientId es requerido'
      }, { status: 400 })
    }

    const adminClient = getAdminSupabase()

    if (filePath) {
      // Obtener información de un archivo específico
      try {
        const { data, error } = await adminClient.storage
          .from('media')
          .download(filePath)

        if (error) {
          return NextResponse.json({
            success: false,
            error: 'Archivo no encontrado'
          }, { status: 404 })
        }

        const { data: { publicUrl } } = adminClient.storage
          .from('media')
          .getPublicUrl(filePath)

        return NextResponse.json({
          success: true,
          filePath,
          publicUrl,
          exists: true
        })

      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error obteniendo información del archivo'
        }, { status: 500 })
      }
    } else {
      // Listar archivos del cliente
      try {
        const { data, error } = await adminClient.storage
          .from('media')
          .list(`uploads/${clientId}`, {
            limit: 100,
            sort: { column: 'created_at', order: 'desc' }
          })

        if (error) {
          return NextResponse.json({
            success: false,
            error: 'Error listando archivos'
          }, { status: 500 })
        }

        const files = data?.map(file => ({
          name: file.name,
          path: `uploads/${clientId}/${file.name}`,
          size: file.metadata?.size,
          contentType: file.metadata?.mimetype,
          createdAt: file.created_at,
          publicUrl: adminClient.storage.from('media').getPublicUrl(`uploads/${clientId}/${file.name}`).data.publicUrl
        })) || []

        return NextResponse.json({
          success: true,
          files,
          count: files.length
        })

      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error listando archivos'
        }, { status: 500 })
      }
    }

  } catch (error) {
    logger.error(`Error en endpoint GET de archivos`, error as Error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// Endpoint para eliminar archivos
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('filePath')
    const clientId = searchParams.get('clientId')

    if (!filePath) {
      return NextResponse.json({
        success: false,
        error: 'filePath es requerido'
      }, { status: 400 })
    }

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'clientId es requerido'
      }, { status: 400 })
    }

    // Verificar que el archivo pertenece al cliente
    if (!filePath.startsWith(`uploads/${clientId}/`)) {
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para eliminar este archivo'
      }, { status: 403 })
    }

    const adminClient = getAdminSupabase()

    const { error } = await adminClient.storage
      .from('media')
      .remove([filePath])

    if (error) {
      logger.error(`Error eliminando archivo`, error, {
        filePath,
        clientId
      })
      
      return NextResponse.json({
        success: false,
        error: `Error eliminando archivo: ${error.message}`
      }, { status: 500 })
    }

    logger.info(`Archivo eliminado exitosamente`, {
      filePath,
      clientId
    })

    return NextResponse.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    })

  } catch (error) {
    logger.error(`Error en endpoint DELETE de archivos`, error as Error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
