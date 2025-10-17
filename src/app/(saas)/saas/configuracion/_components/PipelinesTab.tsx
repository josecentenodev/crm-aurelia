"use client"

import { useState } from "react"
import { api, type RouterOutputs } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import { useToast } from "@/hooks/use-toast"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { PipelineCreateCard } from "./PipelineCreateCard"
import { PipelineCard } from "./PipelineCard"

type Pipeline = RouterOutputs["pipelines"]["listByClient"][number]
// type Stage = Pipeline["stages"][number]

interface NewPipelineState {
	name: string
	description: string
	isDefault: boolean
}

interface NewStageState {
	name: string
	color?: string
	slaMinutes?: number | ""
	isWon: boolean
	isLost: boolean
}

export function PipelinesTab() {
	const { clientId } = useClientContext()
	const { toast } = useToast()

	const [newPipeline, setNewPipeline] = useState<NewPipelineState>({ name: "", description: "", isDefault: false })
	const [newStageByPipeline, setNewStageByPipeline] = useState<Record<string, NewStageState>>({})
	const [expanded, setExpanded] = useState<Record<string, boolean>>({})

	const { data: pipelines = [], refetch } = api.pipelines.listByClient.useQuery(
		{ clientId: clientId! },
		{ enabled: !!clientId }
	)

	const createPipeline = api.pipelines.create.useMutation({
		onSuccess: async () => {
			toast({ title: "Pipeline creado", description: "Se creó correctamente." })
			setNewPipeline({ name: "", description: "", isDefault: false })
			await refetch()
		},
		onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
	})

	const updatePipeline = api.pipelines.update.useMutation({
		onSuccess: async () => { await refetch() },
		onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
	})

	const deletePipeline = api.pipelines.delete.useMutation({
		onSuccess: async () => { toast({ title: "Pipeline eliminado" }); await refetch() },
		onError: (e) => toast({ title: "No se puede eliminar", description: e.message, variant: "destructive" })
	})

	const createStage = api.pipelines.createStage.useMutation({
		onSuccess: async () => { toast({ title: "Etapa creada" }); await refetch() },
		onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
	})

	const updateStage = api.pipelines.updateStage.useMutation({
		onSuccess: async () => { await refetch() },
		onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
	})

	const deleteStage = api.pipelines.deleteStage.useMutation({
		onSuccess: async () => { toast({ title: "Etapa eliminada" }); await refetch() },
		onError: (e) => toast({ title: "No se puede eliminar", description: e.message, variant: "destructive" })
	})

	const reorderStages = api.pipelines.reorderStages.useMutation({
		onError: (e) => toast({ title: "No se pudo reordenar", description: e.message, variant: "destructive" })
	})

	function handleCreatePipeline() {
		if (!clientId || !newPipeline.name.trim()) return
		createPipeline.mutate({ clientId, name: newPipeline.name.trim(), description: newPipeline.description || undefined, isDefault: newPipeline.isDefault })
	}

	function setPipelineDefault(pipeline: Pipeline, next: boolean) {
		if (!clientId) return
		updatePipeline.mutate({ id: pipeline.id, clientId, isDefault: next })
	}

	function handleCreateStage(pipelineId: string) {
		const st = newStageByPipeline[pipelineId]
		if (!st?.name?.trim()) return
		createStage.mutate({ pipelineId, name: st.name.trim(), color: st.color ?? undefined, slaMinutes: st.slaMinutes === "" ? undefined : Number(st.slaMinutes), isWon: st.isWon, isLost: st.isLost })
		setNewStageByPipeline((prev) => ({ ...prev, [pipelineId]: { name: "", color: undefined, slaMinutes: "", isWon: false, isLost: false } }))
	}

	async function onDragEnd(result: DropResult) {
		const { destination, source } = result
		if (!destination) return
		if (destination.droppableId !== source.droppableId) return
		if (destination.index === source.index) return

		const pipeline = pipelines.find((p) => p.id === source.droppableId)
		if (!pipeline) return

		const reordered = Array.from(pipeline.stages)
		const [moved] = reordered.splice(source.index, 1)
		if (!moved) return
		reordered.splice(destination.index, 0, moved)

		// Recalcular orden secuencial empezando en 0
		const order = reordered.map((s, idx) => ({ id: s.id, order: idx }))
		reorderStages.mutate({ pipelineId: pipeline.id, order })
	}

	return (
		<div className="space-y-6">
			<PipelineCreateCard value={newPipeline} onChange={setNewPipeline} onSubmit={handleCreatePipeline} isSubmitting={createPipeline.status === 'pending'} />

			<DragDropContext onDragEnd={onDragEnd}>
				{(pipelines ?? []).length === 0 ? (
					<div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-600">
						Aún no tienes pipelines. Crea uno para comenzar a organizar tus oportunidades.
					</div>
				) : (
					<div className="flex flex-col items-stretch gap-6 mx-auto">
						{pipelines.map((pipeline) => (
							<PipelineCard
								key={pipeline.id}
								pipeline={pipeline}
								expanded={!!expanded[pipeline.id]}
								onToggleExpanded={() => setExpanded((prev) => ({ ...prev, [pipeline.id]: !prev[pipeline.id] }))}
								newStage={newStageByPipeline[pipeline.id] ?? { name: "", color: "#e5e7eb", slaMinutes: "", isWon: false, isLost: false }}
								onChangeNewStage={(next) => setNewStageByPipeline((prev) => ({ ...prev, [pipeline.id]: next }))}
								onCreateStage={() => handleCreateStage(pipeline.id)}
								onUpdateStage={(args) => updateStage.mutate(args)}
								onDeletePipeline={() => deletePipeline.mutateAsync({ id: pipeline.id, clientId: clientId! })}
								onDeleteStage={(stageId) => deleteStage.mutateAsync({ id: stageId })}
								onToggleDefault={(next) => setPipelineDefault(pipeline, next)}
							/>
						))}
					</div>
				)}
			</DragDropContext>
		</div>
	)
}


