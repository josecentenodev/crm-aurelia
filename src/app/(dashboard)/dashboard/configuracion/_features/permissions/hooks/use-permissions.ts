import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

/**
 * Hook centralizado para la gestión de permisos (Task Groups y Tasks)
 * Encapsula toda la lógica de datos y mutaciones
 */
export function usePermissions() {
  const { toast } = useToast()

  // ==================== QUERIES ====================
  const taskGroupsQuery = api.permisos.listTaskGroups.useQuery()
  const tasksQuery = api.permisos.listTasks.useQuery()

  // ==================== MUTATIONS - TASK GROUPS ====================
  const createGroupMutation = api.permisos.createTaskGroup.useMutation({
    onSuccess: () => {
      toast({
        title: "Grupo creado",
        description: "El grupo de tareas ha sido creado exitosamente."
      })
      taskGroupsQuery.refetch()
    },
    onError: (error) => {
      toast({
        title: "Error al crear grupo",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const updateGroupMutation = api.permisos.updateTaskGroup.useMutation({
    onSuccess: () => {
      toast({
        title: "Grupo actualizado",
        description: "El grupo de tareas ha sido actualizado exitosamente."
      })
      taskGroupsQuery.refetch()
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar grupo",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const deleteGroupMutation = api.permisos.deleteTaskGroup.useMutation({
    onSuccess: () => {
      toast({
        title: "Grupo eliminado",
        description: "El grupo de tareas ha sido eliminado exitosamente."
      })
      taskGroupsQuery.refetch()
      tasksQuery.refetch()
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar grupo",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // ==================== MUTATIONS - TASKS ====================
  const createTaskMutation = api.permisos.createTask.useMutation({
    onSuccess: () => {
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada exitosamente."
      })
      tasksQuery.refetch()
    },
    onError: (error) => {
      toast({
        title: "Error al crear tarea",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const updateTaskMutation = api.permisos.updateTask.useMutation({
    onSuccess: () => {
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente."
      })
      tasksQuery.refetch()
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar tarea",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const deleteTaskMutation = api.permisos.deleteTask.useMutation({
    onSuccess: () => {
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada exitosamente."
      })
      tasksQuery.refetch()
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar tarea",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // ==================== COMPUTED DATA ====================
  // Agrupar tasks por groupId para mejor organización
  const tasksByGroup: Record<string, any[]> = {}
  if (tasksQuery.data) {
    for (const task of tasksQuery.data) {
      if (!tasksByGroup[task.groupId]) {
        tasksByGroup[task.groupId] = []
      }
      tasksByGroup[task.groupId]?.push(task)
    }
  }

  const isEmpty =
    !taskGroupsQuery.isLoading &&
    !tasksQuery.isLoading &&
    (!taskGroupsQuery.data || taskGroupsQuery.data.length === 0)

  return {
    // Queries data
    taskGroups: taskGroupsQuery.data ?? [],
    tasks: tasksQuery.data ?? [],
    tasksByGroup,

    // Loading states
    isLoadingGroups: taskGroupsQuery.isLoading,
    isLoadingTasks: tasksQuery.isLoading,
    isEmpty,

    // Task Group mutations
    createGroup: createGroupMutation.mutate,
    updateGroup: updateGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    isCreatingGroup: createGroupMutation.isPending,
    isUpdatingGroup: updateGroupMutation.isPending,
    isDeletingGroup: deleteGroupMutation.isPending,

    // Task mutations
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending
  }
}
