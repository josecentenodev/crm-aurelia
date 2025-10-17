// Renombrado de WebhookConfigTab.tsx para mejor organización sin tabs
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Webhook, Save, TestTube, ChevronDown, ChevronUp, Copy } from "lucide-react"
import type { UIClientLite } from "@/lib/mappers/integrations"
import { EvolutionWebhookEvent } from "@/services/evolution-api-types"
import { api } from "@/trpc/react"

interface Props {
  client: UIClientLite
  instanceName: string
}

interface UIWebhookSub {
  id: string
  name: string | null
  url: string
  events: string[]
  enabled: boolean
}

export function WebhookConfigSection({ client, instanceName }: Props) {
  const utils = api.useUtils()
  const list = api.integraciones.getInstanceWebhook.useQuery({ clientId: client.id, instanceName })
  
  const setWebhook = api.integraciones.setInstanceWebhook.useMutation({
    onSuccess: () => { 
      void utils.integraciones.getInstanceWebhook.invalidate()
    }
  })
  const test = api.integraciones.testInstanceWebhook.useMutation()

  const [name, setName] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<EvolutionWebhookEvent[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Prefill default URL (advanced) using encoded instance name
  useEffect(() => {
    if (!webhookUrl && typeof window !== 'undefined') {
      // SOLUCIÓN PROVISORIA: URL hardcodeada para evitar URLs incorrectas de deploys
      const def = `https://aurelia-platform-preview.vercel.app/api/webhook/evolution/${client.id}/${encodeURIComponent(instanceName)}`
      setWebhookUrl(def)
    }
  }, [client.id, instanceName, webhookUrl])

  const availableEvents = [
    // Eventos de Mensajería (prioritarios)
    { id: EvolutionWebhookEvent.MESSAGES_UPSERT, label: "Mensajes nuevos", description: "Se recibe un mensaje nuevo" },
    { id: EvolutionWebhookEvent.MESSAGES_SET, label: "Mensajes establecidos", description: "Mensajes establecidos en el chat" },
    { id: EvolutionWebhookEvent.MESSAGES_UPDATE, label: "Mensajes actualizados", description: "Actualizaciones de mensajes existentes" },
    { id: EvolutionWebhookEvent.MESSAGES_DELETE, label: "Mensajes eliminados", description: "Mensajes que han sido eliminados" },
    { id: EvolutionWebhookEvent.SEND_MESSAGE, label: "Mensaje enviado", description: "Confirmación de mensaje enviado" },
    
    // Eventos de Conexión
    { id: EvolutionWebhookEvent.CONNECTION_UPDATE, label: "Estado de conexión", description: "Cambios en el estado de WhatsApp" },
    { id: EvolutionWebhookEvent.QRCODE_UPDATED, label: "QR actualizado", description: "Nuevo código QR generado" },
    { id: EvolutionWebhookEvent.APPLICATION_STARTUP, label: "Inicio de aplicación", description: "Aplicación iniciada" },
    
    // Eventos de Contactos
    { id: EvolutionWebhookEvent.CONTACTS_UPSERT, label: "Contactos", description: "Nuevos contactos o actualizaciones" },
    { id: EvolutionWebhookEvent.CONTACTS_SET, label: "Contactos establecidos", description: "Contactos establecidos" },
    { id: EvolutionWebhookEvent.CONTACTS_UPDATE, label: "Contactos actualizados", description: "Actualizaciones de contactos" },
    { id: EvolutionWebhookEvent.PRESENCE_UPDATE, label: "Presencia", description: "Cambios en el estado de presencia" },
    
    // Eventos de Chats
    { id: EvolutionWebhookEvent.CHATS_UPSERT, label: "Chats nuevos", description: "Nuevos chats creados" },
    { id: EvolutionWebhookEvent.CHATS_SET, label: "Chats establecidos", description: "Chats establecidos" },
    { id: EvolutionWebhookEvent.CHATS_UPDATE, label: "Chats actualizados", description: "Actualizaciones de chats" },
    { id: EvolutionWebhookEvent.CHATS_DELETE, label: "Chats eliminados", description: "Chats eliminados" },
    
    // Eventos de Grupos
    { id: EvolutionWebhookEvent.GROUPS_UPSERT, label: "Grupos nuevos", description: "Nuevos grupos creados" },
    { id: EvolutionWebhookEvent.GROUP_UPDATE, label: "Grupos actualizados", description: "Actualizaciones de grupos" },
    { id: EvolutionWebhookEvent.GROUP_PARTICIPANTS_UPDATE, label: "Participantes", description: "Cambios en participantes del grupo" },
    
    // Eventos adicionales
    { id: EvolutionWebhookEvent.CALL, label: "Llamadas", description: "Eventos de llamadas" },
    { id: EvolutionWebhookEvent.TYPEBOT_START, label: "Inicio de Typebot", description: "Inicio de flujo de Typebot" },
    { id: EvolutionWebhookEvent.TYPEBOT_CHANGE_STATUS, label: "Estado de Typebot", description: "Cambios en estado de Typebot" },
    { id: EvolutionWebhookEvent.LABELS_EDIT, label: "Etiquetas editadas", description: "Cambios en etiquetas" },
    { id: EvolutionWebhookEvent.LABELS_ASSOCIATION, label: "Asociación de etiquetas", description: "Asociación de etiquetas" },
  ]

  const toggleEvent = (eventId: EvolutionWebhookEvent) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleSave = async () => {
    if (!webhookUrl || selectedEvents.length === 0) return
    await setWebhook.mutateAsync({
      clientId: client.id,
      instanceName,
      url: webhookUrl,
      events: selectedEvents
    })
    setName("")
    setWebhookUrl("")
    setSelectedEvents([])
  }

  const handleTest = async () => {
    if (!webhookUrl) return
    await test.mutateAsync({
      clientId: client.id,
      instanceName,
      url: webhookUrl
    })
  }

  return (
    <div className="space-y-6">
      {/* Webhook Actual en WhatsApp API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Webhook className="w-5 h-5 text-green-600" />
            <span>Webhook Actual en WhatsApp API</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {list.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span className="text-sm text-gray-600">Cargando configuración actual...</span>
            </div>
          ) : list.data ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">URL:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {list.data.url}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Estado:</span>
                <Badge variant={list.data.enabled ? "default" : "secondary"}>
                  {list.data.enabled ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Eventos:</span>
                <div className="flex flex-wrap gap-1">
                  {list.data.events?.map((event, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Webhook className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">No hay webhook configurado en WhatsApp API</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Webhook className="w-5 h-5 text-indigo-600" />
              <span>Nueva suscripción de webhook</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Advanced options (prefilled) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opciones avanzadas</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAdvanced(v => !v)}>
                    {showAdvanced ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                    {showAdvanced ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                {!showAdvanced && (
                  <div className="text-xs text-gray-500">
                    URL por defecto: <span className="font-mono break-all">{`https://aurelia-platform-preview.vercel.app/api/webhook/evolution/${client.id}/${encodeURIComponent(instanceName)}`}</span>
                  </div>
                )}
                {showAdvanced && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Nombre (opcional)</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="ej: CRM, DataLake, Auditoría"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="webhookUrl">URL del Webhook</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          id="webhookUrl"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://tu-servidor.com/webhook"
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={() => { navigator.clipboard.writeText(webhookUrl) }}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleTest} disabled={!webhookUrl}>
                  <TestTube className="w-4 h-4 mr-2" />
                  Probar
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleSave}
                  disabled={!webhookUrl || selectedEvents.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eventos a Recibir */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos a Recibir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEvents.includes(event.id)
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleEvent(event.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.label}</h4>
                      <p className="text-sm text-gray-500">{event.description}</p>
                    </div>
                    {selectedEvents.includes(event.id) && (
                      <Badge variant="default" className="bg-indigo-100 text-indigo-800">
                        Activo
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de suscripciones configuradas */}
      <Card>
        <CardHeader>
          <CardTitle>Suscripciones configuradas ({list.data?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {list.isLoading ? (
            <p className="text-sm text-gray-500">Cargando…</p>
          ) : (list.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500">No hay webhooks configurados.</p>
          ) : (
            <div className="space-y-2">
              {list.data!.map((wh: UIWebhookSub) => (
                <div key={wh.id} className="p-3 border rounded-md flex items-center justify-between">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium truncate">{wh.name ?? '(sin nombre)'}</p>
                    <p className="text-xs text-gray-500 truncate">{wh.url}</p>
                    <p className="text-[11px] text-gray-400 truncate">Eventos: {wh.events.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={wh.enabled ? 'default' : 'secondary'}>{wh.enabled ? 'Activo' : 'Inactivo'}</Badge>
                    <Button variant="outline" size="sm" onClick={() => test.mutate({ id: wh.id })}>
                      <TestTube className="w-3 h-3 mr-1" />Test
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => update.mutate({ id: wh.id, enabled: !wh.enabled })}>
                      {wh.enabled ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove.mutate({ id: wh.id })}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
