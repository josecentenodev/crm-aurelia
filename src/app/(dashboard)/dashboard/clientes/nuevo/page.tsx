"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { api } from "@/trpc/react"
import { CreateClientSchema, type CreateClient } from "@/domain/Clientes"
import { ClientCreationLoader } from "@/components/ui/client-creation-loader"

type CreationState = 'idle' | 'creating_client' | 'creating_integration' | 'success' | 'error'

export default function NuevoClientePage() {
  const router = useRouter()
  const [creationState, setCreationState] = useState<CreationState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [integrationError, setIntegrationError] = useState<string | null>(null)

  const { data: statuses = [] } = api.superadmin.getClientStatuses.useQuery()
  const { data: plans = [] } = api.superadmin.getClientPlans.useQuery()
  
  const createClient = api.superadmin.createClient.useMutation({
    onSuccess: (result) => {
      if (result.integrationStatus === 'success') {
        setCreationState('success')
        // Redirigir después de mostrar éxito
        setTimeout(() => {
          router.push("/dashboard/clientes")
        }, 2000)
      } else if (result.integrationStatus === 'error') {
        setCreationState('error')
        setIntegrationError(result.integrationError)
      } else {
        // Cliente creado pero sin integración (Evolution API no disponible)
        setCreationState('success')
        setTimeout(() => {
          router.push("/dashboard/clientes")
        }, 2000)
      }
    },
    onError: (error) => {
      setCreationState('error')
      setError(error.message)
    }
  })

  const form = useForm<CreateClient>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: {
      name: "",
      description: "",
      email: "",
      address: "",
      city: "",
      cp: "",
      country: "",
    }
  })

  const onSubmit = (data: CreateClient) => {
    setError(null)
    setIntegrationError(null)
    setCreationState('creating_client')
    createClient.mutate(data)
  }

  const handleCancel = () => {
    setCreationState('idle')
    setError(null)
    setIntegrationError(null)
  }

  // 🆕 NUEVO: Mostrar loader durante la creación
  if (creationState !== 'idle') {
    return <ClientCreationLoader 
      state={creationState} 
      error={error} 
      integrationError={integrationError}
      onCancel={handleCancel}
    />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push("/dashboard/clientes")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Cliente</h1>
          <p className="text-gray-600">Crea un nuevo cliente en el sistema</p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
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
                  <Label htmlFor="name">Nombre del Cliente *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Nombre de la empresa"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="contacto@empresa.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Descripción del cliente"
                  rows={3}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Estado y Plan */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statusId">Estado *</Label>
                  <Select
                    value={form.watch("statusId")}
                    onValueChange={(value) => form.setValue("statusId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.statusId && (
                    <p className="text-sm text-red-500">{form.formState.errors.statusId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planId">Plan *</Label>
                  <Select
                    value={form.watch("planId")}
                    onValueChange={(value) => form.setValue("planId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.planId && (
                    <p className="text-sm text-red-500">{form.formState.errors.planId.message}</p>
                  )}
                </div>
              </div>
            </div>

            

            {/* Dirección */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dirección (Opcional)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="Dirección completa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="Ciudad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cp">Código Postal</Label>
                  <Input
                    id="cp"
                    {...form.register("cp")}
                    placeholder="CP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    {...form.register("country")}
                    placeholder="País"
                  />
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/clientes")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Crear Cliente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
