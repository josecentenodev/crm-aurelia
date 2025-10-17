// Renombrado de InstancesManagementTab.tsx para mejor organización sin tabs
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClientsIntegrations } from "../../../../_components/EvolutionAPI/ClientsTab/hooks/use-clients-integrations"
import { useInstanceActions } from "../../../../_components/EvolutionAPI/ClientsTab/hooks/use-instance-actions"
import { AutoQrDisplay } from "../AutoQrDisplay"
import { InstanceRow } from "../../../../_components/EvolutionAPI/ClientsTab/components/instance-row"
import type { UIGlobalIntegration, UIClientLite } from "@/lib/mappers/integrations"

interface Props {
  client: UIClientLite
  integration: UIGlobalIntegration
}

export function InstancesManagementSection({ client, integration }: Props) {
  const { toast } = useToast()
  const [instanceName, setInstanceName] = useState("")
  const [showingQrFor, setShowingQrFor] = useState<{ instanceName: string; qrCode?: string } | null>(null)

  // Query integraciones
  const { refetch, getClientInstances } = useClientsIntegrations({
    integrationType: "EVOLUTION_API",
    enabled: true,
    staleTime: 30_000
  })

  // Acciones de instancias
  const { create, remove, deleteInstance } = useInstanceActions(async () => { await refetch() })

  const instances = getClientInstances(client.id)

  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la instancia es requerido",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await create(client.id, instanceName.trim())
      if (result) {
        // Mostrar QR automático inmediatamente
        setShowingQrFor({
          instanceName: result.instanceName,
          qrCode: result.qrCode ?? undefined
        })
        setInstanceName("")
      }
    } catch (error) {
      console.error("Error creating instance:", error)
    }
  }

  const handleDeleteInstance = async (instanceName: string) => {
    try {
      await remove(client.id, instanceName)
    } catch (error) {
      console.error("Error deleting instance:", error)
    }
  }

  const handleCloseQr = () => {
    setShowingQrFor(null)
  }

  const handleConnected = () => {
    // Auto-cerrar cuando se conecte
    setTimeout(() => setShowingQrFor(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Crear nueva instancia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <span>Crear Nueva Instancia</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="instanceName">Nombre de la instancia</Label>
              <Input
                id="instanceName"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="ej: ventas, soporte, marketing"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCreateInstance}
                disabled={!instanceName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {false ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Crear Instancia
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Cada instancia permite conectar un número de WhatsApp diferente
          </p>
        </CardContent>
      </Card>

      {/* Lista de instancias */}
      <Card>
        <CardHeader>
          <CardTitle>Instancias Activas ({instances.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay instancias creadas aún</p>
              <p className="text-sm text-gray-400">Crea tu primera instancia para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instances.map((instance) => (
                <InstanceRow
                  key={instance.id}
                  instance={instance}
                  onDelete={handleDeleteInstance}
                  isDeleting={deleteInstance.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
