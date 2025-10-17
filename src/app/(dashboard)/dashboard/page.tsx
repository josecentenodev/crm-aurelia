"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Users, 
  Bot, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Crown,
  Activity,
  Globe,
  Shield,
  ArrowRight,
  Calendar,
  Clock
} from "lucide-react"
import { api } from "@/trpc/react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { 
    data: stats, 
    isLoading, 
    error: statsError,
    refetch 
  } = api.superadmin.getStats.useQuery()

  const { data: recentClients } = api.superadmin.getClients.useQuery({
    limit: 5
  })

  const handleRefresh = () => {
    void refetch()
  }

  // Datos mock para métricas adicionales (en el futuro vendrán de la API)
  const mockMetrics = {
    revenue: {
      current: 125000,
      previous: 98000,
      growth: 27.6
    },
    satisfaction: {
      score: 4.8,
      trend: 0.2
    },
    performance: {
      avgResponseTime: "1.8 min",
      uptime: 99.9
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Ejecutivo */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Dashboard Superadmin</h1>
                <p className="text-violet-100 text-lg">Panel de control ejecutivo de Aurelia</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-violet-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Tiempo real</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Link href="/dashboard/clientes/nuevo">
              <Button className="bg-white text-violet-700 hover:bg-violet-50 font-semibold">
                <Building2 className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {statsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar estadísticas: {statsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Total Clientes</CardTitle>
              <Building2 className="h-5 w-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-900">{stats.totalClients}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-600 font-medium">
                  {stats.activeClients} activos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Usuarios</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalUsers}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-600 font-medium">
                  {stats.activeUsers} activos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Agentes</CardTitle>
              <Bot className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.totalAgentes}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-600 font-medium">
                  {stats.activeAgentes} activos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Conversaciones</CardTitle>
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.totalConversations}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-600 font-medium">
                  +12% este mes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas de Negocio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-700">
              <TrendingUp className="w-5 h-5 mr-2" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">
              ${mockMetrics.revenue.current.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              {mockMetrics.revenue.growth > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                mockMetrics.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {mockMetrics.revenue.growth}% vs mes anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <Activity className="w-5 h-5 mr-2" />
              Satisfacción Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">
              {mockMetrics.satisfaction.score}/5
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                +{mockMetrics.satisfaction.trend} vs mes anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center text-cyan-700">
              <Shield className="w-5 h-5 mr-2" />
              Rendimiento Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900">
              {mockMetrics.performance.uptime}%
            </div>
            <div className="text-sm text-cyan-600 mt-2">
              Tiempo respuesta: {mockMetrics.performance.avgResponseTime}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/clientes">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                    Gestionar Clientes
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Administrar todos los clientes
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/usuarios">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                    Gestionar Usuarios
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Administrar usuarios del sistema
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/templates">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                    Templates
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Gestionar templates de agentes
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/configuracion">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                    Configuración
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Configurar el sistema
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Clientes Recientes */}
      {recentClients?.clients && recentClients.clients.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-violet-700">
                <Globe className="w-5 h-5 mr-2" />
                Clientes Recientes
              </CardTitle>
              <Link href="/dashboard/clientes">
                <Button variant="outline" size="sm" className="text-violet-600 border-violet-200 hover:bg-violet-50">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{client.name}</h4>
                      <p className="text-sm text-gray-500">
                        Plan: {client.plan.name} • Estado: {client.status.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {client._count.users} usuarios
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {client._count.agentes} agentes
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}