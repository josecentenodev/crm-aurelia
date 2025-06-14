"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import { Input } from "../../_components/ui/input"
import { Badge } from "../../_components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../_components/ui/select"
import { Switch } from "../../_components/ui/switch"
import { Label } from "../../_components/ui/label"
import { ArrowLeft, Send, Bot, User, Phone, Mail, MapPin, Calendar, Plus, Clock } from "lucide-react"
import { mockConversaciones, mockMensajes } from "@/server/api/mock-data"
import { ActivityModal } from "../../_components/activity-modal"
import { useParams } from 'next/navigation'

// TODO: REFACTORIZAR ESTE COMPONENTE. SEPARAR RESPONSABILIDADES Y MEJORAR LA ESTRUCTURA.
// ES UN COMPONENTE MUY GRANDE Y COMPLEJO. TIENE MUCHAS FUNCIONALIDADES.

export default function ConversacionDetallePage() {
  const params = useParams<{ id: string }>()
  const [mensajes, setMensajes] = useState(mockMensajes)
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [estadoLead, setEstadoLead] = useState("nuevo")
  const [iaActiva, setIaActiva] = useState(true)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Encontrar la conversación actual
  const conversacion = mockConversaciones.find((c) => c.id === params.id)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const handleEnviarMensaje = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoMensaje.trim()) return

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

    setMensajes([...mensajes, mensaje])
    setNuevoMensaje("")

    // Solo responder automáticamente si la IA está activa
    if (iaActiva) {
      setTimeout(() => {
        const respuestaAsistente = {
          id: (Date.now() + 1).toString(),
          tipo: "asistente" as const,
          contenido: "Gracias por tu mensaje. Un agente revisará tu consulta y te contactará pronto.",
          timestamp: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          fecha: new Date().toLocaleDateString("es-ES"),
        }
        setMensajes((prev) => [...prev, respuestaAsistente])
      }, 2000)
    }
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

  if (!conversacion) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Conversación no encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/conversaciones">
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-aurelia-primary to-aurelia-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{conversacion.nombreLead.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{conversacion.nombreLead}</h1>
              <p className="text-gray-600">Conversación en {conversacion.canal}</p>
            </div>
          </div>
        </div>
        <Badge className={`${getEstadoColor(conversacion.estado)} border-0`}>{conversacion.estado}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl shadow-sm border-0 bg-white h-[600px] flex flex-col">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-aurelia-primary" />
                  <span className="font-semibold">Chat en Tiempo Real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ia-toggle" className="text-sm">
                    IA {iaActiva ? "Activa" : "Inactiva"}
                  </Label>
                  <Switch id="ia-toggle" checked={iaActiva} onCheckedChange={setIaActiva} />
                </div>
              </div>
              <CardDescription>Conversación con {conversacion.nombreLead}</CardDescription>
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
                  placeholder="Escribe un mensaje..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  className="flex-1 rounded-xl"
                />
                <Button type="submit" className="bg-aurelia-primary hover:bg-purple-700 rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Info del Lead */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle>Información del Lead</CardTitle>
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

          {/* Estado del Lead */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle>Estado del Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Button
                className="w-full bg-aurelia-primary hover:bg-purple-700 rounded-xl"
                onClick={() => setShowActivityModal(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Actividad
              </Button>
            </CardContent>
          </Card>

          {/* Actividades Próximas */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Actividades</CardTitle>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowActivityModal(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Llamada de seguimiento</p>
                  <p className="text-xs text-gray-500">Mañana 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl">
                <Calendar className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Reunión de presentación</p>
                  <p className="text-xs text-gray-500">Viernes 2:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total mensajes:</span>
                <span className="text-sm font-medium">{mensajes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Primer contacto:</span>
                <span className="text-sm font-medium">{conversacion.fechaUltimoMensaje}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Canal:</span>
                <span className="text-sm font-medium">{conversacion.canal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IA:</span>
                <span className={`text-sm font-medium ${iaActiva ? "text-green-600" : "text-red-600"}`}>
                  {iaActiva ? "Activa" : "Inactiva"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Actividades */}
      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        contactName={conversacion.nombreLead}
        conversationId={conversacion.id}
      />
    </div>
  )
}
