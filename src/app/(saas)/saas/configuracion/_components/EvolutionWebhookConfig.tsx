"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Webhook, 
  Settings,
  TestTube,
  Copy
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import { EvolutionWebhookEvent } from "@/services/evolution-api-types"

interface EvolutionWebhookConfigProps {
  instanceId: string
  instanceName: string
  clientId?: string
  isOpen: boolean
  onClose: () => void
}

interface WebhookFormData {
  name: string
  url: string
  events: EvolutionWebhookEvent[]
  enabled: boolean
  headers: Record<string, unknown>
  secret: string
}

const AVAILABLE_EVENTS = [
  // Eventos de Mensajería (prioritarios)
  { value: EvolutionWebhookEvent.MESSAGES_UPSERT, label: "Mensajes nuevos", description: "Cuando se recibe un mensaje nuevo" },
  { value: EvolutionWebhookEvent.MESSAGES_SET, label: "Mensajes establecidos", description: "Mensajes establecidos en el chat" },
  { value: EvolutionWebhookEvent.MESSAGES_UPDATE, label: "Mensajes actualizados", description: "Actualizaciones de mensajes existentes" },
  { value: EvolutionWebhookEvent.MESSAGES_DELETE, label: "Mensajes eliminados", description: "Mensajes que han sido eliminados" },
  { value: EvolutionWebhookEvent.SEND_MESSAGE, label: "Mensaje enviado", description: "Confirmación de mensaje enviado" },
  
  // Eventos de Conexión
  { value: EvolutionWebhookEvent.CONNECTION_UPDATE, label: "Estado de conexión", description: "Cambios en el estado de WhatsApp" },
  { value: EvolutionWebhookEvent.QRCODE_UPDATED, label: "QR actualizado", description: "Nuevo código QR generado" },
  { value: EvolutionWebhookEvent.APPLICATION_STARTUP, label: "Inicio de aplicación", description: "Aplicación iniciada" },
  
  // Eventos de Contactos
  { value: EvolutionWebhookEvent.CONTACTS_UPSERT, label: "Contactos", description: "Nuevos contactos o actualizaciones" },
  { value: EvolutionWebhookEvent.CONTACTS_SET, label: "Contactos establecidos", description: "Contactos establecidos" },
  { value: EvolutionWebhookEvent.CONTACTS_UPDATE, label: "Contactos actualizados", description: "Actualizaciones de contactos" },
  { value: EvolutionWebhookEvent.PRESENCE_UPDATE, label: "Presencia", description: "Cambios en el estado de presencia" },
  
  // Eventos de Chats
  { value: EvolutionWebhookEvent.CHATS_UPSERT, label: "Chats nuevos", description: "Nuevos chats creados" },
  { value: EvolutionWebhookEvent.CHATS_SET, label: "Chats establecidos", description: "Chats establecidos" },
  { value: EvolutionWebhookEvent.CHATS_UPDATE, label: "Chats actualizados", description: "Actualizaciones de chats" },
  { value: EvolutionWebhookEvent.CHATS_DELETE, label: "Chats eliminados", description: "Chats eliminados" },
  
  // Eventos de Grupos
  { value: EvolutionWebhookEvent.GROUPS_UPSERT, label: "Grupos nuevos", description: "Nuevos grupos creados" },
  { value: EvolutionWebhookEvent.GROUP_UPDATE, label: "Grupos actualizados", description: "Actualizaciones de grupos" },
  { value: EvolutionWebhookEvent.GROUP_PARTICIPANTS_UPDATE, label: "Participantes", description: "Cambios en participantes del grupo" },
  
  // Eventos adicionales
  { value: EvolutionWebhookEvent.CALL, label: "Llamadas", description: "Eventos de llamadas" },
  { value: EvolutionWebhookEvent.TYPEBOT_START, label: "Inicio de Typebot", description: "Inicio de flujo de Typebot" },
  { value: EvolutionWebhookEvent.TYPEBOT_CHANGE_STATUS, label: "Estado de Typebot", description: "Cambios en estado de Typebot" },
  { value: EvolutionWebhookEvent.LABELS_EDIT, label: "Etiquetas editadas", description: "Cambios en etiquetas" },
  { value: EvolutionWebhookEvent.LABELS_ASSOCIATION, label: "Asociación de etiquetas", description: "Asociación de etiquetas" },
]

export function EvolutionWebhookConfig({ 
  instanceId: _instanceId, 
  instanceName, 
  clientId: propClientId, 
  isOpen, 
  onClose 
}: EvolutionWebhookConfigProps) {
  const { toast } = useToast()
  const { clientId: contextClientId, isLoading: clientLoading } = useClientContext()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<WebhookFormData>({
    name: "",
    url: "",
    events: [],
    enabled: true,
    headers: {},
    secret: ""
  })

  // Use context clientId if prop is not provided or empty
  const clientId = propClientId ?? contextClientId

  // Prefill default URL using encoded instance name
  useEffect(() => {
    if (!formData.url && typeof window !== 'undefined' && clientId && instanceName) {
      // SOLUCIÓN PROVISORIA: URL hardcodeada para evitar URLs incorrectas de deploys
      const defaultUrl = `https://aurelia-platform-preview.vercel.app/api/webhook/evolution/${clientId}/${encodeURIComponent(instanceName)}`
      setFormData(prev => ({ ...prev, url: defaultUrl }))
    }
  }, [clientId, instanceName, formData.url])

  // Query para obtener webhook actual de Evolution API
  const { data: currentWebhook, refetch } = api.integraciones.getInstanceWebhook.useQuery({
    clientId: clientId!,
    instanceName
  }, {
    enabled: isOpen && !!clientId && !clientLoading
  })

  // Mutations
  const setWebhookMutation = api.integraciones.setInstanceWebhook.useMutation({
    onSuccess: () => {
      toast({
        title: "Webhook configurado",
        description: "El webhook se ha configurado correctamente"
      })
      setFormData({
        name: "",
        url: "",
        events: [],
        enabled: true,
        headers: {},
        secret: ""
      })
      setShowForm(false)
      void refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const testWebhookMutation = api.integraciones.testInstanceWebhook.useMutation({
    onSuccess: (result) => {
      toast({
        title: result.ok ? "Webhook probado" : "Error en webhook",
        description: result.ok 
          ? `Webhook respondió correctamente (${result.ms}ms)`
          : `Error: ${result.error || 'Respuesta no válida'}`,
        variant: result.ok ? undefined : "destructive"
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleSetWebhook = async () => {
    if (!clientId) {
      toast({
        title: "Error",
        description: "No se pudo determinar el cliente",
        variant: "destructive"
      })
      return
    }

    if (!formData.url.trim()) {
      toast({
        title: "Error",
        description: "La URL del webhook es requerida",
        variant: "destructive"
      })
      return
    }

    if (formData.events.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un evento",
        variant: "destructive"
      })
      return
    }

    await setWebhookMutation.mutateAsync({
      clientId,
      instanceName,
      url: formData.url,
      events: formData.events
    })
  }

  const handleTestWebhook = async () => {
    if (!formData.url) return
    await testWebhookMutation.mutateAsync({
      clientId: clientId!,
      instanceName,
      url: formData.url
    })
  }

  const toggleEvent = (eventValue: EvolutionWebhookEvent) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue]
    }))
  }

  // Show loading state if clientId is not available
  if (clientLoading || !clientId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Webhook className="w-5 h-5" />
              <span>Configuración de Webhook</span>
            </DialogTitle>
            <DialogDescription>
              Configura webhook para la instancia <strong>{instanceName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando configuración...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Webhook className="w-5 h-5" />
            <span>Configuración de Webhook</span>
          </DialogTitle>
          <DialogDescription>
            Configura webhook para la instancia <strong>{instanceName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Webhook actual */}
          {currentWebhook && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Webhook Actual</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">URL:</span>
                    <span className="text-gray-600 break-all">{currentWebhook.url}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Estado:</span>
                    <Badge variant={currentWebhook.enabled ? "default" : "secondary"}>
                      {currentWebhook.enabled ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Eventos:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentWebhook.events?.map(event => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario de configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {currentWebhook ? "Actualizar Webhook" : "Configurar Webhook"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL del Webhook *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="webhookUrl"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://mi-servidor.com/webhook"
                    className="rounded-xl flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigator.clipboard.writeText(formData.url)}
                    className="rounded-xl"
                    disabled={!formData.url}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Eventos a Escuchar *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {AVAILABLE_EVENTS.map(event => (
                    <div key={event.value} className="flex items-center space-x-2">
                      <Switch
                        checked={formData.events.includes(event.value)}
                        onCheckedChange={() => toggleEvent(event.value)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{event.label}</div>
                        <div className="text-xs text-gray-500">{event.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSetWebhook}
                  disabled={setWebhookMutation.isPending || !formData.url.trim() || formData.events.length === 0}
                  className="flex-1 rounded-xl"
                >
                  {setWebhookMutation.isPending ? "Configurando..." : (currentWebhook ? "Actualizar Webhook" : "Configurar Webhook")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={testWebhookMutation.isPending || !formData.url.trim()}
                  className="rounded-xl"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testWebhookMutation.isPending ? "Probando..." : "Probar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
