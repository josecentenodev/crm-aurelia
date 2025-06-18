"use client"

import { ArrowLeft, ArrowRight, Check, Plus, X, Target, Users, Brain, Zap, Settings, MessageSquare, TrendingUp, Shield, Lightbulb, PlayCircle } from "lucide-react"
import { Button, Input, Label, Textarea, Progress, Separator, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

const TOTAL_STEPS = 8

export default function NuevoAsistenteVentasPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    businessName: "",
    industry: "",
    targetMarket: "",
    avgDealSize: "",

    // Paso 2: Metodología de ventas
    salesMethodology: "",
    customStages: [],

    // Paso 3: Buyer personas
    buyerPersonas: [{ name: "", role: "", painPoints: "" }],

    // Paso 4: Proceso de descubrimiento
    discoveryQuestions: [],

    // Paso 5: Scoring y calificación
    scoringCriteria: [],
    qualificationThreshold: 70,

    // Paso 6: Automatizaciones
    automations: [],

    // Paso 7: Objeciones y CRM
    commonObjections: [],
    crmIntegration: "",

    // Paso 8: Configuración final
    assistantName: "",
    description: "",
    conversationStyle: "",
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: string, item: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as any[]), item],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    console.log("Datos del asistente de ventas:", formData)
    router.push("/asistentes")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Información del Negocio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Nombre del negocio</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => updateFormData("businessName", e.target.value)}
                    placeholder="Ej: TechSolutions Inc."
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industria</Label>
                  <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Tecnología</SelectItem>
                      <SelectItem value="healthcare">Salud</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufactura</SelectItem>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetMarket">Mercado objetivo</Label>
                  <Input
                    id="targetMarket"
                    value={formData.targetMarket}
                    onChange={(e) => updateFormData("targetMarket", e.target.value)}
                    placeholder="Ej: Empresas B2B de 50-500 empleados"
                  />
                </div>
                <div>
                  <Label htmlFor="avgDealSize">Tamaño promedio de venta</Label>
                  <Input
                    id="avgDealSize"
                    value={formData.avgDealSize}
                    onChange={(e) => updateFormData("avgDealSize", e.target.value)}
                    placeholder="Ej: $50,000 - $200,000"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Metodología de Ventas</h3>
              <p className="text-sm text-gray-600 mb-4">Selecciona tu framework de ventas preferido</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { id: "bant", name: "BANT", desc: "Budget, Authority, Need, Timeline" },
                  { id: "meddic", name: "MEDDIC", desc: "Metrics, Economic Buyer, Decision Criteria" },
                  { id: "spin", name: "SPIN Selling", desc: "Situation, Problem, Implication, Need-payoff" },
                  { id: "challenger", name: "Challenger Sale", desc: "Teach, Tailor, Take Control" },
                  { id: "sandler", name: "Sandler", desc: "Pain, Budget, Decision" },
                  { id: "custom", name: "Personalizado", desc: "Define tu propia metodología" },
                ].map((method) => (
                  <Card
                    key={method.id}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.salesMethodology === method.id
                        ? "ring-2 ring-purple-500 bg-purple-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => updateFormData("salesMethodology", method.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mt-1 ${
                          formData.salesMethodology === method.id
                            ? "bg-purple-500 border-purple-500"
                            : "border-gray-300"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {formData.salesMethodology === "custom" && (
                <div>
                  <Label>Etapas personalizadas</Label>
                  <div className="space-y-2 mt-2">
                    {formData.customStages.map((stage, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={stage}
                          onChange={(e) => {
                            const updated = [...formData.customStages]
                            updated[index] = e.target.value
                            updateFormData("customStages", updated)
                          }}
                          placeholder={`Etapa ${index + 1}`}
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeArrayItem("customStages", index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addArrayItem("customStages", "")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Etapa
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Buyer Personas</h3>
              <p className="text-sm text-gray-600 mb-4">Define los perfiles de tus clientes ideales</p>

              {formData.buyerPersonas.map((persona, index) => (
                <Card key={index} className="p-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Persona {index + 1}</h4>
                    {formData.buyerPersonas.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeArrayItem("buyerPersonas", index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre/Título</Label>
                      <Input
                        value={persona.name}
                        onChange={(e) => {
                          const updated = [...formData.buyerPersonas]
                          updated[index].name = e.target.value
                          updateFormData("buyerPersonas", updated)
                        }}
                        placeholder="Ej: Director de TI"
                      />
                    </div>
                    <div>
                      <Label>Rol en la decisión</Label>
                      <Input
                        value={persona.role}
                        onChange={(e) => {
                          const updated = [...formData.buyerPersonas]
                          updated[index].role = e.target.value
                          updateFormData("buyerPersonas", updated)
                        }}
                        placeholder="Ej: Decisor final, Influenciador"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Puntos de dolor principales</Label>
                      <Textarea
                        value={persona.painPoints}
                        onChange={(e) => {
                          const updated = [...formData.buyerPersonas]
                          updated[index].painPoints = e.target.value
                          updateFormData("buyerPersonas", updated)
                        }}
                        placeholder="¿Qué problemas enfrentan? ¿Qué los mantiene despiertos por la noche?"
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={() => addArrayItem("buyerPersonas", { name: "", role: "", painPoints: "" })}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Persona
              </Button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Preguntas de Descubrimiento</h3>
              <p className="text-sm text-gray-600 mb-4">Define las preguntas clave para entender a tus prospectos</p>

              <div>
                <Label>Preguntas de descubrimiento</Label>
                {formData.discoveryQuestions.map((question, index) => (
                  <div key={index} className="flex items-start space-x-2 mt-2">
                    <Textarea
                      value={question}
                      onChange={(e) => {
                        const updated = [...formData.discoveryQuestions]
                        updated[index] = e.target.value
                        updateFormData("discoveryQuestions", updated)
                      }}
                      placeholder="Escribe una pregunta de descubrimiento..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("discoveryQuestions", index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayItem("discoveryQuestions", "")}
                  className="w-full mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Pregunta
                </Button>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💡 Ejemplos de preguntas SPIN:</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    • <strong>Situación:</strong> "¿Cómo manejan actualmente el proceso de...?"
                  </li>
                  <li>
                    • <strong>Problema:</strong> "¿Qué desafíos enfrentan con su solución actual?"
                  </li>
                  <li>
                    • <strong>Implicación:</strong> "¿Cómo afecta esto a la productividad del equipo?"
                  </li>
                  <li>
                    • <strong>Necesidad:</strong> "¿Sería útil si pudieran automatizar este proceso?"
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sistema de Scoring</h3>
              <p className="text-sm text-gray-600 mb-4">Define cómo calificar y puntuar a los prospectos</p>

              <div className="mb-6">
                <Label>Umbral de calificación (0-100)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.qualificationThreshold}
                    onChange={(e) => updateFormData("qualificationThreshold", Number.parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-medium">{formData.qualificationThreshold}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Prospectos con puntaje superior serán marcados como calificados
                </p>
              </div>

              <div>
                <Label>Criterios de scoring</Label>
                {formData.scoringCriteria.map((criteria, index) => (
                  <Card key={index} className="p-4 mt-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Criterio {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeArrayItem("scoringCriteria", index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Criterio</Label>
                        <Input
                          value={criteria.name || ""}
                          onChange={(e) => {
                            const updated = [...formData.scoringCriteria]
                            updated[index] = { ...updated[index], name: e.target.value }
                            updateFormData("scoringCriteria", updated)
                          }}
                          placeholder="Ej: Presupuesto confirmado"
                        />
                      </div>
                      <div>
                        <Label>Peso (%)</Label>
                        <Input
                          type="number"
                          value={criteria.weight || ""}
                          onChange={(e) => {
                            const updated = [...formData.scoringCriteria]
                            updated[index] = { ...updated[index], weight: Number.parseInt(e.target.value) }
                            updateFormData("scoringCriteria", updated)
                          }}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <Label>Descripción</Label>
                        <Input
                          value={criteria.description || ""}
                          onChange={(e) => {
                            const updated = [...formData.scoringCriteria]
                            updated[index] = { ...updated[index], description: e.target.value }
                            updateFormData("scoringCriteria", updated)
                          }}
                          placeholder="Cómo evaluar este criterio"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayItem("scoringCriteria", { name: "", weight: 0, description: "" })}
                  className="w-full mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Criterio
                </Button>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Automatizaciones</h3>
              <p className="text-sm text-gray-600 mb-4">Configura respuestas automáticas y seguimientos</p>

              <div>
                <Label>Automatizaciones por evento</Label>
                {formData.automations.map((automation, index) => (
                  <Card key={index} className="p-4 mt-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Automatización {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeArrayItem("automations", index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Evento disparador</Label>
                        <Select
                          value={automation.trigger || ""}
                          onValueChange={(value) => {
                            const updated = [...formData.automations]
                            updated[index] = { ...updated[index], trigger: value }
                            updateFormData("automations", updated)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona evento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead_qualified">Lead calificado</SelectItem>
                            <SelectItem value="demo_requested">Demo solicitada</SelectItem>
                            <SelectItem value="proposal_sent">Propuesta enviada</SelectItem>
                            <SelectItem value="objection_raised">Objeción planteada</SelectItem>
                            <SelectItem value="no_response">Sin respuesta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Acción</Label>
                        <Select
                          value={automation.action || ""}
                          onValueChange={(value) => {
                            const updated = [...formData.automations]
                            updated[index] = { ...updated[index], action: value }
                            updateFormData("automations", updated)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona acción" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="send_email">Enviar email</SelectItem>
                            <SelectItem value="schedule_call">Agendar llamada</SelectItem>
                            <SelectItem value="notify_sales">Notificar vendedor</SelectItem>
                            <SelectItem value="update_crm">Actualizar CRM</SelectItem>
                            <SelectItem value="send_content">Enviar contenido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Template de mensaje</Label>
                        <Textarea
                          value={automation.template || ""}
                          onChange={(e) => {
                            const updated = [...formData.automations]
                            updated[index] = { ...updated[index], template: e.target.value }
                            updateFormData("automations", updated)
                          }}
                          placeholder="Escribe el template del mensaje..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayItem("automations", { trigger: "", action: "", template: "" })}
                  className="w-full mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Automatización
                </Button>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Objeciones y CRM</h3>
              <p className="text-sm text-gray-600 mb-4">Manejo de objeciones e integración con CRM</p>

              <div className="mb-6">
                <Label>Objeciones comunes</Label>
                {formData.commonObjections.map((objection, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <Input
                      value={objection}
                      onChange={(e) => {
                        const updated = [...formData.commonObjections]
                        updated[index] = e.target.value
                        updateFormData("commonObjections", updated)
                      }}
                      placeholder='Ej: "Es muy caro"'
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("commonObjections", index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => addArrayItem("commonObjections", "")} className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Objeción
                </Button>
              </div>

              <div>
                <Label>Integración CRM</Label>
                <Select
                  value={formData.crmIntegration}
                  onValueChange={(value) => updateFormData("crmIntegration", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu CRM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                    <SelectItem value="hubspot">HubSpot</SelectItem>
                    <SelectItem value="pipedrive">Pipedrive</SelectItem>
                    <SelectItem value="zoho">Zoho CRM</SelectItem>
                    <SelectItem value="monday">Monday.com</SelectItem>
                    <SelectItem value="custom">API personalizada</SelectItem>
                    <SelectItem value="none">Sin integración</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configuración Final</h3>
              <p className="text-sm text-gray-600 mb-4">Últimos detalles para completar tu asistente</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="assistantName">Nombre del asistente</Label>
                  <Input
                    id="assistantName"
                    value={formData.assistantName}
                    onChange={(e) => updateFormData("assistantName", e.target.value)}
                    placeholder="Ej: Alex - Asistente de Ventas"
                  />
                </div>
                <div>
                  <Label htmlFor="conversationStyle">Estilo de conversación</Label>
                  <Select
                    value={formData.conversationStyle}
                    onValueChange={(value) => updateFormData("conversationStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Profesional y formal</SelectItem>
                      <SelectItem value="friendly">Amigable y cercano</SelectItem>
                      <SelectItem value="consultative">Consultivo y experto</SelectItem>
                      <SelectItem value="direct">Directo y eficiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descripción del asistente</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Describe brevemente qué hace este asistente y cómo ayuda a tu proceso de ventas..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mt-6">
                <h4 className="font-medium mb-2">🚀 ¡Tu asistente de ventas está listo!</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Has configurado un asistente completo con metodología de ventas, scoring automático y automatizaciones
                  inteligentes.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Metodología configurada</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Scoring automático</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Automatizaciones listas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/asistentes/nuevo">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Asistente de Ventas Completo</h1>
            <p className="text-gray-600 mt-1">
              Configura un asistente para automatizar todo el proceso de ventas consultivas
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {currentStep} de {TOTAL_STEPS}
            </span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / TOTAL_STEPS) * 100)}% completado</span>
          </div>
          <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-8 gap-2 mb-8">
          {[
            { icon: Target, label: "Negocio", color: "purple" },
            { icon: Brain, label: "Metodología", color: "purple" },
            { icon: Users, label: "Personas", color: "purple" },
            { icon: MessageSquare, label: "Descubrimiento", color: "purple" },
            { icon: TrendingUp, label: "Scoring", color: "purple" },
            { icon: Zap, label: "Automatización", color: "purple" },
            { icon: Shield, label: "Objeciones", color: "purple" },
            { icon: Settings, label: "Configuración", color: "purple" },
          ].map((step, index) => {
            const StepIcon = step.icon
            const isActive = currentStep === index + 1
            const isCompleted = currentStep > index + 1

            return (
              <div
                key={index}
                className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? "bg-purple-100 border-2 border-purple-300"
                    : isCompleted
                      ? "bg-purple-50 border-2 border-purple-200"
                      : "bg-white border-2 border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setCurrentStep(index + 1)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    isActive
                      ? "bg-purple-500 text-white"
                      : isCompleted
                        ? "bg-purple-400 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    isActive ? "text-purple-700" : isCompleted ? "text-purple-600" : "text-gray-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border-0 bg-white">
              <CardContent className="p-8">
                {renderStepContent()}

                <Separator className="my-8" />

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>

                  {currentStep === TOTAL_STEPS ? (
                    <Button
                      onClick={handleSubmit}
                      className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Crear Asistente
                    </Button>
                  ) : (
                    <Button onClick={nextStep} className="rounded-xl bg-purple-600 hover:bg-purple-700">
                      Siguiente
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Preview Card */}
              <Card className="rounded-2xl shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlayCircle className="w-5 h-5 text-purple-600" />
                    <span>Vista Previa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">{formData.assistantName || "Asistente de Ventas"}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {formData.businessName && `Empresa: ${formData.businessName}`}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formData.salesMethodology && `Metodología: ${formData.salesMethodology.toUpperCase()}`}
                    </div>
                    <div className="text-xs text-gray-600">Buyer Personas: {formData.buyerPersonas.length}</div>
                    <div className="text-xs text-gray-600">Preguntas: {formData.discoveryQuestions.length}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <span>Tips de Ventas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {currentStep === 1 && (
                      <div>
                        <p className="font-medium text-purple-700">💼 Información del Negocio</p>
                        <p className="text-gray-600">
                          Define claramente tu mercado objetivo y el tamaño promedio de tus ventas para personalizar
                          mejor las conversaciones.
                        </p>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div>
                        <p className="font-medium text-purple-700">🎯 Metodología de Ventas</p>
                        <p className="text-gray-600">
                          BANT es ideal para ventas transaccionales, mientras que MEDDIC funciona mejor para ventas
                          complejas B2B.
                        </p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div>
                        <p className="font-medium text-purple-700">👥 Buyer Personas</p>
                        <p className="text-gray-600">
                          Identifica tanto al decisor económico como a los influenciadores técnicos en el proceso de
                          compra.
                        </p>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div>
                        <p className="font-medium text-purple-700">❓ Preguntas de Descubrimiento</p>
                        <p className="text-gray-600">
                          Las mejores preguntas son abiertas y ayudan al prospecto a descubrir sus propios problemas y
                          necesidades.
                        </p>
                      </div>
                    )}
                    {currentStep === 5 && (
                      <div>
                        <p className="font-medium text-purple-700">📊 Sistema de Scoring</p>
                        <p className="text-gray-600">
                          Un buen sistema de scoring te ayuda a priorizar leads y enfocar tu tiempo en las oportunidades
                          más prometedoras.
                        </p>
                      </div>
                    )}
                    {currentStep === 6 && (
                      <div>
                        <p className="font-medium text-purple-700">⚡ Automatizaciones</p>
                        <p className="text-gray-600">
                          Automatiza las tareas repetitivas pero mantén el toque humano en las interacciones
                          importantes.
                        </p>
                      </div>
                    )}
                    {currentStep === 7 && (
                      <div>
                        <p className="font-medium text-purple-700">🛡️ Manejo de Objeciones</p>
                        <p className="text-gray-600">
                          Las objeciones son oportunidades para profundizar en las necesidades del prospecto. Prepara
                          respuestas empáticas.
                        </p>
                      </div>
                    )}
                    {currentStep === 8 && (
                      <div>
                        <p className="font-medium text-purple-700">🚀 ¡Casi listo!</p>
                        <p className="text-gray-600">
                          Un asistente bien configurado puede aumentar tu tasa de conversión hasta un 30% y reducir el
                          tiempo de calificación.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
