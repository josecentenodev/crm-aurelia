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
  Users, 
  Plus,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { api } from "@/trpc/react"
import { UserCard } from "./_components/UserCard"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UsuariosPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const { 
    data: usersData, 
    isLoading, 
    error,
    refetch 
  } = api.superadmin.getUsers.useQuery({
    search: search || undefined,
    type: typeFilter === "all" ? undefined : typeFilter as "ADMIN" | "CUSTOMER" | undefined,
    active: activeFilter === "all" ? undefined : activeFilter === "true",
    limit: 50
  })

  const { data: stats } = api.superadmin.getUserStats.useQuery()

  const users = usersData?.users ?? []

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
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
          <Link href="/dashboard/usuarios/nuevo">
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar usuarios: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeUsers} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Administradores</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.adminUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.adminUsers} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Clientes</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.customerUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.customerUsers} activos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
                <SelectItem value="CUSTOMER">Clientes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Usuarios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Usuarios ({users.length})
          </h2>
          {usersData?.pagination && (
            <Badge variant="outline">
              Mostrando {users.length} de {usersData.pagination.total}
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
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
              <p className="text-gray-500 text-center mb-4">
                {(search || (typeFilter && typeFilter !== "all") || (activeFilter && activeFilter !== "all")) 
                  ? "No se encontraron usuarios con los filtros aplicados."
                  : "Aún no hay usuarios registrados en el sistema."
                }
              </p>
              {(search || (typeFilter && typeFilter !== "all") || (activeFilter && activeFilter !== "all")) ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    setTypeFilter("all")
                    setActiveFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Link href="/dashboard/usuarios/nuevo">
                  <Button>
                    <Users className="w-4 h-4 mr-2" />
                    Crear Usuario
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard key={user.id} user={user} onUpdate={handleRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
