import { Button } from "@/components/ui"
import { Plus, Upload, Download, Trash2, Loader2 } from "lucide-react"

type Props = {
  onCreate: () => void
  selectedIds: string[]
  onDelete: () => void
  isLoading?: boolean
}

export function ContactActions({ onCreate, selectedIds, onDelete, isLoading }: Props) {
  return (
    <div className="flex gap-2 mb-4">
      <Button variant="outline" className="rounded-xl">
        <Upload className="w-4 h-4 mr-2" />
        Importar
      </Button>
      <Button variant="outline" className="rounded-xl">
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>
      <Button className="bg-violet-500 hover:bg-purple-700 rounded-xl" onClick={onCreate}>
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Contacto
      </Button>
      {selectedIds.length > 0 && (
        <Button
          variant="destructive"
          className="rounded-xl"
          onClick={onDelete}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Eliminar {selectedIds.length} Seleccionado{selectedIds.length > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  )
} 