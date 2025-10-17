/**
 * Preview de archivos seleccionados para envío
 * Muestra información del archivo y permite subirlo
 */

"use client"

import { Button } from "@/components/ui"
import { X, Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface FilePreviewProps {
  file: File
  type: 'image' | 'document'
  onRemove: () => void
  onUpload: (file: File, type: 'image' | 'document') => Promise<void>
  clientId: string
}

export function FilePreview({ file, type, onRemove, onUpload, clientId }: FilePreviewProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async () => {
    setIsUploading(true)
    try {
      await onUpload(file, type)
      onRemove() // Remove preview after successful upload
    } catch (error) {
      toast({
        title: "Error al subir archivo",
        description: "No se pudo subir el archivo. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    if (type === 'image') {
      return <ImageIcon className="w-5 h-5 text-green-600" />
    }
    return <FileText className="w-5 h-5 text-blue-600" />
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="flex items-center space-x-3">
        {getFileIcon()}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-violet-500 hover:bg-purple-700 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-1" />
                Enviar
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            disabled={isUploading}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview de imagen */}
      {type === 'image' && (
        <div className="mt-3">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="max-w-full h-32 object-cover rounded border"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
    </div>
  )
}
