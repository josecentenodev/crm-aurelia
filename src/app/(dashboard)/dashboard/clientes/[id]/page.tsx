"use client"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Bot, 
  MessageSquare, 
  Calendar,
  Mail,
  MapPin,
  Edit,
  Trash2
} from "lucide-react"
import { api } from "@/trpc/react"
import { ClientUsersTab } from "./_components/ClientUsersTab"
import { ClientAgentesTab } from "./_components/ClientAgentesTab"
import { ClientMetricsTab } from "./_components/ClientMetricsTab"
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Validar que el clientId sea válido
  if (!clientId || typeof clientId !== 'string' || clientId.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/dashboard/clientes")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ID de Cliente Inválido</h3>
            <p className="text-gray-500 text-center mb-4">
              El ID del cliente proporcionado no es válido.
            </p>
            <Button onClick={() => router.push("/dashboard/clientes")}>
              Volver a Clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const deleteMutation = api.superadmin.deleteClient.useMutation({
    onSuccess: () => {
      toast({ title: "Cliente eliminado", description: "El cliente fue eliminado correctamente." });
      router.push("/dashboard/clientes");
    },
    onError: (err) => {
      toast({ title: "No se pudo eliminar", description: err.message, variant: "destructive" });
    },
  });

  const { data: client, isLoading, error } = api.superadmin.getClientById.useQuery(
    { id: clientId },
    { 
      enabled: !!clientId,
      retry: 2,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    }
  )

  // Función segura para obtener el color del estado
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

  // Función segura para obtener el color del plan
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

  // Función segura para obtener el nombre del estado
  const getStatusName = () => {
    return client?.status?.name || 'Sin estado'
  }

  // Función segura para obtener el nombre del plan
  const getPlanName = () => {
    return client?.plan?.name || 'Sin plan'
  }

  // Función segura para obtener los conteos
  const getCount = (key: keyof NonNullable<typeof client>['_count']) => {
    return client?._count?.[key] || 0
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/dashboard/clientes")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error ? "Error al cargar el cliente" : "Cliente no encontrado"}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {error 
                ? "Hubo un problema al cargar los datos del cliente. Por favor, intenta de nuevo."
                : "El cliente que buscas no existe o no tienes permisos para verlo."
              }
            </p>
            <Button onClick={() => router.push("/dashboard/clientes")}>
              Volver a Clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/dashboard/clientes")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client?.name || 'Cliente'}</h1>
            <p className="text-gray-600">Detalles del cliente</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/clientes/${clientId}/editar`)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información del Cliente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <Badge className={getStatusColor(client?.status?.name)}>
                {getStatusName()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Plan:</span>
              <Badge className={getPlanColor(client?.plan?.name)}>
                {getPlanName()}
              </Badge>
            </div>
            {client?.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{client.email}</span>
              </div>
            )}
            {client?.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{client.address}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Creado: {client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Métricas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Usuarios:</span>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{getCount('users')}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Agentes:</span>
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-500" />
                <span className="font-semibold">{getCount('agentes')}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Contactos:</span>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-green-500" />
                <span className="font-semibold">{getCount('contacts')}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversaciones:</span>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">{getCount('conversations')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Límites */}
        <Card>
          <CardHeader>
            <CardTitle>Límites del Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Máx. Usuarios:</span>
              <span className="font-semibold">
                {client?.maxUsers ?? "Sin límite"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Máx. Contactos:</span>
              <span className="font-semibold">
                {client?.maxContacts ?? "Sin límite"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Máx. Agentes:</span>
              <span className="font-semibold">
                {client?.maxAgents ?? "Sin límite"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalle */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios ({getCount('users')})</TabsTrigger>
          <TabsTrigger value="agentes">Agentes ({getCount('agentes')})</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              {client?.description ? (
                <p className="text-gray-600">{client.description}</p>
              ) : (
                <p className="text-gray-500 italic">Sin descripción</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <ClientUsersTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="agentes">
          <ClientAgentesTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="metrics">
          <ClientMetricsTab clientId={clientId} />
        </TabsContent>

      </Tabs>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar cliente"
        description="¿Estás seguro que deseas eliminar este cliente? Esta acción no se puede deshacer. Solo es posible si no tiene usuarios, agentes, contactos ni conversaciones asociadas."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate({ id: clientId })}
      />
    </div>
  )
}
