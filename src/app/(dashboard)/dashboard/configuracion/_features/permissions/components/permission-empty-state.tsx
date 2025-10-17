"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Plus } from "lucide-react"

interface PermissionEmptyStateProps {
  onCreateGroup: () => void
}

/**
 * Estado vacío cuando no hay grupos de tareas
 * Componente simple y específico
 */
export function PermissionEmptyState({ onCreateGroup }: PermissionEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay grupos de tareas
        </h3>
        <p className="text-gray-500 text-center mb-4">
          Crea grupos de tareas para organizar los permisos del sistema.
        </p>
        <Button onClick={onCreateGroup}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Primer Grupo
        </Button>
      </CardContent>
    </Card>
  )
}
