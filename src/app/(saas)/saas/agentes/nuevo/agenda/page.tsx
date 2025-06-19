"use client"
import { ArrowLeft, ArrowRight, Calendar, Clock, Users, Settings, Bell, MessageSquare, Zap, BarChart3, Plus, Trash2, Play, Pause, Check, AlertCircle } from "lucide-react"
import { Button, Input, Label, Textarea, Badge, Switch, Progress, Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components"
import { PASOS_AGENDA, TIPOS_REUNION_PREDEFINIDOS, INTEGRACIONES_CALENDARIO, TEMPLATES_AUTOMATIZACION_AGENDA } from "@/lib/constants/agenda"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"


export default function NuevoAsistenteAgendaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pasoActual, setPasoActual] = useState(1)
  const [loading, setLoading] = useState(false)

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Información Básica
    nombre: "",
    descripcion: "",
    zona_horaria: "",

    // Paso 2: Disponibilidad
    horario_inicio: "09:00",
    horario_fin: "17:00",
    dias_disponibles: [] as string[],
    buffer_tiempo: 15,

    // Paso 3: Tipos de Reuniones
    tipos_reunion: [] as any[],

    // Paso 4: Integraciones
    integraciones: [] as string[],

    // Paso 5: Confirmaciones
    confirmacion_automatica: true,
    recordatorio_24h: true,
    recordatorio_1h: false,

    // Paso 6: Canales
    canales: [] as string[],

    // Paso 7: Automatizaciones
    automatizaciones: [] as any[],
  })

  const progreso = (pasoActual / PASOS_AGENDA.length) * 100

  const handleSiguiente = () => {
    if (pasoActual < PASOS_AGENDA.length) {
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

  const toggleDiaDisponible = (dia: string) => {
    setFormData((prev) => ({
      ...prev,
      dias_disponibles: prev.dias_disponibles.includes(dia)
        ? prev.dias_disponibles.filter((d) => d !== dia)
        : [...prev.dias_disponibles, dia],
    }))
  }

  const agregarTipoReunion = (tipo: any) => {
    setFormData((prev) => ({
      ...prev,
      tipos_reunion: [...prev.tipos_reunion, { ...tipo, id: Date.now() }],
    }))
  }

  const eliminarTipoReunion = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      tipos_reunion: prev.tipos_reunion.filter((t) => t.id !== id),
    }))
  }

  const toggleIntegracion = (integracionId: string) => {
    setFormData((prev) => ({
      ...prev,
      integraciones: prev.integraciones.includes(integracionId)
        ? prev.integraciones.filter((i) => i !== integracionId)
        : [...prev.integraciones, integracionId],
    }))
  }

  const toggleCanal = (canal: string) => {
    setFormData((prev) => ({
      ...prev,
      canales: prev.canales.includes(canal) ? prev.canales.filter((c) => c !== canal) : [...prev.canales, canal],
    }))
  }

  const agregarAutomatizacion = (automatizacion: any) => {
    setFormData((prev) => ({
      ...prev,
      automatizaciones: [
        ...prev.automatizaciones,
        {
          ...automatizacion,
          id: Date.now(),
          activa: true,
        },
      ],
    }))
  }

  const toggleAutomatizacion = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      automatizaciones: prev.automatizaciones.map((auto) =>
        auto.id === id ? { ...auto, activa: !auto.activa } : auto,
      ),
    }))
  }

  const eliminarAutomatizacion = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      automatizaciones: prev.automatizaciones.filter((auto) => auto.id !== id),
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      console.log("Creando asistente de agendamientos:", formData)

      toast({
        title: "¡Asistente de Agendamientos Creado!",
        description: `${formData.nombre} está listo para programar citas`,
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
          <Paso2Disponibilidad formData={formData} onChange={handleInputChange} onToggleDia={toggleDiaDisponible} />
        )
      case 3:
        return (
          <Paso3TiposReuniones formData={formData} onAgregar={agregarTipoReunion} onEliminar={eliminarTipoReunion} />
        )
      case 4:
        return <Paso4Integraciones formData={formData} onToggle={toggleIntegracion} />
      case 5:
        return <Paso5Confirmaciones formData={formData} onChange={handleInputChange} />
      case 6:
        return <Paso6Canales formData={formData} onToggle={toggleCanal} />
      case 7:
        return (
          <Paso7Automatizaciones
            formData={formData}
            onAgregar={agregarAutomatizacion}
            onToggle={toggleAutomatizacion}
            onEliminar={eliminarAutomatizacion}
          />
        )
      case 8:
        return <Paso8Revision formData={formData} />
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
            <h1 className="text-3xl font-bold text-gray-900">Crear Asistente de Agendamientos</h1>
            <p className="text-gray-600 mt-1">
              Configura un asistente para programar citas y reuniones automáticamente
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Progreso de Configuración</h3>
            <span className="text-sm text-gray-500">
              {pasoActual} de {PASOS_AGENDA.length}
            </span>
          </div>
          <Progress value={progreso} className="mb-4" />
          <div className="grid grid-cols-8 gap-2">
            {PASOS_AGENDA.map((paso) => {
              const Icono = paso.icono
              const completado = pasoActual > paso.id
              const actual = pasoActual === paso.id

              return (
                <div
                  key={paso.id}
                  className={`text-center p-2 rounded-lg transition-all ${completado
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
          <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-purple-700 flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Vista Previa</span>
              </CardTitle>
              <CardDescription>Configuración actual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">{formData.nombre || "Asistente de Agendamientos"}</h4>
                <p className="text-sm text-gray-600 mb-3">{formData.zona_horaria || "Zona horaria"}</p>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    • Horario: {formData.horario_inicio} - {formData.horario_fin}
                  </div>
                  <div>• Días: {formData.dias_disponibles.length} configurados</div>
                  <div>• Reuniones: {formData.tipos_reunion.length} tipos</div>
                  <div>• Integraciones: {formData.integraciones.length} conectadas</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-sm text-gray-600">
                    {formData.confirmacion_automatica ? "✅ Confirmación automática" : "❌ Sin confirmación automática"}
                  </p>
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
              <TipsAgenda paso={pasoActual} />
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

            {pasoActual === PASOS_AGENDA.length ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                {loading ? "Creando..." : "Crear Asistente de Agendamientos"}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSiguiente} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
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

// Componentes de cada paso
function Paso1InformacionBasica({ formData, onChange }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Información Básica</span>
        </CardTitle>
        <CardDescription>Configura los datos básicos de tu asistente de agendamientos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Asistente *</Label>
            <Input
              id="nombre"
              placeholder="Ej: Asistente de Citas Médicas"
              value={formData.nombre}
              onChange={(e) => onChange("nombre", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zona_horaria">Zona Horaria *</Label>
            <Select value={formData.zona_horaria} onValueChange={(value) => onChange("zona_horaria", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona tu zona horaria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción del Asistente</Label>
          <Textarea
            id="descripcion"
            placeholder="Describe qué tipo de reuniones agenda este asistente..."
            value={formData.descripcion}
            onChange={(e) => onChange("descripcion", e.target.value)}
            className="rounded-xl min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function Paso2Disponibilidad({ formData, onChange, onToggleDia }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <span>Disponibilidad</span>
        </CardTitle>
        <CardDescription>Define tus horarios y días disponibles para reuniones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="horario_inicio">Horario de Inicio</Label>
            <Input
              id="horario_inicio"
              type="time"
              value={formData.horario_inicio}
              onChange={(e) => onChange("horario_inicio", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horario_fin">Horario de Fin</Label>
            <Input
              id="horario_fin"
              type="time"
              value={formData.horario_fin}
              onChange={(e) => onChange("horario_fin", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Días Disponibles</Label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dia) => (
              <Button
                key={dia}
                variant={formData.dias_disponibles.includes(dia) ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleDia(dia)}
                className="rounded-xl text-xs"
              >
                {dia.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buffer_tiempo">Buffer entre reuniones</Label>
          <Select
            value={formData.buffer_tiempo.toString()}
            onValueChange={(value) => onChange("buffer_tiempo", Number.parseInt(value))}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Sin buffer</SelectItem>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function Paso3TiposReuniones({ formData, onAgregar, onEliminar }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-600" />
          <span>Tipos de Reuniones</span>
        </CardTitle>
        <CardDescription>Define los tipos de citas que puedes agendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Templates Disponibles</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TIPOS_REUNION_PREDEFINIDOS.map((tipo) => (
              <div
                key={tipo.nombre}
                className="p-4 border rounded-xl cursor-pointer hover:border-purple-300 transition-colors"
                onClick={() => onAgregar(tipo)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{tipo.nombre}</h4>
                    <p className="text-sm text-gray-500">
                      {tipo.duracion} min - {tipo.descripcion}
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {formData.tipos_reunion.length > 0 && (
          <div className="space-y-3">
            <Label>Tipos Configurados</Label>
            <div className="space-y-2">
              {formData.tipos_reunion.map((tipo: any) => (
                <div key={tipo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium">{tipo.nombre}</div>
                    <div className="text-sm text-gray-500">
                      {tipo.duracion} min - {tipo.descripcion}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onEliminar(tipo.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Paso4Integraciones({ formData, onToggle }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-purple-600" />
          <span>Integraciones</span>
        </CardTitle>
        <CardDescription>Conecta con tus calendarios y herramientas favoritas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTEGRACIONES_CALENDARIO.map((integracion) => (
            <div
              key={integracion.id}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.integraciones.includes(integracion.id)
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
                }`}
              onClick={() => onToggle(integracion.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integracion.icono}</div>
                  <div>
                    <h4 className="font-medium">{integracion.nombre}</h4>
                    {integracion.popular && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${formData.integraciones.includes(integracion.id)
                      ? "border-purple-500 bg-purple-500"
                      : "border-gray-300"
                    }`}
                >
                  {formData.integraciones.includes(integracion.id) && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function Paso5Confirmaciones({ formData, onChange }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-purple-600" />
          <span>Confirmaciones y Recordatorios</span>
        </CardTitle>
        <CardDescription>Configura confirmaciones automáticas y recordatorios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">Confirmación Automática</p>
              <p className="text-sm text-gray-600">Envía confirmación inmediata al agendar</p>
            </div>
            <Switch
              checked={formData.confirmacion_automatica}
              onCheckedChange={(checked) => onChange("confirmacion_automatica", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">Recordatorio 24 horas</p>
              <p className="text-sm text-gray-600">Envía recordatorio un día antes</p>
            </div>
            <Switch
              checked={formData.recordatorio_24h}
              onCheckedChange={(checked) => onChange("recordatorio_24h", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">Recordatorio 1 hora</p>
              <p className="text-sm text-gray-600">Envía recordatorio una hora antes</p>
            </div>
            <Switch
              checked={formData.recordatorio_1h}
              onCheckedChange={(checked) => onChange("recordatorio_1h", checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Paso6Canales({ formData, onToggle }: any) {
  const canales = [
    { id: "whatsapp", nombre: "WhatsApp", icono: "💬", descripcion: "Mensajes directos" },
    { id: "email", nombre: "Email", icono: "📧", descripcion: "Correo electrónico" },
    { id: "sms", nombre: "SMS", icono: "📱", descripcion: "Mensajes de texto" },
    { id: "telegram", nombre: "Telegram", icono: "✈️", descripcion: "Bot de Telegram" },
  ]

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <span>Canales de Comunicación</span>
        </CardTitle>
        <CardDescription>Selecciona dónde estará disponible tu asistente de agendamientos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canales.map((canal) => (
            <div
              key={canal.id}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.canales.includes(canal.id)
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
                }`}
              onClick={() => onToggle(canal.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{canal.icono}</div>
                  <div>
                    <h4 className="font-medium">{canal.nombre}</h4>
                    <p className="text-sm text-gray-500">{canal.descripcion}</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${formData.canales.includes(canal.id) ? "border-purple-500 bg-purple-500" : "border-gray-300"
                    }`}
                >
                  {formData.canales.includes(canal.id) && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function Paso7Automatizaciones({ formData, onAgregar, onToggle, onEliminar }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <span>Automatizaciones del Asistente</span>
        </CardTitle>
        <CardDescription>Configura reglas automáticas específicas para agendamientos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Templates Recomendados para Agendamientos</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATES_AUTOMATIZACION_AGENDA.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left rounded-xl"
                onClick={() => onAgregar(template)}
              >
                <div>
                  <h4 className="font-medium text-sm">{template.nombre}</h4>
                  <p className="text-xs text-gray-600 mt-1">{template.descripcion}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

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
                        className={`text-xs ${automatizacion.activa ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          } border-0`}
                      >
                        {automatizacion.activa ? "Activa" : "Pausada"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{automatizacion.descripcion}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggle(automatizacion.id)}
                      className="h-6 w-6 p-0"
                    >
                      {automatizacion.activa ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEliminar(automatizacion.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Paso8Revision({ formData }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <span>Revisión y Activación</span>
        </CardTitle>
        <CardDescription>Revisa la configuración de tu asistente de agendamientos antes de activarlo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Información Básica</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Nombre:</span> {formData.nombre}
                </p>
                <p>
                  <span className="text-gray-600">Zona Horaria:</span> {formData.zona_horaria}
                </p>
                <p>
                  <span className="text-gray-600">Horario:</span> {formData.horario_inicio} - {formData.horario_fin}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Disponibilidad</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Días:</span> {formData.dias_disponibles.length} configurados
                </p>
                <p>
                  <span className="text-gray-600">Buffer:</span> {formData.buffer_tiempo} minutos
                </p>
                <p>
                  <span className="text-gray-600">Tipos de reunión:</span> {formData.tipos_reunion.length} configurados
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Configuración</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Integraciones:</span> {formData.integraciones.length} conectadas
                </p>
                <p>
                  <span className="text-gray-600">Canales:</span> {formData.canales.length} activos
                </p>
                <p>
                  <span className="text-gray-600">Confirmación:</span>{" "}
                  {formData.confirmacion_automatica ? "Automática" : "Manual"}
                </p>
                <p>
                  <span className="text-gray-600">Automatizaciones:</span> {formData.automatizaciones.length}{" "}
                  configuradas
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800">Asistente de Agendamientos Listo</h4>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Tu asistente está configurado y listo para programar citas automáticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Tips por paso
function TipsAgenda({ paso }: { paso: number }) {
  const tips = {
    1: [
      "Usa un nombre descriptivo que refleje el tipo de citas",
      "La zona horaria es crucial para evitar confusiones",
      "Una buena descripción ayuda a los usuarios a entender el propósito",
    ],
    2: [
      "Define horarios realistas según tu disponibilidad",
      "Considera buffers entre reuniones para prepararte",
      "Selecciona solo los días que realmente estés disponible",
    ],
    3: [
      "Crea tipos específicos según tus necesidades",
      "Define duraciones apropiadas para cada tipo",
      "Usa descripciones claras para cada tipo de reunión",
    ],
    4: [
      "Google Calendar es la integración más popular",
      "Zoom facilita la creación automática de enlaces",
      "Las integraciones se configuran después de crear el asistente",
    ],
    5: [
      "Las confirmaciones automáticas reducen el no-show",
      "Los recordatorios mejoran la asistencia",
      "Puedes personalizar los mensajes más tarde",
    ],
    6: [
      "WhatsApp es muy efectivo para recordatorios",
      "Email es esencial para confirmaciones formales",
      "SMS tiene alta tasa de apertura",
    ],
    7: [
      "Las automatizaciones ahorran tiempo significativo",
      "Empieza con templates básicos",
      "Puedes crear reglas personalizadas después",
    ],
    8: [
      "Revisa que toda la información sea correcta",
      "Verifica que las integraciones estén seleccionadas",
      "Asegúrate de tener al menos un canal activo",
    ],
  }

  return (
    <div className="space-y-2">
      {tips[paso as keyof typeof tips]?.map((tip, index) => (
        <div key={index} className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
          <p className="text-sm text-gray-600">{tip}</p>
        </div>
      ))}
    </div>
  )
}
