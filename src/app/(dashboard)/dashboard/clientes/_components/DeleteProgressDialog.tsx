"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database,
  Trash2,
  AlertCircle
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface DeleteProgressDialogProps {
  clientId: string
  clientName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface DeletionStep {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  count?: number
  error?: string
}

export function DeleteProgressDialog({ 
  clientId, 
  clientName, 
  isOpen, 
  onClose, 
  onSuccess 
}: DeleteProgressDialogProps) {
  const [steps, setSteps] = useState<DeletionStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { toast } = useToast()

  // Query para obtener información del cliente
  const { data: clientInfo } = api.superadmin.getClientDeletionInfo.useQuery(
    { clientId },
    { enabled: isOpen && !!clientId }
  )

  // Mutation para eliminar el cliente
  const deleteClientMutation = api.superadmin.deleteClientCompletely.useMutation({
    onSuccess: (data) => {
      // Simular progreso de eliminación
      simulateDeletionProgress(data.deletedData)
    },
    onError: (error) => {
      setHasError(true)
      toast({
        title: "Error al eliminar cliente",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Inicializar pasos cuando se abre el diálogo
  useEffect(() => {
    if (isOpen && clientInfo) {
      initializeSteps(clientInfo.dataCounts)
    }
  }, [isOpen, clientInfo])

  const initializeSteps = (dataCounts: Record<string, number>) => {
    const stepOrder = [
      'users',
      'contacts', 
      'agentes',
      'conversations',
      'integrations',
      'pipelines',
      'opportunities',
      'auditLogs',
      'notifications',
      'roles',
      'playgroundSessions',
      'agentTemplates'
    ]

    const initialSteps: DeletionStep[] = stepOrder
      .filter(step => dataCounts[step] > 0)
      .map(step => ({
        id: step,
        name: getStepName(step),
        status: 'pending' as const,
        count: dataCounts[step]
      }))

    // Agregar paso final para el cliente
    initialSteps.push({
      id: 'client',
      name: 'Cliente principal',
      status: 'pending',
      count: 1
    })

    setSteps(initialSteps)
  }

  const getStepName = (step: string) => {
    const names: Record<string, string> = {
      users: 'Usuarios',
      contacts: 'Contactos',
      agentes: 'Agentes',
      conversations: 'Conversaciones',
      integrations: 'Integraciones',
      pipelines: 'Pipelines',
      opportunities: 'Oportunidades',
      auditLogs: 'Registros de Auditoría',
      notifications: 'Notificaciones',
      roles: 'Roles',
      playgroundSessions: 'Sesiones de Playground',
      agentTemplates: 'Templates de Agentes',
      client: 'Cliente principal'
    }
    return names[step] || step
  }

  const simulateDeletionProgress = (deletedData: Record<string, number>) => {
    let stepIndex = 0
    
    const processStep = () => {
      if (stepIndex < steps.length) {
        // Marcar paso actual como procesando
        setSteps(prev => prev.map((step, index) => 
          index === stepIndex 
            ? { ...step, status: 'processing' }
            : step
        ))
        setCurrentStep(stepIndex)

        // Simular tiempo de procesamiento (1-3 segundos)
        const processingTime = Math.random() * 2000 + 1000
        
        setTimeout(() => {
          // Marcar como completado
          setSteps(prev => prev.map((step, index) => 
            index === stepIndex 
              ? { ...step, status: 'completed' }
              : step
          ))
          
          stepIndex++
          processStep()
        }, processingTime)
      } else {
        // Todos los pasos completados
        setIsCompleted(true)
        setTimeout(() => {
          toast({
            title: `Cliente "${clientName}" eliminado exitosamente`,
            variant: "success"
          })
          onSuccess()
          onClose()
        }, 1000)
      }
    }

    processStep()
  }

  const handleStartDeletion = async () => {
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

  const getStepIcon = (status: DeletionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepStatusColor = (status: DeletionStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-500" />
            Eliminando Cliente
          </DialogTitle>
          <DialogDescription>
            Procesando eliminación de "{clientName}" y todos sus datos relacionados...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progreso</span>
              <span className="font-medium">{completedSteps}/{totalSteps} pasos</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-center text-sm text-gray-500">
              {Math.round(progressPercentage)}% completado
            </div>
          </div>

          {/* Lista de pasos */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStepStatusColor(step.status)}`}
              >
                <div className="flex items-center space-x-3">
                  {getStepIcon(step.status)}
                  <div>
                    <div className="font-medium text-sm">{step.name}</div>
                    {step.count && (
                      <div className="text-xs text-gray-500">
                        {step.count} registro{step.count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {step.status === 'processing' && (
                    <Badge variant="outline" className="text-blue-600">
                      Procesando...
                    </Badge>
                  )}
                  {step.status === 'completed' && (
                    <Badge variant="outline" className="text-green-600">
                      Completado
                    </Badge>
                  )}
                  {step.status === 'error' && (
                    <Badge variant="destructive">
                      Error
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Estado final */}
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-800">
                  Eliminación completada exitosamente
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Todos los datos del cliente han sido eliminados permanentemente.
              </p>
            </div>
          )}

          {hasError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-800">
                  Error en la eliminación
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Hubo un problema durante el proceso de eliminación.
              </p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-2">
          {!isCompleted && !hasError && steps.length === 0 && (
            <Button onClick={handleStartDeletion} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Iniciar Eliminación
            </Button>
          )}
          
          {(isCompleted || hasError) && (
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
