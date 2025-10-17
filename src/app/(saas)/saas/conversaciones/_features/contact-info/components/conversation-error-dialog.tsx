/**
 * Diálogo de error para operaciones de conversación
 * Muestra errores cuando fallan las operaciones de archivar o marcar como importante
 */

"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ConversationErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  errorMessage: string
  onRetry?: () => void
}

export function ConversationErrorDialog({
  isOpen,
  onClose,
  errorMessage,
  onRetry
}: ConversationErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Error en la operación</span>
          </DialogTitle>
          <DialogDescription>
            Ha ocurrido un error al procesar la operación. Los cambios se han revertido automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Entendido
            </Button>

            {onRetry && (
              <Button
                onClick={() => {
                  onRetry()
                  onClose()
                }}
                className="rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
