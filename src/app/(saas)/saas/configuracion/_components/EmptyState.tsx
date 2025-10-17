"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Phone } from "lucide-react"

interface EmptyStateProps {
  canCreateMore: boolean
  onCreateNew: () => void
}

export function EmptyState({ canCreateMore, onCreateNew }: EmptyStateProps) {
  return (
    <Card className="rounded-2xl border border-gray-200">
      <CardContent className="text-center py-12">
        <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay instancias configuradas
        </h3>
        <p className="text-gray-600 mb-4">
          Crea tu primera instancia para comenzar a recibir mensajes.
        </p>
        <Button
          onClick={onCreateNew}
          disabled={!canCreateMore}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Primera Instancia
        </Button>
      </CardContent>
    </Card>
  )
}
