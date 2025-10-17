"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Phone, 
  MessageSquare,
  Info,
  Lock
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface IntegrationConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  integration: any
  action: "activate" | "deactivate"
  clientId: string
  onSuccess: () => void
}

export function IntegrationConfirmDialog({
  isOpen,
  onClose,
  integration,
  action,
  clientId,
  onSuccess
}: IntegrationConfirmDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Query para obtener instancias activas
  const { data: instancesData } = api.instances.listByClient.useQuery({
    clientId,
    integrationId: integration?.clientIntegration?.id,
    status: "CONNECTED"
  }, {
    enabled: isOpen && action === "deactivate"
  })

  // Query para obtener conversaciones activas
  const { data: conversationsData } = api.conversaciones.list.useQuery({
    clientId,
    filters: {
      status: "ACTIVA"
    }
  }, {
    enabled: isOpen && action === "deactivate"
  })

  // Mutation para activar integración
  const activateMutation = api.integraciones.activate.useMutation({
    onSuccess: () => {
      toast({
        title: "Integración activada",
        description: "La integración ha sido activada correctamente",
      })
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Mutation para desactivar integración
  const deactivateMutation = api.integraciones.deactivate.useMutation({
    onSuccess: () => {
      toast({
        title: "Integración desactivada",
        description: "La integración ha sido desactivada correctamente",
      })
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const activeInstances = instancesData?.instances || []
  const activeConversations = conversationsData?.filter(
    conv => activeInstances.some(instance => instance.id === conv.instanceId)
  ) || []

  const canDeactivate = activeInstances.length === 0 && activeConversations.length === 0

  const handleConfirm = async () => {
    if (!clientId) return

    setIsLoading(true)
    try {
      if (action === "activate") {
        await activateMutation.mutateAsync({
          clientId,
          type: integration.type
        })
      } else {
        await deactivateMutation.mutateAsync({
          clientId,
          type: integration.type
        })
      }
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsLoading(false)
    }
  }

  const getActionTitle = () => {
    return action === "activate" ? "Activar Integración" : "Desactivar Integración"
  }

  const getActionDescription = () => {
    if (action === "activate") {
      return `¿Estás seguro de que quieres activar ${integration.name}? Esta acción habilitará la integración para tu cuenta.`
    } else {
      return `¿Estás seguro de que quieres desactivar ${integration.name}? Esta acción deshabilitará la integración.`
    }
  }

  const getActionButtonText = () => {
    return action === "activate" ? "Activar" : "Desactivar"
  }

  const getActionButtonVariant = () => {
    return action === "activate" ? "default" : "destructive"
  }

  const getActionIcon = () => {
    return action === "activate" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getActionIcon()}
            <span>{getActionTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            {getActionDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la integración */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">{integration.name}</h4>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </div>
            </div>
          </div>

          {/* Alertas de validación para desactivación */}
          {action === "deactivate" && (
            <>
              {activeInstances.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>
                        <strong>{activeInstances.length}</strong> instancia{activeInstances.length !== 1 ? 's' : ''} activa{activeInstances.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      No se puede desactivar una integración con instancias activas. 
                      Desconecta todas las instancias antes de desactivar.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {activeConversations.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        <strong>{activeConversations.length}</strong> conversación{activeConversations.length !== 1 ? 'es' : ''} activa{activeConversations.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      Hay conversaciones activas en las instancias de esta integración. 
                      Finaliza las conversaciones antes de desactivar.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {canDeactivate && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No hay instancias activas ni conversaciones pendientes. 
                    Puedes desactivar la integración de forma segura.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Información de límites para activación */}
          {action === "activate" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Al activar esta integración podrás:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Crear hasta {integration.clientPermission?.maxInstances || 5} instancias</li>
                    <li>• Conectar números de WhatsApp</li>
                    <li>• Gestionar conversaciones</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    Costo: ${integration.clientPermission?.costPerInstance || 10} por instancia/mes
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={getActionButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading || (action === "deactivate" && !canDeactivate)}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              getActionIcon()
            )}
            <span>{getActionButtonText()}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}