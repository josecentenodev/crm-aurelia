"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User,
  Building2,
  Clock,
  TrendingUp,
  FileText,
  Palette,
  CheckCircle,
  Circle,
  Bot
} from "lucide-react"
import type { Agent, AgentTemplate, AgentField } from "@/domain/Agentes"

interface AgentProgressProps {
  agent: Agent
  template?: AgentTemplate | null
  customFields: Record<string, unknown>
}

export function AgentProgress({ agent, template, customFields }: AgentProgressProps) {
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

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case "TEXT": return "Texto"
      case "TEXTAREA": return "Área"
      case "NUMBER": return "Número"
      case "EMAIL": return "Email"
      case "SELECT": return "Selección"
      case "MULTISELECT": return "Múltiple"
      case "CHECKBOX": return "Checkbox"
      case "RADIO": return "Radio"
      case "DATE": return "Fecha"
      case "JSON": return "JSON"
      default: return type
    }
  }

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case "TEXT":
      case "TEXTAREA":
        return "bg-blue-100 text-blue-800"
      case "NUMBER":
        return "bg-green-100 text-green-800"
      case "EMAIL":
        return "bg-purple-100 text-purple-800"
      case "SELECT":
      case "MULTISELECT":
        return "bg-orange-100 text-orange-800"
      case "CHECKBOX":
      case "RADIO":
        return "bg-pink-100 text-pink-800"
      case "DATE":
        return "bg-indigo-100 text-indigo-800"
      case "JSON":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para verificar si un campo está completado usando el mapeo correcto
  const isFieldCompleted = (fieldName: string, required: boolean, stepId: string) => {
    if (!required) return true
    
    // Buscar el valor en customFields usando el mapeo stepId_fieldName
    const fieldKey = `${stepId}_${fieldName}`
    const value = customFields[fieldKey]
    
    // Si no se encuentra con el mapeo, buscar directamente por nombre (fallback)
    const directValue = customFields[fieldName]
    const finalValue = value !== undefined ? value : directValue
    
    return finalValue !== undefined && finalValue !== null && finalValue !== ""
  }

  const getStepProgress = (step: { id: string; fields?: AgentField[] }) => {
    if (!step.fields || step.fields.length === 0) return { completed: 0, total: 0, percentage: 0 }
    
    const requiredFields = step.fields.filter((field: AgentField) => field.required)
    const completedFields = requiredFields.filter((field: AgentField) => 
      isFieldCompleted(field.name, field.required, step.id)
    )
    
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: requiredFields.length > 0 ? (completedFields.length / requiredFields.length) * 100 : 100
    }
  }

  if (!template?.steps || template.steps.length === 0) {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium mb-1">Sin configuración</p>
            <p className="text-xs">El template no tiene steps configurados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalSteps = template.steps.length
  const completedSteps = template.steps.filter(step => {
    const progress = getStepProgress(step)
    return progress.percentage === 100
  }).length

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Progreso del Agente</h4>
            <Badge variant="outline" className="border-0 bg-gray-100">
              {completedSteps}/{totalSteps} completados
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {template.steps.map((step, index) => {
              const progress = getStepProgress(step)
              const isCompleted = progress.percentage === 100
              
              return (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getIconComponent(step.icon)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{step.name || `Step ${index + 1}`}</p>
                      <p className="text-xs text-gray-500">
                        {progress.completed}/{progress.total} campos requeridos
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-0 bg-gray-100">
                    {Math.round(progress.percentage)}%
                  </Badge>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{template.steps.length}</div>
                <div className="text-xs text-gray-500">Steps</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {template.steps.reduce((total, step) => total + step.fields.length, 0)}
                </div>
                <div className="text-xs text-gray-500">Campos</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 