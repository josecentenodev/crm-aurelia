"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react"
import type { UserData } from "../types"

export type UserAction = "activate" | "deactivate" | "delete"

interface UserActionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData | null
  action: UserAction
  onConfirm: (userId: string, action: UserAction) => Promise<void>
  isLoading?: boolean
}

export function UserActionConfirmDialog({
  open,
  onOpenChange,
  user,
  action,
  onConfirm,
  isLoading = false
}: UserActionConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!user) return null

  const getActionConfig = () => {
    switch (action) {
      case "activate":
        return {
          title: "Activar Usuario",
          description: "¿Estás seguro de que quieres activar este usuario?",
          icon: <UserCheck className="h-5 w-5 text-green-600" />,
          buttonText: "Activar Usuario",
          buttonVariant: "default" as const,
          alertMessage: "El usuario podrá acceder nuevamente al sistema y gestionar sus conversaciones asignadas.",
          alertType: "default" as const
        }
      case "deactivate":
        return {
          title: "Desactivar Usuario",
          description: "¿Estás seguro de que quieres desactivar este usuario?",
          icon: <UserX className="h-5 w-5 text-yellow-600" />,
          buttonText: "Desactivar Usuario",
          buttonVariant: "destructive" as const,
          alertMessage: "El usuario perderá acceso al sistema. Sus conversaciones y oportunidades serán reasignadas automáticamente.",
          alertType: "destructive" as const
        }
      case "delete":
        return {
          title: "Eliminar Usuario",
          description: "¿Estás seguro de que quieres eliminar este usuario?",
          icon: <Trash2 className="h-5 w-5 text-red-600" />,
          buttonText: "Eliminar Usuario",
          buttonVariant: "destructive" as const,
          alertMessage: "Esta acción es irreversible. El usuario será eliminado permanentemente y sus conversaciones y oportunidades serán reasignadas.",
          alertType: "destructive" as const
        }
    }
  }

  const config = getActionConfig()

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm(user.id, action)
      onOpenChange(false)
    } catch (error) {
      console.error("Error confirming user action:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (active: boolean) => {
    return active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
  }

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Información del usuario */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-aurelia-primary to-aurelia-secondary rounded-full flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user.name || "Sin nombre"}</div>
              <div className="text-sm text-gray-600">{user.email || "Sin email"}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getStatusColor(user.active)} border-0 text-xs flex items-center gap-1`}>
                  {getStatusIcon(user.active)}
                  {user.active ? "Activo" : "Inactivo"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {user.type === "ADMIN" ? "Administrador" : "Usuario"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Alerta de advertencia */}
          <Alert variant={config.alertType}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {config.alertMessage}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing || isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
          >
            {isProcessing || isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Procesando...
              </>
            ) : (
              config.buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
