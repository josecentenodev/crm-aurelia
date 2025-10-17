import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui"
import { Bot, CheckCircle, Globe } from "lucide-react"
import { type AgentTemplate } from "@/domain/Agentes"

export interface Step1SeleccionTemplateProps {
  templates: AgentTemplate[]
  selected: AgentTemplate | null
  setSelected: (tpl: AgentTemplate) => void
}

export function Step1SeleccionTemplate({ templates, selected, setSelected }: Step1SeleccionTemplateProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-violet-600" />
          Selecciona un template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay templates disponibles.</p>
          </div>
        )}
        <div className="grid gap-4">
          {templates.map((tpl) => {
            const isSelected = selected?.id === tpl.id
            return (
              <Button
                key={tpl.id}
                variant="outline"
                className={`h-auto p-6 justify-start text-left transition-all duration-200 ${
                  isSelected 
                    ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" 
                    : "hover:border-violet-200 hover:bg-violet-50/50"
                }`}
                onClick={() => setSelected(tpl)}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-violet-100' : 'bg-gray-100'
                  }`}>
                    {tpl.isGlobal ? (
                      <Globe className={`w-6 h-6 ${isSelected ? 'text-violet-600' : 'text-gray-500'}`} />
                    ) : (
                      <Bot className={`w-6 h-6 ${isSelected ? 'text-violet-600' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold text-base ${isSelected ? 'text-violet-900' : 'text-gray-900'}`}>
                        {tpl.name}
                      </h3>
                      {isSelected && (
                        <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Seleccionado
                        </Badge>
                      )}
                      {tpl.isGlobal && (
                        <Badge variant="outline" className="text-xs">
                          Global
                        </Badge>
                      )}
                    </div>
                    {tpl.description && (
                      <p className="text-sm text-gray-600 mb-2">{tpl.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{tpl.steps?.length || 0} pasos</span>
                      <span>{tpl.steps?.reduce((total, step) => total + (step.fields?.length || 0), 0) || 0} campos</span>
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 
