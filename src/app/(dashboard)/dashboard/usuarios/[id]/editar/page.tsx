"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save, User } from "lucide-react"
import { api } from "@/trpc/react"
import { type UpdateUserBySuperadmin, UserType, UpdateUserBySuperadminSchema } from "@/domain"

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [error, setError] = useState<string | null>(null)

  const { data: user, isLoading: isLoadingUser } = api.superadmin.getUserById.useQuery(
    { id: userId },
    { enabled: !!userId }
  )

  const { data: clientsData } = api.superadmin.getClients.useQuery({
    limit: 100
  })

  const clients = clientsData?.clients || []

  const updateUserMutation = api.superadmin.updateUser.useMutation({
    onSuccess: () => {
      router.push("/dashboard/usuarios")
    },
    onError: (error: any) => {
      setError(error.message)
    }
  })

  const form = useForm<UpdateUserBySuperadmin>({
    resolver: zodResolver(UpdateUserBySuperadminSchema),
    defaultValues: {
      id: userId,
      name: "",
      email: "",
      type: UserType.CUSTOMER,
      active: true,
      clientId: "",
    }
  })

  // Actualizar formulario cuando se carga el usuario
  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        type: user.type as UserType,
        active: user.active,
        clientId: user.clientId || "",
      })
    }
  }, [user, form])

  const onSubmit = (data: UpdateUserBySuperadmin) => {
    setError(null)
    updateUserMutation.mutate(data)
  }

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>Usuario no encontrado</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push("/dashboard/usuarios")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="text-gray-600">Modifica la información del usuario</p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    placeholder="Nombre del usuario"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo y Cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Usuario *</Label>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(value) => form.setValue("type", value as UserType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserType.CUSTOMER}>Cliente</SelectItem>
                      <SelectItem value={UserType.ADMIN}>Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Cliente *</Label>
                  <Select
                    value={form.watch("clientId")}
                    onValueChange={(value) => form.setValue("clientId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.clientId && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.clientId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Estado</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={form.watch("active")}
                  onCheckedChange={(checked) => form.setValue("active", checked)}
                />
                <Label htmlFor="active">Usuario activo</Label>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/usuarios")}
                disabled={updateUserMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 