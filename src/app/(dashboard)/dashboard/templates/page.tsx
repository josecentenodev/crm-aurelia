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
  Palette, 
  Plus,
  RefreshCw,
  AlertCircle,
  Globe,
  Building2
} from "lucide-react"
import { api } from "@/trpc/react"
import { TemplateCard } from "./_components/TemplateCard"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [globalFilter, setGlobalFilter] = useState<string>("all")

  const { 
    data: templatesData, 
    isLoading, 
    error,
    refetch 
  } = api.superadmin.getTemplates.useQuery({
    search: search || undefined,
    // type: typeFilter === "all" ? undefined : typeFilter,
    isGlobal: globalFilter === "all" ? undefined : globalFilter === "true",
    limit: 50
  })

  // const { data: stats } = api.superadmin.getTemplateStats.useQuery()

  const templates = templatesData?.templates ?? []

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Templates</h1>
          <p className="text-gray-600 mt-2">Administra los templates de agentes del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-0 bg-gray-50 hover:bg-gray-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href="/dashboard/templates/crear">
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 border-0">
              <Plus className="w-4 h-4 mr-2" />
              Crear Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-0 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar templates: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      {templatesData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Templates</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Palette className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{templatesData?.pagination?.total || 0}</div>
              <p className="text-sm text-gray-500 mt-2">
                {templates.filter(t => t.isActive).length} activos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Templates Globales</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{templates.filter(t => t.isGlobal).length}</div>
              <p className="text-sm text-gray-500 mt-2">
                Disponibles para todos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Templates por Cliente</CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{templates.filter(t => !t.isGlobal).length}</div>
              <p className="text-sm text-gray-500 mt-2">
                Específicos por cliente
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2 text-gray-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="AgenteQA">Agente QA</SelectItem>
                <SelectItem value="AgentePersonalizado">Agente Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={globalFilter} onValueChange={setGlobalFilter}>
              <SelectTrigger className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500">
                <SelectValue placeholder="Filtrar por alcance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los alcances</SelectItem>
                <SelectItem value="true">Globales</SelectItem>
                <SelectItem value="false">Por Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Templates */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Templates ({templates.length})
          </h2>
          {templatesData?.pagination && (
            <Badge variant="outline" className="border-0 bg-gray-100">
              Mostrando {templates.length} de {templatesData.pagination.total}
            </Badge>
          )}
        </div>

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
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Palette className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No hay templates</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                {(search || (typeFilter && typeFilter !== "all") || (globalFilter && globalFilter !== "all")) 
                  ? "No se encontraron templates con los filtros aplicados."
                  : "Aún no hay templates registrados en el sistema."
                }
              </p>
              {(search || (typeFilter && typeFilter !== "all") || (globalFilter && globalFilter !== "all")) ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    setTypeFilter("all")
                    setGlobalFilter("all")
                  }}
                  className="border-0 bg-gray-50 hover:bg-gray-100"
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Link href="/dashboard/templates/crear">
                  <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Template
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} onUpdate={handleRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
