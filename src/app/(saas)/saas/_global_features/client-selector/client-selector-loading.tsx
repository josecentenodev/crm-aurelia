"use client"

import { memo } from "react"
import { Building2 } from "lucide-react"

interface ClientSelectorLoadingProps {
  message: string
}

function ClientSelectorLoadingComponent({ message }: ClientSelectorLoadingProps) {
  return (
    <div className="flex items-center space-x-2 px-3 py-2">
      <Building2 className="h-4 w-4 animate-pulse" />
      <span className="text-sm text-gray-500">{message}</span>
    </div>
  )
}

export const ClientSelectorLoading = memo(ClientSelectorLoadingComponent)
