"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, User, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { User } from "@/domain/Usuarios"

interface QuickEditUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  active: boolean
}

export function QuickEditUserModal({ user, isOpen, onClose, onSuccess }: QuickEditUserModalProps) {
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    active: true
  })

  const updateUserQuickMutation = api.usuarios.updateUserQuick.useMutation({
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado exitosamente.",
      })
      onSuccess()
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setError(error.message)
    }
  })

  // Actualizar formulario cuando se abre el modal
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
        active: user.active ?? true
      })
      setError(null)
    }
  }, [user, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    if (!formData.name.trim()) {
      setError("El nombre es requerido")
      return
    }

    setError(null)
    
    const userData = {
      id: user.id,
      name: formData.name.trim(),
      active: formData.active,
    }

    updateUserQuickMutation.mutate(userData)
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span>Edición Rápida - {user?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Modifica los campos más importantes del usuario
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {formData.active ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              Estado del Usuario
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange("active", checked)}
              />
              <Label htmlFor="active" className="text-sm">
                {formData.active ? "Usuario activo" : "Usuario inactivo"}
              </Label>
            </div>
          </div>

          {/* Información del Usuario */}
          {user && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">Información Actual</Label>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium capitalize">{user.type?.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Creado:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateUserQuickMutation.isPending}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateUserQuickMutation.isPending}
              className="bg-violet-500 hover:bg-violet-600 rounded-xl"
            >
              {updateUserQuickMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 