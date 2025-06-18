"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../_components/ui/card"
import { Button } from "../../../_components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  Briefcase,
  Brain,
  MessageSquare,
  GitBranch,
  Zap,
  PlayCircle,
  ClipboardCheck,
  Lightbulb,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { Input } from "../../../_components/ui/input"
import { Label } from "../../../_components/ui/label"
import { Textarea } from "../../../_components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../_components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../_components/ui/select"
import { Switch } from "../../../_components/ui/switch"
import { Badge } from "../../../_components/ui/badge"
import { Slider } from "../../../_components/ui/slider"
import { Progress } from "../../../_components/ui/progress"

// Constantes para los pasos
const PASOS_LEADS = [
  { id: 1, nombre: "Información Básica", icono: <Briefcase className="w-4 h-4" /> },
  { id: 2, nombre: "Criterios de Calificación", icono: <ClipboardCheck className="w-4 h-4" /> },
  { id: 3, nombre: "Preguntas de Descubrimiento", icono: <MessageSquare className="w-4 h-4" /> },
  { id: 4, nombre: "Configuración de Scoring", icono: <Target className="w-4 h-4" /> },
  { id: 5, nombre: "Canales", icono: <GitBranch className="w-4 h-4" /> },
  { id: 6, nombre: "Escalamiento", icono: <Brain className="w-4 h-4" /> },
  { id: 7, nombre: "Automatizaciones", icono: <Zap className="w-4 h-4" /> },
  { id: 8, nombre: "Playground", icono: <PlayCircle className="w-4 h-4" /> },
]

export default function NuevoAsistenteLeadsPage() {
  const router = useRouter()
  const [pasoActual, setPasoActual] = useState(1)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    metodologia: "bant",
    preguntasDescubrimiento: [],
    umbralCalificacion: 70,
    canales: [],
    escalamiento: {
      activado: false,
      umbral: 3,
      destinatario: "",
    },
    automatizaciones: [],
  })

  const avanzarPaso = () => {
    if (pasoActual < PASOS_LEADS.length) {
      setPasoActual(pasoActual + 1)
    }
  }

  const retrocederPaso = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    console.log("Datos del asistente:", formData)
    router.push("/asistentes")
  }

  // Renderizar el paso actual
  const renderPasoActual = () => {
    switch (pasoActual) {
      case 1:
        return <Paso1InformacionBasica formData={formData} handleChange={handleChange} />
      case 2:
        return <Paso2CriteriosCalificacion formData={formData} setFormData={setFormData} />
      case 3:
        return <Paso3PreguntasDescubrimiento formData={formData} setFormData={setFormData} />
      case 4:
        return <Paso4ConfiguracionScoring formData={formData} setFormData={setFormData} />
      case 5:
        return <Paso5Canales formData={formData} setFormData={setFormData} />
      case 6:
        return <Paso6Escalamiento formData={formData} setFormData={setFormData} />
      case 7:
        return <Paso7Automatizaciones formData={formData} setFormData={setFormData} />
      case 8:
        return <Paso8Playground formData={formData} />
      default:
        return null
    }
  }

  const getTipActual = () => {
    switch (pasoActual) {
      case 1:
        return "Un nombre descriptivo ayuda a identificar rápidamente el propósito del asistente."
      case 2:
        return "BANT es ideal para B2B, MEDDIC para ventas complejas, y personalizado para casos específicos."
      case 3:
        return "Las preguntas abiertas generan más información que las preguntas cerradas."
      case 4:
        return "Un umbral muy bajo genera muchos falsos positivos, muy alto puede perder oportunidades."
      case 5:
        return "Comienza con un canal y expande gradualmente según los resultados."
      case 6:
        return "El escalamiento oportuno mejora la experiencia del cliente y las conversiones."
      case 7:
        return "Las automatizaciones ahorran tiempo y aseguran seguimiento consistente."
      case 8:
        return "Prueba diferentes escenarios para validar la configuración antes de activar."
      default:
        return "Configura cada paso cuidadosamente para obtener mejores resultados."
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/asistentes/nuevo">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Asistente de Calificación de Leads</h1>
            <p className="text-gray-600 mt-1">Configura un asistente especializado en calificar prospectos</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">Progreso de Configuración</span>
            <span className="text-sm font-medium text-gray-700">
              {pasoActual} de {PASOS_LEADS.length}
            </span>
          </div>
          <Progress value={(pasoActual / PASOS_LEADS.length) * 100} className="h-2 mb-6" />

          <div className="grid grid-cols-8 gap-2">
            {PASOS_LEADS.map((paso) => (
              <div key={paso.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    paso.id < pasoActual
                      ? "bg-green-500 text-white"
                      : paso.id === pasoActual
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {paso.id < pasoActual ? <Check className="w-5 h-5" /> : paso.icono}
                </div>
                <span
                  className={`text-xs text-center leading-tight ${
                    paso.id <= pasoActual ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}
                >
                  {paso.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <Card className="rounded-2xl shadow-sm border-0 bg-white">
              {renderPasoActual()}

              {/* Botones de navegación */}
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" onClick={retrocederPaso} disabled={pasoActual === 1}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                {pasoActual < PASOS_LEADS.length ? (
                  <Button onClick={avanzarPaso}>
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    Finalizar
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vista previa */}
            <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Eye className="w-5 h-5 text-green-600 mr-2" />
                  Vista Previa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600">NOMBRE</Label>
                  <p className="text-sm font-medium">{formData.nombre || "Asistente de Calificación de Leads"}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">METODOLOGÍA</Label>
                  <p className="text-sm font-medium capitalize">{formData.metodologia}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">UMBRAL</Label>
                  <p className="text-sm font-medium">{formData.umbralCalificacion}%</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">CANALES</Label>
                  <p className="text-sm font-medium">
                    {formData.canales.length > 0 ? `${formData.canales.length} seleccionados` : "Ninguno"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="rounded-2xl shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                  Consejo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{getTipActual()}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componentes para cada paso
function Paso1InformacionBasica({ formData, handleChange }) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Briefcase className="w-5 h-5 text-green-600 mr-2" />
          Información Básica
        </CardTitle>
        <CardDescription>Configura la información básica de tu asistente de calificación de leads</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del asistente</Label>
          <Input
            id="nombre"
            name="nombre"
            placeholder="Ej: Calificador de Leads Inmobiliarios"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            placeholder="Describe brevemente qué hará este asistente..."
            rows={4}
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>
      </CardContent>
    </>
  )
}

function Paso2CriteriosCalificacion({ formData, setFormData }) {
  const handleMetodologiaChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      metodologia: value,
    }))
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <ClipboardCheck className="w-5 h-5 text-green-600 mr-2" />
          Criterios de Calificación
        </CardTitle>
        <CardDescription>Selecciona la metodología de calificación que utilizará tu asistente</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={formData.metodologia} onValueChange={handleMetodologiaChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="bant">BANT</TabsTrigger>
            <TabsTrigger value="meddic">MEDDIC</TabsTrigger>
            <TabsTrigger value="personalizado">Personalizado</TabsTrigger>
          </TabsList>

          <TabsContent value="bant" className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Metodología BANT</h3>
              <p className="text-green-700 text-sm">El asistente calificará leads según:</p>
              <ul className="list-disc list-inside text-sm text-green-700 mt-2">
                <li>
                  <strong>Budget:</strong> ¿Tiene presupuesto asignado?
                </li>
                <li>
                  <strong>Authority:</strong> ¿Tiene autoridad para decidir?
                </li>
                <li>
                  <strong>Need:</strong> ¿Tiene una necesidad clara?
                </li>
                <li>
                  <strong>Timeline:</strong> ¿Tiene un plazo definido?
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Importancia de Presupuesto</Label>
                  <Slider defaultValue={[25]} max={100} step={5} />
                </div>
                <div className="space-y-2">
                  <Label>Importancia de Autoridad</Label>
                  <Slider defaultValue={[25]} max={100} step={5} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Importancia de Necesidad</Label>
                  <Slider defaultValue={[25]} max={100} step={5} />
                </div>
                <div className="space-y-2">
                  <Label>Importancia de Tiempo</Label>
                  <Slider defaultValue={[25]} max={100} step={5} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meddic" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Metodología MEDDIC</h3>
              <p className="text-blue-700 text-sm">El asistente calificará leads según:</p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
                <li>
                  <strong>Metrics:</strong> ¿Qué métricas mejorará?
                </li>
                <li>
                  <strong>Economic Buyer:</strong> ¿Quién tiene el poder económico?
                </li>
                <li>
                  <strong>Decision Criteria:</strong> ¿Cuáles son los criterios de decisión?
                </li>
                <li>
                  <strong>Decision Process:</strong> ¿Cómo es el proceso de decisión?
                </li>
                <li>
                  <strong>Identify Pain:</strong> ¿Cuál es el dolor principal?
                </li>
                <li>
                  <strong>Champion:</strong> ¿Quién es el promotor interno?
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Importancia de Métricas</Label>
                <Slider defaultValue={[16]} max={100} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Importancia de Comprador</Label>
                <Slider defaultValue={[16]} max={100} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Importancia de Criterios</Label>
                <Slider defaultValue={[16]} max={100} step={1} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Importancia de Proceso</Label>
                <Slider defaultValue={[16]} max={100} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Importancia de Dolor</Label>
                <Slider defaultValue={[16]} max={100} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Importancia de Promotor</Label>
                <Slider defaultValue={[16]} max={100} step={1} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personalizado" className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Criterios Personalizados</h3>
              <p className="text-purple-700 text-sm">Define tus propios criterios de calificación</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Criterios de calificación</Label>
                <Button variant="outline" size="sm">
                  + Añadir criterio
                </Button>
              </div>

              <div className="border rounded-lg divide-y">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Interés en el producto</h4>
                    <p className="text-sm text-gray-500">Nivel de interés mostrado</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">25%</span>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tamaño de empresa</h4>
                    <p className="text-sm text-gray-500">Número de empleados</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">25%</span>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Presupuesto disponible</h4>
                    <p className="text-sm text-gray-500">Capacidad de inversión</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">25%</span>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Urgencia</h4>
                    <p className="text-sm text-gray-500">Necesidad inmediata</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">25%</span>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  )
}

function Paso3PreguntasDescubrimiento({ formData, setFormData }) {
  const [nuevaPregunta, setNuevaPregunta] = useState("")

  const agregarPregunta = () => {
    if (nuevaPregunta.trim()) {
      setFormData((prev) => ({
        ...prev,
        preguntasDescubrimiento: [...prev.preguntasDescubrimiento, nuevaPregunta],
      }))
      setNuevaPregunta("")
    }
  }

  const eliminarPregunta = (index) => {
    setFormData((prev) => ({
      ...prev,
      preguntasDescubrimiento: prev.preguntasDescubrimiento.filter((_, i) => i !== index),
    }))
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
          Preguntas de Descubrimiento
        </CardTitle>
        <CardDescription>Define las preguntas que el asistente utilizará para calificar leads</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Escribe una pregunta de descubrimiento..."
              value={nuevaPregunta}
              onChange={(e) => setNuevaPregunta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarPregunta()}
            />
            <Button onClick={agregarPregunta}>Agregar</Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">
              Preguntas sugeridas según metodología {formData.metodologia.toUpperCase()}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {formData.metodologia === "bant" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Cuál es su presupuesto para este proyecto?")}
                  >
                    ¿Cuál es su presupuesto para este proyecto?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Quién toma la decisión final de compra?")}
                  >
                    ¿Quién toma la decisión final de compra?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Qué problema específico está tratando de resolver?")}
                  >
                    ¿Qué problema específico está tratando de resolver?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Cuándo necesita implementar esta solución?")}
                  >
                    ¿Cuándo necesita implementar esta solución?
                  </Button>
                </>
              )}
              {formData.metodologia === "meddic" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Qué métricas específicas busca mejorar?")}
                  >
                    ¿Qué métricas específicas busca mejorar?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Quién maneja el presupuesto para este tipo de soluciones?")}
                  >
                    ¿Quién maneja el presupuesto para este tipo de soluciones?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Cuáles son sus criterios para evaluar soluciones?")}
                  >
                    ¿Cuáles son sus criterios para evaluar soluciones?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Cómo es su proceso interno de toma de decisiones?")}
                  >
                    ¿Cómo es su proceso interno de toma de decisiones?
                  </Button>
                </>
              )}
              {formData.metodologia === "personalizado" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Cuál es su principal desafío actualmente?")}
                  >
                    ¿Cuál es su principal desafío actualmente?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Qué soluciones ha probado anteriormente?")}
                  >
                    ¿Qué soluciones ha probado anteriormente?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Cuál es el tamaño de su empresa?")}
                  >
                    ¿Cuál es el tamaño de su empresa?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setNuevaPregunta("¿Cuál es su rol en la empresa?")}
                  >
                    ¿Cuál es su rol en la empresa?
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Preguntas configuradas ({formData.preguntasDescubrimiento.length})</h3>
          {formData.preguntasDescubrimiento.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-gray-500">Aún no has agregado preguntas de descubrimiento</p>
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {formData.preguntasDescubrimiento.map((pregunta, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <span>{pregunta}</span>
                  <Button variant="ghost" size="sm" onClick={() => eliminarPregunta(index)}>
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </>
  )
}

function Paso4ConfiguracionScoring({ formData, setFormData }) {
  const handleUmbralChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      umbralCalificacion: value[0],
    }))
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Target className="w-5 h-5 text-green-600 mr-2" />
          Configuración de Scoring
        </CardTitle>
        <CardDescription>
          Define cómo se calificarán los leads y el umbral para considerarlos calificados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Umbral de calificación</Label>
          <div className="space-y-6">
            <Slider
              defaultValue={[formData.umbralCalificacion]}
              max={100}
              step={5}
              onValueChange={handleUmbralChange}
            />
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Lead no calificado</span>
              <span className="font-medium">{formData.umbralCalificacion}%</span>
              <span className="text-sm text-gray-500">Lead calificado</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium">Interpretación de scoring</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>0-30%</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                No calificado
              </Badge>
            </div>
            <Progress value={20} className="h-2 bg-red-100" indicatorClassName="bg-red-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>31-69%</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                En proceso
              </Badge>
            </div>
            <Progress value={50} className="h-2 bg-yellow-100" indicatorClassName="bg-yellow-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>70-100%</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Calificado
              </Badge>
            </div>
            <Progress value={85} className="h-2 bg-green-100" indicatorClassName="bg-green-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Acciones post-calificación</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Lead calificado</h4>
                  <p className="text-sm text-gray-500">Asignar a vendedor</p>
                </div>
              </div>
              <Select defaultValue="asignar">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Seleccionar acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asignar">Asignar vendedor</SelectItem>
                  <SelectItem value="notificar">Notificar equipo</SelectItem>
                  <SelectItem value="email">Enviar email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <MessageSquare className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">Lead en proceso</h4>
                  <p className="text-sm text-gray-500">Continuar conversación</p>
                </div>
              </div>
              <Select defaultValue="continuar">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Seleccionar acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continuar">Continuar chat</SelectItem>
                  <SelectItem value="nurturing">Iniciar nurturing</SelectItem>
                  <SelectItem value="recordatorio">Programar recordatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <ArrowRight className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium">Lead no calificado</h4>
                  <p className="text-sm text-gray-500">Agradecer interés</p>
                </div>
              </div>
              <Select defaultValue="agradecer">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Seleccionar acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agradecer">Agradecer interés</SelectItem>
                  <SelectItem value="newsletter">Ofrecer newsletter</SelectItem>
                  <SelectItem value="descartar">Descartar lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}

function Paso5Canales({ formData, setFormData }) {
  const toggleCanal = (canal) => {
    setFormData((prev) => {
      if (prev.canales.includes(canal)) {
        return {
          ...prev,
          canales: prev.canales.filter((c) => c !== canal),
        }
      } else {
        return {
          ...prev,
          canales: [...prev.canales, canal],
        }
      }
    })
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <GitBranch className="w-5 h-5 text-green-600 mr-2" />
          Canales
        </CardTitle>
        <CardDescription>Selecciona los canales donde estará disponible tu asistente de calificación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.canales.includes("web") ? "border-green-500 bg-green-50" : "hover:border-gray-300"
            }`}
            onClick={() => toggleCanal("web")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${formData.canales.includes("web") ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Widget Web</h4>
                  <p className="text-sm text-gray-500">Chat en tu sitio web</p>
                </div>
              </div>
              <Switch
                checked={formData.canales.includes("web")}
                onCheckedChange={() => toggleCanal("web")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.canales.includes("whatsapp") ? "border-green-500 bg-green-50" : "hover:border-gray-300"
            }`}
            onClick={() => toggleCanal("whatsapp")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    formData.canales.includes("whatsapp") ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">WhatsApp</h4>
                  <p className="text-sm text-gray-500">Integración con WhatsApp</p>
                </div>
              </div>
              <Switch
                checked={formData.canales.includes("whatsapp")}
                onCheckedChange={() => toggleCanal("whatsapp")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.canales.includes("facebook") ? "border-green-500 bg-green-50" : "hover:border-gray-300"
            }`}
            onClick={() => toggleCanal("facebook")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    formData.canales.includes("facebook") ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Facebook Messenger</h4>
                  <p className="text-sm text-gray-500">Chat en Facebook</p>
                </div>
              </div>
              <Switch
                checked={formData.canales.includes("facebook")}
                onCheckedChange={() => toggleCanal("facebook")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.canales.includes("email") ? "border-green-500 bg-green-50" : "hover:border-gray-300"
            }`}
            onClick={() => toggleCanal("email")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${formData.canales.includes("email") ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-gray-500">Respuestas por email</p>
                </div>
              </div>
              <Switch
                checked={formData.canales.includes("email")}
                onCheckedChange={() => toggleCanal("email")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Configuración de canales</h3>
          <p className="text-blue-700 text-sm">
            Puedes configurar cada canal individualmente después de crear el asistente. Aquí solo seleccionas dónde
            estará disponible.
          </p>
        </div>
      </CardContent>
    </>
  )
}

function Paso6Escalamiento({ formData, setFormData }) {
  const toggleEscalamiento = () => {
    setFormData((prev) => ({
      ...prev,
      escalamiento: {
        ...prev.escalamiento,
        activado: !prev.escalamiento.activado,
      },
    }))
  }

  const handleEscalamientoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      escalamiento: {
        ...prev.escalamiento,
        [field]: value,
      },
    }))
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Brain className="w-5 h-5 text-green-600 mr-2" />
          Escalamiento
        </CardTitle>
        <CardDescription>Configura cuándo y cómo el asistente debe escalar a un humano</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Escalamiento a humano</h3>
            <p className="text-sm text-gray-500">Permite que el asistente derive la conversación a un agente humano</p>
          </div>
          <Switch checked={formData.escalamiento.activado} onCheckedChange={toggleEscalamiento} />
        </div>

        {formData.escalamiento.activado && (
          <div className="space-y-4 border-l-4 border-green-500 pl-4">
            <div className="space-y-2">
              <Label htmlFor="umbral">Umbral de intentos</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="umbral"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.escalamiento.umbral}
                  onChange={(e) => handleEscalamientoChange("umbral", Number.parseInt(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">intentos sin calificar al lead</span>
              </div>
              <p className="text-xs text-gray-500">
                El asistente escalará después de este número de intentos fallidos de calificación
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinatario">Destinatario del escalamiento</Label>
              <Select
                value={formData.escalamiento.destinatario || ""}
                onValueChange={(value) => handleEscalamientoChange("destinatario", value)}
              >
                <SelectTrigger id="destinatario">
                  <SelectValue placeholder="Seleccionar destinatario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipo_ventas">Equipo de Ventas</SelectItem>
                  <SelectItem value="soporte">Soporte</SelectItem>
                  <SelectItem value="gerente">Gerente de Ventas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">Mensaje de escalamiento</h4>
              <p className="text-yellow-700 text-sm">
                El asistente informará al usuario que la conversación será transferida a un agente humano.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-medium">Condiciones adicionales de escalamiento</h3>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="palabras_clave" />
              <Label htmlFor="palabras_clave">Palabras clave específicas</Label>
            </div>
            <Input placeholder="Ej: urgente, problema, ayuda, humano" disabled={true} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="horario" />
              <Label htmlFor="horario">Fuera de horario laboral</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="09:00" disabled={true} />
              <Input placeholder="18:00" disabled={true} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="solicitud_explicita" />
              <Label htmlFor="solicitud_explicita">Solicitud explícita del usuario</Label>
            </div>
            <p className="text-xs text-gray-500">El asistente escalará si el usuario solicita hablar con un humano</p>
          </div>
        </div>
      </CardContent>
    </>
  )
}

function Paso7Automatizaciones({ formData, setFormData }) {
  const [nuevaAutomatizacion, setNuevaAutomatizacion] = useState({
    trigger: "",
    accion: "",
    activa: true,
  })

  const agregarAutomatizacion = () => {
    if (nuevaAutomatizacion.trigger && nuevaAutomatizacion.accion) {
      setFormData((prev) => ({
        ...prev,
        automatizaciones: [
          ...prev.automatizaciones,
          {
            ...nuevaAutomatizacion,
            id: Date.now().toString(),
          },
        ],
      }))
      setNuevaAutomatizacion({
        trigger: "",
        accion: "",
        activa: true,
      })
    }
  }

  const toggleAutomatizacion = (id) => {
    setFormData((prev) => ({
      ...prev,
      automatizaciones: prev.automatizaciones.map((auto) =>
        auto.id === id ? { ...auto, activa: !auto.activa } : auto,
      ),
    }))
  }

  const eliminarAutomatizacion = (id) => {
    setFormData((prev) => ({
      ...prev,
      automatizaciones: prev.automatizaciones.filter((auto) => auto.id !== id),
    }))
  }

  const agregarTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      automatizaciones: [
        ...prev.automatizaciones,
        {
          ...template,
          id: Date.now().toString(),
          activa: true,
        },
      ],
    }))
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Zap className="w-5 h-5 text-green-600 mr-2" />
          Automatizaciones
        </CardTitle>
        <CardDescription>Configura acciones automáticas basadas en el comportamiento del lead</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium">Templates recomendados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() =>
                agregarTemplate({
                  trigger: "lead_calificado",
                  accion: "asignar_vendedor",
                })
              }
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Asignación Automática</span>
                <span className="text-xs text-gray-500">Asigna leads calificados a vendedores</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() =>
                agregarTemplate({
                  trigger: "lead_no_calificado",
                  accion: "enviar_nurturing",
                })
              }
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Nurturing Automático</span>
                <span className="text-xs text-gray-500">Envía emails educativos a leads no calificados</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() =>
                agregarTemplate({
                  trigger: "presupuesto_alto",
                  accion: "notificar_gerente",
                })
              }
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Alerta de Oportunidad</span>
                <span className="text-xs text-gray-500">Notifica al gerente sobre leads con alto presupuesto</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() =>
                agregarTemplate({
                  trigger: "lead_en_proceso",
                  accion: "programar_seguimiento",
                })
              }
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Seguimiento Programado</span>
                <span className="text-xs text-gray-500">Agenda seguimiento para leads en proceso</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Crear automatización personalizada</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trigger">Cuando ocurra</Label>
              <Select
                value={nuevaAutomatizacion.trigger}
                onValueChange={(value) => setNuevaAutomatizacion((prev) => ({ ...prev, trigger: value }))}
              >
                <SelectTrigger id="trigger">
                  <SelectValue placeholder="Seleccionar trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_calificado">Lead calificado</SelectItem>
                  <SelectItem value="lead_no_calificado">Lead no calificado</SelectItem>
                  <SelectItem value="lead_en_proceso">Lead en proceso</SelectItem>
                  <SelectItem value="presupuesto_alto">Presupuesto alto detectado</SelectItem>
                  <SelectItem value="autoridad_confirmada">Autoridad confirmada</SelectItem>
                  <SelectItem value="necesidad_urgente">Necesidad urgente</SelectItem>
                  <SelectItem value="tiempo_corto">Tiempo de decisión corto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accion">Realizar esta acción</Label>
              <Select
                value={nuevaAutomatizacion.accion}
                onValueChange={(value) => setNuevaAutomatizacion((prev) => ({ ...prev, accion: value }))}
              >
                <SelectTrigger id="accion">
                  <SelectValue placeholder="Seleccionar acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asignar_vendedor">Asignar a vendedor</SelectItem>
                  <SelectItem value="enviar_nurturing">Enviar secuencia de nurturing</SelectItem>
                  <SelectItem value="notificar_gerente">Notificar al gerente</SelectItem>
                  <SelectItem value="programar_seguimiento">Programar seguimiento</SelectItem>
                  <SelectItem value="crear_oportunidad">Crear oportunidad en CRM</SelectItem>
                  <SelectItem value="enviar_propuesta">Enviar propuesta comercial</SelectItem>
                  <SelectItem value="agendar_demo">Agendar demostración</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={agregarAutomatizacion}
            disabled={!nuevaAutomatizacion.trigger || !nuevaAutomatizacion.accion}
          >
            Agregar automatización
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Automatizaciones configuradas ({formData.automatizaciones.length})</h3>

          {formData.automatizaciones.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-gray-500">Aún no has agregado automatizaciones</p>
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {formData.automatizaciones.map((auto) => {
                // Mapeo de triggers a texto legible
                const triggerTexto =
                  {
                    lead_calificado: "Lead calificado",
                    lead_no_calificado: "Lead no calificado",
                    lead_en_proceso: "Lead en proceso",
                    presupuesto_alto: "Presupuesto alto detectado",
                    autoridad_confirmada: "Autoridad confirmada",
                    necesidad_urgente: "Necesidad urgente",
                    tiempo_corto: "Tiempo de decisión corto",
                  }[auto.trigger] || auto.trigger

                // Mapeo de acciones a texto legible
                const accionTexto =
                  {
                    asignar_vendedor: "Asignar a vendedor",
                    enviar_nurturing: "Enviar secuencia de nurturing",
                    notificar_gerente: "Notificar al gerente",
                    programar_seguimiento: "Programar seguimiento",
                    crear_oportunidad: "Crear oportunidad en CRM",
                    enviar_propuesta: "Enviar propuesta comercial",
                    agendar_demo: "Agendar demostración",
                  }[auto.accion] || auto.accion

                return (
                  <div key={auto.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={auto.activa ? "default" : "outline"}
                        className={auto.activa ? "bg-green-500" : ""}
                      >
                        {auto.activa ? "Activa" : "Inactiva"}
                      </Badge>
                      <div>
                        <p className="font-medium">Cuando: {triggerTexto}</p>
                        <p className="text-sm text-gray-500">Acción: {accionTexto}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleAutomatizacion(auto.id)}>
                        {auto.activa ? "Pausar" : "Activar"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => eliminarAutomatizacion(auto.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </>
  )
}

function Paso8Playground({ formData }) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <PlayCircle className="w-5 h-5 text-green-600 mr-2" />
          Playground
        </CardTitle>
        <CardDescription>Prueba tu asistente antes de activarlo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Entorno de prueba</h3>
          <p className="text-blue-700 text-sm">
            Este es un entorno de prueba para tu asistente. Puedes hacer preguntas y ver cómo respondería en base a la
            configuración que has realizado.
          </p>
        </div>

        <div className="border rounded-lg h-96 flex flex-col">
          <div className="bg-gray-50 p-3 border-b flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">{formData.nombre || "Asistente de Calificación de Leads"}</h4>
              <p className="text-xs text-gray-500">Modo Prueba</p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <p>¡Hola! Soy tu asistente de calificación de leads. ¿En qué puedo ayudarte hoy?</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 justify-end">
              <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                <p>Hola, estoy interesado en sus servicios</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <p>
                  ¡Perfecto! Me gustaría conocer más sobre tu empresa.{" "}
                  {formData.preguntasDescubrimiento.length > 0
                    ? formData.preguntasDescubrimiento[0]
                    : "¿Podrías contarme qué tipo de solución estás buscando?"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t p-3">
            <div className="flex items-center space-x-2">
              <Input placeholder="Escribe tu respuesta..." className="flex-1" />
              <Button size="sm">Enviar</Button>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Configuración actual</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Metodología:</span>
              <span className="ml-2 capitalize">{formData.metodologia}</span>
            </div>
            <div>
              <span className="text-green-700 font-medium">Umbral:</span>
              <span className="ml-2">{formData.umbralCalificacion}%</span>
            </div>
            <div>
              <span className="text-green-700 font-medium">Preguntas:</span>
              <span className="ml-2">{formData.preguntasDescubrimiento.length} configuradas</span>
            </div>
            <div>
              <span className="text-green-700 font-medium">Automatizaciones:</span>
              <span className="ml-2">{formData.automatizaciones.length} activas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}
