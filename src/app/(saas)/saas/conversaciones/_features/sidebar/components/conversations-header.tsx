/**
 * Header del sidebar de conversaciones
 * Muestra título y botón para crear nueva conversación
 * Componente presentacional puro - sin lógica de negocio
 */

"use client"

import { Button } from "@/components/ui"
import { Plus } from "lucide-react"

interface ConversationsHeaderProps {
  onCreateNew: () => void
}

export function ConversationsHeader({ onCreateNew }: ConversationsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-xl p-2 hover:bg-purple-50"
        onClick={onCreateNew}
        title="Crear nueva conversación"
      >
        <Plus className="w-4 h-4 text-purple-600" />
      </Button>
    </div>
  )
}

