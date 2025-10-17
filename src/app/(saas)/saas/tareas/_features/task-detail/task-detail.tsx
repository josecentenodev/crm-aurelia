"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTaskById, useDeleteTask, useUpdateTask } from "../../_hooks/use-tasks-queries"
import { adaptTaskForDisplay } from "../../_adapters/task-adapter"
import {
  Loader2,
  Calendar,
  User,
  AlertCircle,
  Edit,
  Trash2,
  MessageSquare,
  Briefcase,
  Target,
  Clock,
  CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TaskForm } from "../task-form/task-form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface TaskDetailProps {
  taskId: string
  onClose?: () => void
}

export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: task, isLoading, error } = useTaskById(taskId)
  const deleteTaskMutation = useDeleteTask()
  const updateTaskMutation = useUpdateTask()

  const handleDelete = () => {
    deleteTaskMutation.mutate(
      { id: taskId },
      {
        onSuccess: () => {
          toast({
            title: "Tarea eliminada",
            description: "La tarea se ha eliminado exitosamente.",
          })
          onClose?.()
        },
        onError: (error) => {
          toast({
            title: "Error al eliminar tarea",
            description: error.message,
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleMarkAsCompleted = () => {
    if (!task) return

    updateTaskMutation.mutate(
      { id: task.id, status: "COMPLETED" },
      {
        onSuccess: () => {
          toast({
            title: "Tarea completada",
            description: "La tarea se ha marcado como completada.",
          })
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Error al cargar la tarea</p>
          <p className="text-sm text-muted-foreground">
            {error?.message ?? "La tarea no existe"}
          </p>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Editar Tarea</h2>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
        </div>
        <TaskForm
          task={task}
          onSuccess={() => {
            setIsEditing(false)
            toast({
              title: "Tarea actualizada",
              description: "Los cambios se han guardado exitosamente.",
            })
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  const adaptedTask = adaptTaskForDisplay(task)

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={adaptedTask.statusColor}>
              {adaptedTask.statusText}
            </Badge>
            <Badge className={adaptedTask.priorityColor}>
              {adaptedTask.priorityText}
            </Badge>
            {adaptedTask.isOverdue && (
              <Badge variant="destructive">Vencida</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {task.status !== "COMPLETED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsCompleted}
              disabled={updateTaskMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Descripción */}
      {task.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {task.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Propietario */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Propietario</p>
              <p className="text-sm text-muted-foreground">
                {adaptedTask.ownerName}
                {task.owner?.email && (
                  <span className="text-xs block">{task.owner.email}</span>
                )}
              </p>
            </div>
          </div>

          {/* Fecha de vencimiento */}
          {task.dueDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Fecha de vencimiento</p>
                <p className="text-sm text-muted-foreground">
                  {adaptedTask.dueDateFormatted}
                  {adaptedTask.isOverdue && (
                    <span className="text-red-500 block text-xs">
                      Vencida hace {formatDistanceToNow(new Date(task.dueDate), { locale: es })}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Fechas de creación y actualización */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Fechas</p>
              <p className="text-xs text-muted-foreground">
                Creada: {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: es })}
              </p>
              <p className="text-xs text-muted-foreground">
                Actualizada: {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relaciones */}
      {(task.relatedContact || task.relatedConversation || task.relatedOpportunity) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Relacionado con</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.relatedContact && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Contacto</p>
                  <p className="text-sm text-muted-foreground">
                    {task.relatedContact.name}
                    {task.relatedContact.email && (
                      <span className="text-xs block">{task.relatedContact.email}</span>
                    )}
                    {task.relatedContact.phone && (
                      <span className="text-xs block">{task.relatedContact.phone}</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {task.relatedConversation && (
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Conversación</p>
                  <p className="text-sm text-muted-foreground">
                    {task.relatedConversation.title ?? "Sin título"}
                  </p>
                  {task.relatedConversation.status && (
                    <Badge variant="outline" className="mt-1">
                      {task.relatedConversation.status}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {task.relatedOpportunity && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Oportunidad</p>
                  <p className="text-sm text-muted-foreground">
                    {task.relatedOpportunity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.relatedOpportunity.amount && (
                      <span className="text-xs text-muted-foreground">
                        ${Number(task.relatedOpportunity.amount).toLocaleString()}
                      </span>
                    )}
                    {task.relatedOpportunity.status && (
                      <Badge variant="outline">
                        {task.relatedOpportunity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmación de eliminación */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="¿Estás seguro?"
        description="Esta acción no se puede deshacer. La tarea será eliminada permanentemente."
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
