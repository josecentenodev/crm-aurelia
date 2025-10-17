"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bot, 
  MessageSquare, 
  Mail, 
  Phone,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils/client-utils"
import type { IntegrationCardProps } from "../types"
import { 
  getIntegrationStatusColor, 
  getIntegrationStatusText,
  getIntegrationTypeName,
  getIntegrationTypeDescription
} from "../utils"
import { EvolutionInstanceManager } from "../EvolutionInstanceManager"

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const [showInstanceManager, setShowInstanceManager] = useState(false)

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "EVOLUTION_API":
        return <Bot className="w-6 h-6 text-white" />
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

  const getStatusIcon = (isActive: boolean, isAvailable: boolean) => {
    if (!isAvailable) {
      return <XCircle className="w-5 h-5 text-gray-400" />
    }
    return isActive ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertCircle className="w-5 h-5 text-yellow-500" />
  }

  const handleManageInstances = () => {
    setShowInstanceManager(!showInstanceManager)
  }

  const canCreateInstances = integration.isActive && integration.isAvailable && 
    integration.currentInstances < integration.maxInstances

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              {getIntegrationIcon(integration.type)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {getIntegrationTypeName(integration.type)}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {getIntegrationTypeDescription(integration.type)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={cn("border-0 text-xs flex items-center gap-1", getIntegrationStatusColor(integration.isActive, integration.isAvailable))}>
              {getStatusIcon(integration.isActive, integration.isAvailable)}
              {getIntegrationStatusText(integration.isActive, integration.isAvailable)}
            </Badge>
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

          {/* Mensaje si no está disponible */}
          {!integration.isAvailable && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Esta integración no está disponible para tu plan actual. 
                Contacta a soporte para habilitarla.
              </p>
            </div>
          )}

          {/* Botón de gestión de instancias */}
          {integration.isActive && integration.isAvailable && (
            <div className="flex space-x-2">
              <Button
                onClick={handleManageInstances}
                className="flex-1 rounded-xl"
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showInstanceManager ? "Ocultar Instancias" : "Gestionar Instancias"}
                {showInstanceManager ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Gestión de instancias expandible */}
        {showInstanceManager && integration.isActive && integration.isAvailable && integration.type === "EVOLUTION_API" && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <EvolutionInstanceManager 
              integration={integration} 
              onUpdate={() => {
                // Refrescar datos si es necesario
                console.log('Instances updated')
              }} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}