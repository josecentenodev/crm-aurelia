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
  Layout
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface DeleteClientDialogProps {
  clientId: string
  clientName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteClientDialog({ 
  clientId, 
  clientName, 
  isOpen, 
  onClose, 
  onSuccess 
}: DeleteClientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
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
      setIsDeleting(false)
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar cliente",
        description: error.message,
        variant: "destructive"
      })
      setIsDeleting(false)
    }
  })

  const handleDelete = async () => {
    if (!clientInfo) return
    
    setIsDeleting(true)
    try {
      await deleteClientMutation.mutateAsync({ 
        clientId,
        confirmDeletion: true,
        backupBeforeDelete: false
      })
    } catch (error) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <Trash2 className="w-5 h-5 mr-2" />
            Eliminar Cliente
          </DialogTitle>
          <DialogDescription>
            Esta acción eliminará permanentemente el cliente y todos sus datos relacionados.
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
            {/* Información del cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{clientInfo.client.name}</h3>
              <div className="flex items-center gap-2 mb-2">
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
                <p className="text-sm text-gray-600">{clientInfo.client.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Creado: {new Date(clientInfo.client.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Advertencia */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>¡ATENCIÓN!</strong> Esta acción es irreversible. Se eliminarán permanentemente:
              </AlertDescription>
            </Alert>

            {/* Datos que se eliminarán */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">
                Datos que se eliminarán ({clientInfo.totalRecords} registros en total):
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(clientInfo.dataCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getDataIcon(type)}
                      <span className="text-sm font-medium text-gray-700">
                        {getDataLabel(type)}
                      </span>
                    </div>
                    <Badge variant="destructive" className="font-bold">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen total */}
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-800">Total de registros a eliminar:</span>
                <Badge variant="destructive" className="text-lg font-bold">
                  {clientInfo.totalRecords}
                </Badge>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting || !clientInfo}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Permanentemente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
