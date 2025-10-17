"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface InstanceHeaderProps {
  currentInstances: number
  maxInstances: number
  remainingInstances: number
  canCreateMore: boolean
  onCreateNew: () => void
}

export function InstanceHeader({
  currentInstances,
  maxInstances,
  remainingInstances,
  canCreateMore,
  onCreateNew
}: InstanceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Instancias WhatsApp
        </h3>
        <p className="text-gray-600">
          Gestiona las instancias de WhatsApp para esta integración
        </p>
      </div>
      <div className="flex items-center space-x-3">
        {/* Información de límites */}
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {currentInstances} de {maxInstances} instancias
          </div>
          <div className="text-xs text-gray-500">
            {remainingInstances} disponibles
          </div>
        </div>
        
        {/* Botón de crear nueva instancia */}
        <Button
          onClick={onCreateNew}
          disabled={!canCreateMore}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Instancia
        </Button>
      </div>
    </div>
  )
}
