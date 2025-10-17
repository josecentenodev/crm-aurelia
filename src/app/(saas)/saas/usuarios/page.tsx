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
import type { User } from "@prisma/client"

import { UserCard } from "./_components/UserCard"
import Link from "next/link"
import { UserStats } from "./_components/UserStats"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SectionHeader } from "../../../../components/ui/section-header"
import { useClientContext } from "@/providers/ClientProvider"
import { useUsuariosContext } from "@/providers/UsuariosProvider"
import { QuickEditUserModal } from "./_components/QuickEditUserModal"

type UserType = "ADMIN" | "CUSTOMER"
type UserStatus = "true" | "false" | "all"
type FilterType = "all" | UserType

interface UserFilters {
  search: string;
  type: FilterType;
  status: UserStatus;
}

export default function UsuariosPage() {
  const { clientId } = useClientContext()
  const { users, isLoading, error, stats, refetch } = useUsuariosContext()
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    type: "all",
    status: "all"
  })

  const handleRefresh = (): void => {
    void refetch()
  }

  const handleFilterChange = <K extends keyof UserFilters>(
    key: K, 
    value: UserFilters[K]
  ): void => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search || 
      (user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
       user.email?.toLowerCase().includes(filters.search.toLowerCase()))
    
    const matchesType = filters.type === "all" || user.type === filters.type
    const matchesStatus = filters.status === "all" || 
      (filters.status === "true" ? user.active : !user.active)
    
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader 
        title="Gestión de Usuarios" 
        description="Administra los usuarios de tu organización"
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar usuarios: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <UserStats />

      {/* Filtros y Acciones */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Select 
              value={filters.type} 
              onValueChange={(value) => handleFilterChange('type', value as FilterType)}
            >
              <SelectTrigger className="w-40 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
                <SelectItem value="CUSTOMER">Usuarios</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value as UserStatus)}
            >
              <SelectTrigger className="w-40 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href="/saas/usuarios/nuevo">
            <Button className="rounded-xl">
              <Users className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
              <p className="text-gray-500 text-center mb-4">
                {(filters.search || (filters.type && filters.type !== "all") || (filters.status && filters.status !== "all")) 
                  ? "No se encontraron usuarios con los filtros aplicados."
                  : "Aún no hay usuarios registrados en tu organización."
                }
              </p>
              {(filters.search || (filters.type && filters.type !== "all") || (filters.status && filters.status !== "all")) ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      search: "",
                      type: "all",
                      status: "all"
                    })
                  }}
                  className="rounded-xl"
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Link href="/saas/usuarios/nuevo">
                  <Button className="rounded-xl">
                    <Users className="w-4 h-4 mr-2" />
                    Crear Usuario
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} onUpdate={handleRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 