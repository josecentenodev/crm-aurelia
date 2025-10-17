import { api as rsc } from "@/trpc/server"
import { IntegrationsList } from "./_components/IntegrationsList"

export default async function IntegracionesPage() {
  const [integrations, clientsResp] = await Promise.all([
    rsc.integraciones.listGlobal().catch(() => []),
    rsc.clientes.list().catch(() => null),
  ])

  const clients = clientsResp?.clients ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Integraciones</h1>
          <p className="text-gray-600">
            Configura y gestiona las integraciones disponibles para todos los clientes.
          </p>
        </div>
      </div>

      <IntegrationsList 
        integrations={integrations}
        clients={clients}
      />
    </div>
  )
}