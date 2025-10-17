/**
 * Hook para manejar drag & drop en el kanban board
 * Implementa optimistic updates y manejo de errores
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import type { DropResult } from "@hello-pangea/dnd"
import type { PipelineOpportunity, UseDragAndDropReturn } from "../_types"
import { useToast } from "@/hooks/use-toast"
import { useDebouncedCallback } from "./use-debounce"

interface PendingMove {
  id: string
  opportunityId: string
  fromStageId: string | null
  toStageId: string | null
  timestamp: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

interface OptimisticState {
  unassigned: PipelineOpportunity[]
  opportunitiesByStage: Record<string, PipelineOpportunity[]>
}

export function useDragAndDrop(
  opportunities: PipelineOpportunity[],
  onMoveToStage: (opportunityId: string, toStageId: string) => void,
  originalUnassigned: PipelineOpportunity[],
  originalOpportunitiesByStage: Record<string, PipelineOpportunity[]>,
  mutationStatus?: 'idle' | 'pending' | 'success' | 'error'
): UseDragAndDropReturn {
  const { toast } = useToast()
  const [pendingMoves, setPendingMoves] = useState<PendingMove[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const processingRef = useRef(false)
  const lastProcessedMoveRef = useRef<string | null>(null)

  // Generar ID único para cada operación
  const generateMoveId = useCallback(() => {
    return `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Aplicar optimismo a los datos (mantener compatibilidad)
  const opportunitiesWithOptimism = opportunities.map(opportunity => {
    // Buscar si hay una operación pendiente para esta oportunidad
    const pendingMove = pendingMoves.find(move => move.opportunityId === opportunity.id)
    if (pendingMove) {
      return {
        ...opportunity,
        stageId: pendingMove.toStageId,
      }
    }
    return opportunity
  })

  // Procesar datos optimistas para el formato del KanbanBoard
  const processedData = useMemo(() => {
    let currentState: OptimisticState = {
      unassigned: [...originalUnassigned],
      opportunitiesByStage: { ...originalOpportunitiesByStage }
    }

    // Aplicar cada operación pendiente en orden cronológico
    pendingMoves.forEach(move => {
      const { opportunityId, fromStageId, toStageId } = move

      // Remover de la posición origen
      if (fromStageId === null) {
        currentState.unassigned = currentState.unassigned.filter(opp => opp.id !== opportunityId)
      } else {
        currentState.opportunitiesByStage[fromStageId] =
          (currentState.opportunitiesByStage[fromStageId] || [])
            .filter(opp => opp.id !== opportunityId)
      }

      // Agregar a la posición destino
      const movedOpportunity = opportunities.find(opp => opp.id === opportunityId)
      if (movedOpportunity) {
        if (toStageId === null) {
          // Verificar que no esté ya en unassigned para evitar duplicados
          const alreadyExists = currentState.unassigned.some(opp => opp.id === opportunityId)
          if (!alreadyExists) {
            currentState.unassigned = [...currentState.unassigned, { ...movedOpportunity, stageId: null }]
          }
        } else {
          // Verificar que no esté ya en la etapa destino para evitar duplicados
          const alreadyExists = (currentState.opportunitiesByStage[toStageId] || [])
            .some(opp => opp.id === opportunityId)
          if (!alreadyExists) {
            currentState.opportunitiesByStage[toStageId] = [
              ...(currentState.opportunitiesByStage[toStageId] || []),
              { ...movedOpportunity, stageId: toStageId }
            ]
          }
        }
      }
    })

    return currentState
  }, [pendingMoves, originalUnassigned, originalOpportunitiesByStage, opportunities])

  // Función interna para procesar el drag end
  const processDragEnd = useCallback((result: DropResult) => {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId) return
    if (destination.droppableId === "unassigned") return

    const opportunityId = draggableId
    const fromStageId = source.droppableId === "unassigned" ? null : source.droppableId
    const toStageId = destination.droppableId === "unassigned" ? null : destination.droppableId

    // Verificar si ya hay una operación pendiente para esta oportunidad
    const existingMove = pendingMoves.find(move => move.opportunityId === opportunityId)

    if (existingMove) {
      // Actualizar la operación existente en lugar de crear una nueva
      setPendingMoves(prev =>
        prev.map(move =>
          move.id === existingMove.id
            ? { ...move, toStageId, timestamp: Date.now() }
            : move
        )
      )
    } else {
      // Crear nueva operación pendiente
      const newMove: PendingMove = {
        id: generateMoveId(),
        opportunityId,
        fromStageId,
        toStageId,
        timestamp: Date.now(),
        status: 'pending'
      }

      setPendingMoves(prev => [...prev, newMove])
    }

    // Llamar a la mutación del servidor solo si no hay operaciones pendientes
    // para evitar múltiples llamadas simultáneas
    if (!existingMove) {
      onMoveToStage(opportunityId, destination.droppableId)
    }
  }, [onMoveToStage, pendingMoves, generateMoveId])

  // Debounced version para prevenir spam de operaciones
  const debouncedProcessDragEnd = useDebouncedCallback(processDragEnd, 150)

  const handleDragEnd = useCallback((result: DropResult) => {
    // Si hay operaciones pendientes, usar debounce para consolidar
    if (pendingMoves.length > 0) {
      debouncedProcessDragEnd(result)
    } else {
      // Si no hay operaciones pendientes, procesar inmediatamente
      processDragEnd(result)
    }
  }, [processDragEnd, debouncedProcessDragEnd, pendingMoves.length])

  // Función para limpiar el estado optimista
  const clearOptimisticMove = useCallback(() => {
    setPendingMoves([])
  }, [])

  // Función para manejar rollback automático
  const handleRollback = useCallback((failedMoveId: string) => {
    setPendingMoves(prev => {
      const failedMove = prev.find(move => move.id === failedMoveId)
      if (!failedMove) return prev

      // Remover la operación fallida
      const remainingMoves = prev.filter(move => move.id !== failedMoveId)

      // Mostrar notificación específica
      toast({
        title: "❌ Error al mover",
        description: `No se pudo mover la oportunidad. Se revirtió a la posición original.`,
        variant: "destructive"
      })

      return remainingMoves
    })
  }, [toast])

  // Limpiar estado optimista cuando la mutación se complete (exitosa o con error)
  useEffect(() => {
    if (mutationStatus === 'success') {
      // Éxito: remover la operación más reciente de la cola
      setPendingMoves(prev => {
        if (prev.length > 0) {
          const [completedMove, ...remaining] = prev

          // Mostrar notificación de éxito usando setTimeout para evitar render issues
          setTimeout(() => {
            toast({
              title: "✅ Oportunidad movida",
              description: "Se movió correctamente a la nueva etapa",
              variant: "success"
            })
          }, 0)

          return remaining
        }
        return prev
      })
    } else if (mutationStatus === 'error') {
      // Error: hacer rollback de la operación fallida
      setPendingMoves(prev => {
        if (prev.length > 0) {
          const [failedMove, ...remaining] = prev

          // Rollback automático usando setTimeout para evitar render issues
          setTimeout(() => {
            handleRollback(failedMove.id)
          }, 0)

          return remaining
        }
        return prev
      })
    }
  }, [mutationStatus, toast, handleRollback])

  return {
    opportunitiesWithOptimism,
    handleDragEnd,
    processedData,
    clearOptimisticMove,
    pendingMoves,
    hasPendingMoves: pendingMoves.length > 0,
    isProcessing
  }
}

