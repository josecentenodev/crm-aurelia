import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { ContactStatus, ContactChannel } from "@/domain/Contactos"

type Props = {
  filters: {
    estado: ContactStatus | "todos"
    canal: ContactChannel | "todos"
    busqueda: string
  }
  setFilters: (filters: Props["filters"]) => void
}

export function ContactFilters({ filters, setFilters }: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={filters.busqueda}
            onChange={e => setFilters({ ...filters, busqueda: e.target.value })}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={filters.estado} onValueChange={estado => setFilters({ ...filters, estado: estado as ContactStatus | "todos" })}>
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value={ContactStatus.NUEVO}>Nuevos</SelectItem>
            <SelectItem value={ContactStatus.CALIFICADO}>Calificados</SelectItem>
            <SelectItem value={ContactStatus.AGENDADO}>Agendados</SelectItem>
            <SelectItem value={ContactStatus.CLIENTE}>Clientes</SelectItem>
            <SelectItem value={ContactStatus.DESCARTADO}>Descartados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.canal} onValueChange={canal => setFilters({ ...filters, canal: canal as ContactChannel | "todos" })}>
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los canales</SelectItem>
            <SelectItem value={ContactChannel.WHATSAPP}>WhatsApp</SelectItem>
            <SelectItem value={ContactChannel.INSTAGRAM}>Instagram</SelectItem>
            <SelectItem value={ContactChannel.FACEBOOK}>Facebook</SelectItem>
            <SelectItem value={ContactChannel.WEB}>Web</SelectItem>
            <SelectItem value={ContactChannel.EMAIL}>Email</SelectItem>
            <SelectItem value={ContactChannel.TELEFONO}>Teléfono</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 