"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Layers, Plus } from "lucide-react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { usePipelinesData } from "../hooks/use-pipelines-data"
import { usePipelinesMutations } from "../hooks/use-pipelines-mutations"
import { PipelineCreateForm } from "../forms/pipeline-create-form"
import { StageCreateForm } from "../forms/stage-create-form"
import type { PipelineCreateFormData, StageCreateFormData } from "../types"

export function PipelinesTab() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null)
  const [newStageByPipeline, setNewStageByPipeline] = useState<Record<string, StageCreateFormData>>({})

  const pipelinesData = usePipelinesData()
  const mutations = usePipelinesMutations()

  const handleCreatePipeline = async (data: PipelineCreateFormData) => {
    await mutations.createPipeline.mutate(data)
    setShowCreateForm(false)
  }

  const handleCancelCreate = () => {
    setShowCreateForm(false)
  }

  const handleCreateStage = async (pipelineId: string) => {
    const stageData = newStageByPipeline[pipelineId]
    if (!stageData?.name?.trim()) return

    await mutations.createStage.mutate(pipelineId, stageData)
    setNewStageByPipeline(prev => ({ 
      ...prev, 
      [pipelineId]: { name: "", color: "#e5e7eb", slaMinutes: "", isWon: false, isLost: false } 
    }))
  }

  const handleUpdateStage = async (args: {
    id: string
    name?: string
    color?: string
    slaMinutes?: number | undefined
    isWon?: boolean
    isLost?: boolean
  }) => {
    await mutations.updateStage.mutate(args)
  }

  const handleDeletePipeline = async (pipelineId: string) => {
    await mutations.deletePipeline.mutate(pipelineId)
  }

  const handleDeleteStage = async (stageId: string) => {
    await mutations.deleteStage.mutate(stageId)
  }

  const handleSetDefaultPipeline = async (pipelineId: string, isDefault: boolean) => {
    await mutations.setDefaultPipeline.mutate(pipelineId, isDefault)
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result
    if (!destination) return
    if (destination.droppableId !== source.droppableId) return
    if (destination.index === source.index) return

    const pipeline = pipelinesData.pipelines.find((p) => p.id === source.droppableId)
    if (!pipeline) return

    const reordered = Array.from(pipeline.stages)
    const [moved] = reordered.splice(source.index, 1)
    if (!moved) return
    reordered.splice(destination.index, 0, moved)

    // Recalcular orden secuencial empezando en 0
    const order = reordered.map((s, idx) => ({ id: s.id, order: idx }))
    await mutations.reorderStages.mutate(pipeline.id, order)
  }

  if (!pipelinesData.clientId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente no seleccionado</h3>
          <p className="text-gray-500 text-center">
            Selecciona un cliente para ver sus pipelines
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pipelines</h2>
          <p className="text-gray-600">Gestiona los pipelines de ventas y sus etapas</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pipeline
        </Button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <PipelineCreateForm
          onSubmit={handleCreatePipeline}
          onCancel={handleCancelCreate}
          isLoading={mutations.createPipeline.isLoading}
        />
      )}

      {/* Lista de pipelines */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {pipelinesData.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pipelinesData.pipelines.length === 0 ? (
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pipelines</h3>
              <p className="text-gray-500 text-center mb-4">
                Aún no tienes pipelines. Crea uno para comenzar a organizar tus oportunidades.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Pipeline
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pipelinesData.pipelines.map((pipeline) => {
              const isExpanded = expandedPipeline === pipeline.id
              const newStage = newStageByPipeline[pipeline.id] ?? { 
                name: "", 
                color: "#e5e7eb", 
                slaMinutes: "", 
                isWon: false, 
                isLost: false 
              }

              return (
                <Card key={pipeline.id} className="rounded-2xl shadow-sm border-0 bg-white">
                  <div className="p-6">
                    {/* Pipeline Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{pipeline.name}</h3>
                          {pipeline.description && (
                            <p className="text-sm text-gray-600">{pipeline.description}</p>
                          )}
                        </div>
                        {pipeline.isDefault && (
                          <span className="px-2 py-1 bg-violet-100 text-violet-800 text-xs rounded-full">
                            Predeterminado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedPipeline(isExpanded ? null : pipeline.id)}
                          className="rounded-xl"
                        >
                          {isExpanded ? "Contraer" : "Expandir"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePipeline(pipeline.id)}
                          className="rounded-xl text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    {/* Pipeline Content */}
                    {isExpanded && (
                      <div className="space-y-4">
                        {/* Formulario de nueva etapa */}
                        <StageCreateForm
                          onSubmit={() => handleCreateStage(pipeline.id)}
                          onCancel={() => {}}
                          isLoading={mutations.createStage.isLoading}
                        />

                        {/* Lista de etapas */}
                        <div className="space-y-2">
                          {pipeline.stages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color ?? "#e5e7eb" }} />
                                <span className="text-sm font-medium">{stage.name}</span>
                                {stage.isWon && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Ganada</span>}
                                {stage.isLost && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Perdida</span>}
                                {stage.slaMinutes && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">SLA {stage.slaMinutes}m</span>}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStage({ id: stage.id, name: stage.name })}
                                  className="rounded-xl"
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteStage(stage.id)}
                                  className="rounded-xl text-red-600 hover:text-red-700"
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </DragDropContext>
    </div>
  )
}
