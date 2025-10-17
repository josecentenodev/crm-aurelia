"use client"
import type { Agent } from "@/domain/Agentes"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Bot } from "lucide-react"

import { Button } from "@/components/ui/button"
import IntegratedPlayground from "../_components/IntegratedPlayground"

import { useAgentesProvider } from "@/providers/AgentesProvider"

export default function PlaygroundPage() {
  const params = useParams()
  const router = useRouter()
  const agentesProvider = useAgentesProvider()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const agentId = params.id as string

  // Buscar el agente específico
  useEffect(() => {
    if (agentesProvider.agentes && agentId) {
      const agent = agentesProvider.agentes.find(a => a.id === agentId)
      setSelectedAgent(agent ?? null)
    }
  }, [agentesProvider.agentes, agentId])

  // Mostrar loading si está cargando
  if (agentesProvider.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-200 border-t-violet-600 mx-auto mb-6"></div>
            <p className="text-gray-500 text-lg">Cargando agente...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error si hay error
  if (agentesProvider.error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar agente</h3>
            <p className="text-gray-500 mb-6">{typeof agentesProvider.error === 'string' ? agentesProvider.error : agentesProvider.error?.message ?? 'Error desconocido'}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Si no se encontró el agente
  if (!selectedAgent) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Agente no encontrado</h3>
            <p className="text-gray-500 mb-6">El agente que buscas no existe o no tienes permisos para acceder a él</p>
            <Button 
              onClick={() => router.push('/saas/agentes')}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Volver a agentes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/saas/agentes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Playground</h1>
            <p className="text-gray-600">Probando: {selectedAgent.name}</p>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => router.push(`/saas/agentes/${selectedAgent.id}/editar`)}
        >
          Configurar agente
        </Button>
      </div>

      {/* Playground */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full" style={{ height: 'calc(100vh - 200px)' }}>
        <IntegratedPlayground selectedAgent={selectedAgent} />
      </div>
    </div>
  )
} 
