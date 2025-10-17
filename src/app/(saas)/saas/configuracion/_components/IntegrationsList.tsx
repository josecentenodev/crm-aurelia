"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Bot, 
  MessageSquare, 
  Mail, 
  Phone,
  Settings,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import { useToast } from "@/hooks/use-toast"
import { EvolutionAPICard } from "./EvolutionAPICard"

export function IntegrationsList() {
  const { clientId } = useClientContext()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null)

  // Query para obtener integraciones disponibles
  const { data: integrationsData, refetch } = api.integraciones.getClientIntegrations.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  )

  const integrations = integrationsData?.integrations || []

  const activateIntegrationMutation = api.integraciones.activateIntegration.useMutation({
    onSuccess: () => {
      toast({
        title: "Integración activada",
        description: "La integración se ha activado correctamente"
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const deactivateIntegrationMutation = api.integraciones.deactivateIntegration.useMutation({
    onSuccess: () => {
      toast({
        title: "Integración desactivada",
        description: "La integración se ha desactivado correctamente"
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleToggleIntegration = async (type: string, isActive: boolean) => {
    if (!clientId) return

    setIsLoading(true)
    try {
      if (isActive) {
        await activateIntegrationMutation.mutateAsync({
          clientId,
          type: type as any,
          config: {}
        })
      } else {
        await deactivateIntegrationMutation.mutateAsync({
          clientId,
          type: type as any
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "EVOLUTION_API":
        return <Bot className="w-6 h-6" />
      case "WHATSAPP_BUSINESS":
        return <MessageSquare className="w-6 h-6" />
      case "TELEGRAM_BOT":
        return <Bot className="w-6 h-6" />
      case "EMAIL_SMTP":
        return <Mail className="w-6 h-6" />
      case "SMS_TWILIO":
        return <Phone className="w-6 h-6" />
      default:
        return <Settings className="w-6 h-6" />
    }
  }

  const getIntegrationName = (type: string) => {
    switch (type) {
      case "EVOLUTION_API":
        return "WhatsApp API"
      case "WHATSAPP_BUSINESS":
        return "WhatsApp Business"
      case "TELEGRAM_BOT":
        return "Telegram Bot"
      case "EMAIL_SMTP":
        return "Email SMTP"
      case "SMS_TWILIO":
        return "SMS Twilio"
      default:
        return "Integración con servicio externo"
    }
  }

  const getIntegrationDescription = (type: string) => {
    switch (type) {
      case "EVOLUTION_API":
        return "Conexión con WhatsApp API"
      case "WHATSAPP_BUSINESS":
        return "API oficial de WhatsApp Business"
      case "TELEGRAM_BOT":
        return "Bot de Telegram para mensajería"
      case "EMAIL_SMTP":
        return "Envío de emails a través de SMTP"
      case "SMS_TWILIO":
        return "Envío de SMS a través de Twilio"
      default:
        return "Integración con servicio externo"
    }
  }

  const getStatusIcon = (isActive: boolean, isAvailable: boolean) => {
    if (!isAvailable) {
      return <XCircle className="w-5 h-5 text-gray-400" />
    }
    return isActive ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertCircle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusText = (isActive: boolean, isAvailable: boolean) => {
    if (!isAvailable) return "No disponible"
    return isActive ? "Activa" : "Inactiva"
  }

  const getStatusColor = (isActive: boolean, isAvailable: boolean) => {
    if (!isAvailable) return "bg-gray-100 text-gray-600"
    return isActive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const toggleExpanded = (integrationId: string) => {
    setExpandedIntegration(expandedIntegration === integrationId ? null : integrationId)
  }

  if (!clientId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente no seleccionado</h3>
          <p className="text-gray-500 text-center">
            Selecciona un cliente para ver sus integraciones disponibles
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Integraciones</h2>
        <p className="text-gray-600">Gestiona las integraciones disponibles para tu cliente</p>
      </div>

      {/* Lista de Integraciones */}
      <div className="space-y-6">
        {integrations.map((integration) => {
          const isExpanded = expandedIntegration === integration.clientIntegration?.id
          const hasInstances = (integration.clientIntegration as any)?.evolutionApi?.instances?.length > 0
          const instanceCount = (integration.clientIntegration as any)?.evolutionApi?.instances?.length || 0

          return (
            <Card key={integration.type} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {getIntegrationIcon(integration.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {getIntegrationName(integration.type)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {getIntegrationDescription(integration.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("border-0 text-xs flex items-center gap-1", getStatusColor(integration.isActive, integration.isAvailable))}>
                      {getStatusIcon(integration.isActive, integration.isAvailable)}
                      {getStatusText(integration.isActive, integration.isAvailable)}
                    </Badge>
                    {integration.isAvailable && (
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={(checked) => handleToggleIntegration(integration.type, checked)}
                        disabled={isLoading}
                      />
                    )}
                    {/* Botón para expandir/contraer */}
                    {integration.isActive && integration.type === "EVOLUTION_API" && integration.clientIntegration && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpanded(integration.clientIntegration!.id)}
                        className="rounded-xl"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Información del plan */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Límite del plan:</span>
                      <span className="font-medium">{integration.maxInstances} instancias</span>
                    </div>
                    {Number(integration.costPerInstance) > 0 && (
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Costo por instancia:</span>
                        <span className="font-medium">${Number(integration.costPerInstance)}</span>
                      </div>
                    )}
                  </div>

                  {/* Estado actual */}
                  {integration.isActive && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Instancias activas:</span>
                        <span className="font-medium text-green-700">
                          {integration.currentInstances} / {integration.maxInstances}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contenido expandible para Evolution API */}
                  {integration.isActive && integration.type === "EVOLUTION_API" && isExpanded && integration.clientIntegration && (
                    <div className="border-t border-gray-200 pt-4">
                      <EvolutionAPICard 
                        integration={integration as any}
                        onUpdate={refetch}
                      />
                    </div>
                  )}

                  {/* Mensaje si no está disponible */}
                  {!integration.isAvailable && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Esta integración no está disponible para tu plan actual. 
                        Contacta a soporte para habilitarla.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Estado vacío */}
      {integrations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay integraciones disponibles</h3>
            <p className="text-gray-500 text-center mb-4">
              No se encontraron integraciones configuradas para este cliente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Función helper para combinar clases CSS
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
} 