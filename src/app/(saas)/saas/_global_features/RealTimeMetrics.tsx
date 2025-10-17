"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Users, 
  Smartphone, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useConversations, useEvolutionInstances } from "@/hooks/use-conversations"
import { useNotifications } from "@/hooks/use-notifications"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function MetricCard({ title, value, change, icon, color, subtitle }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {change > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={change > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(change)}%
            </span>
            <span className="text-gray-500">vs mes anterior</span>
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface RealTimeMetricsProps {
  clientId: string
}

export function RealTimeMetrics({ clientId }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    connectedInstances: 0,
    totalInstances: 0,
    responseTime: 0,
    satisfactionRate: 0
  })

  const { getUnreadCount } = useNotifications()
  const { conversations, instances } = useConversations({
    filters: { channel: 'WHATSAPP' }
  })
  const { instances: evolutionInstances } = useEvolutionInstances()
  const unreadCount = getUnreadCount()

  useEffect(() => {
    if (conversations && evolutionInstances) {
      const connectedInstances = evolutionInstances.filter(instance => 
        instance.status === "CONNECTED"
      ).length

      const activeConversations = (conversations as any[]).filter(conversation => 
        conversation.status === "ACTIVA"
      ).length

      const totalMessages = (conversations as any[]).reduce((total, conversation) => 
        total + (conversation._count?.messages || 0), 0
      )

      setMetrics({
        totalConversations: (conversations as any[]).length,
        activeConversations,
        totalMessages,
        connectedInstances,
        totalInstances: evolutionInstances.length,
        responseTime: Math.floor(Math.random() * 300) + 30, // Simulado
        satisfactionRate: Math.floor(Math.random() * 20) + 80 // Simulado
      })
    }
  }, [conversations, evolutionInstances])

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 300) + 30,
        satisfactionRate: Math.floor(Math.random() * 20) + 80
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Conversaciones Activas"
        value={metrics.activeConversations}
        change={12}
        icon={<MessageSquare className="w-4 h-4" />}
        color="bg-blue-100 text-blue-600"
        subtitle={`${metrics.totalConversations} total`}
      />
      
      <MetricCard
        title="Instancias Conectadas"
        value={metrics.connectedInstances}
        change={-5}
        icon={<Wifi className="w-4 h-4" />}
        color="bg-green-100 text-green-600"
        subtitle={`${metrics.totalInstances} total`}
      />
      
      <MetricCard
        title="Mensajes Enviados"
        value={metrics.totalMessages}
        change={8}
        icon={<Smartphone className="w-4 h-4" />}
        color="bg-purple-100 text-purple-600"
        subtitle="Este mes"
      />
      
      <MetricCard
        title="Tiempo de Respuesta"
        value={`${metrics.responseTime}s`}
        change={-15}
        icon={<Clock className="w-4 h-4" />}
        color="bg-orange-100 text-orange-600"
        subtitle="Promedio"
      />
    </div>
  )
}

interface SystemStatusProps {
  clientId: string
}

export function SystemStatus({ clientId }: SystemStatusProps) {
  const { instances } = useEvolutionInstances()
  const { isConnected } = useNotifications()

  const getSystemHealth = () => {
    if (!instances) return "unknown"
    
    const connectedInstances = instances.filter(instance => 
      instance.status === "CONNECTED"
    ).length
    
    const totalInstances = instances.length
    
    if (totalInstances === 0) return "unknown"
    if (connectedInstances === totalInstances) return "healthy"
    if (connectedInstances > totalInstances / 2) return "warning"
    return "critical"
  }

  const systemHealth = getSystemHealth()

  const getHealthColor = () => {
    switch (systemHealth) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getHealthIcon = () => {
    switch (systemHealth) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />
      case "warning":
        return <AlertCircle className="w-4 h-4" />
      case "critical":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
          <Badge className={getHealthColor()}>
            {getHealthIcon()}
            <span className="ml-1 capitalize">{systemHealth}</span>
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">WebSocket</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Instancias</span>
              <span className="text-sm font-medium">
                {instances?.filter(i => i.status === "CONNECTED").length || 0} / {instances?.length || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
          <Activity className="w-4 h-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mensajes (24h)</span>
              <span className="text-sm font-medium">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversaciones (24h)</span>
              <span className="text-sm font-medium">89</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa de Respuesta</span>
              <span className="text-sm font-medium">94%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
          <Badge variant="outline">
            {unreadCount} sin leer
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mensajes nuevos</span>
              <span className="text-sm font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conexiones</span>
              <span className="text-sm font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Errores</span>
              <span className="text-sm font-medium text-red-600">1</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 