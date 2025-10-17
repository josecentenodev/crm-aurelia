"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  Settings,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  Plus
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface IntegrationsListProps {
  integrations: Array<{
    id: string
    type: string
    name: string
    description?: string | null
    icon?: string | null
    isActive: boolean
    isConfigurable: boolean
    backendUrl?: string | null
    apiKey?: string | null
    createdAt: Date
    updatedAt: Date
  }>
  clients: Array<{
    id: string
    name: string
    description?: string | null
    email?: string | null
    status: {
      id: string
      name: string
    }
    plan: {
      id: string
      name: string
    }
  }>
}

export function IntegrationsList({ integrations, clients }: IntegrationsListProps) {
  const { toast } = useToast()
  const utils = api.useUtils()
  const [isCreating, setIsCreating] = useState(false)

  // Filtrar solo Evolution API
  const evolutionApiIntegrations = integrations.filter(i => i.type === "EVOLUTION_API")

  // Mutation para crear integración global
  const createIntegrationMutation = api.integraciones.createGlobal.useMutation({
    onSuccess: () => {
      toast({
        title: "Integración creada",
        description: "WhatsApp API ha sido configurada correctamente",
      })
      // Refetch the data
      void utils.integraciones.listGlobal.invalidate()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleCreateIntegration = async () => {
    setIsCreating(true)
    try {
      await createIntegrationMutation.mutateAsync({
        type: "EVOLUTION_API",
        name: "WhatsApp API",
        description: "Conecta con WhatsApp a través de WhatsApp API",
        isActive: true,
        isConfigurable: true
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "EVOLUTION_API":
        return <MessageSquare className="w-6 h-6" />
      default:
        return <Settings className="w-6 h-6" />
    }
  }

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case "EVOLUTION_API":
        return "bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 border-green-200"
      default:
        return "bg-gradient-to-br from-gray-100 to-slate-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp API</h2>
          <p className="text-gray-600 mt-1">
            Gestiona la integración de WhatsApp API para WhatsApp
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {evolutionApiIntegrations.length} integración{evolutionApiIntegrations.length !== 1 ? 'es' : ''} disponible{evolutionApiIntegrations.length !== 1 ? 's' : ''}
            </span>
          </div>
          {evolutionApiIntegrations.length === 0 && (
            <Button
              onClick={handleCreateIntegration}
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Crear WhatsApp API
            </Button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {evolutionApiIntegrations.map((integration) => (
          <Card 
            key={integration.id} 
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-200 hover:border-green-300 bg-gradient-to-br from-white to-gray-50"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-3 rounded-xl shadow-sm ${getIntegrationColor(integration.type)} group-hover:shadow-md transition-shadow`}>
                    {getIntegrationIcon(integration.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                      {integration.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {integration.description ?? "Integración de WhatsApp Business API"}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Status Indicator */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${integration.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {integration.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  <Badge 
                    variant={integration.isActive ? "default" : "secondary"}
                    className={`px-4 py-2 text-sm font-medium ${
                      integration.isActive 
                        ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {integration.isActive ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>
                        {integration.isActive ? "Disponible" : "No disponible"}
                      </span>
                    </div>
                  </Badge>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100">
                  <Link href={`/dashboard/integraciones/${integration.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Gestionar WhatsApp API
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {evolutionApiIntegrations.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <div className="relative mx-auto w-16 h-16 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full opacity-50" />
                <MessageSquare className="absolute inset-0 w-8 h-8 m-auto text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">WhatsApp API no configurada</p>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                WhatsApp API aparecerá aquí una vez que sea configurada. 
                Esta integración te permitirá conectar WhatsApp Business API.
              </p>
              <Button
                onClick={handleCreateIntegration}
                disabled={isCreating}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                {isCreating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Crear WhatsApp API
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
