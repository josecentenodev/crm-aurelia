/**
 * Dialog de confirmación para cambio de estado de conversación
 * Muestra información clara sobre el cambio que se va a realizar
 */

"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui"
import { CheckCircle, Pause, XCircle, Archive, AlertCircle } from "lucide-react"
import type { ConversationStatus } from "@/domain/Conversaciones"

interface ConversationStatusChangeDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  currentStatus: ConversationStatus
  newStatus: ConversationStatus
  isChanging: boolean
}

const STATUS_CONFIG = {
  ACTIVA: { 
    label: "Activa", 
    icon: CheckCircle, 
    color: "text-green-600",
    description: "La conversación continuará recibiendo mensajes normalmente"
  },
  PAUSADA: { 
    label: "Pausada", 
    icon: Pause, 
    color: "text-yellow-600",
    description: "La conversación se pausará temporalmente"
  },
  FINALIZADA: { 
    label: "Finalizada", 
    icon: XCircle, 
    color: "text-blue-600",
    description: "La conversación se marcará como completada"
  },
  ARCHIVADA: { 
    label: "Archivada", 
    icon: Archive, 
    color: "text-gray-600",
    description: "La conversación se archivará y no aparecerá en la lista principal"
  }
} as const

export function ConversationStatusChangeDialog({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  isChanging
}: ConversationStatusChangeDialogProps) {
  const currentConfig = STATUS_CONFIG[currentStatus]
  const newConfig = STATUS_CONFIG[newStatus]
  
  const CurrentIcon = currentConfig.icon
  const NewIcon = newConfig.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Confirmar cambio de estado
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas cambiar el estado de esta conversación?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Estado actual */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CurrentIcon className={`w-5 h-5 ${currentConfig.color}`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Estado actual: {currentConfig.label}
              </div>
              <div className="text-xs text-gray-600">
                {currentConfig.description}
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex justify-center">
            <div className="text-gray-400">↓</div>
          </div>

          {/* Nuevo estado */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <NewIcon className={`w-5 h-5 ${newConfig.color}`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Nuevo estado: {newConfig.label}
              </div>
              <div className="text-xs text-gray-600">
                {newConfig.description}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isChanging}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isChanging}
            className="flex-1"
          >
            {isChanging ? "Cambiando..." : "Confirmar cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

