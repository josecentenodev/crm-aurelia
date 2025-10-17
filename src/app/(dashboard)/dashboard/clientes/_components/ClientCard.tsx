"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  Bot, 
  MessageSquare, 
  Calendar,
  ArrowRight,
  Trash2,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteClientConfirmationDialog } from "./DeleteClientConfirmationDialog"

interface ClientCardProps {
  client: {
    id: string
    name: string
    description: string | null
    email: string | null
    createdAt: Date
    updatedAt: Date
    status: { name: string } | null
    plan: { name: string } | null
    _count: {
      users: number
      contacts: number
      agentes: number
      conversations: number
    } | null
  }
  onClientDeleted?: () => void
}

export function ClientCard({ client, onClientDeleted }: ClientCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Funciones seguras para obtener colores
  const getStatusColor = (status?: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
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

  const getPlanColor = (plan?: string | null) => {
    if (!plan) return 'bg-gray-100 text-gray-800'
    
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

  // Funciones seguras para obtener datos
  const getStatusName = () => {
    return client.status?.name || 'Sin estado'
  }

  const getPlanName = () => {
    return client.plan?.name || 'Sin plan'
  }

  const getCount = (key: keyof NonNullable<typeof client._count>) => {
    return client._count?.[key] || 0
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {client.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(client.status?.name)}>
                  {getStatusName()}
                </Badge>
                <Badge className={getPlanColor(client.plan?.name)}>
                  {getPlanName()}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/clientes/${client.id}`} className="flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Ver detalles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar cliente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {client.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {client.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Usuarios:</span>
                <span className="font-medium">{getCount('users')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600">Agentes:</span>
                <span className="font-medium">{getCount('agentes')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Contactos:</span>
                <span className="font-medium">{getCount('contacts')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Conversaciones:</span>
                <span className="font-medium">{getCount('conversations')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Creado: {new Date(client.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

          <DeleteClientConfirmationDialog
            clientId={client.id}
            clientName={client.name}
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onSuccess={() => {
              onClientDeleted?.()
            }}
          />
    </>
  )
} 