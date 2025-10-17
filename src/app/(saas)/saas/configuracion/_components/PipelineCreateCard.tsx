"use client"

import { Button, Input, Label, Switch } from "@/components/ui"
import { OptimizedCard } from "@/components/ui/optimized-card"
import { Layers, Plus } from "lucide-react"

interface PipelineCreateCardProps {
	value: { name: string; description: string; isDefault: boolean }
	onChange: (next: { name: string; description: string; isDefault: boolean }) => void
	onSubmit: () => void
	isSubmitting?: boolean
}

export function PipelineCreateCard(props: PipelineCreateCardProps) {
	const { value, onChange, onSubmit, isSubmitting } = props

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		onSubmit()
	}

	return (
		<OptimizedCard
			title={<div className="text-base flex items-center gap-2"><Layers className="w-4 h-4 text-violet-600" />Nuevo Pipeline</div> as unknown as string}
			showHeader={true}
			showDescription={false}
			className="w-full rounded-2xl border border-gray-200"
		>
			<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-3">
				<div className="lg:col-span-2 space-y-1">
					<Label htmlFor="pl-name">Nombre</Label>
					<Input id="pl-name" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="Ej: Ventas B2B" className="rounded-xl" required />
				</div>
				<div className="lg:col-span-2 space-y-1">
					<Label htmlFor="pl-desc">Descripción</Label>
					<Input id="pl-desc" value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} placeholder="Opcional" className="rounded-xl" />
				</div>
				<div className="flex items-center gap-2">
					<Switch checked={value.isDefault} onCheckedChange={(v) => onChange({ ...value, isDefault: v })} />
					<span className="text-sm text-gray-700">Predeterminado</span>
				</div>
				<div className="lg:col-span-5 flex justify-end">
					<Button type="submit" className="rounded-xl" disabled={!!isSubmitting}>
						{isSubmitting ? "Creando..." : (<><Plus className="w-4 h-4 mr-2" />Crear Pipeline</>)}
					</Button>
				</div>
			</form>
		</OptimizedCard>
	)
}


