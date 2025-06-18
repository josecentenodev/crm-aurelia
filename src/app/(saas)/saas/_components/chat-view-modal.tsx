"use client"
// TODO: Migrar este componente al directorio correspondiente al feature especifico
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Badge, Switch } from "@/components"
import { X, Send, Bot, User } from "lucide-react"

// Diferentes historiales de mensajes para cada conversación
const mensajesPorConversacion: { [key: string]: any[] } = {
  "1": [
    {
      id: "1",
      tipo: "asistente" as const,
      contenido: "¡Hola María! Veo que estás interesada en propiedades inmobiliarias. ¿En qué puedo ayudarte?",
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
      contenido: "Perfecto! ¿Cuántos ambientes necesitas y en qué zona te gustaría?",
      timestamp: "14:26",
      fecha: "16 Nov 2024",
    },
  ],
  "2": [
    {
      id: "1",
      tipo: "asistente" as const,
      contenido: "¡Hola Carlos! Vi que tienes interés en vehículos. ¿Qué tipo de auto buscas?",
      timestamp: "13:40",
      fecha: "16 Nov 2024",
    },
    {
      id: "2",
      tipo: "usuario" as const,
      contenido: "Necesito un sedan usado, algo confiable",
      timestamp: "13:41",
      fecha: "16 Nov 2024",
    },
  ],
  "3": [
    {
      id: "1",
      tipo: "asistente" as const,
      contenido: "¡Hola Ana! Veo que consultas sobre seguros de vida. ¿Es para proteger a tu familia?",
      timestamp: "12:15",
      fecha: "16 Nov 2024",
    },
    {
      id: "2",
      tipo: "usuario" as const,
      contenido: "Sí, somos 4 en la familia y quiero asegurarlos",
      timestamp: "12:16",
      fecha: "16 Nov 2024",
    },
  ],
}

interface ChatViewModalProps {
  conversacion: any
  onClose: () => void
}

export function ChatViewModal({ conversacion, onClose }: ChatViewModalProps) {
  const [mensajes, setMensajes] = useState(mensajesPorConversacion[conversacion.id] || [])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [iaActiva, setIaActiva] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Actualizar mensajes cuando cambia la conversación
  useEffect(() => {
    setMensajes(mensajesPorConversacion[conversacion.id] || [])
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
      case "prospecto":
        return "bg-blue-100 text-blue-800"
      case "calificado":
        return "bg-green-100 text-green-800"
      case "propuesta":
        return "bg-yellow-100 text-yellow-800"
      case "cerrado":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed right-6 top-6 bottom-6 w-1/3 z-50">
        <Card className="rounded-2xl shadow-2xl border-2 border-aurelia-primary bg-white h-full flex flex-col">
          {/* Header del Chat */}
          <CardHeader className="border-b border-gray-100 pb-3">
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
                <Badge className={`${getEstadoColor(conversacion.estado)} border-0`}>{conversacion.estado}</Badge>
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Control de IA */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {iaActiva ? <Bot className="w-5 h-5 text-green-500" /> : <User className="w-5 h-5 text-blue-500" />}
                <span className="text-sm font-medium">Chat {iaActiva ? "Automático" : "Manual"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={iaActiva} onCheckedChange={setIaActiva} />
                <span className="text-sm text-gray-600">IA</span>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {mensajes.map((mensaje) => (
              <div key={mensaje.id} className={`flex ${mensaje.tipo === "usuario" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-xs ${
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
    </>
  )
}
