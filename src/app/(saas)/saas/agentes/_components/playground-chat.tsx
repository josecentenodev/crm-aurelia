"use client"

import { useState, useRef, useEffect } from "react"
import { Button, Input, Avatar, Badge, Textarea, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components"
import { ThumbsUp, ThumbsDown, Send, Bot, User, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message, PlaygroundChatProps } from "@/domain/Mensajes"


export function PlaygroundChat({
  assistantName = "Asistente IA",
  assistantAvatar,
  initialMessages = [],
  onFeedbackSubmit,
  className,
}: PlaygroundChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<Message | null>(null)
  const [correctedAnswer, setCorrectedAnswer] = useState("")
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showThankYou, setShowThankYou] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Simular respuestas del asistente
  const simulateAssistantResponse = async (userMessage: string) => {
    // Agregar mensaje del usuario
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])

    // Mostrar indicador de "escribiendo..."
    const loadingMsgId = Date.now().toString()
    const loadingMsg: Message = {
      id: loadingMsgId,
      type: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMsg])

    // Simular delay de respuesta
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generar respuesta basada en la pregunta
    let response = ""

    if (userMessage.toLowerCase().includes("hola") || userMessage.toLowerCase().includes("hi")) {
      response = `¡Hola! Soy ${assistantName}, ¿en qué puedo ayudarte hoy?`
    } else if (userMessage.toLowerCase().includes("precio") || userMessage.toLowerCase().includes("costo")) {
      response =
        "Nuestros planes comienzan desde $29/mes para el plan básico. También ofrecemos planes Premium ($79/mes) y Enterprise (personalizado). ¿Te gustaría conocer más detalles sobre alguno de estos planes?"
    } else if (userMessage.toLowerCase().includes("horario") || userMessage.toLowerCase().includes("atención")) {
      response =
        "Nuestro horario de atención al cliente es de lunes a viernes de 9:00 AM a 6:00 PM (GMT-3). Los fines de semana contamos con soporte limitado por email."
    } else if (userMessage.toLowerCase().includes("devolución") || userMessage.toLowerCase().includes("reembolso")) {
      response =
        "Ofrecemos una garantía de devolución de 30 días. Si no estás satisfecho con nuestro servicio, puedes solicitar un reembolso completo dentro de los primeros 30 días de tu suscripción."
    } else {
      response =
        "Gracias por tu pregunta. En este momento estoy en modo de prueba y tengo información limitada. ¿Hay algo más en lo que pueda ayudarte?"
    }

    // Reemplazar el mensaje de carga con la respuesta real
    setMessages((prev) =>
      prev.map((msg) => (msg.id === loadingMsgId ? { ...msg, content: response, isLoading: false } : msg)),
    )

    setIsLoading(false)
  }

  // Manejar envío de mensajes
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const message = inputValue.trim()
    setInputValue("")
    await simulateAssistantResponse(message)
  }

  // Manejar feedback positivo
  const handlePositiveFeedback = (message: Message) => {
    setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, feedback: "positive" } : msg)))

    setShowThankYou(message.id)
    setTimeout(() => setShowThankYou(null), 2000)

    if (onFeedbackSubmit) {
      onFeedbackSubmit({ ...message, feedback: "positive" })
    }
  }

  // Manejar feedback negativo
  const handleNegativeFeedback = (message: Message) => {
    setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, feedback: "negative" } : msg)))

    setFeedbackMessage(message)
    setCorrectedAnswer("")
    setShowFeedbackModal(true)
  }

  // Enviar corrección
  const handleSubmitCorrection = () => {
    if (feedbackMessage && onFeedbackSubmit) {
      onFeedbackSubmit({ ...feedbackMessage, feedback: "negative" }, correctedAnswer)
    }

    setShowFeedbackModal(false)
    setShowThankYou(feedbackMessage?.id ?? null)
    setTimeout(() => setShowThankYou(null), 2000)
  }

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showFeedbackModal) {
        setShowFeedbackModal(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [showFeedbackModal])

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && showFeedbackModal) {
        setShowFeedbackModal(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showFeedbackModal])

  return (
    <div className={cn("flex flex-col h-[500px] border rounded-xl overflow-hidden bg-white relative", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 bg-blue-100">
            {assistantAvatar ? (
              <img src={assistantAvatar || "/placeholder.svg"} alt={assistantName} />
            ) : (
              <Bot className="h-5 w-5 text-blue-700" />
            )}
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{assistantName}</h3>
            <p className="text-xs text-gray-500">Playground de prueba</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Modo Prueba
        </Badge>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Bot className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-700">Prueba tu asistente</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              Escribe un mensaje para ver cómo respondería tu asistente en base a la configuración actual.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", {
                "justify-end": message.type === "user",
                "justify-start": message.type === "assistant",
              })}
            >
              <div
                className={cn("flex max-w-[80%]", {
                  "flex-row-reverse": message.type === "user",
                })}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center">
                  {message.type === "user" ? (
                    <Avatar className="bg-gray-100">
                      <User className="h-5 w-5 text-gray-600" />
                    </Avatar>
                  ) : (
                    <Avatar className="bg-blue-100">
                      {assistantAvatar ? (
                        <img src={assistantAvatar || "/placeholder.svg"} alt={assistantName} />
                      ) : (
                        <Bot className="h-5 w-5 text-blue-700" />
                      )}
                    </Avatar>
                  )}
                </div>

                <div
                  className={cn("mx-2 px-4 py-2 rounded-xl", {
                    "bg-blue-600 text-white": message.type === "user",
                    "bg-gray-100 text-gray-800": message.type === "assistant",
                  })}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-gray-500 text-sm">Escribiendo...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {/* Feedback buttons - only for assistant messages */}
                      {message.type === "assistant" && !message.isLoading && (
                        <div className="mt-2 flex items-center justify-end space-x-3">
                          {showThankYou === message.id ? (
                            <span className="text-sm text-green-600 flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              ¡Gracias por tu feedback!
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handlePositiveFeedback(message)}
                                className={cn(
                                  "p-1.5 rounded-full hover:bg-gray-200 transition-colors flex items-center",
                                  message.feedback === "positive"
                                    ? "text-green-600"
                                    : "text-gray-500 hover:text-green-600",
                                )}
                                disabled={message.feedback !== null}
                                aria-label="Respuesta útil"
                              >
                                <ThumbsUp className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleNegativeFeedback(message)}
                                className={cn(
                                  "p-1.5 rounded-full hover:bg-gray-200 transition-colors flex items-center",
                                  message.feedback === "negative" ? "text-red-600" : "text-gray-500 hover:text-red-600",
                                )}
                                disabled={message.feedback !== null}
                                aria-label="Respuesta no útil"
                              >
                                <ThumbsDown className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-xl"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void handleSendMessage()
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className="rounded-xl">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Custom Feedback Modal (instead of Dialog) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4" ref={modalRef}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  Ayúdanos a mejorar
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowFeedbackModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">Tu feedback nos ayuda a mejorar las respuestas del asistente.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Respuesta del asistente:</h4>
                <p className="text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {feedbackMessage?.content ?? "Respuesta del asistente"}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">¿Cuál sería la respuesta correcta?</h4>
                <Textarea
                  value={correctedAnswer}
                  onChange={(e) => setCorrectedAnswer(e.target.value)}
                  placeholder="Escribe la respuesta correcta aquí..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitCorrection} className="bg-blue-600 hover:bg-blue-700">
                Enviar corrección
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
