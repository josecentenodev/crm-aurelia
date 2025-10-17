"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { DynamicField } from "../../../_components/DynamicField"
import type { AgentField } from "@/domain/Agentes"
import { useAgentEditionStore } from "@/store/agent-edition-store"

export function StepRenderer() {
  const { 
    template, 
    currentStep, 
    formValues,
    setFormValue 
  } = useAgentEditionStore()

  if (!template) {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>No hay template cargado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentTemplateStep = template.steps[currentStep]
  
  if (!currentTemplateStep) {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>Step no encontrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Función para obtener el valor de un campo usando el identificador único
  const getFieldValue = (field: AgentField) => {
    const fieldKey = `${currentTemplateStep.id}_${field.name}`
    return formValues[fieldKey]
  }

  // Función para actualizar el valor de un campo usando el identificador único
  const setFieldValue = (field: AgentField, value: string | number | boolean | string[]) => {
    setFormValue(currentTemplateStep.id, field.name, value)
  }

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                {currentStep + 1}
              </span>
              {currentTemplateStep.name}
            </CardTitle>
            {currentTemplateStep.description && (
              <p className="text-gray-600 mt-2">{currentTemplateStep.description}</p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Paso {currentStep + 1} de {template.steps.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentTemplateStep.fields.map((field: AgentField) => (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <DynamicField
              field={field}
              value={getFieldValue(field)}
              setValue={(value: string | number | boolean | string[]) => setFieldValue(field, value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 