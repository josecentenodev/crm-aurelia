import { Card, CardHeader, CardTitle, CardContent, Label, Separator, Badge } from "@/components/ui"
import { Settings, AlertCircle } from "lucide-react"
import type { AgentTemplate, AgentField } from "@/domain/Agentes"
import { DynamicField } from "./DynamicField"

export type AgentFormValues = Record<string, string | number | boolean | string[] | undefined>

export interface Step2CamposDinamicosProps {
  template: AgentTemplate
  values: AgentFormValues
  setValues: (updater: (prev: AgentFormValues) => AgentFormValues) => void
}

export function Step2CamposDinamicos({ template, values, setValues }: Step2CamposDinamicosProps) {
  // Verificar que el template tenga steps válidos
  if (!template.steps || template.steps.length === 0) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            Error: Template sin configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Este template no tiene pasos configurados.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-600" />
          Completa los campos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {template.steps.map((step, stepIndex) => (
          <div key={step.id} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-violet-700">{stepIndex + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                {step.description && (
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {step.fields?.length || 0} campos
              </Badge>
            </div>
            
            {step.fields && step.fields.length > 0 ? (
              <div className="space-y-4 pl-11">
                {step.fields.map((field: AgentField) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {field.label} 
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <DynamicField
                      field={field}
                      value={values[field.name]}
                      setValue={v => setValues(prev => ({ ...prev, [field.name]: v }))}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="pl-11">
                <p className="text-gray-500 text-sm italic">No hay campos configurados para este paso.</p>
              </div>
            )}
            
            {stepIndex < template.steps.length - 1 && (
              <Separator className="my-6" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 