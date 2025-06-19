"use client"

import { availableMetrics } from "@/server/api/mock-data"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components"
import { Bot, MessageSquare, BarChart3, CheckCircle, TrendingUp, Plus, Eye, Award, Calendar } from "lucide-react"
import { useState } from "react"
import { SectionHeader } from "./_components/header"


// Presets predefinidos
const presets = {
  ventas: {
    name: "Enfoque en Ventas",
    kpis: ["conversaciones", "leads", "conversion", "roi"],
    charts: ["daily_conversations", "sales_funnel"],
    widgets: ["channel_status", "recent_activity", "ai_insights"],
  },
  marketing: {
    name: "Enfoque en Marketing",
    kpis: ["conversaciones", "cost_per_lead", "active_users", "conversion"],
    charts: ["channel_performance", "daily_conversations"],
    widgets: ["channel_status", "top_performers", "ai_insights"],
  },
  operaciones: {
    name: "Enfoque en Operaciones",
    kpis: ["response_time", "automation_rate", "active_users", "leads"],
    charts: ["response_times", "channel_performance"],
    widgets: ["quick_actions", "upcoming_tasks", "recent_activity"],
  },
  completo: {
    name: "Vista Completa",
    kpis: ["conversaciones", "leads", "conversion", "response_time"],
    charts: ["daily_conversations", "channel_performance"],
    widgets: ["channel_status", "quick_actions", "recent_activity", "ai_insights"],
  },
}

export default function Dashboard() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("7dias")
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)

  // Estado de métricas seleccionadas (inicialmente preset completo)
  const [selectedMetrics, setSelectedMetrics] = useState({
    kpis: presets.completo.kpis,
    charts: presets.completo.charts,
    widgets: presets.completo.widgets,
  })

  const handlePresetSelect = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets]
    setSelectedMetrics({
      kpis: preset.kpis,
      charts: preset.charts,
      widgets: preset.widgets,
    })
  }

  const handleMetricToggle = (category: string, metricId: string) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].includes(metricId)
        ? prev[category as keyof typeof prev].filter((id) => id !== metricId)
        : [...prev[category as keyof typeof prev], metricId],
    }))
  }

  // Filtrar métricas según selección
  const visibleKpis = availableMetrics.kpis.filter((kpi) => selectedMetrics.kpis.includes(kpi.id))
  const visibleCharts = availableMetrics.charts.filter((chart) => selectedMetrics.charts.includes(chart.id))
  const visibleWidgets = availableMetrics.widgets.filter((widget) => selectedMetrics.widgets.includes(widget.id))

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <SectionHeader title={"¡Bienvenido a Aurelia! 👋"} description={"Tu plataforma de inteligencia artificial para automatizar ventas consultivas"}>
        <Button className="rounded-xl bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Agente
        </Button>
      </SectionHeader>
      {/** TODO: ESTE COMPONENTE SE DEBE REFACTORIZAR, VISIBLEKPIS, CHARTS && WIDGETS*/}
      {/* KPIs Principales - Solo mostrar los seleccionados */}
      {visibleKpis.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(visibleKpis.length, 4)} gap-6`}>
          {visibleKpis.map((kpi) => (
            <Card key={kpi.id} className="rounded-2xl shadow-sm border-0 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.name}</CardTitle>
                <kpi.icon className={`h-10 w-10 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {kpi.trend} vs semana anterior
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gráficos - Solo mostrar los seleccionados */}
      {visibleCharts.length > 0 && (
        <div className={`grid grid-cols-1 ${visibleCharts.length > 1 ? "lg:grid-cols-2" : ""} gap-6`}>
          {visibleCharts.map((chart) => (
            <Card key={chart.id} className="rounded-2xl shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle>{chart.name}</CardTitle>
                <CardDescription>{chart.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{chart.name}</p>
                    <p className="text-sm text-gray-400">Datos simulados para demo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Widgets - Renderizar según selección */}
      <div className="space-y-6">
        {/* Estado de Canales */}
        {visibleWidgets.some((w) => w.id === "channel_status") && (
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-purple-600">Estado de Canales</CardTitle>
              <CardDescription>Conecta y gestiona tus canales de comunicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                      <p className="text-sm text-gray-500">156 mensajes hoy</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Instagram</h3>
                      <p className="text-sm text-gray-500">98 mensajes hoy</p>
                    </div>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800 border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Facebook</h3>
                      <p className="text-sm text-gray-500">No configurado</p>
                    </div>
                  </div>
                  <Badge variant="outline">Inactivo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sección de Widgets Inferiores */}
        {visibleWidgets.some((w) =>
          ["quick_actions", "recent_activity", "ai_insights", "top_performers", "upcoming_tasks"].includes(w.id),
        ) && (
          <div
            className={`grid grid-cols-1 lg:grid-cols-${Math.min(visibleWidgets.filter((w) => ["quick_actions", "recent_activity", "ai_insights", "top_performers", "upcoming_tasks"].includes(w.id)).length, 3)} gap-6`}
          >
            {/* Acciones Rápidas */}
            {visibleWidgets.some((w) => w.id === "quick_actions") && (
              <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-aurelia-primary">Acciones Rápidas</CardTitle>
                  <CardDescription>Gestiona tu plataforma de manera eficiente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto bg-white rounded-xl shadow-sm">
                    <Bot className="h-5 w-5 text-aurelia-primary mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Crear Nuevo Asistente</p>
                      <p className="text-sm text-gray-500">Configura un asistente para un nuevo canal</p>
                    </div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto bg-white rounded-xl shadow-sm">
                    <MessageSquare className="h-5 w-5 text-aurelia-primary mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Ver Conversaciones</p>
                      <p className="text-sm text-gray-500">Revisa las últimas interacciones con leads</p>
                    </div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto bg-white rounded-xl shadow-sm">
                    <Eye className="h-5 w-5 text-aurelia-primary mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Análisis Detallado</p>
                      <p className="text-sm text-gray-500">Métricas avanzadas y reportes</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Actividad Reciente */}
            {visibleWidgets.some((w) => w.id === "recent_activity") && (
              <Card className="rounded-2xl shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones en tu plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Lead calificado</p>
                      <p className="text-xs text-gray-500">María González - hace 5 min</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Nueva conversación</p>
                      <p className="text-xs text-gray-500">Carlos Ruiz - hace 12 min</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Asistente actualizado</p>
                      <p className="text-xs text-gray-500">Bot Inmobiliario - hace 1 hora</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Canal conectado</p>
                      <p className="text-xs text-gray-500">Instagram - hace 2 horas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights Inteligentes */}
            {visibleWidgets.some((w) => w.id === "ai_insights") && (
              <Card className="rounded-2xl shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle>Insights Inteligentes</CardTitle>
                  <CardDescription>Recomendaciones basadas en IA</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <h4 className="font-medium text-blue-900 mb-1">📈 Tendencia Positiva</h4>
                    <p className="text-sm text-blue-700">
                      Tus conversiones aumentaron 18% esta semana. ¡Excelente trabajo!
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <h4 className="font-medium text-green-900 mb-1">🎯 Oportunidad</h4>
                    <p className="text-sm text-green-700">
                      Los viernes son tu día más activo. Considera programar más contenido.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <h4 className="font-medium text-purple-900 mb-1">🚀 Sugerencia</h4>
                    <p className="text-sm text-purple-700">
                      Conecta WhatsApp API para automatizar aún más tus respuestas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Performers */}
            {visibleWidgets.some((w) => w.id === "top_performers") && (
              <Card className="rounded-2xl shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Mejores asistentes y canales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">Bot Inmobiliario</p>
                        <p className="text-sm text-gray-500">89% tasa de conversión</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">#1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">WhatsApp</p>
                        <p className="text-sm text-gray-500">156 conversaciones</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">#2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="font-medium text-gray-900">Instagram DM</p>
                        <p className="text-sm text-gray-500">98 conversaciones</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">#3</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tareas Pendientes */}
            {visibleWidgets.some((w) => w.id === "upcoming_tasks") && (
              <Card className="rounded-2xl shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle>Tareas Pendientes</CardTitle>
                  <CardDescription>Recordatorios y seguimientos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Seguimiento con María González</p>
                      <p className="text-xs text-gray-500">Vence hoy a las 15:00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Revisar configuración Bot</p>
                      <p className="text-xs text-gray-500">Vence mañana</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Reporte semanal</p>
                      <p className="text-xs text-gray-500">Vence el viernes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
