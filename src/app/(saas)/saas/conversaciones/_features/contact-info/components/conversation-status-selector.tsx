/**
 * Selector de estado de conversación
 * Permite cambiar el estado con confirmación previa
 */

"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { CheckCircle, Pause, XCircle, Archive, Loader2 } from "lucide-react"
import { ConversationStatusChangeDialog } from "./conversation-status-change-dialog"
import type { ConversationStatus } from "@/domain/Conversaciones"

interface ConversationStatusSelectorProps {
  currentStatus: ConversationStatus
  onStatusChange: (newStatus: ConversationStatus) => Promise<void>
  isChanging: boolean
}

const STATUS_CONFIG = {
  ACTIVA: { 
    label: "Activa", 
    icon: CheckCircle, 
    color: "text-green-600"
  },
  PAUSADA: { 
    label: "Pausada", 
    icon: Pause, 
    color: "text-yellow-600"
  },
  FINALIZADA: { 
    label: "Finalizada", 
    icon: XCircle, 
    color: "text-blue-600"
  },
  ARCHIVADA: { 
    label: "Archivada", 
    icon: Archive, 
    color: "text-gray-600"
  }
} as const

export function ConversationStatusSelector({ 
  currentStatus, 
  onStatusChange, 
  isChanging 
}: ConversationStatusSelectorProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<ConversationStatus | null>(null)

  const handleStatusSelect = (value: string) => {
    const newStatus = value as ConversationStatus
    if (newStatus === currentStatus) return
    
    // Abrir dialog de confirmación
    setPendingStatus(newStatus)
    setShowConfirmDialog(true)
  }

  const handleConfirmChange = async () => {
    if (!pendingStatus) return
    
    await onStatusChange(pendingStatus)
    setShowConfirmDialog(false)
    setPendingStatus(null)
  }

  const handleCancelChange = () => {
    setShowConfirmDialog(false)
    setPendingStatus(null)
  }

  const configToShow = STATUS_CONFIG[currentStatus]
  const IconToShow = configToShow.icon

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Estado:</span>
        
        <Select 
          value={currentStatus} 
          onValueChange={handleStatusSelect}
          disabled={isChanging}
        >
          <SelectTrigger className="w-auto h-auto border-none shadow-none hover:bg-gray-50 px-2 py-1 rounded">
            <div className="flex items-center gap-1.5">
              {isChanging ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
              ) : (
                <IconToShow className={`w-3.5 h-3.5 ${configToShow.color}`} />
              )}
              <span className="text-sm text-gray-900">{configToShow.label}</span>
            </div>
          </SelectTrigger>
          
          <SelectContent>
            {(Object.entries(STATUS_CONFIG) as Array<[ConversationStatus, typeof STATUS_CONFIG[ConversationStatus]]>).map(([status, config]) => {
              const Icon = config.icon
              const isCurrent = status === currentStatus
              
              return (
                <SelectItem 
                  key={status} 
                  value={status}
                  disabled={isCurrent}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span className="text-sm">{config.label}</span>
                    {isCurrent && (
                      <span className="text-xs text-gray-500 ml-1">(Actual)</span>
                    )}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Dialog de confirmación */}
      {pendingStatus && (
        <ConversationStatusChangeDialog
          isOpen={showConfirmDialog}
          onClose={handleCancelChange}
          onConfirm={handleConfirmChange}
          currentStatus={currentStatus}
          newStatus={pendingStatus}
          isChanging={isChanging}
        />
      )}
    </>
  )
}

