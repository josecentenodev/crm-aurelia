"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

/**
 * Custom hook for Roles feature - Data Layer
 *
 * Encapsulates ALL data-related logic:
 * - API queries (roles, tasks, users)
 * - Mutations (create, update, delete, assign)
 * - Toast notifications
 * - Computed data (tasksByGroup)
 * - Loading/error states
 *
 * NO UI LOGIC - Only data management
 */
export function useRoles(selectedClientId: string) {
  const { toast } = useToast()

  // ==================== QUERIES ====================

  // Roles for selected client
  const rolesQuery = api.permisos.listRoles.useQuery(
    { clientId: selectedClientId },
    { enabled: !!selectedClientId }
  )

  // Task groups and tasks for permission assignment
  const taskGroupsQuery = api.permisos.listTaskGroups.useQuery()
  const allTasksQuery = api.permisos.listTasks.useQuery()

  // Users for selected client (for user assignment)
  const clientUsersQuery = api.usuarios.listByClient.useQuery(
    { clientId: selectedClientId },
    { enabled: !!selectedClientId }
  )

  // ==================== MUTATIONS ====================

  // Create Role
  const createRoleMutation = api.permisos.createRole.useMutation({
    onSuccess: () => {
      toast({ title: "Rol creado", description: "El rol ha sido creado exitosamente." })
      rolesQuery.refetch()
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  // Update Role
  const updateRoleMutation = api.permisos.updateRole.useMutation({
    onSuccess: () => {
      toast({ title: "Rol actualizado", description: "El rol ha sido actualizado exitosamente." })
      rolesQuery.refetch()
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  // Delete Role
  const deleteRoleMutation = api.permisos.deleteRole.useMutation({
    onSuccess: () => {
      toast({ title: "Rol eliminado", description: "El rol ha sido eliminado exitosamente." })
      rolesQuery.refetch()
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  // Assign Tasks to Role
  const assignTasksToRoleMutation = api.permisos.assignTasksToRole.useMutation({
    onSuccess: () => {
      toast({
        title: "Permisos asignados",
        description: "Los permisos se han asignado al rol exitosamente."
      })
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  // Assign Role to User
  const assignRoleToUserMutation = api.permisos.assignRoleToUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Rol asignado",
        description: "El rol se ha asignado al usuario exitosamente."
      })
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  // Remove Role from User
  const removeRoleFromUserMutation = api.permisos.removeRoleFromUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Rol removido",
        description: "El rol se ha removido del usuario exitosamente."
      })
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  // ==================== COMPUTED DATA ====================

  // Group tasks by groupId for better organization
  const tasksByGroup: Record<string, any[]> = {}
  if (allTasksQuery.data) {
    for (const task of allTasksQuery.data) {
      if (!tasksByGroup[task.groupId]) tasksByGroup[task.groupId] = []
      tasksByGroup[task.groupId]?.push(task)
    }
  }

  // Check if there are no roles
  const isEmpty = rolesQuery.data?.length === 0

  // ==================== RETURN API ====================

  return {
    // Data
    roles: rolesQuery.data ?? [],
    taskGroups: taskGroupsQuery.data ?? [],
    allTasks: allTasksQuery.data ?? [],
    tasksByGroup,
    clientUsers: clientUsersQuery.data?.users ?? [],
    isEmpty,

    // Loading states
    isLoadingRoles: rolesQuery.isLoading,
    isLoadingTaskGroups: taskGroupsQuery.isLoading,
    isLoadingTasks: allTasksQuery.isLoading,
    isLoadingUsers: clientUsersQuery.isLoading,

    // Mutation functions
    createRole: createRoleMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    deleteRole: deleteRoleMutation.mutate,
    assignTasksToRole: assignTasksToRoleMutation.mutate,
    assignRoleToUser: assignRoleToUserMutation.mutate,
    removeRoleFromUser: removeRoleFromUserMutation.mutate,

    // Mutation loading states
    isCreatingRole: createRoleMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
    isDeletingRole: deleteRoleMutation.isPending,
    isAssigningTasks: assignTasksToRoleMutation.isPending,
    isAssigningUser: assignRoleToUserMutation.isPending,
    isRemovingUser: removeRoleFromUserMutation.isPending,

    // Refetch functions
    refetchRoles: rolesQuery.refetch,
    refetchUsers: clientUsersQuery.refetch
  }
}

/**
 * Custom hook for fetching role tasks (used in task assignment dialog)
 */
export function useRoleTasks(roleId: string | null) {
  const { data, isLoading, refetch } = api.permisos.listTasksForRole.useQuery(
    roleId ?? "",
    { enabled: !!roleId }
  )

  return {
    roleTasks: data ?? [],
    isLoadingRoleTasks: isLoading,
    refetchRoleTasks: refetch
  }
}

/**
 * Custom hook for fetching role users (used in user assignment dialog)
 */
export function useRoleUsers(roleId: string | null) {
  const { data, isLoading, refetch } = api.permisos.listRolesForUser.useQuery(
    roleId ?? "",
    { enabled: !!roleId }
  )

  return {
    roleUsers: data ?? [],
    isLoadingRoleUsers: isLoading,
    refetchRoleUsers: refetch
  }
}
