"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Key, UserPlus } from "lucide-react"

interface RoleCardProps {
  role: any
  onEdit: (role: any) => void
  onDelete: (roleId: string) => void
  onManagePermissions: (role: any) => void
  onManageUsers: (role: any) => void
  isDeleting?: boolean
}

/**
 * Role Card Component
 *
 * Displays a single role with actions
 * - Edit role
 * - Delete role
 * - Manage permissions
 * - Manage users
 */
export function RoleCard({
  role,
  onEdit,
  onDelete,
  onManagePermissions,
  onManageUsers,
  isDeleting = false
}: RoleCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{role.name}</h3>
            <Badge variant="outline">Rol</Badge>
          </div>
          {role.description && (
            <p className="text-sm text-gray-600">{role.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManagePermissions(role)}
          >
            <Key className="w-4 h-4 mr-1" />
            Permisos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageUsers(role)}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Usuarios
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(role)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(role.roleId)}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  )
}
