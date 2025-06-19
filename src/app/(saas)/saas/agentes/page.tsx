"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, MessageSquare, Settings, Trash2, Bot, Crown, Users, Play } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Button, Input, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components"
import { PlaygroundChat } from "./_components/playground-chat"
import { mockAgents } from "@/server/api/mock-data"
import { etapasInfo, canalesInfo } from "@/lib/constants/agentes"
import Link from "next/link"
import { type Agent } from "@/domain/Agentes"
import { SectionHeader } from "../_components/header"

export default function AgentesPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showPlayground, setShowPlayground] = useState(false)

  useEffect(() => {
    const loadAgents = async () => {
      try {
        // Forzar modo demo para mostrar datos de ejemplo
        setIsDemo(true)
        setAgents(mockAgents)
        setLoading(false)
        return
      } catch (error: any) {
        console.error("Error:", error)
        setError(`Error de conexión: ${error.message}`)
        setAgents(mockAgents)
        setIsDemo(true)
      } finally {
        setLoading(false)
      }
    }
    void loadAgents()
  }, [])


  // TODO: IMPLEMENTAR ZUSTAND PARA FILTROS CON PERSIST Y SESSION STORAGE
  // Filtro mejorado con validación de null/undefined
  const filteredAgents = agents.filter((agent) => {
    if (!agent || !agent.name) return false
    const agentName = agent.name || ""
    const search = searchTerm || ""
    return agentName.toLowerCase().includes(search.toLowerCase())
  })

  // Estadísticas rápidas
  const stats = {
    total: agents.length,
    activos: agents.filter((a) => a.is_active).length,
    conversaciones: agents.reduce((sum, a) => sum + (a.conversaciones_mes || 0), 0),
    principal: agents.find((a) => a.is_principal)?.name || "No definido",
  }

  const handleTestAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowPlayground(true)
  }

  // TODO: IMPLEMENTAR LOADING Y ERROR HANDLING
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agentes IA</h1>
            <p className="text-muted-foreground">Gestiona tus agentes de inteligencia artificial</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <SectionHeader title={"🤖 Agentes IA"} description={"Gestiona tu embudo de agentes inteligentes"}>
        <Link href="/asistentes/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Agente
          </Button>
        </Link>
      </SectionHeader>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-muted-foreground">Activos</span>
            </div>
            <div className="text-2xl font-bold">{stats.activos}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Conversaciones</span>
            </div>
            <div className="text-2xl font-bold">{stats.conversaciones}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-muted-foreground">Principal</span>
            </div>
            <div className="text-sm font-bold truncate">{stats.principal}</div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value || "")}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/** TODO: REFACTORIZAR EN COMPONENTES SEPARADOS, OPTIMIZAR ROUTING */}
      {/* Playground o Lista de agentes */}
      {showPlayground && selectedAgent ? (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar con lista de agentes */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Agentes</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowPlayground(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedAgent?.id === agent.id
                      ? "bg-blue-100 border-2 border-blue-300"
                      : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium text-sm">{agent.name}</span>
                      {agent.is_principal && <Crown className="h-3 w-3 text-yellow-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant={agent.is_active ? "default" : "secondary"} className="text-xs">
                        {agent.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Área del chat */}
          <div className="lg:col-span-3">
            <PlaygroundChat
              assistantName={selectedAgent.name}
              onFeedbackSubmit={(message, correction) => {
                console.log("Feedback recibido:", { message, correction })
                // Aquí puedes implementar la lógica para guardar el feedback
              }}
              className="h-[600px]"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Lista de agentes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      {agent.name || "Sin nombre"}
                      {agent.is_principal && <Crown className="h-4 w-4 text-yellow-500" />}
                    </CardTitle>
                    <CardDescription className="text-sm">{agent.description || "Sin descripción"}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTestAgent(agent)}>
                        <Play className="mr-2 h-4 w-4" />
                        Probar agente
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Ver conversaciones
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Crown className="mr-2 h-4 w-4" />
                        {agent.is_principal ? "Quitar como principal" : "Marcar como principal"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Estado y modelo */}
                    <div className="flex gap-2">
                      <Badge variant={agent.is_active ? "default" : "secondary"}>
                        {agent.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">{agent.model || "gpt-4"}</Badge>
                      {agent.personalidad && (
                        <Badge variant="outline" className="capitalize">
                          {agent.personalidad}
                        </Badge>
                      )}
                    </div>

                    {/* Etapas del embudo */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Activo en:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.etapas && agent.etapas.length > 0 ? (
                          agent.etapas.map((etapaId) => {
                            const etapa = etapasInfo[etapaId as keyof typeof etapasInfo]
                            const IconComponent = etapa?.icon || Users
                            return (
                              <Badge
                                key={etapaId}
                                className={`${etapa?.color || "bg-gray-100 text-gray-800"} border-0 text-xs flex items-center gap-1`}
                              >
                                <IconComponent className="h-3 w-3" />
                                {etapa?.name || etapaId}
                              </Badge>
                            )
                          })
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Sin etapas asignadas
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Canales */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Canales:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.canales && agent.canales.length > 0 ? (
                          agent.canales.map((canalId) => {
                            const canal = canalesInfo[canalId as keyof typeof canalesInfo]
                            return (
                              <Badge
                                key={canalId}
                                className={`${canal?.color || "bg-gray-100 text-gray-800"} border-0 text-xs`}
                              >
                                {canal?.name || canalId}
                              </Badge>
                            )
                          })
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Sin canales
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Métricas y botón de prueba */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {agent.conversaciones_mes || 0} conversaciones
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleTestAgent(agent)}>
                        <Play className="h-3 w-3 mr-1" />
                        Probar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estado vacío */}
          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <Bot className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay agentes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "No se encontraron agentes con ese criterio." : "Comienza creando tu primer agente."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link href="/asistentes/nuevo">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Agente
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Información del embudo */}
      {!showPlayground && (
        <Card className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Embudo de Agentes
            </h3>
            <div className="grid gap-3 md:grid-cols-4">
              {Object.entries(etapasInfo).map(([key, etapa]) => {
                const IconComponent = etapa.icon
                const agentsInStage = agents.filter((a) => a.etapas?.includes(key)).length
                return (
                  <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <div className={`p-2 rounded-lg ${etapa.color.replace("text-", "bg-").replace("100", "200")}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{etapa.name}</p>
                      <p className="text-xs text-muted-foreground">{agentsInStage} agentes</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
