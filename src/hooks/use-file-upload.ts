import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/utils/server-logger'

interface UploadFileOptions {
  clientId: string
  messageType?: 'image' | 'document'
  onProgress?: (progress: number) => void
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
}

interface UploadResult {
  success: boolean
  filePath?: string
  publicUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  error?: string
}

interface UseFileUploadResult {
  uploadFile: (file: File, options: UploadFileOptions) => Promise<UploadResult>
  isUploading: boolean
  progress: number
  error: string | null
}

export function useFileUpload(): UseFileUploadResult {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (
    file: File, 
    options: UploadFileOptions
  ): Promise<UploadResult> => {
    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Validaciones básicas
      if (!file) {
        throw new Error('No se proporcionó ningún archivo')
      }

      if (!options.clientId) {
        throw new Error('ClientId es requerido')
      }

      // Validar tamaño (máximo 16MB)
      const maxSize = 16 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error(`El archivo es demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB`)
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ]

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no soportado. Solo se permiten imágenes y documentos.')
      }

      // Crear FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clientId', options.clientId)
      if (options.messageType) {
        formData.append('messageType', options.messageType)
      }

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 20, 90)
          options.onProgress?.(newProgress)
          return newProgress
        })
      }, 200)

      // Subir archivo
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgress(100)
      options.onProgress?.(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result: UploadResult = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido al subir archivo')
      }

      logger.api(`Archivo subido exitosamente`, {
        fileName: result.fileName,
        filePath: result.filePath,
        publicUrl: result.publicUrl,
        fileSize: result.fileSize,
        fileType: result.fileType
      })

      options.onSuccess?.(result)

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      
      logger.apiError(`Error subiendo archivo`, err as Error, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        clientId: options.clientId
      })

      options.onError?.(errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }, [])

  return {
    uploadFile,
    isUploading,
    progress,
    error
  }
}

// Hook para obtener información de archivos
export function useFileInfo() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getClientFiles = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/upload?clientId=${clientId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error obteniendo archivos')
      }

      setFiles(result.files || [])
      return result.files || []

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      logger.apiError(`Error obteniendo archivos del cliente`, err as Error, { clientId })
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getFileInfo = useCallback(async (clientId: string, filePath: string) => {
    try {
      const response = await fetch(`/api/upload?clientId=${clientId}&filePath=${encodeURIComponent(filePath)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error obteniendo información del archivo')
      }

      return result

    } catch (err) {
      logger.apiError(`Error obteniendo información del archivo`, err as Error, { clientId, filePath })
      return null
    }
  }, [])

  const deleteFile = useCallback(async (clientId: string, filePath: string) => {
    try {
      const response = await fetch(`/api/upload?clientId=${clientId}&filePath=${encodeURIComponent(filePath)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error eliminando archivo')
      }

      // Actualizar la lista de archivos
      setFiles(prev => prev.filter(file => file.path !== filePath))

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      logger.apiError(`Error eliminando archivo`, err as Error, { clientId, filePath })
      throw new Error(errorMessage)
    }
  }, [])

  return {
    files,
    loading,
    error,
    getClientFiles,
    getFileInfo,
    deleteFile
  }
}
