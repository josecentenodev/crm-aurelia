"use client"

import { useState } from "react"
import { Plus, AlertCircle } from "lucide-react"
import { CreateInstanceForm } from "./create-instance-form"
import { InstancesSection } from "./instances-section"
import { QrPanel } from "./qr-panel"
import type { UIInstance } from "../types"

interface Props {
  clientId: string
  isVisible: boolean
  instances: UIInstance[]
  isDeleting: boolean
  onCreate: (name: string) => Promise<UIInstance | void>
  onDelete: (name: string) => Promise<void> | void
  onShowQR: (instance: UIInstance) => void
  setNewInstanceName: (name: string) => void
}

export function ClientInstancesPanel({ clientId, isVisible, instances, isDeleting, onCreate, onDelete, onShowQR, setNewInstanceName }: Props) {
  const [showingQrFor, setShowingQrFor] = useState<{ instanceName: string; qrCode?: string } | null>(null)

  const handleCreate = async (name: string) => {
    const newInstance = await onCreate(name)
    if (newInstance) {
      // Mostrar QR panel inmediatamente
      setShowingQrFor({ 
        instanceName: newInstance.instanceName, 
        qrCode: newInstance.qrCode || undefined 
      })
    }
  }

  const handleCloseQr = () => {
    setShowingQrFor(null)
  }

  const handleConnected = () => {
    // Auto-cerrar cuando se conecte
    setTimeout(() => setShowingQrFor(null), 2000)
  }

  if (!isVisible) return null
  
  return (
    <div className="pt-4 border-t border-gray-100 space-y-4">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Plus className="w-4 h-4 mr-2 text-blue-600" />
          Crear Nueva Instancia
        </h4>
        <CreateInstanceForm onCreate={handleCreate} isLoading={false} />
        <p className="text-xs text-blue-600 mt-2">
          Se creará una nueva instancia de WhatsApp con código QR para conectar
        </p>
      </div>

      {/* QR Panel inline cuando se crea una instancia */}
      {showingQrFor && (
        <QrPanel
          clientId={clientId}
          instanceName={showingQrFor.instanceName}
          initialQrCode={showingQrFor.qrCode}
          onClose={handleCloseQr}
          onConnected={handleConnected}
        />
      )}

      <InstancesSection
        instances={instances}
        onShowQR={onShowQR}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 text-blue-800">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Información</span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Cada instancia de WhatsApp requiere escanear un código QR para conectarse.
          Las instancias se mantienen activas hasta que se desconecten manualmente.
        </p>
      </div>
    </div>
  )
}


