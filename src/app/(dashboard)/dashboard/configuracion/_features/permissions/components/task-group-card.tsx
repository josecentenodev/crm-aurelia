"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FolderOpen, Plus, Edit, Trash2 } from "lucide-react"
import { TaskItem } from "./task-item"

interface TaskGroupCardProps {
  group: {
    groupId: string
    name: string
    description?: string | null
  }
  tasks: any[]
  onEditGroup: (group: any) => void
  onDeleteGroup: (groupId: string) => void
  onAddTask: (groupId: string) => void
  onEditTask: (task: any) => void
  onDeleteTask: (taskId: string) => void
  isDeletingGroup?: boolean
  isDeletingTask?: boolean
}

/**
 * Componente card para mostrar un grupo de tareas y sus tareas asociadas
 * Componente de composición que usa TaskItem para las tareas individuales
 */
export function TaskGroupCard({
  group,
  tasks,
  onEditGroup,
  onDeleteGroup,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isDeletingGroup = false,
  isDeletingTask = false
}: TaskGroupCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-gray-600">{group.description}</p>
              )}
            </div>
            <Badge variant="outline">{tasks.length} tareas</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddTask(group.groupId)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Tarea
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditGroup(group)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDeleteGroup(group.groupId)}
              disabled={isDeletingGroup}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No hay tareas en este grupo
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.taskId}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                isDeleting={isDeletingTask}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
