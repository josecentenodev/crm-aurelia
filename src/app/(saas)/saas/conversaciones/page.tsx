"use client"

import { useState, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardContent, Input, Badge } from "@/components"
import { Search, Filter } from "lucide-react"
import { mockConversaciones } from "@/server/api/mock-data"
import { ChatView } from "../_components/chat-view"

// TODO: ESTE COMPONENET ES MUY COMPLEJO Y DEBERÍA SER REFACTORIZADO, SEPARAR RESPONSABILIDADES, MEJORAR LA ESCALABILIDAD

export default function ConversacionesPage() {
  const [conversaciones, setConversaciones] = useState(mockConversaciones)
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState<string>(conversaciones[0]?.id ?? "")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollPosition = useRef(0)

  // Filtrar conversaciones
  const conversacionesFiltradas = conversaciones.filter((conv) => {
    const matchEstado = filtroEstado === "todos" || conv.estado === filtroEstado
    const matchBusqueda =
      conv.nombreLead.toLowerCase().includes(busqueda.toLowerCase()) ||
      conv.ultimoMensaje.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

  // Mantener la posición de scroll cuando se selecciona una conversación
  useEffect(() => {
    if (chatContainerRef.current) {
      // Guardar la posición actual antes de cambiar
      lastScrollPosition.current = window.scrollY
    }
  }, [conversacionSeleccionada])

  // Restaurar la posición de scroll después de renderizar
  useEffect(() => {
    if (lastScrollPosition.current > 0) {
      window.scrollTo(0, lastScrollPosition.current)
    }
  }, [conversacionSeleccionada])

  const handleSelectConversacion = (id: string) => {
    // Prevenir el comportamiento predeterminado de scroll
    setConversacionSeleccionada(id)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "nuevo":
        return "bg-blue-100 text-blue-800"
      case "calificado":
        return "bg-green-100 text-green-800"
      case "agendado":
        return "bg-purple-100 text-purple-800"
      case "descartado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const conversacionActual = conversaciones.find((c) => c.id === conversacionSeleccionada)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversaciones</h1>
        <p className="text-gray-600 mt-1">Gestiona todas las conversaciones con tus leads</p>
      </div>

      <div className="flex gap-6" style={{ height: "calc(100vh - 12rem)" }} ref={chatContainerRef}>
        {/* Lista de Conversaciones */}
        <div className="w-1/3 flex flex-col" style={{ height: "calc(100vh - 12rem)" }}>
          {/* Filtros */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="nuevo">Nuevos</SelectItem>
                    <SelectItem value="calificado">Calificados</SelectItem>
                    <SelectItem value="agendado">Agendados</SelectItem>
                    <SelectItem value="descartado">Descartados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Conversaciones - Altura calculada para llenar el espacio restante */}
          <div className="flex-1 overflow-y-auto space-y-3 p-1">
            {conversacionesFiltradas.map((conversacion) => (
              <Card
                key={conversacion.id}
                className={`rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-all cursor-pointer ${
                  conversacionSeleccionada === conversacion.id ? "ring-2 ring-aurelia-primary" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  handleSelectConversacion(conversacion.id)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-aurelia-primary to-aurelia-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {conversacion.nombreLead.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{conversacion.nombreLead}</h3>
                        <Badge className={`${getEstadoColor(conversacion.estado)} border-0 text-xs`}>
                          {conversacion.estado}
                        </Badge>
                      </div>
                      <p className="text-gray-600 truncate text-sm mb-2">{conversacion.ultimoMensaje}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{conversacion.canal}</span>
                        <span>•</span>
                        <span>{conversacion.fechaUltimoMensaje}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat View */}
        <div className="w-2/3" style={{ height: "calc(100vh - 12rem)" }}>
          {conversacionActual && (
            <ChatView conversacion={conversacionActual} onClose={() => {console.log('close conversation')}} showCloseButton={false} />
          )}
        </div>
      </div>
    </div>
  )
}
