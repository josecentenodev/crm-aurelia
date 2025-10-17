"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, MessageSquarePlus, Search, Phone, Mail } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import { useChatsSelectionStore } from "../../_store/chats-selection-store"
import { CONTACT_CHANNELS } from "@/domain/Contactos"
import { 
  CreateConversationFormSchema,
  CREATE_CONVERSATION_FORM_DEFAULTS,
  ContactChannel,
  type CreateConversationFormInput,
  type CreateConversationWithInstance
} from "@/domain/Conversaciones"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { AppRouter } from "@/server/api/root"

export function CreateConversationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { clientId } = useClientContext()
  const { setSelectedConversationId } = useChatsSelectionStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const utils = api.useUtils()

  const form = useForm<CreateConversationFormInput>({
    resolver: zodResolver(CreateConversationFormSchema),
    defaultValues: CREATE_CONVERSATION_FORM_DEFAULTS,
    mode: "onChange",
  })

  const { data: contacts = [], isLoading: isLoadingContacts } = api.contactos.list.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId, staleTime: 5 * 60 * 1000 }
  )

  const { data: instances = [], isLoading: isLoadingInstances } = api.conversaciones.getClientInstances.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId, staleTime: 5 * 60 * 1000 }
  )

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts
    const term = searchTerm.toLowerCase()
    return contacts.filter(contact => {
      const name = contact.name?.toLowerCase() ?? ""
      const email = contact.email?.toLowerCase() ?? ""
      const phone = contact.phone?.toLowerCase() ?? ""
      return name.includes(term) || email.includes(term) || phone.includes(term)
    })
  }, [contacts, searchTerm])

  const contactId = form.watch("contactId")
  const selectedContact = useMemo(() => {
    return contactId ? contacts.find(c => c.id === contactId) : null
  }, [contacts, contactId])

  useEffect(() => {
    if (isSelectOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isSelectOpen])

  const createConversationMutation = api.conversaciones.create.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.conversaciones.list.invalidate({ clientId: clientId!, filters: {} }),
        utils.conversaciones.byId.invalidate({ id: data.id })
      ])

      // Check if this is an existing conversation (by checking if it was just created)
      const isExistingConversation = data.createdAt && new Date().getTime() - new Date(data.createdAt).getTime() > 5000

      if (isExistingConversation) {
        toast({
          title: "Conversación existente encontrada",
          description: `Ya existe una conversación activa con ${data.contact?.name ?? 'este contacto'}. Te redirigiremos a ella.`,
        })
      } else {
        toast({
          title: "¡Conversación creada!",
          description: `La conversación con ${data.contact?.name ?? 'el contacto'} se ha creado exitosamente.`,
        })
      }

      // Set the conversation as selected in the store
      setSelectedConversationId(data.id)

      router.push('/saas/conversaciones')
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Error al crear conversación:", error)
      
      let errorMessage = "Ha ocurrido un error inesperado"
      let errorTitle = "Error al crear conversación"
      const errMsg = error.message
      if (errMsg.includes("ya existe una conversación")) {
        errorTitle = "Conversación duplicada"
        errorMessage = "Ya existe una conversación activa con este contacto en el mismo canal."
      } else if (errMsg.includes("contacto no encontrado")) {
        errorTitle = "Contacto no encontrado"
        errorMessage = "El contacto seleccionado no existe o no tienes permisos para acceder."
      } else if (errMsg.includes("instancia no encontrada")) {
        errorTitle = "Instancia no encontrada"
        errorMessage = "La instancia de WhatsApp seleccionada no existe o no está disponible."
      } else {
        errorMessage = errMsg
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    }
  })

  const onSubmit = useCallback((formData: CreateConversationFormInput) => {
    if (!clientId) {
      toast({
        title: "Error de configuración",
        description: "No se ha seleccionado un cliente. Por favor, verifica tu sesión.",
        variant: "destructive",
      })
      return
    }
    
    const conversationData: CreateConversationWithInstance = {
      contactId: formData.contactId,
      type: formData.type,
      status: formData.status,
      channel: formData.channel,
      title: formData.title,
      isAiActive: formData.isAiActive,
      evolutionInstanceId: formData.evolutionInstanceId,
      initialMessage: formData.initialMessage,
      clientId,
      agentId: null,
      assignedUserId: null,
      channelInstance: null,
      metadata: null,
      isImportant: false,
      aiConversationId: null,
    }

    createConversationMutation.mutate(conversationData)
  }, [clientId, createConversationMutation, toast])

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/saas/conversaciones')}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Conversación</h1>
          <p className="text-gray-600 mt-1">Inicia una nueva conversación con un contacto</p>
        </div>
      </div>

      {/* Form */}
      <Card className="rounded-2xl shadow-sm border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center">
            <MessageSquarePlus className="w-5 h-5 mr-2" />
            Configuración de Conversación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Selección de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contacto *</h3>
              
              <div className="space-y-3">
                {/* Selector de contacto con búsqueda integrada */}
                <div className="space-y-2">
                  <Label htmlFor="contactId">Seleccionar Contacto</Label>
                  <Controller
                    name="contactId"
                    control={form.control}
                    render={({ field }) => (
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        onOpenChange={setIsSelectOpen}
                        disabled={isLoadingContacts}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={isLoadingContacts ? "Cargando contactos..." : "Seleccionar contacto"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {/* Búsqueda integrada */}
                          <div className="p-2 border-b">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                ref={searchInputRef}
                                placeholder="Buscar contacto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                }}
                                onBlur={(e) => {
                                  e.stopPropagation()
                                }}
                                onKeyDown={(e) => {
                                  e.stopPropagation()
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                  }
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation()
                                }}
                                className="pl-10 h-8 text-sm"
                                autoComplete="off"
                              />
                            </div>
                          </div>
                          
                          {/* Lista de contactos filtrados */}
                          {filteredContacts.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              {searchTerm ? "No se encontraron contactos" : "No hay contactos disponibles"}
                            </div>
                          ) : (
                            filteredContacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id} className="py-2">
                                <div className="flex items-center gap-3 w-full py-1">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-sm">
                                      {contact.name?.charAt(0).toUpperCase() ?? "?"}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm leading-tight">{contact.name}</div>
                                    <div className="text-xs text-gray-500 truncate leading-tight">
                                      {contact.email && <span>{contact.email}</span>}
                                      {contact.email && contact.phone && <span> • </span>}
                                      {contact.phone && <span>{contact.phone}</span>}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.contactId?.message && (
                    <p className="text-sm text-red-500">{form.formState.errors.contactId.message}</p>
                  )}
                </div>

                {/* Preview del contacto seleccionado - solo si hay uno seleccionado */}
                {selectedContact && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                          {selectedContact.name?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{selectedContact.name}</p>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {selectedContact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {selectedContact.email}
                            </div>
                          )}
                          {selectedContact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {selectedContact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configuración de Canal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Canal y Configuración</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="channel">Canal *</Label>
                  <Controller
                    name="channel"
                    control={form.control}
                    render={({ field }) => (
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => field.onChange(value as ContactChannel)}
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
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evolutionInstanceId">Instancia de WhatsApp</Label>
                  <Controller
                    name="evolutionInstanceId"
                    control={form.control}
                    render={({ field }) => (
                      <Select 
                        value={field.value ?? "none"} 
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        disabled={isLoadingInstances || form.watch("channel") !== ContactChannel.WHATSAPP}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={isLoadingInstances ? "Cargando instancias..." : "Seleccionar instancia (opcional)"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin instancia específica</SelectItem>
                          {instances.map((instance) => (
                            <SelectItem key={instance.id} value={instance.id}>
                              {instance.instanceName}
                              {instance.phoneNumber && ` (${instance.phoneNumber})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.watch("channel") !== ContactChannel.WHATSAPP && (
                    <p className="text-xs text-gray-500">Solo disponible para WhatsApp</p>
                  )}
                </div>
              </div>
            </div>

            {/* Opciones Adicionales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Opciones Adicionales</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la conversación (opcional)</Label>
                  <Controller
                    name="title"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="title"
                        placeholder="Ej: Consulta sobre producto X"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        className="rounded-xl"
                      />
                    )}
                  />
                  <p className="text-xs text-gray-500">
                    Deja en blanco para usar el nombre del contacto
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialMessage">Mensaje inicial (opcional)</Label>
                  <Controller
                    name="initialMessage"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        id="initialMessage"
                        placeholder="Mensaje de bienvenida o contexto inicial..."
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || undefined)}
                        className="rounded-xl min-h-[100px]"
                      />
                    )}
                  />
                  <p className="text-xs text-gray-500">
                    Este mensaje se enviará automáticamente al crear la conversación
                  </p>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <Controller
                    name="isAiActive"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id="isAiActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="flex-1">
                    <Label htmlFor="isAiActive" className="font-normal cursor-pointer text-sm">
                      Activar IA automática para esta conversación
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      La IA responderá automáticamente a los mensajes del contacto
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/saas/conversaciones")}
                disabled={createConversationMutation.isPending}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createConversationMutation.isPending || !form.formState.isValid}
                className="bg-violet-500 hover:bg-violet-600 rounded-xl"
              >
                {createConversationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Conversación
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
