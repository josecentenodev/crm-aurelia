"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../_components/ui/card"
import { Button } from "../../../_components/ui/button"
import { Input } from "../../../_components/ui/input"
import { Label } from "../../../_components/ui/label"
import { Textarea } from "../../../_components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../_components/ui/select"
import { Badge } from "../../../_components/ui/badge"
import { Progress } from "../../../_components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Upload,
  Plus,
  X,
  Check,
  AlertCircle,
  MessageSquare,
  Settings,
  BarChart3,
  FileText,
  HelpCircle,
  PlayCircle,
  Zap,
  Pause,
  Play,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { PlaygroundChat } from "../../../_components/playground-chat"
import { Separator } from "../../../_components/ui/separator"
import { Switch } from "../../../_components/ui/switch"

const PASOS_FAQ = [
  {
    id: 1,
    titulo: "Información Básica",
    icono: BookOpen,
    descripcion: "Configura los datos básicos del asistente",
  },
  {
    id: 2,
    titulo: "Base de Conocimiento",
    icono: FileText,
    descripcion: "Sube documentos y crea FAQs",
  },
  {
    id: 3,
    titulo: "Configuración de Respuestas",
    icono: Settings,
    descripcion: "Define cómo responderá el asistente",
  },
  {
    id: 4,
    titulo: "Canales",
    icono: MessageSquare,
    descripcion: "Conecta los canales de comunicación",
  },
  {
    id: 5,
    titulo: "Escalamiento",
    icono: HelpCircle,
    descripcion: "Define cuándo transferir a humano",
  },
  {
    id: 6,
    titulo: "Automatizaciones",
    icono: Zap,
    descripcion: "Configura reglas automáticas",
  },
  {
    id: 7,
    titulo: "Revisión",
    icono: BarChart3,
    descripcion: "Revisa y activa tu asistente",
  },
  {
    id: 8,
    titulo: "Playground",
    icono: PlayCircle,
    descripcion: "Prueba tu asistente",
  },
]

const CATEGORIAS_FAQ = [
  { id: "productos", nombre: "Productos y Servicios", color: "bg-blue-100 text-blue-800" },
  { id: "soporte", nombre: "Soporte Técnico", color: "bg-green-100 text-green-800" },
  { id: "facturacion", nombre: "Facturación y Pagos", color: "bg-yellow-100 text-yellow-800" },
  { id: "envios", nombre: "Envíos y Devoluciones", color: "bg-purple-100 text-purple-800" },
  { id: "cuenta", nombre: "Gestión de Cuenta", color: "bg-pink-100 text-pink-800" },
  { id: "politicas", nombre: "Políticas y Términos", color: "bg-gray-100 text-gray-800" },
  { id: "general", nombre: "Información General", color: "bg-orange-100 text-orange-800" },
]

const CANALES_DISPONIBLES = [
  {
    id: "whatsapp",
    nombre: "WhatsApp Business",
    descripcion: "Respuestas automáticas por WhatsApp",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "web",
    nombre: "Chat Web",
    descripcion: "Widget de chat para tu sitio web",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "facebook",
    nombre: "Facebook Messenger",
    descripcion: "Respuestas en Messenger",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "email",
    nombre: "Email",
    descripcion: "Respuestas automáticas por email",
    color: "bg-gray-100 text-gray-800",
  },
]

export default function NuevoAsistenteFAQPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pasoActual, setPasoActual] = useState(1)
  const [loading, setLoading] = useState(false)

  const [nuevaFrase, setNuevaFrase] = useState("")

  const [formData, setFormData] = useState({
    // Paso 1: Información Básica
    nombre_asistente: "",
    nombre_empresa: "",
    area_soporte: "",
    descripcion: "",
    idioma_principal: "es",

    // Paso 2: Base de Conocimiento
    documentos_subidos: [] as any[],
    faqs_manuales: [] as { pregunta: string; respuesta: string; categoria: string }[],
    categorias_activas: [] as string[],

    // Paso 3: Configuración de Respuestas
    nivel_confianza: 0.8,
    estilo_respuesta: "profesional",
    longitud_respuesta: "media",
    incluir_fuentes: true,
    respuesta_no_sabe: "Lo siento, no tengo información sobre esa consulta. Te conectaré con un agente humano.",

    // Paso 4: Canales
    canales_activos: [] as string[],
    mensaje_bienvenida: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",

    // Paso 5: Escalamiento
    escalamiento_automatico: true,
    tiempo_respuesta_max: 30,
    palabras_escalamiento: ["hablar con humano", "agente", "persona real", "no entiendo"],
    horario_soporte: {
      activo: true,
      inicio: "09:00",
      fin: "18:00",
      dias: ["lunes", "martes", "miercoles", "jueves", "viernes"],
    },

    // Configuración IA
    modelo: "gpt-4",
    temperatura: 0.3, // Más conservador para FAQ

    // Paso 6: Automatizaciones
    automatizaciones: [] as {
      id: string
      nombre: string
      descripcion: string
      trigger: string
      accion: string
      condiciones: string
      activa: boolean
      ejecutado: number
      ultimaEjecucion: string
    }[],
  })

  // Estado para el feedback del playground
  const [feedbackStats, setFeedbackStats] = useState({
    positive: 0,
    negative: 0,
    corrections: [] as { question: string; incorrectAnswer: string; correctAnswer: string }[],
  })

  const progreso = (pasoActual / PASOS_FAQ.length) * 100

  const handleSiguiente = () => {
    if (pasoActual < PASOS_FAQ.length) {
      setPasoActual(pasoActual + 1)
    }
  }

  const handleAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const agregarFAQ = (faq: { pregunta: string; respuesta: string; categoria: string }) => {
    if (!faq.pregunta.trim() || !faq.respuesta.trim()) return

    setFormData((prev) => ({
      ...prev,
      faqs_manuales: [...prev.faqs_manuales, faq],
    }))
  }

  const removerFAQ = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs_manuales: prev.faqs_manuales.filter((_, i) => i !== index),
    }))
  }

  const toggleCategoria = (categoriaId: string) => {
    setFormData((prev) => ({
      ...prev,
      categorias_activas: prev.categorias_activas.includes(categoriaId)
        ? prev.categorias_activas.filter((c) => c !== categoriaId)
        : [...prev.categorias_activas, categoriaId],
    }))
  }

  const toggleCanal = (canalId: string) => {
    setFormData((prev) => ({
      ...prev,
      canales_activos: prev.canales_activos.includes(canalId)
        ? prev.canales_activos.filter((c) => c !== canalId)
        : [...prev.canales_activos, canalId],
    }))
  }

  const handleFeedbackSubmit = (message: any, correctedAnswer?: string) => {
    if (message.feedback === "positive") {
      setFeedbackStats((prev) => ({
        ...prev,
        positive: prev.positive + 1,
      }))
    } else if (message.feedback === "negative" && correctedAnswer) {
      setFeedbackStats((prev) => ({
        ...prev,
        negative: prev.negative + 1,
        corrections: [
          ...prev.corrections,
          {
            question: "Pregunta del usuario", // En un caso real, esto vendría del contexto
            incorrectAnswer: message.content,
            correctAnswer: correctedAnswer,
          },
        ],
      }))

      // En un caso real, aquí guardaríamos la corrección en la base de conocimiento
      console.log("Guardando corrección:", {
        incorrectAnswer: message.content,
        correctAnswer: correctedAnswer,
      })

      // También podríamos agregar automáticamente a las FAQs
      if (formData.categorias_activas.length > 0) {
        agregarFAQ({
          pregunta: "Pregunta del usuario", // En un caso real, esto vendría del contexto
          respuesta: correctedAnswer,
          categoria: formData.categorias_activas[0],
        })
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      console.log("Creando asistente FAQ:", formData)
      console.log("Feedback recibido:", feedbackStats)

      toast({
        title: "¡Asistente FAQ Creado!",
        description: `${formData.nombre_asistente} está listo para responder preguntas`,
      })

      router.push("/asistentes")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el asistente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return <Paso1InformacionBasica formData={formData} onChange={handleInputChange} />
      case 2:
        return (
          <Paso2BaseConocimiento
            formData={formData}
            onChange={handleInputChange}
            onAgregarFAQ={agregarFAQ}
            onRemoverFAQ={removerFAQ}
            onToggleCategoria={toggleCategoria}
          />
        )
      case 3:
        return <Paso3ConfiguracionRespuestas formData={formData} onChange={handleInputChange} />
      case 4:
        return <Paso4Canales formData={formData} onChange={handleInputChange} onToggleCanal={toggleCanal} />
      case 5:
        return <Paso5Escalamiento formData={formData} onChange={handleInputChange} />
      case 6:
        return <Paso6Automatizaciones formData={formData} onChange={handleInputChange} />
      case 7:
        return <Paso7Revision formData={formData} />
      case 8:
        return (
          <Paso8Playground formData={formData} feedbackStats={feedbackStats} onFeedbackSubmit={handleFeedbackSubmit} />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/asistentes/nuevo">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Asistente de FAQ</h1>
            <p className="text-gray-600 mt-1">Configura un asistente especializado en responder preguntas frecuentes</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Progreso de Configuración</h3>
            <span className="text-sm text-gray-500">
              {pasoActual} de {PASOS_FAQ.length}
            </span>
          </div>
          <Progress value={progreso} className="mb-4" />
          <div className="grid grid-cols-7 gap-2">
            {PASOS_FAQ.map((paso) => {
              const Icono = paso.icono
              const completado = pasoActual > paso.id
              const actual = pasoActual === paso.id

              return (
                <div
                  key={paso.id}
                  className={`text-center p-2 rounded-lg transition-all ${
                    completado
                      ? "bg-green-50 text-green-700"
                      : actual
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {completado ? <Check className="w-5 h-5" /> : <Icono className="w-5 h-5" />}
                  </div>
                  <p className="text-xs font-medium">{paso.titulo}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-3">{renderPaso()}</div>

        {/* Sidebar con Preview */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Vista Previa</span>
              </CardTitle>
              <CardDescription>Configuración actual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">{formData.nombre_asistente || "Asistente FAQ"}</h4>
                <p className="text-sm text-gray-600 mb-3">{formData.area_soporte || "Área de soporte"}</p>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>• FAQs: {formData.faqs_manuales.length} configuradas</div>
                  <div>• Categorías: {formData.categorias_activas.length} activas</div>
                  <div>• Canales: {formData.canales_activos.length} conectados</div>
                  <div>• Confianza: {Math.round(formData.nivel_confianza * 100)}%</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-sm text-gray-600">{formData.mensaje_bienvenida}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips del paso actual */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <span>Consejos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TipsFAQ paso={pasoActual} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navegación */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleAnterior} disabled={pasoActual === 1} className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {pasoActual === PASOS_FAQ.length ? (
              <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                {loading ? "Creando..." : "Crear Asistente FAQ"}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSiguiente} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Paso 1: Información Básica
function Paso1InformacionBasica({ formData, onChange }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>Información Básica</span>
        </CardTitle>
        <CardDescription>Configura los datos básicos de tu asistente de FAQ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_asistente">Nombre del Asistente *</Label>
            <Input
              id="nombre_asistente"
              placeholder="Ej: Asistente de Soporte"
              value={formData.nombre_asistente}
              onChange={(e) => onChange("nombre_asistente", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre_empresa">Nombre de la Empresa *</Label>
            <Input
              id="nombre_empresa"
              placeholder="Ej: TechCorp"
              value={formData.nombre_empresa}
              onChange={(e) => onChange("nombre_empresa", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="area_soporte">Área de Soporte</Label>
            <Select value={formData.area_soporte} onValueChange={(value) => onChange("area_soporte", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona el área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soporte_tecnico">Soporte Técnico</SelectItem>
                <SelectItem value="atencion_cliente">Atención al Cliente</SelectItem>
                <SelectItem value="ventas">Ventas</SelectItem>
                <SelectItem value="facturacion">Facturación</SelectItem>
                <SelectItem value="recursos_humanos">Recursos Humanos</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="idioma_principal">Idioma Principal</Label>
            <Select value={formData.idioma_principal} onValueChange={(value) => onChange("idioma_principal", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">Inglés</SelectItem>
                <SelectItem value="pt">Portugués</SelectItem>
                <SelectItem value="fr">Francés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción del Asistente</Label>
          <Textarea
            id="descripcion"
            placeholder="Describe brevemente qué tipo de preguntas responderá este asistente..."
            value={formData.descripcion}
            onChange={(e) => onChange("descripcion", e.target.value)}
            className="rounded-xl min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Paso 2: Base de Conocimiento
function Paso2BaseConocimiento({ formData, onChange, onAgregarFAQ, onRemoverFAQ, onToggleCategoria }: any) {
  const [nuevaFAQ, setNuevaFAQ] = useState({ pregunta: "", respuesta: "", categoria: "" })

  const agregarFAQ = () => {
    if (nuevaFAQ.pregunta && nuevaFAQ.respuesta && nuevaFAQ.categoria) {
      onAgregarFAQ(nuevaFAQ)
      setNuevaFAQ({ pregunta: "", respuesta: "", categoria: "" })
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Base de Conocimiento</span>
        </CardTitle>
        <CardDescription>Sube documentos y crea FAQs para entrenar a tu asistente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categorías */}
        <div className="space-y-3">
          <Label>Categorías de Preguntas</Label>
          <p className="text-sm text-gray-500">Selecciona las categorías que manejará tu asistente</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIAS_FAQ.map((categoria) => (
              <div
                key={categoria.id}
                className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.categorias_activas.includes(categoria.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onToggleCategoria(categoria.id)}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    formData.categorias_activas.includes(categoria.id)
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {formData.categorias_activas.includes(categoria.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium text-sm">{categoria.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subir Documentos */}
        <div className="space-y-3">
          <Label>Documentos de Entrenamiento</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
            <p className="text-xs text-gray-500">PDF, DOC, TXT - Manuales, políticas, guías, etc.</p>
            <Button variant="outline" className="mt-3 rounded-xl">
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar Archivos
            </Button>
          </div>
        </div>

        {/* FAQs Manuales */}
        <div className="space-y-3">
          <Label>Preguntas Frecuentes Manuales</Label>
          <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Pregunta frecuente"
                value={nuevaFAQ.pregunta}
                onChange={(e) => setNuevaFAQ({ ...nuevaFAQ, pregunta: e.target.value })}
                className="rounded-xl"
              />
              <Textarea
                placeholder="Respuesta detallada"
                value={nuevaFAQ.respuesta}
                onChange={(e) => setNuevaFAQ({ ...nuevaFAQ, respuesta: e.target.value })}
                className="rounded-xl min-h-[80px]"
              />
              <Select
                value={nuevaFAQ.categoria}
                onValueChange={(value) => setNuevaFAQ({ ...nuevaFAQ, categoria: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_FAQ.filter((cat) => formData.categorias_activas.includes(cat.id)).map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={agregarFAQ} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Agregar FAQ
            </Button>
          </div>

          {formData.faqs_manuales.length > 0 && (
            <div className="space-y-2">
              {formData.faqs_manuales.map((faq: any, index: number) => {
                const categoria = CATEGORIAS_FAQ.find((c) => c.id === faq.categoria)
                return (
                  <div key={index} className="bg-white p-4 rounded-xl border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-sm">{faq.pregunta}</p>
                          <Badge className={categoria?.color}>{categoria?.nombre}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{faq.respuesta}</p>
                      </div>
                      <button onClick={() => onRemoverFAQ(index)} className="text-red-500 hover:text-red-700 ml-2">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Paso 3: Configuración de Respuestas
function Paso3ConfiguracionRespuestas({ formData, onChange }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Configuración de Respuestas</span>
        </CardTitle>
        <CardDescription>Define cómo responderá tu asistente a las preguntas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nivel de Confianza */}
        <div className="space-y-3">
          <Label>Nivel de Confianza Mínimo: {Math.round(formData.nivel_confianza * 100)}%</Label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={formData.nivel_confianza}
            onChange={(e) => onChange("nivel_confianza", Number.parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>50% - Más respuestas</span>
            <span>100% - Solo respuestas seguras</span>
          </div>
          <p className="text-sm text-gray-600">
            El asistente solo responderá si tiene al menos este nivel de confianza en la respuesta
          </p>
        </div>

        {/* Estilo de Respuesta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estilo de Respuesta</Label>
            <Select value={formData.estilo_respuesta} onValueChange={(value) => onChange("estilo_respuesta", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profesional">Profesional</SelectItem>
                <SelectItem value="amigable">Amigable</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Longitud de Respuesta</Label>
            <Select
              value={formData.longitud_respuesta}
              onValueChange={(value) => onChange("longitud_respuesta", value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corta">Corta (1-2 líneas)</SelectItem>
                <SelectItem value="media">Media (1 párrafo)</SelectItem>
                <SelectItem value="larga">Larga (Detallada)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Incluir Fuentes */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium">Incluir Fuentes</p>
            <p className="text-sm text-gray-600">Mostrar de dónde viene la información en las respuestas</p>
          </div>
          <input
            type="checkbox"
            checked={formData.incluir_fuentes}
            onChange={(e) => onChange("incluir_fuentes", e.target.checked)}
            className="rounded"
          />
        </div>

        {/* Respuesta cuando no sabe */}
        <div className="space-y-2">
          <Label>Respuesta cuando no sabe la respuesta</Label>
          <Textarea
            placeholder="Mensaje que enviará cuando no pueda responder..."
            value={formData.respuesta_no_sabe}
            onChange={(e) => onChange("respuesta_no_sabe", e.target.value)}
            className="rounded-xl min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Paso 4: Canales
function Paso4Canales({ formData, onChange, onToggleCanal }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <span>Canales de Comunicación</span>
        </CardTitle>
        <CardDescription>Selecciona dónde estará disponible tu asistente FAQ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selección de Canales */}
        <div className="space-y-4">
          <Label>Canales Disponibles</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CANALES_DISPONIBLES.map((canal) => (
              <div
                key={canal.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.canales_activos.includes(canal.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onToggleCanal(canal.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{canal.nombre}</h4>
                    <p className="text-sm text-gray-600 mt-1">{canal.descripcion}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.canales_activos.includes(canal.id) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                  >
                    {formData.canales_activos.includes(canal.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje de Bienvenida */}
        <div className="space-y-2">
          <Label>Mensaje de Bienvenida</Label>
          <Textarea
            placeholder="Mensaje que recibirán los usuarios al iniciar conversación..."
            value={formData.mensaje_bienvenida}
            onChange={(e) => onChange("mensaje_bienvenida", e.target.value)}
            className="rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Paso 5: Escalamiento
function Paso5Escalamiento({ formData, onChange }: any) {
  const [nuevaFrase, setNuevaFrase] = useState("")

  const agregarFrase = () => {
    if (nuevaFrase.trim() && !formData.palabras_escalamiento.includes(nuevaFrase.trim().toLowerCase())) {
      onChange("palabras_escalamiento", [...formData.palabras_escalamiento, nuevaFrase.trim().toLowerCase()])
      setNuevaFrase("")
    }
  }

  const togglePalabraEscalamiento = (palabra: string) => {
    const nuevasPalabras = formData.palabras_escalamiento.includes(palabra)
      ? formData.palabras_escalamiento.filter((p: string) => p !== palabra)
      : [...formData.palabras_escalamiento, palabra]

    onChange("palabras_escalamiento", nuevasPalabras)
  }

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Escalamiento a Humanos</span>
        </CardTitle>
        <CardDescription>Define cuándo transferir a un agente humano</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Escalamiento Automático */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium">Escalamiento Automático</p>
            <p className="text-sm text-gray-600">Transferir automáticamente cuando no pueda responder</p>
          </div>
          <input
            type="checkbox"
            checked={formData.escalamiento_automatico}
            onChange={(e) => onChange("escalamiento_automatico", e.target.checked)}
            className="rounded"
          />
        </div>

        {/* Tiempo de Respuesta Máximo */}
        <div className="space-y-3">
          <Label>Tiempo Máximo de Respuesta: {formData.tiempo_respuesta_max} segundos</Label>
          <input
            type="range"
            min="10"
            max="120"
            step="10"
            value={formData.tiempo_respuesta_max}
            onChange={(e) => onChange("tiempo_respuesta_max", Number.parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10 seg</span>
            <span>2 min</span>
          </div>
        </div>

        {/* Palabras de Escalamiento */}
        <div className="space-y-3">
          <Label>Palabras que Activan Escalamiento</Label>
          <div className="flex flex-wrap gap-2">
            {formData.palabras_escalamiento.map((palabra: string, index: number) => (
              <Badge key={index} className="bg-red-100 text-red-800 border-0 flex items-center space-x-1">
                <span>{palabra}</span>
                <button
                  type="button"
                  onClick={() => togglePalabraEscalamiento(palabra)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Agregar Nueva Frase */}
        <div className="space-y-3">
          <Label>Agregar Nueva Frase de Escalamiento</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Ej: quiero hablar con alguien"
              value={nuevaFrase}
              onChange={(e) => setNuevaFrase(e.target.value)}
              className="rounded-xl flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  agregarFrase()
                }
              }}
            />
            <Button onClick={agregarFrase} disabled={!nuevaFrase.trim()} className="rounded-xl">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Agrega frases que los usuarios podrían usar para solicitar hablar con una persona
          </p>
        </div>

        {/* Horario de Soporte */}
        <div className="space-y-4">
          <Label>Horario de Soporte Humano</Label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">Soporte 24/7</p>
              <p className="text-sm text-gray-600">Siempre hay agentes disponibles</p>
            </div>
            <input
              type="checkbox"
              checked={!formData.horario_soporte.activo}
              onChange={(e) =>
                onChange("horario_soporte", {
                  ...formData.horario_soporte,
                  activo: !e.target.checked,
                })
              }
              className="rounded"
            />
          </div>

          {formData.horario_soporte.activo && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="space-y-2">
                <Label>Hora de Inicio</Label>
                <Input
                  type="time"
                  value={formData.horario_soporte.inicio}
                  onChange={(e) =>
                    onChange("horario_soporte", {
                      ...formData.horario_soporte,
                      inicio: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de Fin</Label>
                <Input
                  type="time"
                  value={formData.horario_soporte.fin}
                  onChange={(e) =>
                    onChange("horario_soporte", {
                      ...formData.horario_soporte,
                      fin: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Paso 6: Automatizaciones
function Paso6Automatizaciones({ formData, onChange }: any) {
  const [nuevaAutomatizacion, setNuevaAutomatizacion] = useState({
    nombre: "",
    descripcion: "",
    trigger: "",
    accion: "",
    condiciones: "",
    activa: true,
  })
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const agregarAutomatizacion = () => {
    if (!nuevaAutomatizacion.nombre || !nuevaAutomatizacion.trigger || !nuevaAutomatizacion.accion) {
      return
    }

    const automatizacion = {
      id: Date.now().toString(),
      ...nuevaAutomatizacion,
      ejecutado: 0,
      ultimaEjecucion: "Nunca",
    }

    onChange("automatizaciones", [...formData.automatizaciones, automatizacion])
    setNuevaAutomatizacion({
      nombre: "",
      descripcion: "",
      trigger: "",
      accion: "",
      condiciones: "",
      activa: true,
    })
    setMostrarFormulario(false)
  }

  const eliminarAutomatizacion = (id: string) => {
    onChange(
      "automatizaciones",
      formData.automatizaciones.filter((auto: any) => auto.id !== id),
    )
  }

  const toggleAutomatizacion = (id: string) => {
    onChange(
      "automatizaciones",
      formData.automatizaciones.map((auto: any) => (auto.id === id ? { ...auto, activa: !auto.activa } : auto)),
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <span>Automatizaciones del Asistente FAQ</span>
        </CardTitle>
        <CardDescription>
          Configura reglas automáticas específicas para este asistente de preguntas frecuentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Templates Rápidos */}
        <div className="space-y-3">
          <Label>Templates Recomendados para FAQ</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 text-left rounded-xl"
              onClick={() => {
                const template = {
                  nombre: "Escalamiento por Sin Respuesta",
                  descripcion: "Deriva a humano cuando no puede responder después de 2 intentos",
                  trigger: "Sin respuesta encontrada",
                  accion: "Derivar a humano",
                  condiciones: "Después de 2 intentos fallidos",
                  activa: true,
                }
                setNuevaAutomatizacion(template)
                setMostrarFormulario(true)
              }}
            >
              <div>
                <h4 className="font-medium text-sm">Escalamiento Automático</h4>
                <p className="text-xs text-gray-600 mt-1">Deriva a humano cuando no encuentra respuesta</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 text-left rounded-xl"
              onClick={() => {
                const template = {
                  nombre: "Encuesta de Satisfacción",
                  descripcion: "Envía encuesta después de resolver una consulta exitosamente",
                  trigger: "Consulta resuelta",
                  accion: "Enviar encuesta",
                  condiciones: "Respuesta marcada como útil",
                  activa: true,
                }
                setNuevaAutomatizacion(template)
                setMostrarFormulario(true)
              }}
            >
              <div>
                <h4 className="font-medium text-sm">Encuesta Post-Resolución</h4>
                <p className="text-xs text-gray-600 mt-1">Solicita feedback después de resolver consultas</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 text-left rounded-xl"
              onClick={() => {
                const template = {
                  nombre: "Creación de Ticket",
                  descripcion: "Crea ticket de soporte para preguntas complejas o técnicas",
                  trigger: "Pregunta compleja",
                  accion: "Crear ticket",
                  condiciones: "Palabras clave técnicas detectadas",
                  activa: true,
                }
                setNuevaAutomatizacion(template)
                setMostrarFormulario(true)
              }}
            >
              <div>
                <h4 className="font-medium text-sm">Ticket Automático</h4>
                <p className="text-xs text-gray-600 mt-1">Crea tickets para consultas técnicas complejas</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 text-left rounded-xl"
              onClick={() => {
                const template = {
                  nombre: "Notificación de Tendencias",
                  descripcion: "Notifica al equipo sobre nuevas preguntas frecuentes",
                  trigger: "Pregunta repetida",
                  accion: "Notificar equipo",
                  condiciones: "Misma pregunta 5+ veces en 24h",
                  activa: true,
                }
                setNuevaAutomatizacion(template)
                setMostrarFormulario(true)
              }}
            >
              <div>
                <h4 className="font-medium text-sm">Detección de Tendencias</h4>
                <p className="text-xs text-gray-600 mt-1">Identifica nuevas preguntas frecuentes</p>
              </div>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Lista de Automatizaciones */}
        {formData.automatizaciones.length > 0 && (
          <div className="space-y-3">
            <Label>Automatizaciones Configuradas</Label>
            {formData.automatizaciones.map((automatizacion: any) => (
              <div key={automatizacion.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm text-gray-900">{automatizacion.nombre}</h4>
                      <Badge
                        className={`text-xs ${
                          automatizacion.activa ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        } border-0`}
                      >
                        {automatizacion.activa ? "Activa" : "Pausada"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{automatizacion.descripcion}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Trigger: {automatizacion.trigger}</span>
                      <span>•</span>
                      <span>Acción: {automatizacion.accion}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAutomatizacion(automatizacion.id)}
                      className="h-6 w-6 p-0"
                    >
                      {automatizacion.activa ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarAutomatizacion(automatizacion.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón Agregar Personalizada */}
        <Button onClick={() => setMostrarFormulario(true)} variant="outline" className="w-full rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Crear Automatización Personalizada
        </Button>

        {/* Formulario Nueva Automatización */}
        {mostrarFormulario && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre-auto">Nombre de la Automatización</Label>
                <Input
                  id="nombre-auto"
                  placeholder="Ej: Escalamiento por tiempo límite"
                  value={nuevaAutomatizacion.nombre}
                  onChange={(e) => setNuevaAutomatizacion({ ...nuevaAutomatizacion, nombre: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion-auto">Descripción</Label>
                <Textarea
                  id="descripcion-auto"
                  placeholder="Describe qué hace esta automatización..."
                  value={nuevaAutomatizacion.descripcion}
                  onChange={(e) => setNuevaAutomatizacion({ ...nuevaAutomatizacion, descripcion: e.target.value })}
                  className="rounded-xl min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger-auto">Disparador (Trigger)</Label>
                  <Select
                    value={nuevaAutomatizacion.trigger}
                    onValueChange={(value) => setNuevaAutomatizacion({ ...nuevaAutomatizacion, trigger: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="¿Cuándo se ejecuta?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sin respuesta encontrada">Sin respuesta encontrada</SelectItem>
                      <SelectItem value="Consulta resuelta">Consulta resuelta</SelectItem>
                      <SelectItem value="Pregunta compleja">Pregunta compleja</SelectItem>
                      <SelectItem value="Usuario insatisfecho">Usuario insatisfecho</SelectItem>
                      <SelectItem value="Tiempo límite excedido">Tiempo límite excedido</SelectItem>
                      <SelectItem value="Palabra clave detectada">Palabra clave detectada</SelectItem>
                      <SelectItem value="Pregunta repetida">Pregunta repetida</SelectItem>
                      <SelectItem value="Fuera de horario">Fuera de horario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accion-auto">Acción a Ejecutar</Label>
                  <Select
                    value={nuevaAutomatizacion.accion}
                    onValueChange={(value) => setNuevaAutomatizacion({ ...nuevaAutomatizacion, accion: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="¿Qué hacer?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Derivar a humano">Derivar a humano</SelectItem>
                      <SelectItem value="Enviar encuesta">Enviar encuesta</SelectItem>
                      <SelectItem value="Crear ticket">Crear ticket de soporte</SelectItem>
                      <SelectItem value="Notificar equipo">Notificar al equipo</SelectItem>
                      <SelectItem value="Enviar mensaje">Enviar mensaje personalizado</SelectItem>
                      <SelectItem value="Agendar seguimiento">Agendar seguimiento</SelectItem>
                      <SelectItem value="Actualizar FAQ">Actualizar base de conocimiento</SelectItem>
                      <SelectItem value="Enviar email">Enviar email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condiciones-auto">Condiciones Adicionales (Opcional)</Label>
                <Input
                  id="condiciones-auto"
                  placeholder="Ej: Después de 3 intentos, Solo en horario laboral, etc."
                  value={nuevaAutomatizacion.condiciones}
                  onChange={(e) => setNuevaAutomatizacion({ ...nuevaAutomatizacion, condiciones: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={nuevaAutomatizacion.activa}
                  onCheckedChange={(checked) => setNuevaAutomatizacion({ ...nuevaAutomatizacion, activa: checked })}
                />
                <Label className="text-sm">Activar inmediatamente</Label>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={agregarAutomatizacion} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                <Zap className="w-4 h-4 mr-2" />
                Crear Automatización
              </Button>
              <Button variant="outline" onClick={() => setMostrarFormulario(false)} className="rounded-xl">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Paso 7: Revisión
function Paso7Revision({ formData }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Revisión y Activación</span>
        </CardTitle>
        <CardDescription>Revisa la configuración de tu asistente FAQ antes de activarlo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Información Básica</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Nombre:</span> {formData.nombre_asistente}
                </p>
                <p>
                  <span className="text-gray-600">Empresa:</span> {formData.nombre_empresa}
                </p>
                <p>
                  <span className="text-gray-600">Área:</span> {formData.area_soporte}
                </p>
                <p>
                  <span className="text-gray-600">Idioma:</span> {formData.idioma_principal}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Base de Conocimiento</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Categorías:</span> {formData.categorias_activas.length} activas
                </p>
                <p>
                  <span className="text-gray-600">FAQs:</span> {formData.faqs_manuales.length} configuradas
                </p>
                <p>
                  <span className="text-gray-600">Documentos:</span> {formData.documentos_subidos.length} subidos
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Configuración</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Confianza mínima:</span> {Math.round(formData.nivel_confianza * 100)}%
                </p>
                <p>
                  <span className="text-gray-600">Estilo:</span> {formData.estilo_respuesta}
                </p>
                <p>
                  <span className="text-gray-600">Canales:</span> {formData.canales_activos.length} conectados
                </p>
                <p>
                  <span className="text-gray-600">Escalamiento:</span>{" "}
                  {formData.escalamiento_automatico ? "Automático" : "Manual"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800">Asistente FAQ Listo</h4>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Tu asistente está configurado y listo para responder preguntas frecuentes automáticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// NUEVO: Paso 8 - Playground
function Paso8Playground({ formData, feedbackStats, onFeedbackSubmit }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PlayCircle className="w-5 h-5 text-blue-600" />
          <span>Playground</span>
        </CardTitle>
        <CardDescription>Prueba tu asistente antes de activarlo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-700">
            Este es un entorno de prueba para tu asistente. Puedes hacer preguntas y ver cómo respondería en base a la
            configuración que has realizado. Tu feedback ayudará a mejorar las respuestas.
          </p>
        </div>

        {/* Estadísticas de Feedback */}
        {(feedbackStats.positive > 0 || feedbackStats.negative > 0) && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{feedbackStats.positive}</div>
              <div className="text-sm text-gray-600">Respuestas útiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{feedbackStats.negative}</div>
              <div className="text-sm text-gray-600">Respuestas corregidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{feedbackStats.corrections.length}</div>
              <div className="text-sm text-gray-600">Mejoras aplicadas</div>
            </div>
          </div>
        )}

        {/* Chat Playground */}
        <PlaygroundChat
          assistantName={formData.nombre_asistente || "Asistente FAQ"}
          onFeedbackSubmit={onFeedbackSubmit}
          className="h-[600px]"
        />

        {/* Correcciones Recientes */}
        {feedbackStats.corrections.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Correcciones Aplicadas</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {feedbackStats.corrections.slice(-3).map((correction: any, index: number) => (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">Respuesta corregida:</p>
                  <p className="text-sm text-yellow-700 mt-1">{correction.correctAnswer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-800">Importante</h4>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            Las correcciones que hagas aquí se aplicarán automáticamente a la base de conocimiento del asistente para
            mejorar futuras respuestas.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Tips por paso
function TipsFAQ({ paso }: { paso: number }) {
  const tips = {
    1: [
      "Usa un nombre descriptivo para tu asistente",
      "El área de soporte ayuda a personalizar las respuestas",
      "Una buena descripción mejora el contexto de las respuestas",
    ],
    2: [
      "Selecciona solo las categorías relevantes para tu negocio",
      "Sube documentos actualizados y bien estructurados",
      "Crea FAQs para las preguntas más comunes",
    ],
    3: [
      "Un nivel de confianza alto reduce respuestas incorrectas",
      "El estilo debe coincidir con tu marca",
      "Incluir fuentes aumenta la credibilidad",
    ],
    4: [
      "Empieza con pocos canales y expande gradualmente",
      "Personaliza el mensaje de bienvenida por canal",
      "Considera los horarios de cada canal",
    ],
    5: [
      "El escalamiento automático mejora la experiencia",
      "Define palabras clave específicas de tu industria",
      "Configura horarios realistas de soporte",
    ],
    6: [
      "Usa templates recomendados para empezar rápido",
      "Las automatizaciones mejoran la experiencia del usuario",
      "Configura escalamiento para casos complejos",
    ],
    7: [
      "Revisa que toda la información sea correcta",
      "Verifica que los canales estén bien configurados",
      "Asegúrate de tener suficientes FAQs",
    ],
    8: [
      "Prueba diferentes tipos de preguntas",
      "Da feedback honesto para mejorar el asistente",
      "Las correcciones se aplicarán automáticamente",
    ],
  }

  return (
    <div className="space-y-2">
      {tips[paso as keyof typeof tips]?.map((tip, index) => (
        <div key={index} className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          <p className="text-sm text-gray-600">{tip}</p>
        </div>
      ))}
    </div>
  )
}
