// Server component: página dedicada de configuración WhatsApp API por cliente
import { notFound } from "next/navigation"
import Link from "next/link"
import { api as rsc } from "@/trpc/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Settings, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Users,
  Activity
} from "lucide-react"
import { ClientEvolutionApiConfig } from "./_components/ClientEvolutionApiConfig"
import type { GlobalIntegration } from "@/domain"
import { mapGlobalIntegrationToUI, mapClientToLiteUI } from "@/lib/mappers/integrations"
import type { RouterOutputs } from "@/trpc/react"

interface Props {
  params: Promise<{ id: string; clientId: string }>
}

export default async function ClientIntegrationPage({ params }: Props) {
  const { id, clientId } = await params
  const [integration, clientsResp, clientIntegrationsResp] = await Promise.all([
    rsc.integraciones.getGlobalById({ id }).catch(() => null),
    rsc.clientes.list().catch(() => null),
    rsc.integraciones.getClientIntegrations({ clientId }).catch(() => ({ integrations: [] })),
  ])

  if (!integration || integration.type !== "EVOLUTION_API") {
    notFound()
  }

  const clients = clientsResp?.clients ?? []
  const client = clients.find(c => c.id === clientId)
  
  if (!client) {
    notFound()
  }

  const normalizedIntegration = mapGlobalIntegrationToUI(integration as GlobalIntegration)
  const uiClient = mapClientToLiteUI({ id: client.id, name: client.name, status: { id: client.status.id } })
  
  // Extraer el array de integraciones del objeto de respuesta
  const clientIntegrations = clientIntegrationsResp?.integrations ?? []
  
  // Calcular estado específico del cliente
  const clientEvolutionApi = clientIntegrations.find((ci: RouterOutputs["integraciones"]["getClientIntegrations"]["integrations"][number]) => ci.type === "EVOLUTION_API")
  const isClientActive = clientEvolutionApi?.isActive ?? false
  
  // Calcular progreso del setup
  const setupSteps = {
    globalConfigured: Boolean(integration.backendUrl && integration.apiKey),
    globalActive: integration.isActive,
    clientActivated: isClientActive,
    containerDeployed: Boolean(clientEvolutionApi), // Simplificado para el ejemplo
  }
  
  const getClientStatus = () => {
    if (!setupSteps.globalConfigured || !setupSteps.globalActive) return 'blocked'
    if (!setupSteps.clientActivated) return 'pending'
    if (setupSteps.containerDeployed) return 'active'
    return 'configuring'
  }
  
  const clientStatus = getClientStatus()
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <CheckCircle className="w-5 h-5" />,
          label: 'Cliente Activo',
          description: 'Whatsapp API configurada y funcionando'
        }
      case 'configuring':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <Settings className="w-5 h-5" />,
          label: 'En Configuración',
          description: 'Completando configuración del cliente'
        }
      case 'pending':
        return {
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Pendiente de Activación',
          description: 'Cliente listo para activar WhatsApp API'
        }
      case 'blocked':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Bloqueado',
          description: 'Configuración global requerida primero'
        }
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Activity className="w-5 h-5" />,
          label: 'Estado Desconocido',
          description: 'Verificando configuración...'
        }
    }
  }
  
  const statusInfo = getStatusInfo(clientStatus)

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Breadcrumb Context */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/integraciones/${id}`}>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Integraciones
              </Button>
            </Link>
            
            {/* Breadcrumb Visual */}
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <span>Whatsapp API</span>
              <ArrowLeft className="w-3 h-3 rotate-180" />
              <span className="font-medium">{client.name}</span>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant="outline" className="bg-white/50 border-blue-300 text-blue-700">
              <Users className="w-3 h-3 mr-1" />
              Cliente Individual
            </Badge>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Client Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {client.name}
            </h1>
            <p className="text-gray-600">
              Configuración y gestión de instancias WhatsApp para este cliente específico
            </p>
          </div>
          
          {/* Status Overview */}
          <div className="flex justify-end">
            <Card className={`border-2 ${statusInfo.color} min-w-0 max-w-sm`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {statusInfo.icon}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm">{statusInfo.label}</h3>
                    <p className="text-xs opacity-90 truncate">{statusInfo.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Conditional Content Based on Status */}
      {clientStatus === 'blocked' ? (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h3 className="text-xl font-semibold text-red-900 mb-2">
              Configuración Global Requerida
            </h3>
            <p className="text-red-700 mb-6">
              Para activar WhatsApp API en este cliente, primero debes completar la configuración global del sistema.
            </p>
            <Link href={`/dashboard/integraciones/${id}`}>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                <Settings className="w-4 h-4 mr-2" />
                Ir a Configuración Global
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Configuración específica del cliente */
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-600 text-white rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración del Cliente</h2>
              <p className="text-gray-600">
                Gestiona contenedores, instancias WhatsApp y configuraciones específicas
              </p>
            </div>
          </div>
          
          <ClientEvolutionApiConfig 
            integration={normalizedIntegration}
            client={uiClient}
          />
        </div>
      )}
    </div>
  )
}
