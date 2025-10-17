"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAgentCreationStore } from "@/store/agent-creation-store"

export function StepNavigation() {
  const { 
    currentStep, 
    totalSteps,
    setCurrentStep,
    canNavigateToStep
  } = useAgentCreationStore()

  const canGoPrevious = currentStep > 2 // No permitir ir antes del primer step del template
  const canGoNext = currentStep < totalSteps - 1

  return (
    <div className="flex items-center gap-4">
      <div>
        {canGoPrevious && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="rounded-xl border-gray-300 bg-white hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Paso</span>
        <span className="font-semibold text-violet-600">{currentStep - 1}</span>
        <span className="text-gray-600">de</span>
        <span className="font-semibold text-gray-900">{totalSteps - 2}</span>
      </div>
      
      <div>
        {canGoNext && (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="bg-violet-600 hover:bg-violet-700 rounded-xl"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}