"use client"
import { Progress } from "@/components/ui/progress"
import { useAgentCreationStore } from "@/store/agent-creation-store"

export function ProgressIndicator() {
  const { getOverallProgress, getCompletedFieldsCount, getTotalFieldsCount } = useAgentCreationStore()
  
  const overallProgress = getOverallProgress()
  const completedFields = getCompletedFieldsCount()
  const totalFields = getTotalFieldsCount()

  if (totalFields === 0) {
    return null
  }

  return (
    <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Progreso general</span>
          <span className="text-xs text-gray-500">
            {completedFields} de {totalFields} campos completados
          </span>
        </div>
        <span className="text-sm font-semibold text-violet-600">
          {overallProgress}%
        </span>
      </div>
      <Progress 
        value={overallProgress} 
        className="h-2"
      />
    </div>
  )
} 