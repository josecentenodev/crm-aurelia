"use client"
import { CheckCircle, Circle } from "lucide-react"
import { useAgentCreationStore } from "@/store/agent-creation-store"

export function StepProgress() {
  const { 
    selectedTemplate, 
    currentStep, 
    totalSteps,
    getStepProgress 
  } = useAgentCreationStore()

  if (!selectedTemplate) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            {
              name: "Configuración Básica",
              description: "Nombre y estado del agente"
            },
            {
              name: "Seleccionar Template",
              description: "Elige el template base"
            }
          ].map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isUpcoming = index > currentStep

            return (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? "bg-violet-600 text-white" 
                      : isCurrent 
                      ? "bg-violet-100 text-violet-600 border-2 border-violet-600" 
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {step.name}
                    </div>
                    {step.description && (
                      <div className="text-xs text-gray-500 mt-1 max-w-24">
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
                {index < 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? "bg-violet-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Crear steps dinámicos: configuración básica + selección de template + steps del template + confirmación
  const dynamicSteps = [
    {
      name: "Configuración Básica",
      description: "Nombre y estado del agente"
    },
    {
      name: "Seleccionar Template",
      description: "Elige el template base"
    },
    ...selectedTemplate.steps.map(step => ({
      name: step.name,
      description: step.description || undefined
    })),
    {
      name: "Confirmar",
      description: "Revisa y crea el agente"
    }
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {dynamicSteps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? "bg-violet-600 text-white" 
                    : isCurrent 
                    ? "bg-violet-100 text-violet-600 border-2 border-violet-600" 
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                  }`}>
                    {step.name}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1 max-w-24">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < dynamicSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  isCompleted ? "bg-violet-600" : "bg-gray-200"
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 