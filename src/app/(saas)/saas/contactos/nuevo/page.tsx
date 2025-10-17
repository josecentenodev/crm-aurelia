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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save, UserPlus, Tag, X, Plus } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import type { CreateContact } from "@/domain/Contactos"
import { CONTACT_CHANNELS, CONTACT_SOURCES } from "@/domain/Contactos"

interface FormData {
  name: string
  email: string
  phone: string
  message: string
  channel: string
  source: string
  tags: string[]
  notes: string
}

export default function NuevoContactoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { clientId } = useClientContext()
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")

  // Utils para invalidar cache
  const utils = api.useUtils()

  const createContactMutation = api.contactos.create.useMutation({
    onSuccess: async (data) => {
      // Invalidar todos los endpoints de contactos para actualizar la UI
      await Promise.all([
        utils.contactos.list.invalidate(),
        utils.contactos.stats.invalidate()
      ])
      
      toast({
        title: "¡Contacto creado!",
        description: `${data.name} se ha agregado exitosamente a tu base de contactos.`,
        variant: "success"
      })
      
      // Navegar de vuelta a la lista
      router.push("/saas/contactos")
    },
    onError: (error: any) => {
      console.error("Error al crear contacto:", error)
      
      let errorMessage = "Ha ocurrido un error inesperado"
      let errorTitle = "Error al crear contacto"
      
      // Manejo específico de errores tRPC
      if (error.message) {
        if (error.message.includes("email ya está registrado")) {
          errorTitle = "Email duplicado"
          errorMessage = "Ya existe un contacto con este email. Por favor, usa un email diferente."
        } else if (error.message.includes("nombre es requerido")) {
          errorTitle = "Campo requerido"
          errorMessage = "El nombre del contacto es obligatorio."
        } else if (error.message.includes("cliente especificado no existe")) {
          errorTitle = "Error de configuración"
          errorMessage = "No se pudo verificar la información del cliente. Por favor, intenta nuevamente."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
      
      setError(errorMessage)
    }
  })

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      channel: "WHATSAPP",
      source: "",
      tags: [],
      notes: "",
    }
  })

  const onSubmit = (data: FormData) => {
    if (!clientId) {
      const errorMsg = "No se ha seleccionado un cliente. Por favor, verifica tu sesión."
      setError(errorMsg)
      toast({
        title: "Error de configuración",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    // Limpiar errores previos
    setError(null)
    
    // Validaciones adicionales
    if (!data.name.trim()) {
      const errorMsg = "El nombre del contacto es obligatorio"
      setError(errorMsg)
      toast({
        title: "Campo requerido",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    // Validar email si se proporciona
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      const errorMsg = "Por favor, ingresa un email válido"
      setError(errorMsg)
      toast({
        title: "Email inválido",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }
    
    const contactData: CreateContact = {
      name: data.name.trim(),
      email: data.email.trim() || null,
      phone: data.phone.trim() || null,
      message: data.message.trim() || null,
      channel: data.channel as any,
      source: data.source.trim() || null,
      tags: data.tags.filter(tag => tag.trim().length > 0), // Filtrar tags vacíos
      notes: data.notes.trim() || null,
      clientId,
    }

    createContactMutation.mutate(contactData)
  }

  const addTag = () => {
    if (newTag.trim() && !form.watch("tags").includes(newTag.trim())) {
      form.setValue("tags", [...form.watch("tags"), newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", form.watch("tags").filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/saas/contactos')}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Contacto</h1>
          <p className="text-gray-600 mt-1">Agrega un nuevo contacto a tu base de datos</p>
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
            Información del Contacto
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@empresa.com"
                      {...form.register("email")}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="+54 9 11 1234-5678"
                      {...form.register("phone")}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Mensaje inicial del contacto..."
                    {...form.register("message")}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Canal y Origen */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Canal y Origen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="channel">Canal *</Label>
                  <Select 
                    value={form.watch("channel")} 
                    onValueChange={(value) => form.setValue("channel", value)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_CHANNELS.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Origen</Label>
                  <Select 
                    value={form.watch("source")} 
                    onValueChange={(value) => form.setValue("source", value)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Etiquetas</h3>
              
              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Agregar etiqueta"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 rounded-xl"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline" className="rounded-xl">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch("tags").map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)} 
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notas</h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Información adicional sobre el contacto..."
                  {...form.register("notes")}
                  className="rounded-xl min-h-[80px]"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/saas/contactos")}
                disabled={createContactMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createContactMutation.isPending}
                className="bg-violet-500 hover:bg-violet-600"
              >
                {createContactMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Contacto
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