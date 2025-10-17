"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"

interface CreateInstanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationId?: string
  maxInstances?: number
  currentInstances?: number
  onSuccess: () => void
}

export function CreateInstanceDialog({ 
  open, 
  onOpenChange, 
  integrationId, 
  maxInstances = 999,
  currentInstances = 0,
  onSuccess 
}: CreateInstanceDialogProps) {
  const { clientId } = useClientContext()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    instanceName: "",
    phoneNumber: "",
    description: ""
  })

  // Query para obtener integraciones del cliente
  const { data: integrationsData } = api.integraciones.getClientIntegrations.useQuery({
    clientId: clientId!,
    type: "EVOLUTION_API",
    isActive: true
  }, {
    enabled: !!clientId && open
  })

  // Mutation para crear instancia
  const createInstanceMutation = api.instances.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia creada",
        description: "La instancia ha sido creada correctamente",
      })
      onSuccess()
      // Reset form
      setFormData({
        instanceName: "",
        phoneNumber: "",
        description: ""
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clientId) return

    // Verificar límites
    if (currentInstances >= maxInstances) {
      toast({
        title: "Error",
        description: `Has alcanzado el límite máximo de ${maxInstances} instancias para esta integración.`,
        variant: "destructive"
      })
      return
    }

    // Determinar qué integración usar
    const targetIntegrationId = integrationId || integrationsData?.integrations[0]?.id
    
    if (!targetIntegrationId) {
      toast({
        title: "Error",
        description: "No hay integraciones Whatsapp activas disponibles",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await createInstanceMutation.mutateAsync({
        clientId,
        integrationId: targetIntegrationId,
        instanceName: formData.instanceName,
        phoneNumber: formData.phoneNumber || undefined,
        config: {
          description: formData.description || undefined
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      // Reset form
      setFormData({
        instanceName: "",
        phoneNumber: "",
        description: ""
      })
    }
  }

  const integrations = integrationsData?.integrations || []
  const hasActiveIntegration = integrations.length > 0
  const canCreateMore = currentInstances < maxInstances
  const remainingInstances = maxInstances - currentInstances

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Instancia</DialogTitle>
          <DialogDescription>
            Configura una nueva instancia para recibir mensajes.
          </DialogDescription>
        </DialogHeader>

        {/* Información de límites */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {currentInstances} de {maxInstances}
              </Badge>
              <span className="text-sm text-blue-700">
                instancias utilizadas
              </span>
            </div>
            <div className="text-sm text-blue-600">
              {remainingInstances} disponibles
            </div>
          </div>
        </div>

        {/* Alerta si no se pueden crear más instancias */}
        {!canCreateMore && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Límite alcanzado
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Has alcanzado el límite máximo de {maxInstances} instancias para esta integración.
            </p>
          </div>
        )}

        {!hasActiveIntegration ? (
          <div className="text-center py-6">
            <div className="text-yellow-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Integración requerida
            </h3>
            <p className="text-gray-600 mb-4">
              Necesitas configurar una integración Whatsapp antes de crear instancias.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Entendido
            </Button>
          </div>
        ) : !canCreateMore ? (
          <div className="text-center py-6">
            <div className="text-yellow-600 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Límite alcanzado
            </h3>
            <p className="text-gray-600 mb-4">
              Has alcanzado el límite máximo de {maxInstances} instancias para esta integración.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instanceName">Nombre de la Instancia *</Label>
              <Input
                id="instanceName"
                value={formData.instanceName}
                onChange={(e) => setFormData({ ...formData, instanceName: e.target.value })}
                placeholder="ej: ventas-whatsapp"
                className="rounded-xl"
                required
              />
              <p className="text-xs text-gray-500">
                Nombre único para identificar esta instancia
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Número de Teléfono (Opcional)</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+1234567890"
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">
                Número de teléfono asociado a esta instancia
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la instancia..."
                className="rounded-xl"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Información adicional sobre esta instancia
              </p>
            </div>

            {integrations.length > 1 && !integrationId && (
              <div className="space-y-2">
                <Label>Integración Whatsapp</Label>
                <div className="text-sm text-gray-600">
                  Se usará la primera integración activa disponible
                </div>
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading || !formData.instanceName || !canCreateMore}
                className="flex-1 rounded-xl"
              >
                {isLoading ? "Creando..." : "Crear Instancia"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-xl"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 