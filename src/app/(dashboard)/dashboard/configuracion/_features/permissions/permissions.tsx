"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Shield } from "lucide-react"
import { usePermissions } from "./hooks/use-permissions"
import { TaskGroupDialog } from "./components/task-group-dialog"
import { TaskDialog } from "./components/task-dialog"
import { PermissionEmptyState } from "./components/permission-empty-state"
import { PermissionList } from "./components/permission-list"

/**
 * Feature principal de Permissions
 * Orquesta los componentes pequeños y maneja el estado local de UI
 * Toda la lógica de datos está encapsulada en usePermissions()
 */
export function PermissionsFeature() {
  // ==================== STATE ====================
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [preselectedGroupId, setPreselectedGroupId] = useState<string>("")

  // ==================== DATA & MUTATIONS ====================
  const {
    taskGroups,
    tasksByGroup,
    isEmpty,
    isLoadingGroups,
    isLoadingTasks,
    createGroup,
    updateGroup,
    deleteGroup,
    isCreatingGroup,
    isUpdatingGroup,
    isDeletingGroup,
    createTask,
    updateTask,
    deleteTask,
    isCreatingTask,
    isUpdatingTask,
    isDeletingTask
  } = usePermissions()

  // ==================== TASK GROUP HANDLERS ====================
  const handleOpenGroupDialog = (group?: any) => {
    setEditingGroup(group ?? null)
    setIsGroupDialogOpen(true)
  }

  const handleSaveGroup = (data: { name: string; description: string }) => {
    if (editingGroup) {
      updateGroup(
        {
          groupId: editingGroup.groupId,
          name: data.name,
          description: data.description
        },
        {
          onSuccess: () => {
            setIsGroupDialogOpen(false)
            setEditingGroup(null)
          }
        }
      )
    } else {
      createGroup(data, {
        onSuccess: () => {
          setIsGroupDialogOpen(false)
        }
      })
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar este grupo? Esto también eliminará todas las tareas asociadas."
      )
    ) {
      deleteGroup(groupId)
    }
  }

  // ==================== TASK HANDLERS ====================
  const handleOpenTaskDialog = (task?: any, groupId?: string) => {
    setEditingTask(task ?? null)
    setPreselectedGroupId(groupId ?? "")
    setIsTaskDialogOpen(true)
  }

  const handleSaveTask = (data: {
    name: string
    description: string
    groupId: string
  }) => {
    if (editingTask) {
      updateTask(
        {
          taskId: editingTask.taskId,
          name: data.name,
          description: data.description,
          groupId: data.groupId
        },
        {
          onSuccess: () => {
            setIsTaskDialogOpen(false)
            setEditingTask(null)
            setPreselectedGroupId("")
          }
        }
      )
    } else {
      createTask(data, {
        onSuccess: () => {
          setIsTaskDialogOpen(false)
          setPreselectedGroupId("")
        }
      })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      deleteTask(taskId)
    }
  }

  // ==================== RENDER ====================
  if (isLoadingGroups || isLoadingTasks) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando permisos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Gestión de Permisos
          </h2>
          <p className="text-gray-600">
            Administra grupos de tareas y permisos del sistema
          </p>
        </div>
        {!isEmpty && (
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenGroupDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Grupo
              </Button>
            </DialogTrigger>
          </Dialog>
        )}
      </div>

      {/* Content */}
      {isEmpty ? (
        <PermissionEmptyState onCreateGroup={() => handleOpenGroupDialog()} />
      ) : (
        <PermissionList
          taskGroups={taskGroups}
          tasksByGroup={tasksByGroup}
          onEditGroup={handleOpenGroupDialog}
          onDeleteGroup={handleDeleteGroup}
          onAddTask={(groupId) => handleOpenTaskDialog(undefined, groupId)}
          onEditTask={handleOpenTaskDialog}
          onDeleteTask={handleDeleteTask}
          isDeletingGroup={isDeletingGroup}
          isDeletingTask={isDeletingTask}
        />
      )}

      {/* Dialogs */}
      <TaskGroupDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        onSave={handleSaveGroup}
        initialData={editingGroup}
        isLoading={isCreatingGroup || isUpdatingGroup}
      />

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSave={handleSaveTask}
        initialData={editingTask}
        preselectedGroupId={preselectedGroupId}
        isLoading={isCreatingTask || isUpdatingTask}
      />
    </div>
  )
}
