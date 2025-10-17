"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Settings, Phone } from "lucide-react"
import { useIntegrationsData } from "../hooks/use-integrations-data"
import { IntegrationCard } from "../ui/integration-card"

export function IntegrationsTab() {
  const integrationsData = useIntegrationsData()

  if (!integrationsData.clientId) {
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
        <p className="text-gray-600">Gestiona las instancias de tus integraciones habilitadas</p>
      </div>

      {/* Lista de integraciones */}
      <div className="space-y-6">
        {integrationsData.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : integrationsData.integrations.length === 0 ? (
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay integraciones habilitadas</h3>
              <p className="text-gray-500 text-center mb-4">
                No se encontraron integraciones habilitadas para tu plan actual.
              </p>
              <Alert className="max-w-md">
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  Las integraciones son habilitadas por el administrador del sistema. 
                  Contacta a soporte si necesitas acceso a integraciones adicionales.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationsData.integrations.map((integration) => (
              <IntegrationCard
                key={integration.type}
                integration={integration}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}