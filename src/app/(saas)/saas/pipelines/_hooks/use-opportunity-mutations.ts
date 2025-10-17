/**
 * Hook para mutaciones de oportunidades
 * Centraliza todas las operaciones de escritura en oportunidades
 */

import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { UseOpportunityMutationsReturn } from "../_types"

export function useOpportunityMutations(): UseOpportunityMutationsReturn {
  const { clientId } = useClientContext()
  const utils = api.useUtils()

  const invalidateBoardData = async () => {
    if (clientId) {
      await utils.pipelines.boardData.invalidate({ clientId })
    }
  }

  // Casting explícito para evitar problemas de tipo con tRPC
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const closeWon = api.oportunidades.closeAsWon.useMutation({
    onSuccess: invalidateBoardData
  }) as unknown as UseOpportunityMutationsReturn['closeWon']

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const closeLost = api.oportunidades.closeAsLost.useMutation({
    onSuccess: invalidateBoardData
  }) as unknown as UseOpportunityMutationsReturn['closeLost']

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const createOpportunity = api.oportunidades.create.useMutation({
    onSuccess: invalidateBoardData
  }) as unknown as UseOpportunityMutationsReturn['createOpportunity']

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const updateOpportunity = api.oportunidades.update.useMutation({
    onSuccess: invalidateBoardData
  }) as unknown as UseOpportunityMutationsReturn['updateOpportunity']

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const moveToStage = api.oportunidades.moveToStage.useMutation({
    onSuccess: invalidateBoardData,
    onError: () => {
      // Error handling could be enhanced here
    }
  }) as unknown as UseOpportunityMutationsReturn['moveToStage']

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    closeWon,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    closeLost,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createOpportunity,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    updateOpportunity,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    moveToStage,
    invalidateBoardData,
  }
}

