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
import Link from "next/link"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { useToast } from "@/hooks/use-toast"
import type { RouterOutputs } from "@/trpc/react"

type User = RouterOutputs["superadmin"]["getUsers"]["users"][number]

interface UserCardProps {
  user: User
  onUpdate: () => void
}

export function UserCard({ user, onUpdate }: UserCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800'
      case 'AURELIA':
        return 'bg-purple-100 text-purple-800'
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
      case 'AURELIA':
        return <Shield className="w-4 h-4" />
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

  return (
    <>
      <Card className="rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.image || undefined} alt={user.name || "Usuario"} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
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
                    {user.type === "ADMIN" ? "Administrador" : user.type === "AURELIA" ? "Superadmin" : "Usuario"}
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
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/usuarios/${user.id}/editar`} className="flex items-center gap-2 cursor-pointer">
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
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



      <DeleteUserDialog 
        user={user as any} 
        isOpen={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={() => {
          setShowDeleteDialog(false)
          onUpdate()
          toast({
            title: "Usuario eliminado",
            description: "El usuario ha sido eliminado correctamente.",
            variant: "success"
          })
        }}
      />
    </>
  )
} 