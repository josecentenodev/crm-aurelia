"use client"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, User, Mail, Shield, Calendar, CheckCircle, XCircle } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

export default function UsuarioDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const userId = params.id as string

  const { data: usuario, isLoading, error } = api.usuarios.getUserById.useQuery(
    { id: userId },
    { enabled: !!userId }
  )

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !usuario) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || "No se pudo cargar el usuario"}
          </AlertDescription>
        </Alert>
      </div>
    )
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return 'Administrador'
      case 'CUSTOMER':
        return 'Usuario'
      default:
        return 'Usuario'
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/saas/usuarios')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{usuario.name}</h1>
            <p className="text-gray-600 mt-1">Detalles del usuario</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/saas/usuarios/${userId}/editar`)}
            className="rounded-xl"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edición Completa
          </Button>
        </div>
      </div>

      {/* Información del Usuario */}
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
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Email:</span>
              <span className="font-medium">{usuario.email}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Tipo:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {getTypeIcon(usuario.type)}
                {getTypeLabel(usuario.type)}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              {usuario.active ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600">Estado:</span>
              <Badge 
                variant={usuario.active ? "default" : "secondary"}
              >
                {usuario.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Estado y Fechas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Estado y Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Creado:</span>
              <span className="font-medium">
                {new Date(usuario.createdAt).toLocaleDateString()}
              </span>
            </div>

            {usuario.updatedAt && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Actualizado:</span>
                <span className="font-medium">
                  {new Date(usuario.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {usuario.lastLoginAt && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Último login:</span>
                <span className="font-medium">
                  {new Date(usuario.lastLoginAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información del Cliente */}
      {usuario.client && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Cliente Asociado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Cliente:</span>
              <span className="font-medium">{usuario.client.name}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 