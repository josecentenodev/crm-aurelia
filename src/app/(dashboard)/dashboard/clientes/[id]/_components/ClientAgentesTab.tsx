"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bot, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  XCircle,
  Settings
} from "lucide-react"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link"

interface ClientAgentesTabProps {
  clientId: string
}

export function ClientAgentesTab({ clientId }: ClientAgentesTabProps) {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const { 
    data: agentesData, 
    isLoading, 
    error,
    refetch 
  } = api.superadmin.getAgentesByClient.useQuery({
    clientId,
    active: activeFilter === "all" ? undefined : activeFilter === "active"
  }, {
    enabled: !!clientId,
    retry: 2,
    retryDelay: 1000,
  })

  const agentes = agentesData?.agentes ?? []

  const getActiveColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getTemplateColor = (isGlobal: boolean) => {
    return isGlobal ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  }

  const deleteMutation = api.superadmin.deleteAgente.useMutation({
    onSuccess: () => {
      toast({ title: "Agente eliminado", description: "El agente fue eliminado correctamente." });
      setDeleteId(null);
      void refetch();
    },
    onError: (err) => {
      toast({ title: "Error al eliminar", description: err.message, variant: "destructive" });
    },
  });

  const handleDelete = async (agenteId: string) => {
    setDeleteId(agenteId);
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: agenteId });
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar agentes</h3>
          <p className="text-gray-500 text-center mb-4">
            {error.message}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Agentes del Cliente</h2>
          <p className="text-gray-600">Gestiona los agentes de IA asociados a este cliente</p>
        </div>
        <Link href={`/dashboard/clientes/${clientId}/agentes/nuevo`}>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Crear Agente
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar agentes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Agentes ({agentes.length})
          </h3>
          {agentesData?.pagination && (
            <Badge variant="outline">
              Mostrando {agentes.length} de {agentesData.pagination.total}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agentes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay agentes</h3>
              <p className="text-gray-500 text-center mb-4">
                {(search || activeFilter !== "all") 
                  ? "No se encontraron agentes con los filtros aplicados."
                  : "Este cliente aún no tiene agentes registrados."
                }
              </p>
              {(search || activeFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    setActiveFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentes.map((agente) => (
              <Card key={agente.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                        {agente.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getActiveColor(agente.isActive)}>
                          {agente.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {agente.template && (
                          <Badge className={getTemplateColor(agente.template.isGlobal)}>
                            {agente.template.isGlobal ? 'Global' : 'Local'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    {agente.template?.description && (
                      <p className="text-gray-600 line-clamp-2">
                        {agente.template.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Creado: {new Date(agente.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/saas/agentes/${agente.id}/editar`)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(agente.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <XCircle className="w-3 h-3 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar agente"
        description="¿Estás seguro de que quieres eliminar este agente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={async () => { if (deleteId) { await handleDelete(deleteId) } }}
      />
    </div>
  )
} 