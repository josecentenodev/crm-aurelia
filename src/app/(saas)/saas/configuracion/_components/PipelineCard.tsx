"use client"

import { Badge, Button, ConfirmDialog, Input, Label, OptimizedCard, Separator, Switch, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
import { ChevronDown, ChevronUp, GripVertical, Trash2, Wand2, HelpCircle } from "lucide-react"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { useState } from "react"
import type { RouterOutputs } from "@/trpc/react"
import { StageCreateForm } from "./StageCreateForm"

type Pipeline = RouterOutputs["pipelines"]["listByClient"][number]

interface StageDraft {
	name: string
	color?: string
	slaMinutes?: number | ""
	isWon: boolean
	isLost: boolean
}

interface PipelineCardProps {
	pipeline: Pipeline
	expanded: boolean
	onToggleExpanded: () => void
	newStage: StageDraft
	onChangeNewStage: (next: StageDraft) => void
	onCreateStage: () => void
	onUpdateStage: (args: { id: string; name?: string; color?: string; slaMinutes?: number | undefined; isWon?: boolean; isLost?: boolean }) => void
	onDeletePipeline: () => void
	onDeleteStage: (stageId: string, stageName: string) => void
	onToggleDefault: (next: boolean) => void
}

export function PipelineCard(props: PipelineCardProps) {
	const { pipeline, expanded, onToggleExpanded, newStage, onChangeNewStage, onCreateStage, onUpdateStage, onDeletePipeline, onDeleteStage, onToggleDefault } = props
	const [deleteConfirm, setDeleteConfirm] = useState<{ type: "pipeline" | "stage"; id: string; name: string } | null>(null)

	return (
		<OptimizedCard
			key={pipeline.id}
			title={pipeline.name}
			description={pipeline.description}
			className="w-full"
			headerClassName="flex items-center justify-between"
			contentClassName="space-y-4"
		>
			{/* Header Actions */}
			<div className="flex items-center gap-2">
				{pipeline.isDefault && <Badge className="border-0 text-xs bg-violet-100 text-violet-800">Predeterminado</Badge>}
			</div>
			<div className="flex items-center gap-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-2 text-sm">
								<span className="text-gray-700">Predeterminado</span>
								<Switch checked={pipeline.isDefault} onCheckedChange={onToggleDefault} />
							</div>
						</TooltipTrigger>
						<TooltipContent>Establecer como pipeline por defecto</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" size="sm" onClick={() => setDeleteConfirm({ type: "pipeline", id: pipeline.id, name: pipeline.name })}>
								<Trash2 className="w-4 h-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Eliminar pipeline</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" size="sm" onClick={onToggleExpanded}>
								{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>{expanded ? "Contraer etapas" : "Expandir etapas"}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			{/* Content */}
			<>
				<StageCreateForm value={newStage} onChange={onChangeNewStage} onSubmit={onCreateStage} />
				<Droppable droppableId={pipeline.id}>
					{(dropProvided) => (
						<div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="space-y-2">
							{pipeline.stages.map((stage, index) => (
								<Draggable key={stage.id} draggableId={stage.id} index={index}>
									{(dragProvided) => (
										<div ref={dragProvided.innerRef} {...dragProvided.draggableProps} className="rounded-xl border border-gray-200 shadow-sm bg-white p-3 hover:bg-gray-50 transition-colors">
											{/* Stage Header */}
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<div {...dragProvided.dragHandleProps} className="text-gray-400 cursor-grab hover:text-gray-600">
																	<GripVertical className="w-4 h-4" />
																</div>
															</TooltipTrigger>
															<TooltipContent>Arrastrar para reordenar</TooltipContent>
														</Tooltip>
													</TooltipProvider>
													<div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color ?? "#e5e7eb" }} />
													<div className="text-sm font-medium">{stage.name}</div>
													{stage.isWon && <Badge className="bg-green-100 text-green-800 border-0">Ganada</Badge>}
													{stage.isLost && <Badge className="bg-red-100 text-red-800 border-0">Perdida</Badge>}
													{stage.slaMinutes && <Badge variant="secondary" className="text-xs">SLA {stage.slaMinutes}m</Badge>}
												</div>
												<div className="flex items-center gap-2">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button variant="outline" size="sm" onClick={() => onUpdateStage({ id: stage.id, name: stage.name })}>
																	<Wand2 className="w-4 h-4" />
																</Button>
															</TooltipTrigger>
															<TooltipContent>Editar etapa</TooltipContent>
														</Tooltip>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button variant="outline" size="sm" onClick={() => setDeleteConfirm({ type: "stage", id: stage.id, name: stage.name })}>
																	<Trash2 className="w-4 h-4" />
																</Button>
															</TooltipTrigger>
															<TooltipContent>Eliminar etapa</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											</div>

											{/* Expanded Stage Form */}
											{expanded && (
												<>
													<Separator className="mt-3" />
													<div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
														<div className="space-y-1">
															<Label htmlFor={`stage-${stage.id}-name`}>Nombre</Label>
															<Input 
																id={`stage-${stage.id}-name`}
																defaultValue={stage.name} 
																onBlur={(e) => e.target.value !== stage.name && onUpdateStage({ id: stage.id, name: e.target.value })} 
															/>
														</div>
														<div className="space-y-1">
															<Label htmlFor={`stage-${stage.id}-color`}>Color</Label>
															<Input 
																id={`stage-${stage.id}-color`}
																type="color" 
																defaultValue={stage.color ?? "#e5e7eb"} 
																onChange={(e) => onUpdateStage({ id: stage.id, color: e.target.value })} 
																className="h-10 w-16 p-1" 
															/>
														</div>
														<div className="space-y-1">
															<div className="flex items-center gap-1">
																<Label htmlFor={`stage-${stage.id}-sla`}>SLA (min)</Label>
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
																		</TooltipTrigger>
																		<TooltipContent className="max-w-xs">
																			<p className="font-medium mb-1">Service Level Agreement</p>
																			<p className="text-sm">Tiempo objetivo máximo para que una oportunidad avance o responda en esta etapa.</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															</div>
															<Input 
																id={`stage-${stage.id}-sla`}
																inputMode="numeric" 
																defaultValue={stage.slaMinutes ?? ""} 
																onBlur={(e) => onUpdateStage({ id: stage.id, slaMinutes: e.target.value ? Number(e.target.value) : undefined })} 
															/>
														</div>
													</div>
													<div className="flex items-center gap-6 mt-4">
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<div className="flex items-center gap-2">
																		<Switch 
																			checked={!!stage.isWon} 
																			onCheckedChange={(v) => onUpdateStage({ id: stage.id, isWon: v, isLost: v ? false : stage.isLost })} 
																		/>
																		<span className="text-sm font-medium">Ganada</span>
																	</div>
																</TooltipTrigger>
																<TooltipContent>Marca esta etapa como resultado final positivo</TooltipContent>
															</Tooltip>
															<Tooltip>
																<TooltipTrigger asChild>
																	<div className="flex items-center gap-2">
																		<Switch 
																			checked={!!stage.isLost} 
																			onCheckedChange={(v) => onUpdateStage({ id: stage.id, isLost: v, isWon: v ? false : stage.isWon })} 
																		/>
																		<span className="text-sm font-medium">Perdida</span>
																	</div>
																</TooltipTrigger>
																<TooltipContent>Marca esta etapa como resultado final negativo</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</div>
												</>
											)}
										</div>
									)}
								</Draggable>
							))}
							{dropProvided.placeholder}
						</div>
					)}
				</Droppable>
			</>
			<ConfirmDialog
				open={!!deleteConfirm}
				onOpenChange={(o) => !o && setDeleteConfirm(null)}
				title={deleteConfirm?.type === "pipeline" ? "Eliminar Pipeline" : "Eliminar Etapa"}
				description={`¿Seguro que deseas eliminar "${deleteConfirm?.name ?? ""}"? Esta acción es permanente si no hay recursos asociados.`}
				confirmText="Eliminar"
				variant="destructive"
				onConfirm={async () => {
					if (!deleteConfirm) return
					if (deleteConfirm.type === "pipeline") onDeletePipeline()
					else onDeleteStage(deleteConfirm.id, deleteConfirm.name)
					setDeleteConfirm(null)
				}}
			/>
		</OptimizedCard>
	)
}


