"use client"

import { Button } from "@/components/ui/button"
import { Key, Edit, Trash2 } from "lucide-react"

interface TaskItemProps {
  task: {
    taskId: string
    name: string
    description?: string | null
  }
  onEdit: (task: any) => void
  onDelete: (taskId: string) => void
  isDeleting?: boolean
}

/**
 * Componente pequeño y cohesivo para mostrar una tarea individual
 * Solo se encarga de la presentación y eventos de UI
 */
export function TaskItem({ task, onEdit, onDelete, isDeleting = false }: TaskItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Key className="w-4 h-4 text-purple-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-gray-900">{task.name}</p>
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={() => onDelete(task.taskId)}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
