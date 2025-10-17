"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; description: string; groupId: string }) => void
  initialData?: {
    name: string
    description: string
    groupId: string
  }
  preselectedGroupId?: string
  isLoading?: boolean
}

/**
 * Dialog reutilizable para crear/editar tareas individuales
 * Componente controlado y cohesivo con una sola responsabilidad
 */
export function TaskDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  preselectedGroupId,
  isLoading = false
}: TaskDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [groupId, setGroupId] = useState("")

  // Sincronizar con initialData cuando cambie
  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description || "")
      setGroupId(initialData.groupId)
    } else {
      setName("")
      setDescription("")
      setGroupId(preselectedGroupId || "")
    }
  }, [initialData, preselectedGroupId, open])

  const handleSave = () => {
    if (!name.trim() || !groupId) return
    onSave({ name, description, groupId })
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const isEditMode = !!initialData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Tarea" : "Crear Nueva Tarea"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="task-name">Nombre de la Tarea</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Crear Usuario"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="task-description">Descripción</Label>
            <Input
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la tarea"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !groupId || isLoading}
            >
              {isEditMode ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
