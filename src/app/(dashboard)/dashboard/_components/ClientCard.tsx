"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  Bot, 
  MessageSquare, 
  Eye,
  Calendar
} from "lucide-react"
import { type Client } from "@/domain/Clientes"

interface ClientCardProps {
  client: {
    id: string
    name: string
    description: string | null
    email: string | null
    createdAt: Date
    updatedAt: Date
    status: { name: string }
    plan: { name: string }
    _count: {
      users: number
      contacts: number
      agentes: number
      conversations: number
    }
  }
}

export function ClientCard({ client }: ClientCardProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800'
      case 'inactivo':
        return 'bg-red-100 text-red-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'bg-purple-100 text-purple-800'
      case 'business':
        return 'bg-blue-100 text-blue-800'
      case 'starter':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => router.push(`/dashboard/clientes/${client.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {client.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(client.status.name)}>
                {client.status.name}
              </Badge>
              <Badge className={getPlanColor(client.plan.name)}>
                {client.plan.name}
              </Badge>
            </div>
            {client.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {client.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{client._count.users}</p>
              <p className="text-xs text-gray-500">Usuarios</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{client._count.agentes}</p>
              <p className="text-xs text-gray-500">Agentes</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{client._count.contacts}</p>
              <p className="text-xs text-gray-500">Contactos</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{client._count.conversations}</p>
              <p className="text-xs text-gray-500">Conversaciones</p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Creado: {new Date(client.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/clientes/${client.id}`)
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 