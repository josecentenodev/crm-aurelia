// Server component: fetch data on the server and render UI with client subcomponents
import { notFound } from "next/navigation"
import Link from "next/link"
import { api as rsc } from "@/trpc/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { EvolutionApiIntegration } from "./_components/EvolutionAPI/EvolutionApiIntegration"
import type { GlobalIntegration } from "@/domain"
import { mapClientToLiteUI, mapGlobalIntegrationToUI } from "@/lib/mappers/integrations"

// keep alias for clarity
// type GlobalIntegrationRow = GlobalIntegration

export default async function IntegrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [integration, clientsResp] = await Promise.all([
    rsc.integraciones.getGlobalById({ id }).catch(() => null),
    rsc.clientes.list().catch(() => null),
  ])

  if (!integration) notFound()

  // Normalizar datos para props del componente (evitar nulls y ajustar shape esperado)
  const normalizedIntegration = mapGlobalIntegrationToUI(integration as GlobalIntegration)
  const uiClients = (clientsResp?.clients ?? []).map((c) => mapClientToLiteUI({ id: c.id, name: c.name, status: { id: c.status.id } }))

  // Solo mostrar WhatsApp API
  if (integration.type !== "EVOLUTION_API") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/integraciones">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Integración no soportada</p>
              <p className="text-sm">Solo WhatsApp API está disponible actualmente.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header común para WhatsApp API */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/integraciones">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{integration.name}</h1>
            <p className="text-gray-600">{integration.description ?? ""}</p>
          </div>
        </div>
        <Badge variant={integration.isActive ? "default" : "secondary"}>
          {integration.isActive ? "Activa" : "Inactiva"}
        </Badge>
      </div>

      {/* Renderizar componente específico de WhatsApp API */}
      <EvolutionApiIntegration 
        integration={normalizedIntegration}
        clients={uiClients}
      />
    </div>
  )
}
