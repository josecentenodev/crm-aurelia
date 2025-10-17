"use client"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useAgentCreationStore } from "@/store/agent-creation-store"

interface TemplateConfirmStepProps {
  onSubmit: () => void
  loading: boolean
}

export function TemplateConfirmStep({ onSubmit, loading }: TemplateConfirmStepProps) {
  const { 
    selectedTemplate, 
    formValues, 
    isFormValid, 
    getMissingRequiredFields 
  } = useAgentCreationStore()

  if (!selectedTemplate) {
    return (
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>No hay template seleccionado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Función para generar un identificador único para cada campo
  const getFieldKey = (stepId: string, fieldName: string) => {
    return `${stepId}_${fieldName}`
  }

  const missingRequired = getMissingRequiredFields()
  const isValid = isFormValid()

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl">Confirmar configuración</CardTitle>
        <p className="text-gray-600">
          Revisa la configuración de tu agente antes de crearlo
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Template seleccionado</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">{selectedTemplate.name}</span>
            <Badge variant="outline">{selectedTemplate.steps.length} steps</Badge>
          </div>
          {selectedTemplate.description && (
            <p className="text-sm text-gray-600 mt-1">{selectedTemplate.description}</p>
          )}
        </div>

        {/* Validation Status */}
        {missingRequired.length > 0 ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Campos requeridos faltantes</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {missingRequired.map((fieldLabel, index) => (
                <li key={index}>• {fieldLabel}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Configuración completa</span>
            </div>
          </div>
        )}

        {/* Steps Summary */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Resumen de configuración</h3>
          {selectedTemplate.steps.map((step, stepIndex) => (
            <div key={step.id} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {stepIndex + 1}. {step.name}
              </h4>
              {step.description && (
                <p className="text-sm text-gray-600 mb-3">{step.description}</p>
              )}
              <div className="space-y-2">
                {step.fields.map((field) => {
                  const fieldKey = getFieldKey(step.id, field.name)
                  const value = formValues[fieldKey]
                  if (!value) return null
                  
                  return (
                    <div key={field.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{field.label}:</span>
                      <span className="font-medium text-gray-900">
                        {typeof value === 'string' && value.length > 50 
                          ? `${value.substring(0, 50)}...` 
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
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={onSubmit} 
          disabled={loading || !isValid} 
          className="bg-violet-600 hover:bg-violet-700"
        >
          {loading ? "Creando..." : "Crear Agente"}
        </Button>
      </CardFooter>
    </Card>
  )
} 