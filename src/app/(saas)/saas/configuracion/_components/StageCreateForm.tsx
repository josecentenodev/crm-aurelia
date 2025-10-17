"use client"

import { Button, Card, CardContent, Input, Label, Separator, Switch, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
import { Plus, HelpCircle } from "lucide-react"

interface StageDraft {
	name: string
	color?: string
	slaMinutes?: number | ""
	isWon: boolean
	isLost: boolean
}

interface StageCreateFormProps {
	value: StageDraft
	onChange: (next: StageDraft) => void
	onSubmit: () => void
}

export function StageCreateForm(props: StageCreateFormProps) {
	const { value, onChange, onSubmit } = props

	return (
		<Card className="w-full border border-gray-200">
			<CardContent className="p-4">
				{/* Primera fila: Nombre, Color, SLA */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					<div className="space-y-1">
						<Label htmlFor="stage-name">Nombre</Label>
						<Input 
							id="stage-name" 
							value={value.name} 
							onChange={(e) => onChange({ ...value, name: e.target.value })} 
							placeholder="Ej: Calificado" 
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="stage-color">Color</Label>
						<Input 
							id="stage-color" 
							type="color" 
							value={value.color ?? "#e5e7eb"} 
							onChange={(e) => onChange({ ...value, color: e.target.value })} 
							className="h-10 w-16 p-1" 
						/>
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-1">
							<Label htmlFor="stage-sla">SLA (min)</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p className="font-medium mb-1">Service Level Agreement</p>
										<p className="text-sm">Tiempo objetivo máximo para que una oportunidad avance o responda en esta etapa. Ej: 120 min = 2 horas.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<Input 
							id="stage-sla" 
							inputMode="numeric" 
							value={value.slaMinutes ?? ""} 
							onChange={(e) => {
								const val = e.target.value
								onChange({ ...value, slaMinutes: val === "" ? "" : Number(val) })
							}} 
							placeholder="Opcional" 
						/>
					</div>
				</div>

				{/* Segunda fila: Switches y Botón */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-2">
										<Switch 
											checked={!!value.isWon} 
											onCheckedChange={(v) => onChange({ ...value, isWon: v, isLost: v ? false : value.isLost })} 
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
											checked={!!value.isLost} 
											onCheckedChange={(v) => onChange({ ...value, isLost: v, isWon: v ? false : value.isWon })} 
										/>
										<span className="text-sm font-medium">Perdida</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>Marca esta etapa como resultado final negativo</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<Button 
						type="button" 
						onClick={onSubmit} 
						className="rounded-xl"
						disabled={!value.name.trim()}
					>
						<Plus className="w-4 h-4 mr-2" />
						Agregar etapa
					</Button>
				</div>
				<Separator className="mt-4" />
			</CardContent>
		</Card>
	)
}


