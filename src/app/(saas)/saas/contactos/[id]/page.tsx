"use client"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, User, Mail, Phone, MessageSquare, Calendar, Tag, Briefcase } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import type { Contact } from "@/domain/Contactos"
import { ContactStatus } from "@/domain/Contactos"

export default function ContactoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const contactId = params.id as string

  const { data: contacto, isLoading, error } = api.contactos.byId.useQuery(
    { id: contactId },
    { enabled: !!contactId }
  )

  const { data: oportunidades = [] } = api.oportunidades.listByContact.useQuery(
    { contactId },
    { enabled: !!contactId }
  )

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !contacto) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message ?? "No se pudo cargar el contacto"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Type guard para asegurar que contacto es válido
  const contact = contacto as Contact

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/saas/contactos')}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{contact.name}</h1>
          <p className="text-gray-600 mt-1">Detalles del contacto</p>
        </div>
        <div className="ml-auto">
          <Button 
            onClick={() => router.push(`/saas/contactos/${contactId}/editar`)}
            className="bg-violet-500 hover:bg-violet-600"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Información Básica */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Email:</span>
            <span className="font-medium">{contact.email ?? "No especificado"}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Teléfono:</span>
            <span className="font-medium">{contact.phone ?? "No especificado"}</span>
          </div>

          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Canal:</span>
            <Badge variant="outline">{contact.channel}</Badge>
          </div>

          {contact.source && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Origen:</span>
              <Badge variant="outline">{contact.source}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estado y Fechas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Estado y Fechas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Estado:</span>
            <Badge 
              variant={contact.status === ContactStatus.CLIENTE ? "default" : "secondary"}
            >
              {contact.status === ContactStatus.CLIENTE ? "Cliente" : contact.status}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Creado:</span>
            <span className="font-medium">
              {new Date(contact.createdAt).toLocaleDateString()}
            </span>
          </div>

          {contact.updatedAt && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Actualizado:</span>
              <span className="font-medium">
                {new Date(contact.updatedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Etiquetas */}
      {contact.tags && contact.tags.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notas */}
      {contact.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Oportunidades del contacto */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {oportunidades.length === 0 ? (
            <p className="text-gray-500">Sin oportunidades.</p>
          ) : (
            <div className="space-y-3">
              {oportunidades.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 rounded-xl border bg-white">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{opp.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {opp.pipeline?.name ? `Pipeline: ${opp.pipeline.name}` : "Sin pipeline"}
                      {opp.stage?.name ? ` · Etapa: ${opp.stage.name}` : ""}
                      {` · Estado: ${opp.status}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mensaje Inicial */}
      {contact.message && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Mensaje Inicial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 