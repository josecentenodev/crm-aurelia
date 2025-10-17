"use client"

import { memo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2 } from "lucide-react"

interface ClientSelectProps {
  clients: Array<{ id: string; name: string; status: { name: string } }>
  selectedClientId: string | null
  isLocalSwitching: boolean
  onClientChange: (clientId: string) => void
}

function ClientSelectComponent({ 
  clients, 
  selectedClientId, 
  isLocalSwitching, 
  onClientChange 
}: ClientSelectProps) {
  return (
    <div className="flex items-center space-x-2 px-3 py-2">
      <Building2 className="h-4 w-4 text-aurelia-primary" />
      <Select
        value={selectedClientId ?? ""}
        onValueChange={onClientChange}
        disabled={isLocalSwitching}
      >
        <SelectTrigger className="w-48 h-8 text-sm">
          <SelectValue placeholder="Seleccionar cliente" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              <div className="flex items-center space-x-2">
                <span>{client.name}</span>
                <span className="text-xs text-gray-500">({client.status.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLocalSwitching && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-aurelia-primary border-t-transparent" />
      )}
    </div>
  )
}

export const ClientSelect = memo(ClientSelectComponent)
