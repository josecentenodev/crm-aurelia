import { type Contact } from "@/domain/Contactos"
import { Badge, Button, Checkbox, Card, CardContent, CardHeader, CardTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui"
import { Mail, Phone, Calendar, Tag, MoreVertical, Edit, Zap, Trash2 } from "lucide-react"
import { useState } from "react"

type Props = {
  contacts: Contact[]
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  onEdit: (contact: Contact) => void
  onQuickEdit: (contact: Contact) => void
  onDelete: (id: string) => void
}

export function ContactTable({ contacts, selectedIds, setSelectedIds, onEdit, onQuickEdit, onDelete }: Props) {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const paginated = contacts.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(contacts.length / pageSize)

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(paginated.map(c => c.id))
    else setSelectedIds([])
  }
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) setSelectedIds([...selectedIds, id])
    else setSelectedIds(selectedIds.filter(i => i !== id))
  }

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader>
        <CardTitle>Lista de Contactos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <Checkbox
                    checked={selectedIds.length === paginated.length && paginated.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Teléfono</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Canal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Etiquetas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha Creación</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <Checkbox
                      checked={selectedIds.includes(contact.id)}
                      onCheckedChange={checked => handleSelect(contact.id, checked as boolean)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {contact.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{contact.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{contact.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge>{contact.channel}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge>{contact.status}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.slice(0, 2).map((etiqueta, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {etiqueta}
                        </Badge>
                      ))}
                      {(contact.tags?.length ?? 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(contact.tags?.length ?? 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem 
                          onClick={() => onEdit(contact)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                          Edición Completa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onQuickEdit(contact)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4" />
                          Edición Rápida
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(contact.id)}
                          className="flex items-center gap-2 cursor-pointer text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Mostrando {paginated.length} de {contacts.length} contactos
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 