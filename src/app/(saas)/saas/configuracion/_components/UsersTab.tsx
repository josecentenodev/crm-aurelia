"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Users, 
  Plus,
  RefreshCw,
  AlertCircle,
  Shield,
  UserCheck,
  Settings,
  Trash2,
  Edit,
  Eye,
  MoreVertical
} from "lucide-react"
import { api } from "@/trpc/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useClientContext } from "@/providers/ClientProvider"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle } from "lucide-react"
import type { RouterOutputs } from "@/trpc/react"

type User = RouterOutputs["usuarios"]["listByClient"]["users"][number]
type Role = RouterOutputs["permisos"]["listRoles"][number]

export function UsersTab() {
  const { clientId } = useClientContext()
  const { toast } = useToast()
  const [activeSubTab, setActiveSubTab] = useState("usuarios")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  // Users data
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = api.usuarios.listByClient.useQuery({
    clientId: clientId!,
    search: search || undefined,
    type: typeFilter === "all" ? undefined : typeFilter as "ADMIN" | "CUSTOMER" | undefined,
    active: activeFilter === "all" ? undefined : activeFilter === "true",
    limit: 50
  }, {
    enabled: !!clientId
  })

  // Roles data
  const { 
    data: roles = [], 
    isLoading: rolesLoading,
    refetch: refetchRoles 
  } = api.permisos.listRoles.useQuery({ clientId: clientId! }, {
    enabled: !!clientId
  })

  const users = usersData?.users ?? []

  const handleRefresh = () => {
    void refetchUsers()
    void refetchRoles()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />
      case 'CUSTOMER':
        return <UserCheck className="w-4 h-4" />
      default:
        return <UserCheck className="w-4 h-4" />
    }
  }

  const getActiveColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getActiveIcon = (active: boolean) => {
    return active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
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
          {usersError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar usuarios: {usersError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Filtros y Acciones */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
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

                <Select value={activeFilter} onValueChange={setActiveFilter}>
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
                disabled={usersLoading}
                className="rounded-xl"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button className="rounded-xl">
                <Users className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </div>
          </div>

          {/* Lista de Usuarios */}
          <div className="space-y-4">
            {usersLoading ? (
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
            ) : users.length === 0 ? (
              <Card className="rounded-2xl shadow-sm border-0 bg-white">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
                  <p className="text-gray-500 text-center mb-4">
                    {(search || (typeFilter && typeFilter !== "all") || (activeFilter && activeFilter !== "all")) 
                      ? "No se encontraron usuarios con los filtros aplicados."
                      : "Aún no hay usuarios registrados en tu organización."
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
                      className="rounded-xl"
                    >
                      Limpiar filtros
                    </Button>
                  ) : (
                    <Button className="rounded-xl">
                      <Users className="w-4 h-4 mr-2" />
                      Crear Usuario
                    </Button>
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

          {rolesLoading ? (
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
          ) : roles.length === 0 ? (
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
              {roles.map((role) => (
                <RoleCard key={role.roleId} role={role} onUpdate={handleRefresh} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// User Card Component
function UserCard({ user, onUpdate }: { user: User; onUpdate: () => void }) {
  const { toast } = useToast()

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />
      case 'CUSTOMER':
        return <UserCheck className="w-4 h-4" />
      default:
        return <UserCheck className="w-4 h-4" />
    }
  }

  const getActiveColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getActiveIcon = (active: boolean) => {
    return active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
  }

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.image || undefined} alt={user.name || "Usuario"} />
              <AvatarFallback className="bg-gradient-to-br from-aurelia-primary to-aurelia-secondary text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {user.name || "Sin nombre"}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${getTypeColor(user.type)} border-0 text-xs flex items-center gap-1`}>
                  {getTypeIcon(user.type)}
                  {user.type === "ADMIN" ? "Administrador" : "Usuario"}
                </Badge>
                <Badge className={`${getActiveColor(user.active)} border-0 text-xs flex items-center gap-1`}>
                  {getActiveIcon(user.active)}
                  {user.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Funcionalidad en desarrollo",
                    description: "La edición de usuarios estará disponible próximamente",
                  })
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Funcionalidad en desarrollo",
                    description: "La gestión de roles estará disponible próximamente",
                  })
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                Gestionar Roles
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Funcionalidad en desarrollo",
                    description: "La eliminación de usuarios estará disponible próximamente",
                  })
                }}
                className="flex items-center gap-2 cursor-pointer text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <UserCheck className="w-4 h-4" />
          <span>{user.email || "Sin email"}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Settings className="w-4 h-4" />
          <span>Miembro desde {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        {user.updatedAt && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Settings className="w-4 h-4" />
            <span>Actualizado {new Date(user.updatedAt).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Role Card Component
function RoleCard({ role, onUpdate }: { role: Role; onUpdate: () => void }) {
  const { toast } = useToast()

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {role.name}
              </CardTitle>
              {role.description && (
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Funcionalidad en desarrollo",
                    description: "La edición de roles estará disponible próximamente",
                  })
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Funcionalidad en desarrollo",
                    description: "La gestión de permisos estará disponible próximamente",
                  })
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Ver Permisos
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Funcionalidad en desarrollo",
                    description: "La eliminación de roles estará disponible próximamente",
                  })
                }}
                className="flex items-center gap-2 cursor-pointer text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>0 usuarios asignados</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Settings className="w-4 h-4" />
          <span>0 permisos configurados</span>
        </div>
      </CardContent>
    </Card>
  )
} 