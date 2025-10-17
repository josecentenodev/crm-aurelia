"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save, UserPlus } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import type { CreateUser, UserType } from "@/domain/Usuarios"

interface FormData {
  name: string
  email: string
  password: string
  type: UserType
  active: boolean
}

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { clientId } = useClientContext()
  const [error, setError] = useState<string | null>(null)

  const createUserMutation = api.usuarios.createUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado exitosamente.",
      })
      router.push("/saas/usuarios")
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

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      type: UserType.CUSTOMER,
      active: true,
    }
  })

  const onSubmit = (data: FormData) => {
    if (!clientId) {
      setError("No se ha seleccionado un cliente")
      return
    }

    setError(null)
    
    const userData: CreateUser = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      type: data.type,
      active: data.active,
      clientId,
    }

    createUserMutation.mutate(userData)
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/saas/usuarios')}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Usuario</h1>
          <p className="text-gray-600 mt-1">Agrega un nuevo usuario al sistema</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Información del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    {...form.register("name", { required: "El nombre es requerido" })}
                    className="rounded-xl"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@empresa.com"
                    {...form.register("email", { 
                      required: "El email es requerido",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Por favor ingresa un email válido"
                      }
                    })}
                    className="rounded-xl"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...form.register("password", { 
                      required: "La contraseña es requerida",
                      minLength: {
                        value: 6,
                        message: "La contraseña debe tener al menos 6 caracteres"
                      }
                    })}
                    className="rounded-xl"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo de Usuario */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tipo de Usuario</h3>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select 
                  value={form.watch("type")} 
                  onValueChange={(value) => form.setValue("type", value as UserType)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserType.ADMIN}>Administrador</SelectItem>
                    <SelectItem value={UserType.CUSTOMER}>Cliente</SelectItem>
                    <SelectItem value={UserType.AGENT}>Agente</SelectItem>
                  </SelectContent>
                </Select>
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
                onClick={() => router.push("/saas/usuarios")}
                disabled={createUserMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="bg-violet-500 hover:bg-violet-600"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear Usuario
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