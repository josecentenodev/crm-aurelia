"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, User, Mail, Shield, Calendar } from "lucide-react"
import { api } from "@/trpc/react"

interface UserFormData {
  name: string
  email: string
  type: "ADMIN" | "CUSTOMER"
  active: boolean
  role: string
}

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    type: "CUSTOMER",
    active: true,
    role: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  // Obtener datos del usuario
  const { data: user, isLoading: isLoadingUser } = api.usuarios.getUserById.useQuery(
    { userId: params.id },
    {
      enabled: !!params.id,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            type: data.type || "CUSTOMER",
            active: data.active,
            role: data.role || ""
          })
        }
      }
    }
  )

  // Mutation para actualizar usuario
  const updateUserMutation = api.usuarios.updateUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente",
      })
      router.push("/saas/usuarios")
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserMutation.mutateAsync({
        userId: params.id,
        ...formData
      })
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Usuario no encontrado</h3>
              <p className="text-gray-600">El usuario que buscas no existe o no tienes permisos para verlo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
            <p className="text-gray-600">Modifica la información del usuario</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={user.active ? "default" : "secondary"}>
            {user.active ? "Activo" : "Inactivo"}
          </Badge>
          <Badge variant="outline">
            {user.type === "ADMIN" ? "Administrador" : "Cliente"}
          </Badge>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nombre del usuario"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Acceso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Configuración de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo de usuario</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value as "ADMIN" | "CUSTOMER")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Cliente</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="role">Rol</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  placeholder="Rol del usuario"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange("active", checked)}
                />
                <Label htmlFor="active">Usuario activo</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Fecha de creación:</span>
                <p className="text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Última actualización:</span>
                <p className="text-gray-900">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">ID del usuario:</span>
                <p className="text-gray-900 font-mono text-xs">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || updateUserMutation.isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading || updateUserMutation.isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
} 