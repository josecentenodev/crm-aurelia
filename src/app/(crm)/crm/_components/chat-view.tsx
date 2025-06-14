"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import { X, Send, Bot, User, Phone, Mail, MapPin, Calendar } from "lucide-react"

// Diferentes historiales de mensajes para cada conversación
const mensajesPorConversacion: { [key: string]: any[] } = {
  "1": [
    {
      id: "1",
      tipo: "asistente" as const,
      contenido: "¡Hola! Soy el Asistente Inmobiliario de Aurelia. ¿En qué puedo ayudarte hoy?",
      timestamp: "14:25",
      fecha: "16 Nov 2024",
    },
    {
      id: "2",
      tipo: "usuario" as const,
      contenido: "Hola, estoy buscando un departamento para comprar",
      timestamp: "14:26",
      fecha: "16 Nov 2024",
    },
    {
      id: "3",
      tipo: "asistente" as const,
      contenido:
        "Perfecto, me encanta ayudarte con eso. Para encontrar las mejores opciones, ¿podrías contarme un poco más sobre lo que buscas? Por ejemplo: ¿cuántos ambientes necesitas?",
      timestamp: "14:26",
      fecha: "16 Nov 2024",
    },
    {
      id: "4",
      tipo: "usuario" as const,
      contenido: "Busco un 2 ambientes, preferiblemente en Palermo",
      timestamp: "14:28",
      fecha: "16 Nov 2024",
    },
    {
      id: "5",
      tipo: "asistente" as const,
      contenido: "Excelente elección de zona. ¿Cuál es tu presupuesto aproximado para esta compra?",
      timestamp: "14:29",
      fecha: "16 Nov 2024",
    },
    {
      id: "6",
      tipo: "usuario" as const,
      contenido: "Mi presupuesto está entre $180,000 y $220,000 USD",
      timestamp: "14:30",
      fecha: "16 Nov 2024",
    },
  ],
  "2": [
    {
      id: "1",
      tipo: "asistente" as const,
      contenido: "¡Hola! Soy tu asistente automotriz. ¿Estás buscando un vehículo?",
      timestamp: "13:40",
      fecha: "16 Nov 2024",
    },
    {
      id: "2",
      tipo: "usuario" as const,
      contenido: "Sí, necesito un auto usado",
      timestamp: "13:41",
      fecha: "16 Nov 2024",
    },
    {
      id: "3",
      tipo: "asistente" as const,
      contenido: "Genial! ¿Qué tipo de vehículo tienes en mente? ¿Sedan, SUV, hatchback?",
      timestamp: "13:41",
      fecha: "16 Nov 2024",
    },
    {
      id: "4",
      tipo: "usuario" as const,
      contenido: "Prefiero un sedan, algo confiable",
      timestamp: "13:43",
      fecha: "16 Nov 2024",
    },
    {
      id: "5",
      tipo: "asistente" as const,
      contenido: "Perfecto! ¿Cuál es tu presupuesto aproximado?",
      timestamp: "13:44",
      fecha: "16 Nov 2024",
    },
    {
      id: "6",
      tipo: "usuario" as const,
      contenido: "Mi presupuesto es de $25,000 USD",
      timestamp: "13:45",
      fecha: "16 Nov 2024",
    },
  ],
  "3": [
    {
      id: "1",
      tipo: "asistente" as const,
      contenido: "¡Hola! Soy tu consultor de seguros. ¿En qué puedo ayudarte?",
      timestamp: "12:15",
      fecha: "16 Nov 2024",
    },
    {
      id: "2",
      tipo: "usuario" as const,
      contenido: "Necesito información sobre seguros de vida",
      timestamp: "12:16",
      fecha: "16 Nov 2024",
    },
    {
      id: "3",
      tipo: "asistente" as const,
      contenido: "Excelente decisión proteger a tu familia. ¿Cuántas personas dependen económicamente de ti?",
      timestamp: "12:16",
      fecha: "16 Nov 2024",
    },
    {
      id: "4",
      tipo: "usuario" as const,
      contenido: "Somos 4 en la familia, mi esposa y dos hijos",
      timestamp: "12:18",
      fecha: "16 Nov 2024",
    },
    {
      id: "5",
      tipo: "asistente" as const,
      contenido:
        "Perfecto. Para calcular la cobertura adecuada, ¿podrías contarme cuáles son tus ingresos mensuales aproximados?",
      timestamp: "12:19",
      fecha: "16 Nov 2024",
    },
    {
      id: "6",
      tipo: "usuario" as const,
      contenido: "Mis ingresos son de aproximadamente $8,000 USD mensuales",
      timestamp: "12:20",
      fecha: "16 Nov 2024",
    },
  ],
}

interface ChatViewProps {
  conversacion: any
  onClose: () => void
  showCloseButton?: boolean
}

export function ChatView({ conversacion, onClose, showCloseButton = true }: ChatViewProps) {
  const [mensajes, setMensajes] = useState(mensajesPorConversacion[conversacion.id] || [])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [estadoLead, setEstadoLead] = useState(conversacion.estado)
  const [vendedorAsignado, setVendedorAsignado] = useState(conversacion.vendedorAsignado || "")
  const [iaActiva, setIaActiva] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Actualizar mensajes cuando cambia la conversación
  useEffect(() => {
    setMensajes(mensajesPorConversacion[conversacion.id] || [])
    setEstadoLead(conversacion.estado)
    setVendedorAsignado(conversacion.vendedorAsignado || "")
    setIaActiva(true) // Reset IA state for new conversation
  }, [conversacion.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const handleEnviarMensaje = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoMensaje.trim() || iaActiva) return

    const mensaje = {
      id: Date.now().toString(),
      tipo: "usuario" as const,
      contenido: nuevoMensaje,
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fecha: new Date().toLocaleDateString("es-ES"),
    }

    const nuevosMensajes = [...mensajes, mensaje]
    setMensajes(nuevosMensajes)

    // Actualizar el historial para esta conversación
    mensajesPorConversacion[conversacion.id] = nuevosMensajes

    setNuevoMensaje("")
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

  return (
    <div className="h-full flex flex-col">
      {/* Header del Chat */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-aurelia-primary to-aurelia-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{conversacion.nombreLead.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <CardTitle className="text-lg">{conversacion.nombreLead}</CardTitle>
                <CardDescription>Conversación en {conversacion.canal}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getEstadoColor(estadoLead)} border-0`}>{estadoLead}</Badge>
              {showCloseButton && (
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Chat */}
        <div className="col-span-2 flex flex-col">
          <Card className="rounded-2xl shadow-sm border-0 bg-white flex flex-col flex-1">
            <CardHeader className="border-b border-gray-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {iaActiva ? <Bot className="w-5 h-5 text-green-500" /> : <User className="w-5 h-5 text-blue-500" />}
                  <span>Chat {iaActiva ? "Automático" : "Manual"}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch checked={iaActiva} onCheckedChange={setIaActiva} />
                  <span className="text-sm text-gray-600">IA</span>
                </div>
              </div>
            </CardHeader>

            {/* Mensajes */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`flex ${mensaje.tipo === "usuario" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                      mensaje.tipo === "usuario" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        mensaje.tipo === "usuario" ? "bg-aurelia-primary" : "bg-gray-200"
                      }`}
                    >
                      {mensaje.tipo === "usuario" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        mensaje.tipo === "usuario" ? "bg-aurelia-primary text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{mensaje.contenido}</p>
                      <p className={`text-xs mt-1 ${mensaje.tipo === "usuario" ? "text-purple-200" : "text-gray-500"}`}>
                        {mensaje.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input de mensaje */}
            <div className="border-t border-gray-100 p-4">
              <form onSubmit={handleEnviarMensaje} className="flex space-x-2">
                <Input
                  placeholder={iaActiva ? "Para tomar conversación apagar IA" : "Escribe un mensaje..."}
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  disabled={iaActiva}
                  className={`flex-1 rounded-xl ${iaActiva ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
                <Button
                  type="submit"
                  disabled={iaActiva}
                  className={`rounded-xl ${iaActiva ? "bg-gray-400 cursor-not-allowed" : "bg-aurelia-primary hover:bg-purple-700"}`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Panel de Información - Usando flex-1 para llenar el espacio disponible */}
        <div className="flex flex-col space-y-4">
          {/* Info del Contacto */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle>Información del Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{conversacion.nombreLead}</p>
                  <p className="text-xs text-gray-500">Nombre completo</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">+54 9 11 1234-5678</p>
                  <p className="text-xs text-gray-500">Teléfono</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">lead@email.com</p>
                  <p className="text-xs text-gray-500">Email</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Buenos Aires, Argentina</p>
                  <p className="text-xs text-gray-500">Ubicación</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestión del Lead - Usando flex-1 para que se expanda y llene el espacio restante */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Gestión del Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <Select value={estadoLead} onValueChange={setEstadoLead}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuevo">Nuevo</SelectItem>
                      <SelectItem value="calificado">Calificado</SelectItem>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="descartado">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Vendedor Asignado</label>
                  <Select value={vendedorAsignado} onValueChange={setVendedorAsignado}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juan-perez">Juan Pérez</SelectItem>
                      <SelectItem value="maria-garcia">María García</SelectItem>
                      <SelectItem value="carlos-lopez">Carlos López</SelectItem>
                      <SelectItem value="ana-martinez">Ana Martínez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botón al final */}
              <Button className="w-full bg-aurelia-primary hover:bg-purple-700 rounded-xl mt-auto">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Reunión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
