"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Users, 
  MessageSquare,
  ArrowRight,
  Activity,
  Zap
} from "lucide-react"

import { ConfigurationTab } from "./ConfigurationTab"
import { ClientsTab } from "./ClientsTab"

interface EvolutionApiIntegrationProps {
  integration: {
    id: string
    type: string
    name: string
    description?: string
    icon?: string
    isActive: boolean
    isConfigurable: boolean
    backendUrl?: string
    apiKey?: string
  }
  clients: Array<{
    id: string
    name: string
    statusId: string
  }>
}

export function EvolutionApiIntegration({ integration, clients }: EvolutionApiIntegrationProps) {
  // Calcular estado y métricas
  const systemStatus = useMemo(() => {
    const hasConfiguration = Boolean(integration.backendUrl && integration.apiKey)
    const isSystemActive = integration.isActive
    const totalClients = clients.length
    
    let completionPercentage = 0
    if (hasConfiguration) completionPercentage += 50
    if (isSystemActive) completionPercentage += 30
    if (totalClients > 0) completionPercentage += 20

    return {
      hasConfiguration,
      isSystemActive,
      totalClients,
      completionPercentage,
      statusLevel: completionPercentage >= 80 ? 'success' : 
                   completionPercentage >= 50 ? 'warning' : 'error'
    }
  }, [integration, clients])

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'warning': return <AlertCircle className="w-5 h-5" />
      case 'error': return <AlertCircle className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <Card className={`border-2 ${getStatusColor(systemStatus.statusLevel)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(systemStatus.statusLevel)}
              <div>
                <CardTitle className="text-lg">Estado del Sistema</CardTitle>
                <p className="text-sm opacity-90">
                  Configuración {systemStatus.completionPercentage}% completa
                </p>
              </div>
            </div>
            <Badge variant={systemStatus.isSystemActive ? "default" : "secondary"}>
              {systemStatus.isSystemActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={systemStatus.completionPercentage} className="h-2" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50">
              <div className={`p-2 rounded-lg ${systemStatus.hasConfiguration ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Configuración</p>
                <p className="text-sm opacity-75">
                  {systemStatus.hasConfiguration ? 'Completa' : 'Pendiente'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50">
              <div className={`p-2 rounded-lg ${systemStatus.isSystemActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Sistema</p>
                <p className="text-sm opacity-75">
                  {systemStatus.isSystemActive ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50">
              <div className={`p-2 rounded-lg ${systemStatus.totalClients > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Clientes</p>
                <p className="text-sm opacity-75">
                  {systemStatus.totalClients} configurados
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Flow */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Step 1: Global Configuration */}
        <Card className="relative">
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Configuración Global</CardTitle>
                  <p className="text-sm text-gray-600">
                    Configura la conexión con WhatsApp API
                  </p>
                </div>
              </div>
              {systemStatus.hasConfiguration && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Step 2: Client Management */}
        <Card className="relative">
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            2
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Gestión de Clientes</CardTitle>
                  <p className="text-sm text-gray-600">
                    Habilita clientes y configura instancias WhatsApp
                  </p>
                </div>
              </div>
              {systemStatus.totalClients > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{systemStatus.totalClients}</Badge>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Flow Arrow */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <ArrowRight className="w-5 h-5" />
          <span className="text-sm">Flujo de configuración</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* Detailed Configuration Section */}
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración Detallada</h2>
              <p className="text-gray-600">
                Configura los parámetros de conexión y prueba la comunicación con WhatsApp API
              </p>
            </div>
          </div>
          
          <ConfigurationTab integration={integration} />
        </div>

        {/* Clients Management Section */}
        {(systemStatus.hasConfiguration && systemStatus.isSystemActive) ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-600 text-white rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gestión de Clientes</h2>
                <p className="text-gray-600">
                  Gestiona qué clientes tienen WhatsApp API habilitada y configura sus instancias WhatsApp
                </p>
              </div>
            </div>
            
            <ClientsTab
              integrationId={integration.id}
              integrationType={integration.type}
              clients={clients}
            />
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Completa la configuración global
              </h3>
              <p className="text-gray-500">
                {!systemStatus.hasConfiguration 
                  ? "Configura la URL del backend y la API key para WhatsApp API para continuar"
                  : "Activa el sistema para gestionar clientes"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
