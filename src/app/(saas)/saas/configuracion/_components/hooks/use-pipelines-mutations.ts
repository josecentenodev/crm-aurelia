import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import type { PipelineCreateFormData, StageCreateFormData } from "../types"

export function usePipelinesMutations() {
  const { clientId } = useClientContext()
  const { toast } = useToast()
  const utils = api.useUtils()

  const invalidatePipelines = async () => {
    if (clientId) {
      await utils.pipelines.listByClient.invalidate({ clientId })
    }
  }

  // Crear pipeline
  const createPipeline = api.pipelines.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Pipeline creado",
        description: "Se creó correctamente."
      })
      invalidatePipelines()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Actualizar pipeline
  const updatePipeline = api.pipelines.update.useMutation({
    onSuccess: () => {
      invalidatePipelines()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Eliminar pipeline
  const deletePipeline = api.pipelines.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Pipeline eliminado"
      })
      invalidatePipelines()
    },
    onError: (error) => {
      toast({
        title: "No se puede eliminar",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Crear etapa
  const createStage = api.pipelines.createStage.useMutation({
    onSuccess: () => {
      toast({
        title: "Etapa creada"
      })
      invalidatePipelines()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Actualizar etapa
  const updateStage = api.pipelines.updateStage.useMutation({
    onSuccess: () => {
      invalidatePipelines()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Eliminar etapa
  const deleteStage = api.pipelines.deleteStage.useMutation({
    onSuccess: () => {
      toast({
        title: "Etapa eliminada"
      })
      invalidatePipelines()
    },
    onError: (error) => {
      toast({
        title: "No se puede eliminar",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Reordenar etapas
  const reorderStages = api.pipelines.reorderStages.useMutation({
    onError: (error) => {
      toast({
        title: "No se pudo reordenar",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Handlers
  const handleCreatePipeline = async (data: PipelineCreateFormData) => {
    if (!clientId || !data.name.trim()) return

    await createPipeline.mutateAsync({
      clientId,
      name: data.name.trim(),
      description: data.description || undefined,
      isDefault: data.isDefault
    })
  }

  const handleUpdatePipeline = async (id: string, updates: Partial<PipelineCreateFormData>) => {
    if (!clientId) return

    await updatePipeline.mutateAsync({
      id,
      clientId,
      ...updates
    })
  }

  const handleDeletePipeline = async (id: string) => {
    if (!clientId) return

    await deletePipeline.mutateAsync({
      id,
      clientId
    })
  }

  const handleCreateStage = async (pipelineId: string, data: StageCreateFormData) => {
    if (!data.name?.trim()) return

    await createStage.mutateAsync({
      pipelineId,
      name: data.name.trim(),
      color: data.color ?? undefined,
      slaMinutes: data.slaMinutes === "" ? undefined : Number(data.slaMinutes),
      isWon: data.isWon,
      isLost: data.isLost
    })
  }

  const handleUpdateStage = async (args: {
    id: string
    name?: string
    color?: string
    slaMinutes?: number | undefined
    isWon?: boolean
    isLost?: boolean
  }) => {
    await updateStage.mutateAsync(args)
  }

  const handleDeleteStage = async (stageId: string) => {
    await deleteStage.mutateAsync({ id: stageId })
  }

  const handleReorderStages = async (pipelineId: string, order: Array<{ id: string; order: number }>) => {
    await reorderStages.mutateAsync({ pipelineId, order })
  }

  const handleSetDefaultPipeline = async (pipelineId: string, isDefault: boolean) => {
    if (!clientId) return

    await updatePipeline.mutateAsync({
      id: pipelineId,
      clientId,
      isDefault
    })
  }

  return {
    createPipeline: {
      mutate: handleCreatePipeline,
      isLoading: createPipeline.isLoading,
      status: createPipeline.status
    },
    updatePipeline: {
      mutate: handleUpdatePipeline,
      isLoading: updatePipeline.isLoading,
      status: updatePipeline.status
    },
    deletePipeline: {
      mutate: handleDeletePipeline,
      isLoading: deletePipeline.isLoading,
      status: deletePipeline.status
    },
    createStage: {
      mutate: handleCreateStage,
      isLoading: createStage.isLoading,
      status: createStage.status
    },
    updateStage: {
      mutate: handleUpdateStage,
      isLoading: updateStage.isLoading,
      status: updateStage.status
    },
    deleteStage: {
      mutate: handleDeleteStage,
      isLoading: deleteStage.isLoading,
      status: deleteStage.status
    },
    reorderStages: {
      mutate: handleReorderStages,
      isLoading: reorderStages.isLoading,
      status: reorderStages.status
    },
    setDefaultPipeline: {
      mutate: handleSetDefaultPipeline,
      isLoading: updatePipeline.isLoading,
      status: updatePipeline.status
    },
    invalidatePipelines
  }
}
