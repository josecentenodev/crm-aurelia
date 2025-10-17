"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Save, 
  Plus, 
  Trash2,
  Settings,
  Code,
  GripVertical,
  User,
  Building2,
  Clock,
  TrendingUp,
  FileText,
  Palette,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { type FieldType, FieldTypeValues } from "@/domain"
import { StepProgress } from "./_components/StepProgress"
import { TemplatePreview } from "./_components/TemplatePreview"

interface FieldData {
  name: string
  label: string
  type: FieldType
  required: boolean
  options: string[]
  order: number
  config?: Record<string, any>
}

interface StepData {
  name: string
  description?: string
  icon: string
  order: number
  fields: FieldData[]
}

interface FormData {
  name: string
  description: string
  category: string
  isActive: boolean
  isGlobal: boolean
  clientId: string
  steps: StepData[]
}

export default function CrearTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    isActive: true,
    isGlobal: false,
    clientId: "",
    steps: []
  })

  const { data: clientsData } = api.superadmin.getClients.useQuery({
    limit: 100
  })

  const clients = clientsData?.clients ?? []

  const createTemplateMutation = api.superadmin.createTemplate.useMutation({
    onSuccess: () => {
      toast({
        title: "Template creado",
        description: "El template se ha creado exitosamente.",
      })
      router.push("/dashboard/templates")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setError(error.message)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isActive: formData.isActive,
        isGlobal: formData.isGlobal,
        clientId: formData.isGlobal ? undefined : formData.clientId,
        steps: formData.steps
      }

      await createTemplateMutation.mutateAsync(templateData)
    } catch (error) {
      console.error("Error creating template:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        name: "",
        description: "",
        icon: "user",
        order: prev.steps.length,
        fields: []
      }]
    }))
  }

  const removeStep = (stepIndex: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== stepIndex)
    }))
  }

  const updateStep = (stepIndex: number, step: Partial<StepData>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => i === stepIndex ? { ...s, ...step } : s)
    }))
  }

  const addField = (stepIndex: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === stepIndex 
          ? {
              ...step,
              fields: [...step.fields, {
                name: "",
                label: "",
                type: "TEXT" as FieldType,
                required: false,
                options: [],
                order: step.fields.length,
                config: {}
              }]
            }
          : step
      )
    }))
  }

  const removeField = (stepIndex: number, fieldIndex: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === stepIndex 
          ? {
              ...step,
              fields: step.fields.filter((_, j) => j !== fieldIndex)
            }
          : step
      )
    }))
  }

  const updateField = (stepIndex: number, fieldIndex: number, field: Partial<FieldData>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === stepIndex 
          ? {
              ...step,
              fields: step.fields.map((f, j) => j === fieldIndex ? { ...f, ...field } : f)
            }
          : step
      )
    }))
  }

  const addOption = (stepIndex: number, fieldIndex: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === stepIndex 
          ? {
              ...step,
              fields: step.fields.map((field, j) => 
                j === fieldIndex 
                  ? { ...field, options: [...field.options, ""] }
                  : field
              )
            }
          : step
      )
    }))
  }

  const updateOption = (stepIndex: number, fieldIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === stepIndex 
          ? {
              ...step,
              fields: step.fields.map((field, j) => 
                j === fieldIndex 
                  ? { 
                      ...field, 
                      options: field.options.map((opt, k) => 
                        k === optionIndex ? value : opt
                      )
                    }
                  : field
              )
            }
          : step
      )
    }))
  }

  const removeOption = (stepIndex: number, fieldIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === stepIndex 
          ? {
              ...step,
              fields: step.fields.map((field, j) => 
                j === fieldIndex 
                  ? { 
                      ...field, 
                      options: field.options.filter((_, k) => k !== optionIndex)
                    }
                  : field
              )
            }
          : step
      )
    }))
  }

  const getFieldTypeLabel = (type: FieldType) => {
    switch (type) {
      case "TEXT": return "Texto"
      case "TEXTAREA": return "Área de texto"
      case "NUMBER": return "Número"
      case "EMAIL": return "Email"
      case "SELECT": return "Selección única"
      case "MULTISELECT": return "Selección múltiple"
      case "CHECKBOX": return "Casilla de verificación"
      case "RADIO": return "Botones de radio"
      case "DATE": return "Fecha"
      case "JSON": return "JSON"
      default: return type
    }
  }

  const needsOptions = (type: FieldType) => {
    return ["SELECT", "MULTISELECT", "RADIO"].includes(type)
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "user": return <User className="w-4 h-4" />
      case "building": return <Building2 className="w-4 h-4" />
      case "clock": return <Clock className="w-4 h-4" />
      case "trending-up": return <TrendingUp className="w-4 h-4" />
      case "file-text": return <FileText className="w-4 h-4" />
      case "palette": return <Palette className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getIconLabel = (iconName: string) => {
    switch (iconName) {
      case "user": return "Usuario"
      case "building": return "Empresa"
      case "clock": return "Reloj"
      case "trending-up": return "Tendencia"
      case "file-text": return "Documento"
      case "palette": return "Paleta"
      default: return "Usuario"
    }
  }

  return (
    <div className="flex space-x-8">
      {/* Sidebar con progreso */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-6">
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="border-0 bg-gray-50 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Crear Template</h1>
            <p className="text-gray-600">Crea un nuevo template de agente con steps personalizados</p>
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <Badge variant={formData.isGlobal ? "default" : "secondary"} className="border-0">
              {formData.isGlobal ? "Global" : "Local"}
            </Badge>
            <Badge variant={formData.isActive ? "default" : "secondary"} className="border-0">
              {formData.isActive ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activo
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Inactivo
                </>
              )}
            </Badge>
          </div>

          <StepProgress steps={formData.steps} />
          
          <div className="mt-6">
            <TemplatePreview 
              name={formData.name}
              description={formData.description}
              category={formData.category}
              isGlobal={formData.isGlobal}
              isActive={formData.isActive}
              steps={formData.steps}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 space-y-8">

      {error && (
        <Alert variant="destructive" className="border-0 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Settings className="w-5 h-5 mr-2 text-gray-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Template *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del template"
                  required
                  className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ventas">Ventas</SelectItem>
                    <SelectItem value="soporte">Soporte</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Instrucciones</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del template (opcional)"
                rows={3}
                className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isGlobal"
                checked={formData.isGlobal}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGlobal: checked }))}
              />
              <Label htmlFor="isGlobal">Template global (disponible para todos los clientes)</Label>
            </div>

            {!formData.isGlobal && (
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Template activo</Label>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Steps del Template
              </CardTitle>
              <Button type="button" onClick={addStep} variant="outline" size="sm" className="border-0 bg-gray-50 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {formData.steps.map((step, stepIndex) => (
              <div key={stepIndex} className="bg-gray-50 rounded-xl p-6 space-y-6 border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getIconComponent(step.icon)}
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900">Step {stepIndex + 1}</h4>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeStep(stepIndex)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-0 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Nombre del Step *</Label>
                    <Input
                      value={step.name}
                      onChange={(e) => updateStep(stepIndex, { name: e.target.value })}
                      placeholder="Nombre del step"
                      required
                      className="border-0 bg-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ícono</Label>
                    <Select value={step.icon} onValueChange={(value) => updateStep(stepIndex, { icon: value })}>
                      <SelectTrigger className="border-0 bg-white focus:ring-2 focus:ring-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="building">Empresa</SelectItem>
                        <SelectItem value="clock">Reloj</SelectItem>
                        <SelectItem value="trending-up">Tendencia</SelectItem>
                        <SelectItem value="file-text">Documento</SelectItem>
                        <SelectItem value="palette">Paleta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Orden</Label>
                    <Input
                      type="number"
                      value={step.order}
                      onChange={(e) => updateStep(stepIndex, { order: parseInt(e.target.value) })}
                      min={0}
                      className="border-0 bg-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={step.description || ""}
                    onChange={(e) => updateStep(stepIndex, { description: e.target.value })}
                    placeholder="Descripción del step (opcional)"
                    rows={2}
                    className="border-0 bg-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <Separator className="bg-gray-200" />

                {/* Campos del Step */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-900">Campos del Step</h5>
                    <Button
                      type="button"
                      onClick={() => addField(stepIndex)}
                      variant="outline"
                      size="sm"
                      className="border-0 bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Campo
                    </Button>
                  </div>

                  {step.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="bg-white rounded-lg p-6 space-y-6 border-0 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <h6 className="font-semibold text-gray-900">Campo {fieldIndex + 1}</h6>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeField(stepIndex, fieldIndex)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-0 bg-gray-50 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Nombre del Campo *</Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(stepIndex, fieldIndex, { name: e.target.value })}
                            placeholder="Nombre del campo"
                            required
                            className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Etiqueta *</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(stepIndex, fieldIndex, { label: e.target.value })}
                            placeholder="Etiqueta del campo"
                            required
                            className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label>Tipo de Campo *</Label>
                          <Select value={field.type} onValueChange={(value) => updateField(stepIndex, fieldIndex, { type: value as FieldType })}>
                            <SelectTrigger className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FieldTypeValues.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {getFieldTypeLabel(type)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Orden</Label>
                          <Input
                            type="number"
                            value={field.order}
                            onChange={(e) => updateField(stepIndex, fieldIndex, { order: parseInt(e.target.value) })}
                            min={0}
                            className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(stepIndex, fieldIndex, { required: checked })}
                          />
                          <Label>Requerido</Label>
                        </div>
                      </div>

                      {/* Opciones para campos que las necesitan */}
                      {needsOptions(field.type) && (
                        <div className="space-y-4">
                          <Label>Opciones</Label>
                          <div className="space-y-3">
                            {field.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(stepIndex, fieldIndex, optionIndex, e.target.value)}
                                  placeholder={`Opción ${optionIndex + 1}`}
                                  className="flex-1 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                                />
                                <Button
                                  type="button"
                                  onClick={() => removeOption(stepIndex, fieldIndex, optionIndex)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 border-0 bg-gray-50 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => addOption(stepIndex, fieldIndex)}
                              variant="outline"
                              size="sm"
                              className="border-0 bg-gray-50 hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Agregar Opción
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {step.fields.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-0 shadow-sm">
                      <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No hay campos configurados</p>
                      <p className="text-sm">Agrega campos para recopilar información específica</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {formData.steps.length === 0 && (
              <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border-0">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium mb-3">No hay steps configurados</h3>
                <p className="text-sm mb-6">Agrega steps para organizar los campos del template</p>
                <Button onClick={addStep} variant="outline" className="border-0 bg-white hover:bg-gray-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Step
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="border-0 bg-gray-50 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 border-0"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Creando..." : "Crear Template"}
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
} 
