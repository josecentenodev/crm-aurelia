"use client"

import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"

interface RoleEmptyStateProps {
  onCreateRole: () => void
}

/**
 * Empty State Component for Roles
 *
 * Displayed when there are no roles for the selected client
 */
export function RoleEmptyState({ onCreateRole }: RoleEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay roles</h3>
      <p className="text-gray-500 mb-4">
        Este cliente aún no tiene roles configurados.
      </p>
      <Button onClick={onCreateRole}>
        <Plus className="w-4 h-4 mr-2" />
        Crear Primer Rol
      </Button>
    </div>
  )
}
