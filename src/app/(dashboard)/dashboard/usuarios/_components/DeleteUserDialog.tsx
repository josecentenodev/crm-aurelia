"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { api } from "@/trpc/react"
import { type UserWithClientInfo } from "@/domain"

interface DeleteUserDialogProps {
  user: UserWithClientInfo
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteUserDialog({ user, isOpen, onClose, onSuccess }: DeleteUserDialogProps) {
  const [error, setError] = useState<string | null>(null)

  const deleteUserMutation = api.superadmin.deleteUser.useMutation({
    onSuccess: () => {
      onClose()
      onSuccess()
      setError(null)
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  const handleDelete = () => {
    setError(null)
    deleteUserMutation.mutate({ id: user.id })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar Usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar al usuario{" "}
            <strong>{user.name ?? user.email}</strong>?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Información del usuario:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Nombre:</strong> {user.name ?? "Sin nombre"}</p>
              <p><strong>Email:</strong> {user.email ?? "Sin email"}</p>
              <p><strong>Tipo:</strong> {user.type}</p>
              <p><strong>Estado:</strong> {user.active ? "Activo" : "Inactivo"}</p>
              {user.client && (
                <p><strong>Cliente:</strong> {user.client.name}</p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Advertencia
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Al eliminar este usuario, se perderán todos sus datos y no podrá acceder al sistema.
                    Esta acción es irreversible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteUserMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? "Eliminando..." : "Eliminar Usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 