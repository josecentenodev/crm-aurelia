"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Users, Plus } from "lucide-react"

interface ClientSelectorProps {
  clients: any[]
  selectedClientId: string
  onClientChange: (clientId: string) => void
  onCreateRole: () => void
  isLoadingClients?: boolean
}

/**
 * Client Selector Component
 *
 * Allows selecting a client to manage their roles
 * Shows "Create Role" button when a client is selected
 */
export function ClientSelector({
  clients,
  selectedClientId,
  onClientChange,
  onCreateRole,
  isLoadingClients = false
}: ClientSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Seleccionar Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Label htmlFor="client-select">Cliente</Label>
            <Select
              value={selectedClientId}
              onValueChange={onClientChange}
              disabled={isLoadingClients}
            >
              <SelectTrigger id="client-select">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedClientId && (
            <Button onClick={onCreateRole} className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Crear Rol
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
