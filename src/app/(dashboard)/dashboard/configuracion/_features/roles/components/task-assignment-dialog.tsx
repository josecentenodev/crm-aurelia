"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield } from "lucide-react"

interface TaskAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: any | null
  taskGroups: any[]
  tasksByGroup: Record<string, any[]>
  selectedTaskIds: string[]
  onTaskToggle: (taskId: string, checked: boolean) => void
  onSave: () => void
  isLoading?: boolean
}

/**
 * Task Assignment Dialog Component
 *
 * Dialog for assigning permissions (tasks) to a role
 * - Displays tasks grouped by task group
 * - Checkbox selection for each task
 * - Shows count of selected permissions
 */
export function TaskAssignmentDialog({
  open,
  onOpenChange,
  role,
  taskGroups,
  tasksByGroup,
  selectedTaskIds,
  onTaskToggle,
  onSave,
  isLoading = false
}: TaskAssignmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Asignar Permisos al Rol: {role?.name}</DialogTitle>
          <DialogDescription>
            Selecciona los permisos que tendrá este rol. Los usuarios con este
            rol podrán realizar estas acciones.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {taskGroups.map((group) => (
              <div key={group.groupId} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-900">{group.name}</h4>
                  {group.description && (
                    <span className="text-sm text-gray-500">
                      - {group.description}
                    </span>
                  )}
                </div>
                <div className="ml-7 space-y-2">
                  {tasksByGroup[group.groupId]?.map((task) => (
                    <div key={task.taskId} className="flex items-center space-x-2">
                      <Checkbox
                        id={task.taskId}
                        checked={selectedTaskIds.includes(task.taskId)}
                        onCheckedChange={(checked) =>
                          onTaskToggle(task.taskId, checked as boolean)
                        }
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={task.taskId}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {task.name}
                        {task.description && (
                          <span className="text-gray-500 ml-2">
                            - {task.description}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center pt-4">
          <Badge variant="secondary">
            {selectedTaskIds.length} permisos seleccionados
          </Badge>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Permisos"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
