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
  Circle
} from "lucide-react"

interface StepProgressProps {
  steps: Array<{
    name: string
    description?: string
    icon: string
    order: number
    fields: Array<{
      name: string
      label: string
      type: string
      required: boolean
    }>
  }>
  currentStep?: number
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
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

  if (steps.length === 0) {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium mb-1">No hay steps configurados</p>
            <p className="text-xs">Agrega steps para organizar los campos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Steps del Template</h4>
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6">
                {currentStep === index ? (
                  <Circle className="w-5 h-5 text-purple-500 fill-current" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  {getIconComponent(step.icon)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{step.name || `Step ${index + 1}`}</p>
                  <p className="text-xs text-gray-500">
                    {step.fields.length} campos
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-0 bg-gray-100">
                {step.fields.filter(f => f.required).length} requeridos
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 