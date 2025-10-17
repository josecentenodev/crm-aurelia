import { useMemo } from "react"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { PipelineData, StageCreateFormData } from "../types"

export function usePipelinesData() {
  const { clientId, isLoading: isClientLoading } = useClientContext()

  const { data: pipelines = [], isLoading: isPipelinesLoading, refetch } = api.pipelines.listByClient.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId && !isClientLoading }
  )

  const isLoading = isClientLoading || isPipelinesLoading

  const defaultPipeline = useMemo((): PipelineData | undefined => {
    return pipelines.find(pipeline => pipeline.isDefault)
  }, [pipelines])

  const pipelinesWithStages = useMemo(() => {
    return pipelines.map(pipeline => ({
      ...pipeline,
      stagesCount: pipeline.stages.length,
      hasStages: pipeline.stages.length > 0
    }))
  }, [pipelines])

  const pipelinesByDefault = useMemo(() => {
    const defaultPipelines = pipelines.filter(p => p.isDefault)
    const nonDefaultPipelines = pipelines.filter(p => !p.isDefault)
    
    return {
      default: defaultPipelines,
      nonDefault: nonDefaultPipelines
    }
  }, [pipelines])

  const totalStages = useMemo(() => {
    return pipelines.reduce((total, pipeline) => total + pipeline.stages.length, 0)
  }, [pipelines])

  const wonStages = useMemo(() => {
    return pipelines.flatMap(pipeline => 
      pipeline.stages.filter(stage => stage.isWon)
    )
  }, [pipelines])

  const lostStages = useMemo(() => {
    return pipelines.flatMap(pipeline => 
      pipeline.stages.filter(stage => stage.isLost)
    )
  }, [pipelines])

  const stagesWithSLA = useMemo(() => {
    return pipelines.flatMap(pipeline => 
      pipeline.stages.filter(stage => stage.slaMinutes && stage.slaMinutes > 0)
    )
  }, [pipelines])

  const getPipelineById = (id: string) => {
    return pipelines.find(pipeline => pipeline.id === id)
  }

  const getStageById = (stageId: string) => {
    for (const pipeline of pipelines) {
      const stage = pipeline.stages.find(s => s.id === stageId)
      if (stage) return { pipeline, stage }
    }
    return null
  }

  return {
    pipelines,
    defaultPipeline,
    pipelinesWithStages,
    pipelinesByDefault,
    totalStages,
    wonStages,
    lostStages,
    stagesWithSLA,
    isLoading,
    clientId,
    getPipelineById,
    getStageById,
    refetch
  }
}
