"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; description: string }) => void
  initialData?: any
  isLoading?: boolean
}

/**
 * Role Dialog Component
 *
 * Controlled dialog for creating or editing roles
 * - Parent controls open state
 * - Self-contained form logic
 * - Emits onSave event with form data
 */
export function RoleDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isLoading = false
}: RoleDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  // Reset or populate form when dialog opens/closes or initialData changes
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Rol" : "Crear Nuevo Rol"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="role-name">Nombre del Rol</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Administrador"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="role-description">Descripción</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descripción del rol"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || isLoading}>
              {isLoading ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Rol"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
