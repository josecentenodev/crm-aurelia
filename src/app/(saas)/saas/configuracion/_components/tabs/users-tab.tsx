"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  Filter, 
  Users, 
  Plus,
  RefreshCw,
  AlertCircle,
  Shield
} from "lucide-react"
import { useUsersData } from "../hooks/use-users-data"
import { UserCard } from "../ui/user-card"
import { RoleCard } from "../ui/role-card"
import { UserCreateForm } from "../forms/user-create-form"
import type { UsersTabFilters, UserCreateFormData } from "../types"

export function UsersTab() {
  const [activeSubTab, setActiveSubTab] = useState("usuarios")
  const [filters, setFilters] = useState<UsersTabFilters>({
    search: "",
    typeFilter: "all",
    activeFilter: "all"
  })
  const [showCreateForm, setShowCreateForm] = useState(false)

  const usersData = useUsersData(filters)

  const handleCreateUser = async (data: UserCreateFormData) => {
    // TODO: Implementar creación de usuario
    console.log('Create user:', data)
    setShowCreateForm(false)
  }

  const handleCancelCreate = () => {
    setShowCreateForm(false)
  }

  const handleRefresh = () => {
    usersData.handleRefresh()
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      typeFilter: "all",
      activeFilter: "all"
    })
  }

  if (!usersData.clientId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente no seleccionado</h3>
          <p className="text-gray-500 text-center">
            Selecciona un cliente para ver sus usuarios
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-gray-100 p-1">
          <TabsTrigger value="usuarios" className="rounded-xl">
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-xl">
            <Shield className="w-4 h-4 mr-2" />
            Roles y Permisos
          </TabsTrigger>
        </TabsList>

        {/* Usuarios Tab */}
        <TabsContent value="usuarios" className="space-y-6">
          {/* Error Alert */}
          {usersData.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar usuarios: {usersData.error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Formulario de creación */}
          {showCreateForm && (
            <UserCreateForm
              onSubmit={handleCreateUser}
              onCancel={handleCancelCreate}
              isLoading={false} // TODO: Implementar loading state
            />
          )}

          {/* Filtros y Acciones */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 rounded-xl"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                <Select value={filters.typeFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, typeFilter: value }))}>
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

                <Select value={filters.activeFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, activeFilter: value }))}>
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
                disabled={usersData.isLoading}
                className="rounded-xl"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${usersData.isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="rounded-xl"
              >
                <Users className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </div>
          </div>

          {/* Lista de Usuarios */}
          <div className="space-y-4">
            {usersData.isLoading ? (
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
            ) : usersData.filteredUsers.length === 0 ? (
              <Card className="rounded-2xl shadow-sm border-0 bg-white">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
                  <p className="text-gray-500 text-center mb-4">
                    {(filters.search || (filters.typeFilter && filters.typeFilter !== "all") || (filters.activeFilter && filters.activeFilter !== "all")) 
                      ? "No se encontraron usuarios con los filtros aplicados."
                      : "Aún no hay usuarios registrados en tu organización."
                    }
                  </p>
                  {(filters.search || (filters.typeFilter && filters.typeFilter !== "all") || (filters.activeFilter && filters.activeFilter !== "all")) ? (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="rounded-xl"
                    >
                      Limpiar filtros
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="rounded-xl"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Crear Usuario
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usersData.filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} onUpdate={handleRefresh} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Gestión de Roles</h3>
              <p className="text-gray-600">Administra roles y permisos de tu organización</p>
            </div>
            <Button className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Crear Rol
            </Button>
          </div>

          {usersData.isLoading ? (
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
          ) : usersData.roles.length === 0 ? (
            <Card className="rounded-2xl shadow-sm border-0 bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay roles</h3>
                <p className="text-gray-500 text-center mb-4">
                  Aún no hay roles configurados en tu organización.
                </p>
                <Button className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Rol
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersData.roles.map((role) => (
                <RoleCard key={role.roleId} role={role} onUpdate={handleRefresh} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
