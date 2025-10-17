import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge, Separator } from "@/components/ui"
import { CheckCircle, Bot, Settings, ArrowRight } from "lucide-react"
import type { AgentTemplate } from "@/domain/Agentes"
import type { AgentFormValues } from "./Step2CamposDinamicos"

export interface Step3ConfirmProps {
  template: AgentTemplate
  values: AgentFormValues
  onSubmit: () => void
  loading: boolean
}

export function Step3Confirm({ template, values, onSubmit, loading }: Step3ConfirmProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Confirmar creación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Info */}
        <div className="flex items-center gap-4 p-4 bg-violet-50 rounded-lg">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            {template.description && (
              <p className="text-sm text-gray-600">{template.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {template.steps?.length || 0} pasos
              </Badge>
              {template.isGlobal && (
                <Badge variant="secondary" className="text-xs">
                  Template Global
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Steps and Fields */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            Configuración del agente
          </h4>
          
          {template.steps?.map((step, stepIndex) => (
            <div key={step.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-violet-700">{stepIndex + 1}</span>
                </div>
                <h5 className="font-medium text-gray-900">{step.name}</h5>
                {step.description && (
                  <span className="text-sm text-gray-500">- {step.description}</span>
                )}
              </div>
              
              {step.fields && step.fields.length > 0 && (
                <div className="ml-9 space-y-2">
                  {step.fields.map((field) => {
                    const value = values[field.name]
                    return (
                      <div key={field.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                        <span className="text-sm font-medium text-gray-700">{field.label}</span>
                        <span className="text-sm text-gray-600">
                          {value !== undefined && value !== null && value !== "" 
                            ? (Array.isArray(value) ? value.join(", ") : String(value))
                            : "No configurado"
                          }
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
              
              {stepIndex < (template.steps?.length || 0) - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end pt-6">
        <Button 
          onClick={onSubmit} 
          disabled={loading} 
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creando agente...
            </>
          ) : (
            <>
              Crear Agente
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 