"use client"
import { CheckCircle, Circle } from "lucide-react"
import { useAgentEditionStore } from "@/store/agent-edition-store"

export function StepProgress() {
  const { 
    template, 
    currentStep, 
    totalSteps,
    getStepProgress 
  } = useAgentEditionStore()

  if (!template) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Circle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <div className="text-sm font-medium">Cargando configuración...</div>
            <div className="text-xs text-gray-400">para ver los pasos</div>
          </div>
        </div>
      </div>
    )
  }

  // Crear steps dinámicos basados en el template
  const dynamicSteps = template.steps.map(step => ({
    name: step.name,
    description: step.description || undefined
  }))

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {dynamicSteps.map((step, index) => {
          const stepProgress = getStepProgress().find(p => p.stepId === template.steps[index].id)
          const isCompleted = stepProgress?.percentage === 100
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                  isCompleted 
                    ? "bg-violet-600 text-white border-violet-600 shadow-lg" 
                    : isCurrent 
                    ? "bg-violet-100 text-violet-600 border-violet-600 shadow-md" 
                    : "bg-white text-gray-400 border-gray-300"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium transition-colors duration-200 ${
                    isCompleted 
                      ? "text-violet-700" 
                      : isCurrent 
                      ? "text-violet-600" 
                      : "text-gray-500"
                  }`}>
                    {step.name}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1 max-w-32 leading-tight">
                      {step.description}
                    </div>
                  )}
                  {stepProgress && (
                    <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                      isCompleted 
                        ? "bg-violet-100 text-violet-700" 
                        : isCurrent 
                        ? "bg-violet-50 text-violet-600" 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {stepProgress.completedFields}/{stepProgress.totalFields}
                    </div>
                  )}
                </div>
              </div>
              {index < dynamicSteps.length - 1 && (
                <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? "bg-violet-600" 
                    : isCurrent 
                    ? "bg-gradient-to-r from-violet-600 to-gray-200" 
                    : "bg-gray-200"
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 