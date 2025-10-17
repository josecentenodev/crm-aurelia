"use client"

import { RoleCard } from "./role-card"

interface RoleListProps {
  roles: any[]
  onEdit: (role: any) => void
  onDelete: (roleId: string) => void
  onManagePermissions: (role: any) => void
  onManageUsers: (role: any) => void
  isDeletingRole?: boolean
}

/**
 * Role List Component
 *
 * Maps over roles array and renders RoleCard components
 * Composition pattern - delegates rendering to RoleCard
 */
export function RoleList({
  roles,
  onEdit,
  onDelete,
  onManagePermissions,
  onManageUsers,
  isDeletingRole = false
}: RoleListProps) {
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <RoleCard
          key={role.roleId}
          role={role}
          onEdit={onEdit}
          onDelete={onDelete}
          onManagePermissions={onManagePermissions}
          onManageUsers={onManageUsers}
          isDeleting={isDeletingRole}
        />
      ))}
    </div>
  )
}
