"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, 
  Globe, 
  Building2, 
  Edit, 
  Trash2,
  Bot,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react"
import { type AgentTemplate, type FieldType } from "@/domain"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface TemplateCardProps {
  template: AgentTemplate & {
    client?: {
      id: string
      name: string
    } | null
    _count?: {
      agentes: number
    }
  }
  onUpdate: () => void
}

export function TemplateCard({ template, onUpdate }: TemplateCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteTemplateMutation = api.superadmin.deleteTemplate.useMutation({
    onSuccess: () => {
      toast({
        title: "Template eliminado",
        description: "El template se ha eliminado exitosamente.",
      })
      onUpdate()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este template? Esta acción no se puede deshacer.")) {
      return
    }
    
    setIsDeleting(true)
    try {
      await deleteTemplateMutation.mutateAsync({ id: template.id })
    } catch (error) {
      console.error("Error deleting template:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "AgenteQA":
        return "Agente QA"
      case "AgentePersonalizado":
        return "Agente Personalizado"
      default:
        return "Agente"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "AgenteQA":
        return "bg-blue-100 text-blue-800"
      case "AgentePersonalizado":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFieldTypeLabel = (type: FieldType) => {
    switch (type) {
      case "TEXT": return "Texto"
      case "TEXTAREA": return "Área"
      case "NUMBER": return "Número"
      case "EMAIL": return "Email"
      case "SELECT": return "Selección"
      case "MULTISELECT": return "Múltiple"
      case "CHECKBOX": return "Checkbox"
      case "RADIO": return "Radio"
      case "DATE": return "Fecha"
      case "JSON": return "JSON"
      default: return type
    }
  }

  const getFieldTypeColor = (type: FieldType) => {
    switch (type) {
      case "TEXT":
      case "TEXTAREA":
        return "bg-blue-100 text-blue-800"
      case "NUMBER":
        return "bg-green-100 text-green-800"
      case "EMAIL":
        return "bg-purple-100 text-purple-800"
      case "SELECT":
      case "MULTISELECT":
        return "bg-orange-100 text-orange-800"
      case "CHECKBOX":
      case "RADIO":
        return "bg-pink-100 text-pink-800"
      case "DATE":
        return "bg-indigo-100 text-indigo-800"
      case "JSON":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {template.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {template.description ?? "Sin descripción"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline"
              className={`${getTypeColor("AgentePersonalizado")} border-0`}
            >
              {getTypeLabel("AgentePersonalizado")}
            </Badge>
            <Badge variant={template.isGlobal ? "default" : "secondary"} className="border-0">
              {template.isGlobal ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Global
                </>
              ) : (
                <>
                  <Building2 className="w-3 h-3 mr-1" />
                  Cliente
                </>
              )}
            </Badge>
            <Badge variant={template.isActive ? "default" : "secondary"} className="border-0">
              {template.isActive ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activo
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Inactivo
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Steps:</span>
            <span className="font-medium text-gray-900">{template.steps.length}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Campos:</span>
            <span className="font-medium text-gray-900">
              {template.steps.reduce((total, step) => total + step.fields.length, 0)}
            </span>
          </div>
          
          {template.client && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium text-gray-900">{template.client.name}</span>
            </div>
          )}
        </div>

        {template.steps.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Steps del template:</p>
            <div className="space-y-3">
              {template.steps.map((step) => (
                <div key={step.id} className="bg-gray-50 rounded-lg p-3 border-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">{step.name}</span>
                    <Badge variant="outline" className="text-xs border-0 bg-white">
                      {step.fields.length} campos
                    </Badge>
                  </div>
                  {step.fields.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {step.fields.slice(0, 3).map((field) => (
                        <Badge key={field.id} variant="outline" className="text-xs border-0 bg-white">
                          <span className="mr-1">{field.name}</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${getFieldTypeColor(field.type)}`}>
                            {getFieldTypeLabel(field.type)}
                          </span>
                          {field.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </Badge>
                      ))}
                      {step.fields.length > 3 && (
                        <Badge variant="outline" className="text-xs border-0 bg-white">
                          +{step.fields.length - 3} más
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {template.category && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Categoría:</span>
            <Badge variant="outline" className="text-xs border-0 bg-gray-100">
              {template.category}
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Creado: {new Date(template.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-0 bg-gray-50 hover:bg-gray-100"
              onClick={() => {
                router.push(`/dashboard/templates/${template.id}/editar`)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-0 bg-gray-50 hover:bg-gray-100 text-red-600 hover:text-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 