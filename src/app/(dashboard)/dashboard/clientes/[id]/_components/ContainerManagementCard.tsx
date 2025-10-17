"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Server, 
  Play, 
  Square, 
  RotateCcw, 
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  MessageSquare,
  Copy,
  Download,
  QrCode,
  ExternalLink
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface ContainerManagementCardProps {
  clientId: string
}

export function ContainerManagementCard({ clientId }: ContainerManagementCardProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<any>(null)
  const [newInstanceName, setNewInstanceName] = useState("")
  const { toast } = useToast()

  // Cargar configuración global
  const { data: integrations } = api.globalIntegrations.list.useQuery()
  const evolutionIntegration = integrations?.find(i => i.type === "EVOLUTION_API")

  // Cargar contenedor del cliente
  const { data: containerData, isLoading: containerLoading, error: containerError, refetch: refetchContainer } = api.evolutionApi.listClientContainers.useQuery(
    {
      clientId,
      backendUrl: evolutionIntegration?.backendUrl || "",
      apiKey: evolutionIntegration?.apiKey || ""
    },
    {
      enabled: !!clientId && !!evolutionIntegration?.backendUrl && !!evolutionIntegration?.apiKey
    }
  )

  // Cargar instancias del cliente
  const { data: instancesData, isLoading: instancesLoading, error: instancesError, refetch: refetchInstances } = api.evolutionApi.getClientInstances.useQuery(
    {
      clientId,
      backendUrl: evolutionIntegration?.backendUrl || "",
      apiKey: evolutionIntegration?.apiKey || ""
    },
    {
      enabled: !!clientId && !!evolutionIntegration?.backendUrl && !!evolutionIntegration?.apiKey
    }
  )

  // Extraer datos del contenedor e instancias
  const container = containerData?.[0] || null
  const instances = instancesData || []

  // Manejar errores
  if (containerError || instancesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Gestión de Infraestructura WhatsApp API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-500 text-center mb-4">
              {containerError?.message || instancesError?.message || "Error desconocido al cargar los datos de infraestructura."}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                refetchContainer()
                refetchInstances()
              }}
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const createContainerMutation = api.evolutionApi.createContainer.useMutation({
    onSuccess: () => {
      toast({ 
        title: "Contenedor creado", 
        description: "El contenedor de WhatsApp API se ha creado exitosamente." 
      })
      refetchContainer()
    },
    onError: (error) => {
      toast({ 
        title: "Error al crear contenedor", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  })

  const deleteContainerMutation = api.evolutionApi.deleteClientContainer.useMutation({
    onSuccess: () => {
      toast({ 
        title: "Contenedor eliminado", 
        description: "El contenedor de WhatsApp API se ha eliminado exitosamente." 
      })
      refetchContainer()
      refetchInstances()
    },
    onError: (error) => {
      toast({ 
        title: "Error al eliminar contenedor", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  })

  const checkHealthMutation = api.evolutionApi.checkContainerHealth.useMutation({
    onSuccess: (data) => {
      toast({ 
        title: "Estado de salud verificado", 
        description: data.healthy ? "El contenedor está funcionando correctamente." : "El contenedor presenta problemas." 
      })
      refetchContainer()
    },
    onError: (error) => {
      toast({ 
        title: "Error al verificar salud", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  })

  // Mutaciones para instancias
  const createInstanceMutation = api.evolutionApi.createWhatsAppInstance.useMutation({
    onSuccess: (result) => {
      if (result.webhookConfigured) {
        toast({ 
          title: "Instancia creada", 
          description: "Se creó la instancia y se configuró el webhook automáticamente" 
        })
      } else {
        toast({ 
          title: "Instancia creada", 
          description: `Se creó la instancia. ${result.webhookError ? 'Error configurando webhook: ' + result.webhookError : 'Webhook no configurado'}`,
          variant: result.webhookError ? "destructive" : "default"
        })
      }
      setNewInstanceName("")
      refetchInstances()
    },
    onError: (error) => {
      toast({ 
        title: "Error al crear instancia", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  })

  const deleteInstanceMutation = api.evolutionApi.deleteWhatsAppInstance.useMutation({
    onSuccess: () => {
      toast({ 
        title: "Instancia eliminada", 
        description: "La instancia de WhatsApp se ha eliminado exitosamente." 
      })
      refetchInstances()
    },
    onError: (error) => {
      toast({ 
        title: "Error al eliminar instancia", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  })

  const getStatusColor = (status?: string, isHealthy?: boolean) => {
    if (status === 'RUNNING' && isHealthy) return 'bg-green-500'
    if (status === 'RUNNING' && !isHealthy) return 'bg-yellow-500'
    if (status === 'STOPPED') return 'bg-gray-500'
    if (status === 'ERROR') return 'bg-red-500'
    if (status === 'DEPLOYING') return 'bg-blue-500'
    return 'bg-gray-500'
  }

  const getStatusIcon = (status?: string, isHealthy?: boolean) => {
    if (status === 'RUNNING' && isHealthy) return <CheckCircle className="w-4 h-4" />
    if (status === 'RUNNING' && !isHealthy) return <AlertCircle className="w-4 h-4" />
    if (status === 'STOPPED') return <Square className="w-4 h-4" />
    if (status === 'ERROR') return <XCircle className="w-4 h-4" />
    if (status === 'DEPLOYING') return <Activity className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  const getInstanceStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-gray-500'
      case 'connecting': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getInstanceStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'disconnected': return <Square className="w-4 h-4" />
      case 'connecting': return <Activity className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleCreateContainer = () => {
    if (!evolutionIntegration) {
      toast({
        title: "Error",
        description: "No se encontró la configuración de WhatsApp API",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    createContainerMutation.mutate({
      clientId,
      backendUrl: evolutionIntegration.backendUrl!,
      apiKey: evolutionIntegration.apiKey!
    }, {
      onSettled: () => setIsCreating(false)
    })
  }

  const handleDeleteContainer = () => {
    if (!evolutionIntegration) return

    setIsDeleting(true)
    deleteContainerMutation.mutate({
      clientId,
      backendUrl: evolutionIntegration.backendUrl!,
      apiKey: evolutionIntegration.apiKey!
    }, {
      onSettled: () => setIsDeleting(false)
    })
  }

  const handleCheckHealth = () => {
    if (!evolutionIntegration) return

    setIsCheckingHealth(true)
    checkHealthMutation.mutate({
      clientId,
      backendUrl: evolutionIntegration.backendUrl!,
      apiKey: evolutionIntegration.apiKey!
    }, {
      onSettled: () => setIsCheckingHealth(false)
    })
  }

  const handleCreateInstance = async () => {
    if (!evolutionIntegration || !newInstanceName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la instancia",
        variant: "destructive"
      })
      return
    }

    createInstanceMutation.mutate({
      clientId,
      instanceName: newInstanceName.trim(),
      backendUrl: evolutionIntegration.backendUrl!,
      apiKey: evolutionIntegration.apiKey!
    })
  }

  const handleDeleteInstance = (instanceName: string) => {
    if (!evolutionIntegration) return

    deleteInstanceMutation.mutate({
      clientId,
      instanceName,
      backendUrl: evolutionIntegration.backendUrl!,
      apiKey: evolutionIntegration.apiKey!
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles"
    })
  }

  if (containerLoading || instancesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Gestión de Infraestructura WhatsApp API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Activity className="w-8 h-8 animate-spin mr-2" />
            <span>Cargando datos de infraestructura...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="w-5 h-5 mr-2" />
          Gestión de Infraestructura WhatsApp API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado del Contenedor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Estado del Contenedor</h3>
            {container && (
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(container.status, container.isHealthy)}>
                  {getStatusIcon(container.status, container.isHealthy)}
                  {container.status === 'RUNNING' ? 'Ejecutándose' : 
                   container.status === 'STOPPED' ? 'Detenido' : 
                   container.status === 'ERROR' ? 'Error' : 
                   container.status === 'DEPLOYING' ? 'Desplegando' : 
                   container.status}
                </Badge>
              </div>
            )}
          </div>

          {!container ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                No hay un contenedor de WhatsApp API configurado para este cliente.
              </p>
              <Button 
                onClick={handleCreateContainer} 
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Crear Contenedor
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Información del Contenedor</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{container.containerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Puerto:</span>
                    <span className="font-medium">{container.hostPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">URL de Gestión:</span>
                    <a 
                      href={container.managerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Abrir
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Acciones</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCheckHealth}
                    disabled={isCheckingHealth}
                    className="w-full"
                  >
                    {isCheckingHealth ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Verificar Salud
                  </Button>
                  <ConfirmDialog
                    title="Eliminar Contenedor"
                    description="¿Estás seguro de que quieres eliminar este contenedor? Esta acción no se puede deshacer."
                    onConfirm={handleDeleteContainer}
                  >
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={isDeleting}
                      className="w-full"
                    >
                      {isDeleting ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Eliminar Contenedor
                    </Button>
                  </ConfirmDialog>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gestión de Instancias */}
        {container && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Gestión de Instancias WhatsApp</h3>
              <Button 
                onClick={() => setNewInstanceName("")}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Instancia
              </Button>
            </div>

            {/* Crear Nueva Instancia */}
            {newInstanceName !== null && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Crear Nueva Instancia</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre de la instancia (ej: ventas_principal)"
                    value={newInstanceName}
                    onChange={(e) => setNewInstanceName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleCreateInstance}
                    disabled={!newInstanceName.trim() || createInstanceMutation.isPending}
                    size="sm"
                  >
                    {createInstanceMutation.isPending ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Crear
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setNewInstanceName("")}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Instancias */}
            <div className="space-y-2">
              {instances.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <MessageSquare className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay instancias</h3>
                  <p className="text-gray-600 mb-4">
                    Crea tu primera instancia de WhatsApp para comenzar a enviar mensajes.
                  </p>
                  <Button 
                    onClick={() => setNewInstanceName("")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Instancia
                  </Button>
                </div>
              ) : (
                instances.map((instance) => (
                  <div key={instance.instanceName} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">{instance.instanceName}</h4>
                          <p className="text-sm text-gray-500">Instancia de WhatsApp</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getInstanceStatusColor(instance.status)}>
                          {getInstanceStatusIcon(instance.status)}
                          {instance.status === 'connected' ? 'Conectado' : 
                           instance.status === 'disconnected' ? 'Desconectado' : 
                           instance.status === 'connecting' ? 'Conectando' : 
                           instance.status}
                        </Badge>
                        <ConfirmDialog
                          title="Eliminar Instancia"
                          description="¿Estás seguro de que quieres eliminar esta instancia? Esta acción no se puede deshacer."
                          onConfirm={() => handleDeleteInstance(instance.instanceName)}
                        >
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={deleteInstanceMutation.isPending}
                          >
                            {deleteInstanceMutation.isPending ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Eliminar
                          </Button>
                        </ConfirmDialog>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 