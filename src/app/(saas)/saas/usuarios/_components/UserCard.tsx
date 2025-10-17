"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { RouterOutputs } from "@/trpc/react"

type User = RouterOutputs["usuarios"]["listByClient"]["users"][number]

interface UserCardProps {
  user: User
  onUpdate: () => void
}

export function UserCard({ user, onUpdate }: UserCardProps) {
  const { toast } = useToast()
  const router = useRouter()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />
      case 'CUSTOMER':
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getActiveColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getActiveIcon = (active: boolean) => {
    return active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleEditUser = (user: User) => {
    // TODO: Implementar página de edición de usuario
    router.push(`/saas/usuarios/${user.id}/editar`)
  }

  const handleDeleteUser = async (user: User) => {
    // TODO: Implementar eliminación de usuario
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name}?`)) {
      try {
        // await deleteUser(user.id) // This line was commented out in the original file, so it's commented out here.
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado correctamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el usuario",
          variant: "destructive",
        })
      }
    }
  }

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
                  <Badge className={`${getTypeColor(user.type)} border-0 text-xs flex items-center gap-1`}>
                    {getTypeIcon(user.type)}
                    {user.type === "ADMIN" ? "Administrador" : "Usuario"}
                  </Badge>
                  <Badge className={`${getActiveColor(user.active)} border-0 text-xs flex items-center gap-1`}>
                    {getActiveIcon(user.active)}
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem 
                  onClick={() => handleEditUser(user)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteUser(user)}
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
            <Mail className="w-4 h-4" />
            <span>{user.email || "Sin email"}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Miembro desde {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          {user.updatedAt && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Actualizado {new Date(user.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>


    </>
  )
} 
