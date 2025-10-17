"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trash2, 
  Users, 
  Bot, 
  MessageSquare, 
  Building2,
  Database,
  Settings,
  FileText,
  Bell,
  Shield,
  Play,
  Layout,
  AlertTriangle
} from "lucide-react"

interface DeletionStatsCardProps {
  clientName: string
  dataCounts: Record<string, number>
  totalRecords: number
  isDeleting?: boolean
}

export function DeletionStatsCard({ 
  clientName, 
  dataCounts, 
  totalRecords, 
  isDeleting = false 
}: DeletionStatsCardProps) {
  const getDataIcon = (type: string) => {
    switch (type) {
      case 'users': return <Users className="w-4 h-4" />
      case 'contacts': return <Building2 className="w-4 h-4" />
      case 'agentes': return <Bot className="w-4 h-4" />
      case 'conversations': return <MessageSquare className="w-4 h-4" />
      case 'integrations': return <Settings className="w-4 h-4" />
      case 'pipelines': return <Database className="w-4 h-4" />
      case 'opportunities': return <FileText className="w-4 h-4" />
      case 'auditLogs': return <FileText className="w-4 h-4" />
      case 'notifications': return <Bell className="w-4 h-4" />
      case 'roles': return <Shield className="w-4 h-4" />
      case 'playgroundSessions': return <Play className="w-4 h-4" />
      case 'agentTemplates': return <Layout className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const getDataLabel = (type: string) => {
    switch (type) {
      case 'users': return 'Usuarios'
      case 'contacts': return 'Contactos'
      case 'agentes': return 'Agentes'
      case 'conversations': return 'Conversaciones'
      case 'integrations': return 'Integraciones'
      case 'pipelines': return 'Pipelines'
      case 'opportunities': return 'Oportunidades'
      case 'auditLogs': return 'Registros de Auditoría'
      case 'notifications': return 'Notificaciones'
      case 'roles': return 'Roles'
      case 'playgroundSessions': return 'Sesiones de Playground'
      case 'agentTemplates': return 'Templates de Agentes'
      default: return type
    }
  }

  return (
    <Card className={`${isDeleting ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center ${isDeleting ? 'text-red-600' : 'text-orange-600'}`}>
          {isDeleting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-2"></div>
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          {isDeleting ? 'Eliminando' : 'Preparando eliminación de'} "{clientName}"
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${isDeleting ? 'text-red-600' : 'text-orange-600'}`}>
            {totalRecords}
          </div>
          <div className="text-sm text-gray-600">
            registro{totalRecords !== 1 ? 's' : ''} a eliminar
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(dataCounts).map(([type, count]) => (
            <div 
              key={type} 
              className={`flex items-center justify-between p-2 rounded-lg border ${
                isDeleting 
                  ? 'bg-red-100 border-red-200' 
                  : 'bg-orange-100 border-orange-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {getDataIcon(type)}
                <span className="text-sm font-medium text-gray-700">
                  {getDataLabel(type)}
                </span>
              </div>
              <Badge 
                variant={isDeleting ? "destructive" : "secondary"}
                className="font-bold"
              >
                {count}
              </Badge>
            </div>
          ))}
        </div>

        {isDeleting && (
          <div className="text-center text-sm text-red-600 font-medium">
            ⚠️ Esta acción es irreversible
          </div>
        )}
      </CardContent>
    </Card>
  )
}
