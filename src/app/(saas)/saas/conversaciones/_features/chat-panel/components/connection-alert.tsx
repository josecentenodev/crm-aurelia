"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConnectionAlertProps {
  error: string | null
  onRetry: () => void
}

export function ConnectionAlert({ error, onRetry }: ConnectionAlertProps) {
  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="flex-1">
          <strong>Error de conexión:</strong> {error}. Los mensajes en tiempo real no se actualizarán.
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="shrink-0 border-destructive-foreground/20 hover:bg-destructive-foreground/10"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Reconectar
        </Button>
      </AlertDescription>
    </Alert>
  )
}

