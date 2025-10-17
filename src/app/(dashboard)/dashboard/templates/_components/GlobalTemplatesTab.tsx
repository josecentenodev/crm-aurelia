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
  Globe,
  Calendar,
  Settings,
  Copy,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"


export function GlobalTemplatesTab() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const { data: templatesData, isLoading, refetch } = api.superadmin.getGlobalTemplates.useQuery({
    search: search || undefined,
    active: activeFilter === "all" ? undefined : activeFilter === "active"
  })

  const templates = templatesData?.templates ?? []

  const getActiveColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'ventas':
        return 'bg-blue-100 text-blue-800'
      case 'soporte':
        return 'bg-green-100 text-green-800'
      case 'marketing':
        return 'bg-purple-100 text-purple-800'
      case 'general':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditTemplate = (template: any) => {
    router.push(`/dashboard/templates/${template.id}/editar`)
  }

  const handleCreateTemplate = () => {
    router.push("/dashboard/templates/crear")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Templates Globales</h2>
          <p className="text-gray-600 mt-2">Templates disponibles para todos los clientes</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
          onClick={handleCreateTemplate}
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Template Global
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2 text-gray-600" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
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

      {/* Lista de Templates */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-0 bg-white">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No hay templates globales</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                {(search || activeFilter !== "all")
                  ? "No se encontraron templates con los filtros aplicados."
                  : "Aún no se han creado templates globales."
                }
              </p>
              {(search || activeFilter !== "all") ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    setActiveFilter("all")
                  }}
                  className="border-0 bg-gray-50 hover:bg-gray-100"
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
                  onClick={handleCreateTemplate}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Template Global
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 mb-3">
                        {template.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${getActiveColor(template.isActive)} border-0`}>
                          {template.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactivo
                            </>
                          )}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-0">
                          <Globe className="w-3 h-3 mr-1" />
                          Global
                        </Badge>
                        {template.category && (
                          <Badge className={`${getCategoryColor(template.category)} border-0`}>
                            {template.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {template.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Agentes:</span>
                      <div className="flex items-center space-x-1">
                        <Bot className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {template._count?.agentes || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Creado: {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-0 bg-gray-50 hover:bg-gray-100"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="border-0 bg-gray-50 hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-0 bg-gray-50 hover:bg-gray-100">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {templatesData?.pagination && templatesData.pagination.total > templatesData.pagination.limit && (
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-gray-600">
              Mostrando {templates.length} de {templatesData.pagination.total} templates
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!templatesData.pagination.hasMore}
                className="border-0 bg-gray-50 hover:bg-gray-100"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!templatesData.pagination.hasMore}
                className="border-0 bg-gray-50 hover:bg-gray-100"
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
} 