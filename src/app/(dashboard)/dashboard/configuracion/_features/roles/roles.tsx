"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import { api } from "@/trpc/react"
import { useRoles, useRoleTasks, useRoleUsers } from "./hooks/use-roles"
import { ClientSelector } from "./components/client-selector"
import { RoleList } from "./components/role-list"
import { RoleEmptyState } from "./components/role-empty-state"
import { RoleDialog } from "./components/role-dialog"
import { TaskAssignmentDialog } from "./components/task-assignment-dialog"
import { UserAssignmentDialog } from "./components/user-assignment-dialog"

/**
 * Roles Feature - Main Orchestrator
 *
 * Orchestrates all role management functionality:
 * - Client selection
 * - Role CRUD operations
 * - Permission assignment
 * - User assignment
 *
 * Data layer: useRoles hook
 * UI layer: Small, focused components
 * Orchestration: This component connects everything
 */
export function RolesFeature() {
  // ==================== LOCAL UI STATE ====================
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isTaskAssignmentOpen, setIsTaskAssignmentOpen] = useState(false)
  const [isUserAssignmentOpen, setIsUserAssignmentOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [selectedRoleForTasks, setSelectedRoleForTasks] = useState<any>(null)
  const [selectedRoleForUsers, setSelectedRoleForUsers] = useState<any>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  // ==================== DATA & MUTATIONS ====================

  // Fetch clients for selector
  const { data: clientsData, isLoading: loadingClients } =
    api.superadmin.getClients.useQuery({ limit: 100 })

  // Roles feature data (only enabled when client is selected)
  const {
    roles,
    taskGroups,
    tasksByGroup,
    clientUsers,
    isEmpty,
    isLoadingRoles,
    createRole,
    updateRole,
    deleteRole,
    assignTasksToRole,
    assignRoleToUser,
    removeRoleFromUser,
    isCreatingRole,
    isUpdatingRole,
    isDeletingRole,
    isAssigningTasks,
    isAssigningUser,
    isRemovingUser,
    refetchRoles
  } = useRoles(selectedClientId)

  // Role tasks for task assignment dialog
  const { roleTasks, refetchRoleTasks } = useRoleTasks(
    selectedRoleForTasks?.roleId ?? null
  )

  // Role users for user assignment dialog
  const { roleUsers, refetchRoleUsers } = useRoleUsers(
    selectedRoleForUsers?.roleId ?? null
  )

  // ==================== ROLE CRUD HANDLERS ====================

  const handleOpenRoleDialog = (role?: any) => {
    setEditingRole(role ?? null)
    setIsRoleDialogOpen(true)
  }

  const handleSaveRole = (data: { name: string; description: string }) => {
    if (editingRole) {
      updateRole(
        {
          roleId: editingRole.roleId,
          name: data.name,
          description: data.description
        },
        {
          onSuccess: () => {
            setIsRoleDialogOpen(false)
            setEditingRole(null)
          }
        }
      )
    } else {
      createRole(
        {
          name: data.name,
          description: data.description,
          clientId: selectedClientId
        },
        {
          onSuccess: () => {
            setIsRoleDialogOpen(false)
          }
        }
      )
    }
  }

  const handleDeleteRole = (roleId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este rol?")) {
      deleteRole(roleId)
    }
  }

  // ==================== PERMISSION MANAGEMENT HANDLERS ====================

  const handleOpenTaskAssignment = async (role: any) => {
    setSelectedRoleForTasks(role)
    // Fetch tasks for this role and pre-select them
    const tasks = await refetchRoleTasks()
    if (tasks.data) {
      const taskIds = tasks.data.map((rt: any) => rt.task.taskId)
      setSelectedTaskIds(taskIds)
    }
    setIsTaskAssignmentOpen(true)
  }

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTaskIds([...selectedTaskIds, taskId])
    } else {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId))
    }
  }

  const handleSaveTaskAssignment = () => {
    if (!selectedRoleForTasks) return
    assignTasksToRole(
      {
        roleId: selectedRoleForTasks.roleId,
        taskIds: selectedTaskIds
      },
      {
        onSuccess: () => {
          setIsTaskAssignmentOpen(false)
          setSelectedTaskIds([])
          setSelectedRoleForTasks(null)
        }
      }
    )
  }

  const handleCloseTaskAssignment = () => {
    setIsTaskAssignmentOpen(false)
    setSelectedTaskIds([])
    setSelectedRoleForTasks(null)
  }

  // ==================== USER MANAGEMENT HANDLERS ====================

  const handleOpenUserAssignment = (role: any) => {
    setSelectedRoleForUsers(role)
    refetchRoleUsers()
    setIsUserAssignmentOpen(true)
  }

  const handleAssignUser = (userId: string) => {
    if (!selectedRoleForUsers) return
    assignRoleToUser(
      {
        roleId: selectedRoleForUsers.roleId,
        userId
      },
      {
        onSuccess: () => {
          refetchRoleUsers()
        }
      }
    )
  }

  const handleRemoveUser = (userId: string) => {
    if (!selectedRoleForUsers) return
    if (confirm("¿Estás seguro de que quieres remover este rol del usuario?")) {
      removeRoleFromUser(
        {
          roleId: selectedRoleForUsers.roleId,
          userId
        },
        {
          onSuccess: () => {
            refetchRoleUsers()
          }
        }
      )
    }
  }

  const handleCloseUserAssignment = () => {
    setIsUserAssignmentOpen(false)
    setSelectedRoleForUsers(null)
  }

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Gestión de Roles
        </h2>
        <p className="text-gray-600">Administra los roles de los clientes</p>
      </div>

      {/* Client Selector */}
      <ClientSelector
        clients={clientsData?.clients ?? []}
        selectedClientId={selectedClientId}
        onClientChange={setSelectedClientId}
        onCreateRole={() => handleOpenRoleDialog()}
        isLoadingClients={loadingClients}
      />

      {/* Roles List */}
      {selectedClientId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Roles del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRoles ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Cargando roles...</div>
              </div>
            ) : isEmpty ? (
              <RoleEmptyState onCreateRole={() => handleOpenRoleDialog()} />
            ) : (
              <RoleList
                roles={roles}
                onEdit={handleOpenRoleDialog}
                onDelete={handleDeleteRole}
                onManagePermissions={handleOpenTaskAssignment}
                onManageUsers={handleOpenUserAssignment}
                isDeletingRole={isDeletingRole}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <RoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        onSave={handleSaveRole}
        initialData={editingRole}
        isLoading={isCreatingRole || isUpdatingRole}
      />

      <TaskAssignmentDialog
        open={isTaskAssignmentOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseTaskAssignment()
        }}
        role={selectedRoleForTasks}
        taskGroups={taskGroups}
        tasksByGroup={tasksByGroup}
        selectedTaskIds={selectedTaskIds}
        onTaskToggle={handleTaskToggle}
        onSave={handleSaveTaskAssignment}
        isLoading={isAssigningTasks}
      />

      <UserAssignmentDialog
        open={isUserAssignmentOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseUserAssignment()
        }}
        role={selectedRoleForUsers}
        allUsers={clientUsers}
        roleUsers={roleUsers}
        onAssignUser={handleAssignUser}
        onRemoveUser={handleRemoveUser}
        isAssigningUser={isAssigningUser}
        isRemovingUser={isRemovingUser}
      />
    </div>
  )
}
