import { Card, CardContent } from "@/components/ui"
import { Users } from "lucide-react"
import { type Contact, ContactStatus } from "@/domain/Contactos"

type Props = {
  contacts: Contact[]
  selectedIds: string[]
}

export function ContactStats({ contacts, selectedIds }: Props) {
  const countByStatus = (status: ContactStatus) => contacts.filter(c => c.status === status).length
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contactos</p>
              <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
            </div>
            <Users className="h-8 w-8 text-violet-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nuevos</p>
              <p className="text-2xl font-bold text-blue-600">{countByStatus(ContactStatus.NUEVO)}</p>
            </div>
            <span className="text-2xl">🆕</span>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calificados</p>
              <p className="text-2xl font-bold text-green-600">{countByStatus(ContactStatus.CALIFICADO)}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-yellow-600">{countByStatus(ContactStatus.CLIENTE)}</p>
            </div>
            <span className="text-2xl">👑</span>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Seleccionados</p>
              <p className="text-2xl font-bold text-purple-600">{selectedIds.length}</p>
            </div>
            <span className="text-2xl">☑️</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 