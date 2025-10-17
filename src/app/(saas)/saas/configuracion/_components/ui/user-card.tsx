"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Shield,
  UserCheck,
  Settings,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  UserX,
  UserPlus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { UserCardProps } from "../types"
import { 
  getUserTypeColor,
  getUserStatusColor,
  formatDate
} from "../utils"
import { UserActionConfirmDialog, type UserAction } from "../dialogs/UserActionConfirmDialog"

export function UserCard({ user, onUpdate }: UserCardProps) {
  const { toast } = useToast()
  const { clientId } = useClientContext()
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    user: typeof user | null
    action: UserAction
  }>({
    open: false,
    user: null,
    action: "activate"
  })

  const utils = api.useUtils()

  // Mutations para las acciones
  const toggleActiveMutation = api.usuarios.toggleUserActive.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Éxito",
        description: data.message,
      })
      void utils.usuarios.listByClient.invalidate()
      onUpdate()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const deleteUserMutation = api.usuarios.deleteUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      })
      void utils.usuarios.listByClient.invalidate()
      onUpdate()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />
      case 'CUSTOMER':
        return <UserCheck className="w-4 h-4" />
      default:
        return <UserCheck className="w-4 h-4" />
    }
  }

  const getStatusIcon = (active: boolean) => {
    return active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
  }

  const handleEdit = () => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La edición de usuarios estará disponible próximamente",
    })
  }

  const handleManageRoles = () => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La gestión de roles estará disponible próximamente",
    })
  }

  const handleToggleActive = () => {
    setConfirmDialog({
      open: true,
      user,
      action: user.active ? "deactivate" : "activate"
    })
  }

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      user,
      action: "delete"
    })
  }

  const handleConfirmAction = async (userId: string, action: UserAction) => {
    try {
      if (action === "activate" || action === "deactivate") {
        await toggleActiveMutation.mutateAsync({
          id: userId,
          clientId: clientId!, // Pasar el clientId del contexto
          active: action === "activate"
        })
      } else if (action === "delete") {
        await deleteUserMutation.mutateAsync({
          id: userId,
          clientId: clientId! // Pasar el clientId del contexto
        })
      }
    } catch (error) {
      // Error handling is done in the mutation callbacks
      console.error("Error in user action:", error)
    }
  }

  const isLoading = toggleActiveMutation.isPending || deleteUserMutation.isPending

  return (
    <>
      <Card className="rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.image || undefined} alt={user.name || "Usuario"} />
                <AvatarFallback className="bg-gradient-to-br from-aurelia-primary to-aurelia-secondary text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {user.name || "Sin nombre"}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${getUserTypeColor(user.type)} border-0 text-xs flex items-center gap-1`}>
                    {getTypeIcon(user.type)}
                    {user.type === "ADMIN" ? "Administrador" : "Usuario"}
                  </Badge>
                  <Badge className={`${getUserStatusColor(user.active)} border-0 text-xs flex items-center gap-1`}>
                    {getStatusIcon(user.active)}
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isLoading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem 
                  onClick={handleEdit}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleManageRoles}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  Gestionar Roles
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleToggleActive}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {user.active ? (
                    <>
                      <UserX className="w-4 h-4" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Activar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="flex items-center gap-2 cursor-pointer text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <UserCheck className="w-4 h-4" />
            <span>{user.email || "Sin email"}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Settings className="w-4 h-4" />
            <span>Miembro desde {formatDate(user.createdAt)}</span>
          </div>
          {user.updatedAt && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Settings className="w-4 h-4" />
              <span>Actualizado {formatDate(user.updatedAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <UserActionConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        user={confirmDialog.user}
        action={confirmDialog.action}
        onConfirm={handleConfirmAction}
        isLoading={isLoading}
      />
    </>
  )
}
