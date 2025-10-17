"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Bot,
  RefreshCw
} from "lucide-react"
import { useClientMetrics } from "../../_hooks"
import { Skeleton } from "@/components/ui/skeleton"

interface ClientMetricsTabProps {
  clientId: string
}

export function ClientMetricsTab({ clientId }: ClientMetricsTabProps) {
  const {
    metrics,
    selectedPeriod,
    isLoading,
    error,
    updatePeriod,
    refetch,
    getGrowthColor,
    getGrowthIcon,
    formatPercentage,
    formatNumber
  } = useClientMetrics({ clientId })

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Métricas del Cliente</h2>
            <p className="text-gray-600">Análisis de rendimiento y actividad</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">
                Error al cargar las métricas: {error.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Métricas del Cliente</h2>
          <p className="text-gray-600">Análisis de rendimiento y actividad</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={(value) => updatePeriod(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* Skeleton para métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Skeleton para métricas detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : metrics ? (
        <>
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Conversaciones</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(metrics.conversations.total)}</div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`w-4 h-4 ${getGrowthColor(metrics.conversations.growth)}`} />
                  <p className={`text-xs ${getGrowthColor(metrics.conversations.growth)}`}>
                    {formatPercentage(metrics.conversations.growth)} vs período anterior
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {metrics.conversations.active} activas
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Contactos</CardTitle>
                <Building2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(metrics.contacts.total)}</div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`w-4 h-4 ${getGrowthColor(metrics.contacts.growth)}`} />
                  <p className={`text-xs ${getGrowthColor(metrics.contacts.growth)}`}>
                    {formatPercentage(metrics.contacts.growth)} vs período anterior
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {metrics.contacts.new} nuevos
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Agentes Activos</CardTitle>
                <Bot className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.agents.active}</div>
                <p className="text-xs text-gray-500">de {metrics.agents.total} total</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {metrics.agents.conversationsThisMonth} conv. este período
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tasa Conversión</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.performance.conversionRate}%</div>
                <p className="text-xs text-gray-500">de contactos a clientes</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {metrics.performance.satisfactionRate}/5 satisfacción
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estado de Conversaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Estado de Conversaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Activas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.conversations.active}</span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.conversations.total > 0 
                        ? ((metrics.conversations.active / metrics.conversations.total) * 100).toFixed(1)
                        : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completadas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.conversations.completed}</span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.conversations.total > 0 
                        ? ((metrics.conversations.completed / metrics.conversations.total) * 100).toFixed(1)
                        : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Pendientes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.conversations.pending}</span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.conversations.total > 0 
                        ? ((metrics.conversations.pending / metrics.conversations.total) * 100).toFixed(1)
                        : 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado de Contactos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Estado de Contactos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Nuevos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.contacts.new}</span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.contacts.total > 0 
                        ? ((metrics.contacts.new / metrics.contacts.total) * 100).toFixed(1)
                        : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Calificados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.contacts.qualified}</span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.contacts.total > 0 
                        ? ((metrics.contacts.qualified / metrics.contacts.total) * 100).toFixed(1)
                        : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Convertidos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.contacts.converted}</span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.contacts.total > 0 
                        ? ((metrics.contacts.converted / metrics.contacts.total) * 100).toFixed(1)
                        : 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Rendimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Métricas de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Respuesta Promedio</p>
                    <p className="text-lg font-semibold text-gray-900">{metrics.performance.avgResponseTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tasa de Satisfacción</p>
                    <p className="text-lg font-semibold text-gray-900">{metrics.performance.satisfactionRate}/5</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tasa de Conversión</p>
                    <p className="text-lg font-semibold text-gray-900">{metrics.performance.conversionRate}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nota sobre datos */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Estas métricas están basadas en datos de los últimos {selectedPeriod === "7d" ? "7 días" : selectedPeriod === "30d" ? "30 días" : "90 días"}. 
                  Los datos se actualizan automáticamente cada 5 minutos.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
} 