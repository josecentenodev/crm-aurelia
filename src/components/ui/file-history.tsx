'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Calendar,
  HardDrive,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useFileInfo } from '@/hooks/use-file-upload'
import { toast } from '@/hooks/use-toast'

interface FileHistoryProps {
  clientId: string
  onFileSelect?: (file: { publicUrl: string; name: string; contentType: string }) => void
}

export function FileHistory({ clientId, onFileSelect }: FileHistoryProps) {
  const { files, loading, error, getClientFiles, deleteFile } = useFileInfo()
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (clientId) {
      getClientFiles(clientId)
    }
  }, [clientId, getClientFiles])

  const handleDeleteFile = async (filePath: string) => {
    setDeletingFiles(prev => new Set(prev).add(filePath))
    
    try {
      await deleteFile(clientId, filePath)
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error eliminando archivo",
        variant: "destructive",
      })
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(filePath)
        return newSet
      })
    }
  }

  const handleFileClick = (file: any) => {
    if (onFileSelect) {
      onFileSelect({
        publicUrl: file.publicUrl,
        name: file.name,
        contentType: file.contentType
      })
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-green-500" />
    } else if (contentType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />
    } else if (contentType.includes('word') || contentType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />
    } else {
      return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const getFileTypeBadge = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Imagen</Badge>
    } else if (contentType.includes('pdf')) {
      return <Badge variant="secondary" className="bg-red-100 text-red-700">PDF</Badge>
    } else if (contentType.includes('word') || contentType.includes('document')) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Documento</Badge>
    } else {
      return <Badge variant="secondary">Archivo</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Archivos Subidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando archivos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Archivos Subidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => getClientFiles(clientId)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Archivos Subidos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{files.length} archivos</Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => getClientFiles(clientId)}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay archivos subidos</p>
            <p className="text-sm">Los archivos que subas aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.contentType)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{file.name}</p>
                      {getFileTypeBadge(file.contentType)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(file.createdAt)}
                      </span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {onFileSelect && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileClick(file)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFile(file.path)}
                    disabled={deletingFiles.has(file.path)}
                  >
                    {deletingFiles.has(file.path) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
