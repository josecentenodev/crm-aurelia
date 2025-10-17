import { useState, useEffect } from 'react'
import { logger } from '@/lib/utils/server-logger'

interface MediaInfo {
  messageId: string
  messageType: string
  messageSubType?: string
  fileName?: string
  fileSize?: number
  duration?: number
  width?: number
  height?: number
  caption?: string
  title?: string
  description?: string
  hasThumbnail: boolean
  hasOriginalUrl: boolean
  isStoredInSupabase: boolean
  storagePath?: string
  publicUrl?: string
  endpoints: {
    thumbnail?: string
    original?: string
    stored?: string
  }
}

interface UseMediaOptions {
  autoLoad?: boolean
  onError?: (error: Error) => void
}

export function useMediaInfo(messageId: string, options: UseMediaOptions = {}) {
  const { autoLoad = true, onError } = options
  
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const loadMediaInfo = async () => {
    if (!messageId) return
    
    setLoading(true)
    setError(null)
    
    try {
      logger.debug(`Cargando información multimedia`, { messageId })
      
      const response = await fetch(`/api/messages/${messageId}/media-info`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setMediaInfo(data)
      
      logger.debug(`Información multimedia cargada`, {
        messageId,
        messageType: data.messageType,
        isStoredInSupabase: data.isStoredInSupabase
      })
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido')
      setError(error)
      onError?.(error)
      
      logger.error(`Error cargando información multimedia`, {
        messageId,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }
  
  const getMediaUrl = (): string | null => {
    if (!mediaInfo) return null
    
    // Prioridad: Supabase > Original > Thumbnail
    if (mediaInfo.isStoredInSupabase && mediaInfo.publicUrl) {
      return mediaInfo.publicUrl
    }
    
    if (mediaInfo.endpoints.stored) {
      return mediaInfo.endpoints.stored
    }
    
    if (mediaInfo.endpoints.original) {
      return mediaInfo.endpoints.original
    }
    
    if (mediaInfo.endpoints.thumbnail) {
      return mediaInfo.endpoints.thumbnail
    }
    
    return null
  }
  
  const getThumbnailUrl = (): string | null => {
    if (!mediaInfo) return null
    
    if (mediaInfo.endpoints.thumbnail) {
      return mediaInfo.endpoints.thumbnail
    }
    
    // Para imágenes, usar la URL principal como thumbnail
    if (mediaInfo.messageType === 'IMAGE') {
      return getMediaUrl()
    }
    
    return null
  }
  
  const downloadMedia = async (): Promise<void> => {
    if (!mediaInfo) return
    
    try {
      const url = getMediaUrl()
      if (!url) {
        throw new Error('No hay URL disponible para descargar')
      }
      
      // Si es una URL de Supabase o nuestro endpoint, descargar directamente
      if (url.startsWith('/api/') || url.includes('supabase')) {
        const link = document.createElement('a')
        link.href = url
        link.download = mediaInfo.fileName || `media_${mediaInfo.messageId}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Para URLs externas, abrir en nueva pestaña
        window.open(url, '_blank')
      }
      
      logger.debug(`Descarga de multimedia iniciada`, {
        messageId: mediaInfo.messageId,
        url,
        fileName: mediaInfo.fileName
      })
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido')
      onError?.(error)
      
      logger.error(`Error descargando multimedia`, {
        messageId: mediaInfo.messageId,
        error: error.message
      })
    }
  }
  
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
  
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  useEffect(() => {
    if (autoLoad && messageId) {
      loadMediaInfo()
    }
  }, [messageId, autoLoad])
  
  return {
    mediaInfo,
    loading,
    error,
    loadMediaInfo,
    getMediaUrl,
    getThumbnailUrl,
    downloadMedia,
    formatFileSize,
    formatDuration
  }
}
