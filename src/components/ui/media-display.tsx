import React from 'react'
import Image from 'next/image'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { 
  Image as ImageIcon, 
  Video, 
  Mic, 
  FileText, 
  MapPin, 
  User, 
  Smile, 
  BarChart3,
  Download,
  Play,
  ExternalLink,
  Eye,
  Loader2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { useMediaInfo } from '@/hooks/use-media-info'

// Helper function para manejar fechas de forma segura
function formatMessageTime(createdAt: string | Date): string {
  try {
    const date = new Date(createdAt)
    if (isNaN(date.getTime())) {
      return 'Hora no disponible'
    }
    return date.toLocaleTimeString()
  } catch (error) {
    return 'Hora no disponible'
  }
}

interface MediaDisplayProps {
  message: {
    id: string
    content: string
    messageType?: string
    messageSubType?: string
    mediaUrl?: string
    mediaFileName?: string
    mediaSize?: number
    mediaDuration?: number
    mediaWidth?: number
    mediaHeight?: number
    mediaThumbnail?: string
    caption?: string
    title?: string
    description?: string
    latitude?: number
    longitude?: number
    locationName?: string
    contactName?: string
    contactPhone?: string
    reaction?: string
    pollOptions?: string[]
    createdAt: Date
    role: string
    senderType?: string
  }
  showMetadata?: boolean
}

export function MediaDisplay({ message, showMetadata = false }: MediaDisplayProps) {
  const { 
    mediaInfo, 
    loading, 
    error, 
    getMediaUrl, 
    getThumbnailUrl, 
    downloadMedia, 
    formatFileSize, 
    formatDuration 
  } = useMediaInfo(message.id)
  
  const getMessageIcon = () => {
    switch (message.messageType) {
      case 'IMAGE': return <ImageIcon className="w-4 h-4" />
      case 'VIDEO': return <Video className="w-4 h-4" />
      case 'AUDIO': return <Mic className="w-4 h-4" />
      case 'DOCUMENT': return <FileText className="w-4 h-4" />
      case 'LOCATION': return <MapPin className="w-4 h-4" />
      case 'CONTACT': return <User className="w-4 h-4" />
      case 'STICKER': return <Smile className="w-4 h-4" />
      case 'POLL': return <BarChart3 className="w-4 h-4" />
      default: return null
    }
  }
  
  const renderMediaContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando multimedia...</span>
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="p-4 bg-destructive/10 rounded-lg text-center">
          <p className="text-sm text-destructive">Error cargando multimedia</p>
          <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        </div>
      )
    }
    
    switch (message.messageType) {
      case 'IMAGE':
        return (
          <div className="space-y-2">
            {getThumbnailUrl() && (
              <div className="relative group">
                <Image 
                  src={getThumbnailUrl()!}
                  alt={message.caption ?? 'Imagen'}
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-auto max-h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  unoptimized={true}
                  onError={(e) => {
                    // Si falla, usar el thumbnail como fallback
                    const target = e.target as HTMLImageElement
                    target.src = getThumbnailUrl() ?? ''
                  }}
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Imagen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Image 
                        src={getMediaUrl()!}
                        alt={message.caption ?? 'Imagen'}
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-lg"
                        unoptimized={true}
                        onError={(e) => {
                          // Si falla, usar el thumbnail como fallback
                          const target = e.target as HTMLImageElement
                          target.src = getThumbnailUrl() ?? ''
                        }}
                      />
                      {message.caption && (
                        <p className="text-sm text-muted-foreground">{message.caption}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Tamaño:</span> {formatFileSize(mediaInfo?.fileSize)}
                          </div>
                          <div>
                            <span className="font-medium">Dimensiones:</span> {mediaInfo?.width}×{mediaInfo?.height}
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {mediaInfo?.messageSubType}
                          </div>
                          <div>
                            <span className="font-medium">Archivo:</span> {mediaInfo?.fileName ?? 'N/A'}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={downloadMedia}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {message.caption && (
              <p className="text-sm text-muted-foreground">{message.caption}</p>
            )}
          </div>
        )

      case 'VIDEO':
        return (
          <div className="space-y-2">
            {getThumbnailUrl() && (
              <div className="relative group">
                <Image 
                  src={getThumbnailUrl()!}
                  alt={message.caption ?? 'Video'}
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-auto max-h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  unoptimized={true}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Video</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <video 
                        src={getMediaUrl()!}
                        controls
                        className="w-full h-auto rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement
                          target.style.display = 'none'
                          const errorDiv = document.createElement('div')
                          errorDiv.className = 'p-4 bg-muted rounded-lg text-center'
                          errorDiv.textContent = 'Video no disponible'
                          target.parentNode?.appendChild(errorDiv)
                        }}
                      />
                      {message.caption && (
                        <p className="text-sm text-muted-foreground">{message.caption}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Duración:</span> {formatDuration(mediaInfo?.duration)}
                          </div>
                          <div>
                            <span className="font-medium">Tamaño:</span> {formatFileSize(mediaInfo?.fileSize)}
                          </div>
                          <div>
                            <span className="font-medium">Dimensiones:</span> {mediaInfo?.width}×{mediaInfo?.height}
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {mediaInfo?.messageSubType}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={downloadMedia}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {message.caption && (
              <p className="text-sm text-muted-foreground">{message.caption}</p>
            )}
            {showMetadata && (
              <div className="text-sm text-muted-foreground">
                Duración: {formatDuration(mediaInfo?.duration)} | Tamaño: {formatFileSize(mediaInfo?.fileSize)}
              </div>
            )}
          </div>
        )

      case 'AUDIO':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Mic className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="h-2 bg-muted-foreground/20 rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{formatDuration(mediaInfo?.duration)}</span>
            </div>
            
            {getMediaUrl() && (
              <audio 
                controls 
                className="w-full"
                src={getMediaUrl()!}
                onError={(e) => {
                  const target = e.target as HTMLAudioElement
                  target.style.display = 'none'
                  const errorDiv = document.createElement('div')
                  errorDiv.className = 'p-2 bg-muted rounded text-center text-sm text-muted-foreground'
                  errorDiv.textContent = 'Audio no disponible'
                  target.parentNode?.appendChild(errorDiv)
                }}
              />
            )}
            
            {showMetadata && (
              <div className="text-sm text-muted-foreground">
                Duración: {formatDuration(mediaInfo?.duration)} | Tamaño: {formatFileSize(mediaInfo?.fileSize)}
              </div>
            )}
          </div>
        )

      case 'DOCUMENT':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{message.title ?? message.mediaFileName ?? 'Documento'}</p>
                {message.description && (
                  <p className="text-sm text-muted-foreground">{message.description}</p>
                )}
                {showMetadata && (
                  <p className="text-xs text-muted-foreground">{formatFileSize(mediaInfo?.fileSize)}</p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadMedia}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Vista previa del documento si es PDF */}
            {mediaInfo?.messageSubType === 'application/pdf' && getMediaUrl() && (
              <div className="mt-2">
                <iframe
                  src={getMediaUrl()!}
                  className="w-full h-64 border rounded-lg"
                  title="Vista previa del documento"
                  onError={(e) => {
                    const target = e.target as HTMLIFrameElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )

      case 'LOCATION':
        return (
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{message.locationName ?? 'Ubicación'}</span>
              </div>
              {message.latitude && message.longitude && (
                <p className="text-sm text-muted-foreground mt-1">
                  {message.latitude.toFixed(6)}, {message.longitude.toFixed(6)}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver en mapa
            </Button>
          </div>
        )

      case 'CONTACT':
        return (
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <User className="w-8 h-8 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{message.contactName ?? 'Contacto'}</p>
              {message.contactPhone && (
                <p className="text-sm text-muted-foreground">{message.contactPhone}</p>
              )}
            </div>
            <Button variant="outline" size="sm">
              Guardar
            </Button>
          </div>
        )

      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {getMessageIcon()}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {message.messageType ?? 'TEXT'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
            
            {renderMediaContent()}
            
            {showMetadata && message.messageType !== 'IMAGE' && (
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-2">
                  <div>Rol: {message.role}</div>
                  <div>Tipo: {message.senderType}</div>
                  {mediaInfo?.fileSize && <div>Tamaño: {formatFileSize(mediaInfo.fileSize)}</div>}
                  {mediaInfo?.messageSubType && <div>Subtipo: {mediaInfo.messageSubType}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
