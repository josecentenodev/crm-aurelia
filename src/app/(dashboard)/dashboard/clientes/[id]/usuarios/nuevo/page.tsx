"use client"
import { useState } from "react"
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
import { ArrowLeft, Loader2, Save, UserPlus } from "lucide-react"
import { api } from "@/trpc/react"
import { type CreateUserBySuperadmin, UserType, CreateUserBySuperadminSchema } from "@/domain"
import { z } from "zod"

const FormSchema = CreateUserBySuperadminSchema.extend({
  confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden",
})

type FormValues = z.infer<typeof FormSchema>

export default function NuevoUsuarioClientePage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const [error, setError] = useState<string | null>(null)

  const createUserMutation = api.superadmin.createUserForClient.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/clientes/${clientId}`)
    },
    onError: (err: any) => {
      setError(err.message)
    }
  })

  const { data: clientData } = api.superadmin.getClientById.useQuery({ id: clientId }, { enabled: !!clientId })

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      type: UserType.CUSTOMER,
      active: true,
      clientId: clientId,
      password: "",
      confirmPassword: "",
    }
  })

  const onSubmit = (data: FormValues) => {
    setError(null)
    const { confirmPassword, ...payload } = data
    createUserMutation.mutate({ ...payload, clientId })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/dashboard/clientes/${clientId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
          <p className="text-gray-600">Crear usuario para este cliente</p>
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
                  <Input id="name" placeholder="Nombre del usuario" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="usuario@ejemplo.com" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Usuario *</Label>
                  <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v as UserType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserType.CUSTOMER}>Cliente</SelectItem>
                      <SelectItem value={UserType.ADMIN}>Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input value={clientData?.name ?? clientId} disabled />
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Seguridad</h3>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" {...form.register("password")} />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input id="confirmPassword" type="password" placeholder="Repetir contraseña" {...form.register("confirmPassword")} />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Estado</h3>
              <div className="flex items-center space-x-2">
                <Switch id="active" checked={form.watch("active")} onCheckedChange={(c) => form.setValue("active", c)} />
                <Label htmlFor="active">Usuario activo</Label>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/clientes/${clientId}`)} disabled={createUserMutation.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
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


