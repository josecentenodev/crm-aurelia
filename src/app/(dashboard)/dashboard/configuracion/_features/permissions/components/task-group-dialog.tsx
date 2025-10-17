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

interface TaskGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; description: string }) => void
  initialData?: {
    name: string
    description: string
  }
  isLoading?: boolean
}

/**
 * Dialog reutilizable para crear/editar grupos de tareas
 * Componente controlado que no maneja su propio estado de apertura
 */
export function TaskGroupDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isLoading = false
}: TaskGroupDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  // Sincronizar con initialData cuando cambie
  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description || "")
    } else {
      setName("")
      setDescription("")
    }
  }, [initialData, open])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name, description })
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
            {isEditMode ? "Editar Grupo de Tareas" : "Crear Grupo de Tareas"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Nombre del Grupo</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Gestión de Usuarios"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="group-description">Descripción</Label>
            <Input
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del grupo"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || isLoading}>
              {isEditMode ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
