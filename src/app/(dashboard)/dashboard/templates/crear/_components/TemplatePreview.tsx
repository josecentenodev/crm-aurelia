"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User,
  Building2,
  Clock,
  TrendingUp,
  FileText,
  Palette,
  Eye,
  Settings
} from "lucide-react"
import { type FieldType } from "@/domain"

interface TemplatePreviewProps {
  name: string
  description: string
  category: string
  isGlobal: boolean
  isActive: boolean
  steps: Array<{
    name: string
    description?: string
    icon: string
    order: number
    fields: Array<{
      name: string
      label: string
      type: FieldType
      required: boolean
      options: string[]
    }>
  }>
}

export function TemplatePreview({ 
  name, 
  description, 
  category, 
  isGlobal, 
  isActive, 
  steps 
}: TemplatePreviewProps) {
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

  const getFieldTypeLabel = (type: FieldType) => {
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

  const getFieldTypeColor = (type: FieldType) => {
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

  const totalFields = steps.reduce((total, step) => total + step.fields.length, 0)
  const requiredFields = steps.reduce((total, step) => 
    total + step.fields.filter(f => f.required).length, 0
  )

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Eye className="w-5 h-5 mr-2 text-gray-600" />
          Vista Previa del Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-xl text-gray-900">{name || "Nombre del Template"}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-2">{description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={isGlobal ? "default" : "secondary"} className="border-0">
              {isGlobal ? "Global" : "Local"}
            </Badge>
            <Badge variant={isActive ? "default" : "secondary"} className="border-0">
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
            {category && (
              <Badge variant="outline" className="border-0 bg-gray-100">{category}</Badge>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{steps.length}</div>
            <div className="text-xs text-gray-500">Steps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalFields}</div>
            <div className="text-xs text-gray-500">Campos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{requiredFields}</div>
            <div className="text-xs text-gray-500">Requeridos</div>
          </div>
        </div>

        {/* Steps */}
        {steps.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Steps Configurados</h4>
            {steps.map((step, stepIndex) => (
              <div key={stepIndex} className="bg-gray-50 rounded-lg p-4 space-y-3 border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getIconComponent(step.icon)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{step.name || `Step ${stepIndex + 1}`}</h5>
                    {step.description && (
                      <p className="text-xs text-gray-500">{step.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs border-0 bg-white">
                    {step.fields.length} campos
                  </Badge>
                </div>
                
                {step.fields.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {step.fields.slice(0, 3).map((field, fieldIndex) => (
                      <Badge key={fieldIndex} variant="outline" className="text-xs border-0 bg-white">
                        <span className="mr-1">{field.name}</span>
                        <span className={`px-1 py-0.5 rounded text-xs ${getFieldTypeColor(field.type)}`}>
                          {getFieldTypeLabel(field.type)}
                        </span>
                        {field.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </Badge>
                    ))}
                    {step.fields.length > 3 && (
                      <Badge variant="outline" className="text-xs border-0 bg-white">
                        +{step.fields.length - 3} más
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Settings className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium">No hay steps configurados</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 