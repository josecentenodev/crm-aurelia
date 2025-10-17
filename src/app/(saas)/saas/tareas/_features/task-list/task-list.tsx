"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTasksList } from "../../_hooks/use-tasks-queries"
import { useTasksStore } from "../../_store/tasks-store"
import { adaptTaskForDisplay, sortTasksByPriority } from "../../_adapters/task-adapter"
import { TaskDetail } from "../task-detail/task-detail"
import { Loader2, Calendar, User, AlertCircle, CheckCircle2 } from "lucide-react"

export function TaskList() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const { getTrpcFilters } = useTasksStore()
  const filters = getTrpcFilters()

  const { data: tasks, isLoading, error } = useTasksList(filters)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Error al cargar las tareas</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-10 pb-10">
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay tareas</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Crea tu primera tarea para comenzar a organizar tu trabajo.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedTasks = sortTasksByPriority(tasks)

  return (
    <>
      <div className="space-y-4">
        {sortedTasks.map((task) => {
        const adaptedTask = adaptTaskForDisplay(task)

        return (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
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

                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{adaptedTask.dueDateFormatted}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{adaptedTask.ownerName}</span>
                    </div>
                    {adaptedTask.relatedEntityName && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {adaptedTask.relatedEntityName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        )
        })}
      </div>

      {/* Modal de detalle */}
      <Dialog open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Tarea</DialogTitle>
          </DialogHeader>
          {selectedTaskId && (
            <TaskDetail
              taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
