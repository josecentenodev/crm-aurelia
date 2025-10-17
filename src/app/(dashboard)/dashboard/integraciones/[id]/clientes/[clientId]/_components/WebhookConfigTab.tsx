"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Webhook, Save, TestTube, Copy } from "lucide-react"
import type { UIGlobalIntegration, UIClientLite } from "@/lib/mappers/integrations"
import { EvolutionWebhookEvent } from "@/services/evolution-api-types"

interface Props {
  client: UIClientLite
  integration: UIGlobalIntegration
}

export function WebhookConfigTab({ client, integration }: Props) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<EvolutionWebhookEvent[]>([])

  const availableEvents = [
    { id: EvolutionWebhookEvent.MESSAGES_UPSERT, label: "Mensajes nuevos", description: "Se recibe un mensaje" },
    { id: EvolutionWebhookEvent.CONNECTION_UPDATE, label: "Estado de conexión", description: "Cambios en el estado de WhatsApp" },
    { id: EvolutionWebhookEvent.QRCODE_UPDATED, label: "QR actualizado", description: "Nuevo código QR generado" },
    { id: EvolutionWebhookEvent.CONTACTS_UPSERT, label: "Contactos", description: "Actualizaciones de contactos" },
    { id: EvolutionWebhookEvent.GROUPS_UPSERT, label: "Grupos", description: "Cambios en grupos" },
  ]

  const toggleEvent = (eventId: EvolutionWebhookEvent) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Webhook className="w-5 h-5 text-indigo-600" />
            <span>Configuración de Webhook</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Webhook habilitado</Label>
              <p className="text-sm text-gray-500">Recibir eventos en tiempo real</p>
            </div>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>

          {isEnabled && (
            <>
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
                  <Button variant="outline" size="sm">
                    <TestTube className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Eventos a recibir</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline">
              <TestTube className="w-4 h-4 mr-2" />
              Probar Webhook
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payload de Ejemplo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`{
  "event": "messages.upsert",
  "instanceId": "ventas",
  "data": {
    "key": {
      "remoteJid": "5491123456789@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C1F87B2"
    },
    "message": {
      "conversation": "Hola, necesito ayuda"
    },
    "messageTimestamp": 1703123456,
    "status": "RECEIVED"
  }
}`}
            </pre>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-2 right-2"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
