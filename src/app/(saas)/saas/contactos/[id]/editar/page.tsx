"use client"
import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save, User, Tag, X, Plus } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import { useContactosProvider } from "@/providers/ContactosProvider"
import type { UpdateContact, ContactChannel, ContactStatus } from "@/domain/Contactos"
import { CONTACT_CHANNELS, CONTACT_SOURCES, CONTACT_STATUSES } from "@/domain/Contactos"

interface FormData {
  name: string
  email: string
  phone: string
  message: string
  channel: string
  source: string
  status: string
  tags: string[]
  notes: string
}

export default function EditarContactoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { clientId } = useClientContext()
  const contactId = params.id as string
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")

  const { data: contacto, isLoading, error: fetchError } = api.contactos.byId.useQuery(
    { id: contactId },
    { enabled: !!contactId }
  )

  const { updateContacto, isUpdatingContacto } = useContactosProvider()

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      channel: "WHATSAPP",
      source: "",
      status: "NUEVO",
      tags: [],
      notes: "",
    }
  })

  // Actualizar formulario cuando se carga el contacto
  useEffect(() => {
    if (contacto) {
      form.reset({
        name: contacto.name ?? "",
        email: contacto.email ?? "",
        phone: contacto.phone ?? "",
        message: contacto.message ?? "",
        channel: contacto.channel ?? "WHATSAPP",
        source: contacto.source ?? "",
        status: contacto.status ?? "NUEVO",
        tags: contacto.tags ?? [],
        notes: contacto.notes ?? "",
      })
    }
  }, [contacto, form])

  const onSubmit = async (data: FormData) => {
    if (!clientId) {
      setError("No se ha seleccionado un cliente")
      return
    }

    setError(null)
    
    const contactData: UpdateContact & { id: string } = {
      id: contactId,
      name: data.name.trim(),
      email: data.email.trim() || null,
      phone: data.phone.trim() || null,
      message: data.message.trim() || null,
      channel: data.channel as ContactChannel,
      source: data.source.trim() || null,
      status: data.status as ContactStatus,
      tags: data.tags,
      notes: data.notes.trim() || null,
    }

    try {
      await updateContacto(contactData)
      toast({
        title: "Contacto actualizado",
        description: "El contacto se ha actualizado exitosamente.",
      })
      router.push(`/saas/contactos/${contactId}`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setError(errorMessage)
    }
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

  if (fetchError || !contacto) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>
            {fetchError?.message ?? "No se pudo cargar el contacto"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/saas/contactos/${contactId}`)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Contacto</h1>
          <p className="text-gray-600 mt-1">Modifica la información del contacto</p>
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
            <User className="w-5 h-5 mr-2" />
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

            {/* Canal, Origen y Estado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={form.watch("status")} 
                    onValueChange={(value) => form.setValue("status", value)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
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
                onClick={() => router.push(`/saas/contactos/${contactId}`)}
                disabled={isUpdatingContacto}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingContacto}
                className="bg-violet-500 hover:bg-violet-600"
              >
                {isUpdatingContacto ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Actualizar Contacto
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