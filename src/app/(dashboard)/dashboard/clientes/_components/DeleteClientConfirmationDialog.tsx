"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  Trash2,
  Users,
  Bot,
  MessageSquare,
  Building2,
  Database,
  Settings,
  FileText,
  Bell,
  Shield,
  Play,
  Layout,
  Calendar,
  Mail,
  Loader2
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface DeleteClientConfirmationDialogProps {
  clientId: string
  clientName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteClientConfirmationDialog({ 
  clientId, 
  clientName, 
  isOpen, 
  onClose, 
  onSuccess 
}: DeleteClientConfirmationDialogProps) {
  const [showProgress, setShowProgress] = useState(false)
  const { toast } = useToast()

  // Query para obtener información detallada del cliente
  const { 
    data: clientInfo, 
    isLoading: isLoadingInfo,
    error: infoError 
  } = api.superadmin.getClientDeletionInfo.useQuery(
    { clientId },
    { 
      enabled: isOpen && !!clientId,
      retry: 2 
    }
  )

  // Mutation para eliminar el cliente
  const deleteClientMutation = api.superadmin.deleteClientCompletely.useMutation({
    onSuccess: (data) => {
      toast({
        title: data.message,
        description: `Se eliminaron ${data.totalDeletedRecords} registros en total`,
        variant: "success"
      })
      setShowProgress(false)
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar cliente",
        description: error.message,
        variant: "destructive"
      })
      setShowProgress(false)
    }
  })

  const handleConfirmDelete = async () => {
    if (!clientInfo?.canDelete) {
      toast({
        title: "No se puede eliminar",
        description: "El cliente no cumple con las condiciones para ser eliminado",
        variant: "destructive"
      })
      return
    }

    setShowProgress(true)
    try {
      await deleteClientMutation.mutateAsync({ 
        clientId,
        confirmDeletion: true,
        backupBeforeDelete: false
      })
    } catch {
      // Error ya manejado en onError
    }
  }


  const getDataIcon = (type: string) => {
    switch (type) {
      case 'users': return <Users className="w-4 h-4" />
      case 'contacts': return <Building2 className="w-4 h-4" />
      case 'agentes': return <Bot className="w-4 h-4" />
      case 'conversations': return <MessageSquare className="w-4 h-4" />
      case 'integrations': return <Settings className="w-4 h-4" />
      case 'pipelines': return <Database className="w-4 h-4" />
      case 'opportunities': return <FileText className="w-4 h-4" />
      case 'auditLogs': return <FileText className="w-4 h-4" />
      case 'notifications': return <Bell className="w-4 h-4" />
      case 'roles': return <Shield className="w-4 h-4" />
      case 'playgroundSessions': return <Play className="w-4 h-4" />
      case 'agentTemplates': return <Layout className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const getDataLabel = (type: string) => {
    switch (type) {
      case 'users': return 'Usuarios'
      case 'contacts': return 'Contactos'
      case 'agentes': return 'Agentes'
      case 'conversations': return 'Conversaciones'
      case 'integrations': return 'Integraciones'
      case 'pipelines': return 'Pipelines'
      case 'opportunities': return 'Oportunidades'
      case 'auditLogs': return 'Registros de Auditoría'
      case 'notifications': return 'Notificaciones'
      case 'roles': return 'Roles'
      case 'playgroundSessions': return 'Sesiones de Playground'
      case 'agentTemplates': return 'Templates de Agentes'
      default: return type
    }
  }

  const getDataDescription = (type: string) => {
    switch (type) {
      case 'users': return 'Todos los usuarios asociados al cliente'
      case 'contacts': return 'Base de datos de contactos y leads'
      case 'agentes': return 'Agentes de IA configurados'
      case 'conversations': return 'Historial completo de conversaciones'
      case 'integrations': return 'Configuraciones de integraciones (WhatsApp, etc.)'
      case 'pipelines': return 'Pipelines de ventas y procesos'
      case 'opportunities': return 'Oportunidades de negocio registradas'
      case 'auditLogs': return 'Registros de auditoría y actividad'
      case 'notifications': return 'Notificaciones y alertas'
      case 'roles': return 'Roles y permisos personalizados'
      case 'playgroundSessions': return 'Sesiones de prueba de agentes'
      case 'agentTemplates': return 'Templates de configuración de agentes'
      default: return 'Datos relacionados'
    }
  }

  if (infoError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Error
            </DialogTitle>
            <DialogDescription>
              No se pudo cargar la información del cliente
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {infoError.message}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isOpen && !showProgress} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="w-5 h-5 mr-2" />
              Confirmar Eliminación de Cliente
            </DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente el cliente y todos sus datos relacionados. 
              Esta operación no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {isLoadingInfo ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : clientInfo ? (
            <div className="space-y-6">
              {/* Información detallada del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{clientInfo.client.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Creado: {new Date(clientInfo.client.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {clientInfo.client.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{clientInfo.client.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {clientInfo.client.status && (
                      <Badge variant="outline">
                        {clientInfo.client.status.name}
                      </Badge>
                    )}
                    {clientInfo.client.plan && (
                      <Badge variant="outline">
                        {clientInfo.client.plan.name}
                      </Badge>
                    )}
                  </div>

                  {clientInfo.client.description && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {clientInfo.client.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Mostrar errores si existen */}
              {clientInfo.errors && clientInfo.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>No se puede eliminar este cliente:</strong>
                      <ul className="list-disc list-inside space-y-1">
                        {clientInfo.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Mostrar warnings si existen */}
              {clientInfo.warnings && clientInfo.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>Advertencias:</strong>
                      <ul className="list-disc list-inside space-y-1">
                        {clientInfo.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Advertencia crítica */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>¡ADVERTENCIA CRÍTICA!</strong> Esta acción eliminará permanentemente 
                  todos los datos del cliente. Esta operación es irreversible y no se puede deshacer.
                </AlertDescription>
              </Alert>

              {/* Resumen de datos a eliminar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">
                    Datos que se eliminarán ({clientInfo.totalRecords} registros en total)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(clientInfo.dataCounts).map(([type, count]) => (
                      <div key={type} className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex-shrink-0">
                          {getDataIcon(type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {getDataLabel(type)}
                            </h4>
                            <Badge variant="destructive" className="font-bold">
                              {count}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {getDataDescription(type)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resumen total */}
              <div className="bg-red-100 border border-red-300 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Resumen de Eliminación
                  </h3>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {clientInfo.totalRecords}
                      </div>
                      <div className="text-sm text-red-700">Registros totales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {Object.keys(clientInfo.dataCounts).length + 1}
                      </div>
                      <div className="text-sm text-red-700">Categorías</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={!clientInfo}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Confirmar Eliminación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showProgress && (
        <Dialog open={showProgress} onOpenChange={() => setShowProgress(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Eliminando Cliente
              </DialogTitle>
              <DialogDescription>
                Eliminando {clientName} y todos sus datos relacionados...
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Procesando eliminación...</span>
              </div>
              {deleteClientMutation.isPending && (
                <div className="text-sm text-gray-600">
                  Por favor espera mientras se eliminan todos los datos relacionados.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
