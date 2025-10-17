"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  QrCode, 
  Wifi, 
  WifiOff, 
  Settings, 
  Trash2, 
  MessageSquare,
  Phone,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import { cn } from "@/lib/utils/client-utils"
import { CreateInstanceDialog } from "./CreateInstanceDialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { QRCodeModal } from "./QRCodeModal"
import { ErrorAlert, useErrorHandler } from "@/components/ui/error-alert"

interface InstancesListProps {
  integrationId?: string
  maxInstances?: number
  currentInstances?: number
}

export function InstancesList({ 
  integrationId, 
  maxInstances = 999, 
  currentInstances = 0 
}: InstancesListProps) {
  const { clientId } = useClientContext()
  const { toast } = useToast()
  const { errors, handleError, clearErrors, removeError } = useErrorHandler()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [expandedInstance, setExpandedInstance] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Query para obtener instancias
  const { data: instancesData, refetch } = api.instances.listByClient.useQuery({
    clientId: clientId!,
    integrationId
  }, {
    enabled: !!clientId
  })

  // Query para obtener integraciones (para mostrar información adicional)
  const { data: integrationsData } = api.integraciones.getClientIntegrations.useQuery({
    clientId: clientId!
  }, {
    enabled: !!clientId
  })

  // Mutations
  const connectMutation = api.instances.connect.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia conectada",
        description: "Se ha generado el código QR para conectar la instancia",
      })
      refetch()
    },
    onError: (error) => {
      handleError(error)
    }
  })

  const disconnectMutation = api.instances.disconnect.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia desconectada",
        description: "La instancia ha sido desconectada correctamente",
      })
      refetch()
    },
    onError: (error) => {
      handleError(error)
    }
  })

  const deleteMutation = api.instances.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia eliminada",
        description: "La instancia ha sido eliminada correctamente",
      })
      refetch()
    },
    onError: (error) => {
      handleError(error)
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return <Wifi className="w-4 h-4 text-green-500" />
      case "CONNECTING":
        return <QrCode className="w-4 h-4 text-yellow-500" />
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "MAINTENANCE":
        return <Settings className="w-4 h-4 text-blue-500" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "bg-green-100 text-green-800"
      case "CONNECTING":
        return "bg-yellow-100 text-yellow-800"
      case "ERROR":
        return "bg-red-100 text-red-800"
      case "MAINTENANCE":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "Conectada"
      case "CONNECTING":
        return "Conectando"
      case "ERROR":
        return "Error"
      case "MAINTENANCE":
        return "Mantenimiento"
      default:
        return "Desconectada"
    }
  }

  const getIntegrationName = (integrationId: string) => {
    const integration = integrationsData?.integrations.find(i => i.id === integrationId)
    return integration?.name || "Integración"
  }

  const getIntegrationType = (integrationId: string) => {
    const integration = integrationsData?.integrations.find(i => i.id === integrationId)
    return integration?.type || "UNKNOWN"
  }

  const handleConnect = async (instanceId: string) => {
    await connectMutation.mutateAsync(instanceId)
  }

  const handleDisconnect = async (instanceId: string) => {
    await disconnectMutation.mutateAsync(instanceId)
  }

  const handleDelete = async (instanceId: string) => {
    setShowDeleteConfirm(instanceId)
  }

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteMutation.mutateAsync(showDeleteConfirm)
      setShowDeleteConfirm(null)
    }
  }

  const handleShowQR = (instanceId: string) => {
    setShowQRModal(instanceId)
  }

  const instances = instancesData?.instances || []
  const canCreateMore = currentInstances < maxInstances
  const remainingInstances = maxInstances - currentInstances

  return (
    <div className="space-y-6">
      {/* Header con información de límites */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {integrationId ? "Instancias de esta Integración" : "Todas las Instancias"}
          </h3>
          <p className="text-gray-600">
            {integrationId 
              ? "Gestiona las instancias de esta integración específica"
              : "Gestiona todas las instancias de todas las integraciones"
            }
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
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!canCreateMore}
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Instancia
          </Button>
        </div>
      </div>

      {/* Alerta si no se pueden crear más instancias */}
      {!canCreateMore && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Límite alcanzado
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Has alcanzado el límite máximo de {maxInstances} instancias para esta integración. 
            Elimina una instancia existente o actualiza tu plan para crear más.
          </p>
        </div>
      )}

      {/* Lista de instancias */}
      {instances.length === 0 ? (
        <Card className="rounded-2xl border border-gray-200">
          <CardContent className="text-center py-12">
            <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay instancias configuradas
            </h3>
            <p className="text-gray-600 mb-4">
              {integrationId 
                ? "Crea tu primera instancia para esta integración."
                : "Crea tu primera instancia para comenzar a recibir mensajes."
              }
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={!canCreateMore}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Instancia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {instances.map((instance) => {
            const isExpanded = expandedInstance === instance.id
            const integrationName = getIntegrationName(instance.integrationId)
            const integrationType = getIntegrationType(instance.integrationId)

            return (
              <Card key={instance.id} className="rounded-2xl border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {instance.instanceName}
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {integrationName}
                            </span>
                            {instance.phoneNumber && (
                              <span className="flex items-center space-x-1 text-xs">
                                <Phone className="w-3 h-3" />
                                <span>{instance.phoneNumber}</span>
                              </span>
                            )}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("border-0 text-xs flex items-center gap-1", getStatusColor(instance.status))}>
                        {getStatusIcon(instance.status)}
                        {getStatusText(instance.status)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedInstance(isExpanded ? null : instance.id)}
                        className="rounded-xl"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>0 conversaciones</span>
                      </div>
                      {instance.lastConnected && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Última conexión: {new Date(instance.lastConnected).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {instance.status === "DISCONNECTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowQR(instance.id)}
                          className="rounded-xl"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Conectar
                        </Button>
                      )}
                      {instance.status === "CONNECTING" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowQR(instance.id)}
                            className="rounded-xl"
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Ver QR
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(instance.id)}
                            disabled={disconnectMutation.isLoading}
                            className="rounded-xl"
                          >
                            <WifiOff className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      {instance.status === "CONNECTED" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowQR(instance.id)}
                            className="rounded-xl"
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Ver QR
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(instance.id)}
                            disabled={disconnectMutation.isLoading}
                            className="rounded-xl"
                          >
                            <WifiOff className="w-4 h-4 mr-2" />
                            Desconectar
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(instance.id)}
                        disabled={deleteMutation.isLoading}
                        className="rounded-xl text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Sección expandible con detalles */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Integración:</span>
                          <p className="text-gray-600">{integrationName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Tipo:</span>
                          <p className="text-gray-600">{integrationType}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Estado:</span>
                          <p className="text-gray-600">{getStatusText(instance.status)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Creada:</span>
                          <p className="text-gray-600">{new Date(instance.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {instance.config && Object.keys(instance.config).length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Configuración:</span>
                          <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                            {JSON.stringify(instance.config, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog para crear nueva instancia */}
      <CreateInstanceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        integrationId={integrationId}
        maxInstances={maxInstances}
        currentInstances={currentInstances}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          refetch()
        }}
      />

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        title="Eliminar Instancia"
        description="¿Estás seguro de que quieres eliminar esta instancia? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* Modal para mostrar QR */}
      {showQRModal && (
        <QRCodeModal
          instanceId={showQRModal}
          isOpen={!!showQRModal}
          onClose={() => setShowQRModal(null)}
          onSuccess={() => {
            setShowQRModal(null)
            void refetch()
          }}
        />
      )}

      {/* Mostrar errores */}
      {errors.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Errores</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearErrors}
              className="text-xs"
            >
              Limpiar todos
            </Button>
          </div>
          {errors.map((error, index) => (
            <ErrorAlert
              key={`${error.code}-${index}`}
              error={error}
              onDismiss={() => removeError(error)}
              showTechnicalDetails={false}
            />
          ))}
        </div>
      )}
    </div>
  )
} 