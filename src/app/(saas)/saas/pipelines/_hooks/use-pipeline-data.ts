/**
 * Hook para cargar y procesar datos del pipeline
 * Maneja la carga de oportunidades, contactos y estructura del board
 */

import { useMemo } from "react"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { KanbanColumn, PipelineOpportunity, UsePipelineDataReturn } from "../_types"
import type { Opportunity } from "@/domain/Oportunidades"

export function usePipelineData(): UsePipelineDataReturn {
  const { clientId, isLoading: isClientLoading } = useClientContext()

  const { data: board, isLoading: isBoardLoading } = api.pipelines.boardData.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId && !isClientLoading }
  )

  const { data: contacts = [], isLoading: isContactsLoading } = api.contactos.listByClient.useQuery(
    { clientId: clientId!, filters: undefined },
    { enabled: !!clientId && !isClientLoading }
  )

  const isLoading = isClientLoading || isBoardLoading || isContactsLoading

  const stageColumns = useMemo((): KanbanColumn[] => {
    return (board?.pipelines ?? [])
      .flatMap((p) => p.stages.map((s) => {
        const stageOpportunities = (board?.grouped?.[s.id] ?? []) as Array<Opportunity & { stageId?: string | null; pipelineId?: string | null }>
        const totalAmount = stageOpportunities.reduce((sum, opp) => {
          const amount = Number(opp.amount) || 0
          return sum + amount
        }, 0)

        return {
          id: s.id,
          name: s.name,
          color: s.color ?? "#e5e7eb",
          pipelineName: p.name,
          order: s.order,
          totalAmount: totalAmount > 0 ? totalAmount : undefined,
        }
      }))
      .sort((a, b) => a.order - b.order)
  }, [board?.pipelines, board?.grouped])

  const typedOpportunities = useMemo((): PipelineOpportunity[] => {
    return [
      ...((board?.grouped?.unassigned ?? []) as Array<Opportunity & { stageId?: string | null; pipelineId?: string | null }>),
      ...stageColumns.flatMap(col => (board?.grouped?.[col.id] ?? []) as Array<Opportunity & { stageId?: string | null; pipelineId?: string | null }>)
    ]
  }, [board?.grouped, stageColumns])

  const opportunitiesByStage = useMemo((): Record<string, PipelineOpportunity[]> => {
    const result: Record<string, PipelineOpportunity[]> = {}
    for (const col of stageColumns) {
      result[col.id] = []
    }
    for (const o of typedOpportunities) {
      if (o.stageId && result[o.stageId]) {
        result[o.stageId].push(o)
      }
    }
    return result
  }, [typedOpportunities, stageColumns])

  const unassigned = useMemo((): PipelineOpportunity[] => {
    return typedOpportunities.filter((o) => !o.stageId)
  }, [typedOpportunities])

  return {
    board,
    contacts,
    isLoading,
    stageColumns,
    typedOpportunities,
    opportunitiesByStage,
    unassigned,
    clientId,
  }
}

