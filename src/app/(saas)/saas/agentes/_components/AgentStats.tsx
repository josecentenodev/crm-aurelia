"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { Bot, Crown, MessageSquare, TrendingUp, Users } from "lucide-react"
import { useAgentesProvider } from "@/providers/AgentesProvider"

export default function AgentStats() {
  const { agentes: agents = [], isLoading } = useAgentesProvider()

  // Calcular métricas
  const total = agents.length
  const activos = agents.filter((a) => a.isActive).length
  const inactivos = total - activos
  const conversaciones = agents.reduce((sum, a) => sum + (a.conversationsThisMonth || 0), 0)
  const principal = agents.find((a) => a.isPrincipal)?.name || "No definido"

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total de Agentes",
      value: total,
      icon: Users,
      color: "violet",
      description: "Agentes configurados"
    },
    {
      title: "Agentes Activos",
      value: activos,
      icon: TrendingUp,
      color: "green",
      description: `${Math.round((activos / total) * 100)}% del total`
    },
    {
      title: "Conversaciones",
      value: conversaciones,
      icon: MessageSquare,
      color: "blue",
      description: "Este mes"
    },
    {
      title: "Agente Principal",
      value: principal,
      icon: Crown,
      color: "amber",
      description: "Configurado como principal"
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
              <div className={`text-2xl font-bold text-${stat.color}-900`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 