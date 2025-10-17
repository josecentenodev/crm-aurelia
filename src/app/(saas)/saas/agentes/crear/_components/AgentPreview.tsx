"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Settings, MessageSquare } from "lucide-react"
import { useAgentCreationStore } from "@/store/agent-creation-store"

interface AgentPreviewProps {
  agentName?: string
  isActive?: boolean
  isPrincipal?: boolean
}

export function AgentPreview({ agentName, isActive = true, isPrincipal = false }: AgentPreviewProps) {
  const { 
    selectedTemplate, 
    formValues,
    getOverallProgress 
  } = useAgentCreationStore()

  // Función para generar un identificador único para cada campo
  const getFieldKey = (stepId: string, fieldName: string) => {
    return `${stepId}_${fieldName}`
  }

  // Usar el nombre proporcionado o generar uno por defecto
  const displayName = agentName || (selectedTemplate 
    ? `${selectedTemplate.name} - Nuevo agente`
    : "Nuevo agente")

  if (!selectedTemplate) {
    return (
      <Card className="rounded-xl border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Vista previa del agente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Selecciona un template para ver la vista previa</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">Vista previa del agente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header del agente */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            <p className="text-sm text-gray-600">Basado en: {selectedTemplate.name}</p>
          </div>
          <Badge variant="default">Nuevo</Badge>
        </div>

        {/* Configuración */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                {isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Principal:</span>
              <Badge variant={isPrincipal ? "default" : "outline"} className="text-xs">
                {isPrincipal ? "Sí" : "No"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Campos configurados */}
        {Object.keys(formValues).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span>Campos configurados</span>
            </div>
            <div className="space-y-2">
              {selectedTemplate.steps.map((step) => (
                <div key={step.id} className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-700">{step.name}</h4>
                  <div className="space-y-1">
                    {step.fields.map((field) => {
                      const fieldKey = getFieldKey(step.id, field.name)
                      const value = formValues[fieldKey]
                      if (!value) return null
                      
                      return (
                        <div key={field.id} className="flex justify-between text-xs">
                          <span className="text-gray-500">{field.label}:</span>
                          <span className="text-gray-700 font-medium">
                            {typeof value === 'string' && value.length > 30 
                              ? `${value.substring(0, 30)}...` 
                              : String(value)
                            }
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}