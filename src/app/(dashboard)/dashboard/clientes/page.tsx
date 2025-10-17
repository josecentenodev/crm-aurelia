"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Building2, 
  Users, 
  Bot, 
  MessageSquare,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { api } from "@/trpc/react"
import { ClientCard } from "./_components"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ClientesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")

  // Queries con manejo seguro de errores y loading states
  const { 
    data: clientsData, 
    isLoading: clientsLoading, 
    error: clientsError,
    refetch: refetchClients
  } = api.superadmin.getClients.useQuery({
    search: search || undefined,
    statusId: statusFilter === "all" ? undefined : statusFilter || undefined,
    planId: planFilter === "all" ? undefined : planFilter || undefined,
    limit: 50
  }, {
    retry: 2,
    retryDelay: 1000,
  })

  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = api.superadmin.getStats.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  })

  const { 
    data: statuses = [], 
    isLoading: statusesLoading, 
    error: statusesError 
  } = api.superadmin.getClientStatuses.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  })

  const { 
    data: plans = [], 
    isLoading: plansLoading, 
    error: plansError 
  } = api.superadmin.getClientPlans.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  })

  // Datos seguros
  const clients = clientsData?.clients ?? []
  const isLoading = clientsLoading || statsLoading || statusesLoading || plansLoading
  const hasErrors = clientsError || statsError || statusesError || plansError

  // Función segura para obtener estadísticas
  const getSafeStats = () => {
    if (!stats) return {
      totalClients: 0,
      activeClients: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalAgentes: 0,
      activeAgentes: 0,
      totalConversations: 0
    }
    return stats
  }

  const handleRefresh = () => {
    void refetchClients()
  }

  const safeStats = getSafeStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra todos los clientes del sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href="/dashboard/clientes/nuevo">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Building2 className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alerts */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {clientsError && `Error al cargar clientes: ${clientsError.message}`}
            {statsError && `Error al cargar estadísticas: ${statsError.message}`}
            {statusesError && `Error al cargar estados: ${statusesError.message}`}
            {plansError && `Error al cargar planes: ${plansError.message}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clientes</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statsLoading ? "..." : safeStats.totalClients}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {statsLoading ? "..." : `${safeStats.activeClients} activos`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statsLoading ? "..." : safeStats.totalUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {statsLoading ? "..." : `${safeStats.activeUsers} activos`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Agentes</CardTitle>
            <Bot className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statsLoading ? "..." : safeStats.totalAgentes}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {statsLoading ? "..." : `${safeStats.activeAgentes} activos`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statsLoading ? "..." : safeStats.totalConversations}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar clientes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los planes</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Clientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Clientes ({clients.length})
          </h2>
          {clientsData?.pagination && (
            <Badge variant="outline">
              Mostrando {clients.length} de {clientsData.pagination.total}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
              <p className="text-gray-500 text-center mb-4">
                {(search || (statusFilter && statusFilter !== "all") || (planFilter && planFilter !== "all")) 
                  ? "No se encontraron clientes con los filtros aplicados."
                  : "Aún no hay clientes registrados en el sistema."
                }
              </p>
              {(search || (statusFilter && statusFilter !== "all") || (planFilter && planFilter !== "all")) ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    setStatusFilter("all")
                    setPlanFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Link href="/dashboard/clientes/nuevo">
                  <Button>
                    <Building2 className="w-4 h-4 mr-2" />
                    Crear Cliente
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard 
                key={client.id} 
                client={client} 
                onClientDeleted={() => {
                  void refetchClients()
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
