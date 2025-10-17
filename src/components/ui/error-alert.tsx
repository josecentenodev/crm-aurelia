"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  RefreshCw, 
  Copy,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EvolutionError, ErrorCode } from "@/lib/error-codes"

interface ErrorAlertProps {
  error: EvolutionError
  onRetry?: () => void
  onDismiss?: () => void
  showTechnicalDetails?: boolean
  className?: string
}

const getErrorIcon = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return <XCircle className="h-4 w-4" />
    case 'HIGH':
      return <AlertTriangle className="h-4 w-4" />
    case 'MEDIUM':
      return <AlertTriangle className="h-4 w-4" />
    case 'LOW':
      return <Info className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

const getErrorVariant = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'destructive'
    case 'HIGH':
      return 'destructive'
    case 'MEDIUM':
      return 'default'
    case 'LOW':
      return 'default'
    default:
      return 'default'
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'LOW':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function ErrorAlert({ 
  error, 
  onRetry, 
  onDismiss, 
  showTechnicalDetails = false,
  className = "" 
}: ErrorAlertProps) {
  const { toast } = useToast()
  const [showDetails, setShowDetails] = useState(showTechnicalDetails)

  const handleCopyError = () => {
    const errorText = `
Error Code: ${error.code}
User Message: ${error.userMessage}
Technical Details: ${error.technicalDetails || 'N/A'}
Severity: ${error.severity}
Retryable: ${error.retryable}
Stack: ${error.stack || 'N/A'}
    `.trim()

    navigator.clipboard.writeText(errorText)
    toast({
      title: "Error copiado",
      description: "Los detalles del error han sido copiados al portapapeles",
    })
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    }
  }

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <Alert variant={getErrorVariant(error.severity)} className={className}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getErrorIcon(error.severity)}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTitle className="text-sm font-medium">
                {error.userMessage}
              </AlertTitle>
              <Badge variant="outline" className={`text-xs ${getSeverityColor(error.severity)}`}>
                {error.severity}
              </Badge>
              {error.retryable && (
                <Badge variant="secondary" className="text-xs">
                  Reintentable
                </Badge>
              )}
            </div>
            
            <AlertDescription className="text-sm text-muted-foreground">
              {error.technicalDetails && (
                <span className="block mb-2">
                  {error.technicalDetails}
                </span>
              )}
              
              <div className="flex items-center space-x-2 mt-3">
                {error.retryable && onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="h-7 px-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reintentar
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyError}
                  className="h-7 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
                
                {showDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="h-7 px-2"
                  >
                    {showDetails ? 'Ocultar' : 'Mostrar'} detalles
                  </Button>
                )}
              </div>
              
              {showDetails && (
                <div className="mt-3 p-3 bg-muted rounded-md text-xs font-mono">
                  <div className="mb-2">
                    <strong>Código:</strong> {error.code}
                  </div>
                  {error.technicalDetails && (
                    <div className="mb-2">
                      <strong>Detalles técnicos:</strong> {error.technicalDetails}
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <strong>Stack trace:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <XCircle className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  )
}

// Componente para mostrar múltiples errores
interface ErrorListProps {
  errors: EvolutionError[]
  onRetry?: (error: EvolutionError) => void
  onDismiss?: (error: EvolutionError) => void
  className?: string
}

export function ErrorList({ errors, onRetry, onDismiss, className = "" }: ErrorListProps) {
  if (errors.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {errors.map((error, index) => (
        <ErrorAlert
          key={`${error.code}-${index}`}
          error={error}
          onRetry={onRetry ? () => onRetry(error) : undefined}
          onDismiss={onDismiss ? () => onDismiss(error) : undefined}
          showTechnicalDetails={false}
        />
      ))}
    </div>
  )
}

// Hook para manejar errores en componentes
export function useErrorHandler() {
  const [errors, setErrors] = useState<EvolutionError[]>([])
  const { toast } = useToast()

  const handleError = (error: unknown) => {
    let evolutionError: EvolutionError

    if (error instanceof EvolutionError) {
      evolutionError = error
    } else {
      evolutionError = EvolutionError.fromAxiosError(error)
    }

    setErrors(prev => [...prev, evolutionError])

    // Mostrar toast según la severidad
    const variant = evolutionError.severity === 'CRITICAL' || evolutionError.severity === 'HIGH' 
      ? 'destructive' 
      : 'default'

    toast({
      title: evolutionError.userMessage,
      description: evolutionError.technicalDetails,
      variant,
    })

    return evolutionError
  }

  const clearErrors = () => {
    setErrors([])
  }

  const removeError = (errorToRemove: EvolutionError) => {
    setErrors(prev => prev.filter(error => error !== errorToRemove))
  }

  const retryError = (error: EvolutionError, retryFn: () => void) => {
    if (error.retryable) {
      retryFn()
      removeError(error)
    }
  }

  return {
    errors,
    handleError,
    clearErrors,
    removeError,
    retryError
  }
} 