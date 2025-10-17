"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Shield,
  Users,
  Settings,
  Trash2,
  Edit,
  Eye,
  MoreVertical
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { RoleCardProps } from "../types"

export function RoleCard({ role, onUpdate }: RoleCardProps) {
  const { toast } = useToast()

  const handleEdit = () => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La edición de roles estará disponible próximamente",
    })
  }

  const handleViewPermissions = () => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La gestión de permisos estará disponible próximamente",
    })
  }

  const handleDelete = () => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La eliminación de roles estará disponible próximamente",
    })
  }

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {role.name}
              </CardTitle>
              {role.description && (
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              )}
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
                onClick={handleEdit}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleViewPermissions}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Ver Permisos
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
          <Users className="w-4 h-4" />
          <span>0 usuarios asignados</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Settings className="w-4 h-4" />
          <span>0 permisos configurados</span>
        </div>
      </CardContent>
    </Card>
  )
}
