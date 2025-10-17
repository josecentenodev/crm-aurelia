/**
 * Hook para calcular totales del kanban board
 * Calcula totales por columna y total general
 */

import { useMemo } from "react"
import type { PipelineOpportunity, KanbanColumn, UseKanbanTotalsReturn } from "../_types"

export function useKanbanTotals(
  unassigned: PipelineOpportunity[],
  columns: KanbanColumn[]
): UseKanbanTotalsReturn {
  return useMemo(() => {
    // Calcular total de montos para oportunidades sin etapa
    const unassignedTotal = unassigned.reduce((sum, opp) => {
      const amount = Number(opp.amount) || 0
      return sum + amount
    }, 0)

    // Calcular total general de todas las oportunidades
    const totalGeneral = unassignedTotal + columns.reduce((sum, col) => sum + (Number(col.totalAmount) || 0), 0)

    return {
      unassignedTotal,
      totalGeneral,
      hasUnassignedTotal: unassignedTotal > 0,
      hasTotalGeneral: totalGeneral > 0,
    }
  }, [unassigned, columns])
}

