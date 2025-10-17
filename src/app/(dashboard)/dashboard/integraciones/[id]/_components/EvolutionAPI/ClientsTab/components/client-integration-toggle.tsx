"use client"

import { Loader2 } from "lucide-react"
import { IntegrationSwitch } from "./integration-switch"

interface Props {
  isActive: boolean
  isLoading: boolean
  onToggle: (enable: boolean) => void
}

export function ClientIntegrationToggle({ isActive, isLoading, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <span className="text-sm font-medium text-gray-700">Habilitar WhatsApp API:</span>
      <div className="flex items-center space-x-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <IntegrationSwitch isActive={isActive} onToggle={onToggle} disabled={isLoading} />
        )}
      </div>
    </div>
  )
}


