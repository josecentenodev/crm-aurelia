"use client"
import { useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { DynamicField } from "../../_components/DynamicField"
import type { AgentField } from "@/domain/Agentes"
import { useAgentCreationStore } from "@/store/agent-creation-store"

export function TemplateStepRenderer() {
  const { 
    selectedTemplate, 
    currentStep, 
    formValues,
    setFormValue 
  } = useAgentCreationStore()

  // Debug logs
  useEffect(() => {
    console.log('TemplateStepRenderer Debug:', {
      selectedTemplate: selectedTemplate?.name,
      currentStep,
      stepsLength: selectedTemplate?.steps?.length,
      currentTemplateStepIndex: currentStep - 1,
      currentTemplateStep: selectedTemplate?.steps?.[currentStep - 1]
    })
  }, [selectedTemplate, currentStep])

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

  // Calcular el step actual del template (restando 2 porque step 0 es config básica y step 1 es selección de template)
  const currentTemplateStepIndex = currentStep - 2
  const currentTemplateStep = selectedTemplate.steps[currentTemplateStepIndex]
  
  if (!currentTemplateStep) {
    return (
      <Card className="rounded-xl">
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
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl">{currentTemplateStep.name}</CardTitle>
        {currentTemplateStep.description && (
          <p className="text-gray-600">{currentTemplateStep.description}</p>
        )}
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
              setValue={(value) => setFieldValue(field, value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 