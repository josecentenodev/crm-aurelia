"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Save, 
  Bot,
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Building2,
  Clock,
  TrendingUp,
  FileText,
  Palette
} from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useAgentCache } from "../../_hooks"
import type { Agent } from "@/domain/Agentes"
import { useClientContext } from "@/providers/ClientProvider"
import { useAgentEditionStore } from "@/store/agent-edition-store"
import { StepProgress } from "./_components/StepProgress"
import { StepRenderer } from "./_components/StepRenderer"
import { StepNavigation } from "./_components/StepNavigation"
import { SectionHeader } from "../../../../../../components/ui/section-header"

interface FormData {
  name: string
  isActive: boolean
  isPrincipal: boolean
}

export default function EditarAgentePage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  const { toast } = useToast()
  const { clientId, isAureliaUser, isLoading: contextLoading } = useClientContext()
  const { updateAgentOptimistically, invalidateAgentsList } = useAgentCache()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    isActive: true,
    isPrincipal: false,
  })

  // Store para edición
  const {
    agent,
    template,
    currentStep,
    formValues,
    setAgent,
    setTemplate,
    setFormValues,
    setCurrentStep,
    reset: resetStore,
    clearStorage
  } = useAgentEditionStore()

  // Obtener el agente a editar
  const {
    data: agentData,
    isLoading: loadingAgent,
    error: agentError
  } = api.agentes.getAgenteById.useQuery(
    { 
      id: agentId,
      clientId: isAureliaUser ? (clientId ?? undefined) : undefined
    },
    {
      enabled: !!agentId && !contextLoading
    }
  )

  // Obtener el template del agente
  const {
    data: templateData,
    isLoading: loadingTemplate,
    error: templateError
  } = api.agentes.getTemplateById.useQuery(
    { 
      id: agentData?.templateId ?? "", 
      clientId: isAureliaUser ? (clientId ?? undefined) : undefined
    },
    {
      enabled: !!agentData?.templateId && !contextLoading
    }
  )

  // Efecto para cargar los datos del agente cuando se obtienen
  useEffect(() => {
    if (agentData) {
      setFormData({
        name: agentData.name,
        isActive: agentData.isActive,
        isPrincipal: agentData.isPrincipal,
      })
      
      // Cargar datos en el store
      setAgent(agentData)
      
      // Cargar customFields en el store
      if (typeof agentData.customFields === 'object' && agentData.customFields !== null) {
        const customFields = agentData.customFields as Record<string, unknown>
        const mappedValues: Record<string, string | number | boolean | string[] | undefined> = {}
        
        // Mapear los valores usando identificadores únicos
        if (templateData) {
          templateData.steps.forEach((step: { id: string; fields: Array<{ name: string }> }) => {
            step.fields.forEach((field: { name: string }) => {
              const fieldKey = `${step.id}_${field.name}`
              if (customFields[field.name] !== undefined) {
                mappedValues[fieldKey] = customFields[field.name] as string | number | boolean | string[] | undefined
              }
            })
          })
        }
        
        setFormValues(mappedValues)
      }
    }
  }, [agentData, templateData, setAgent, setFormValues])

  // Efecto para cargar el template en el store
  useEffect(() => {
    if (templateData) {
      setTemplate(templateData)
    }
  }, [templateData, setTemplate])

  // Efecto para inicializar el progreso de campos cuando se cargan los datos
  useEffect(() => {
    if (agentData && templateData && formValues) {
      // Inicializar fieldProgress basado en los valores existentes
      const fieldProgress: Array<{
        stepId: string
        fieldName: string
        isCompleted: boolean
        value: string | number | boolean | string[] | undefined
      }> = []

      templateData.steps.forEach((step) => {
        step.fields.forEach((field) => {
          const fieldKey = `${step.id}_${field.name}`
          const value = formValues[fieldKey]
          const isCompleted = value !== undefined && value !== null && value !== ""
          
          fieldProgress.push({
            stepId: step.id,
            fieldName: field.name,
            isCompleted,
            value
          })
        })
      })

      // Actualizar el fieldProgress en el store
      const { setFieldProgress } = useAgentEditionStore.getState()
      setFieldProgress(fieldProgress)
    }
  }, [agentData, templateData, formValues])

  // Limpiar store al desmontar
  useEffect(() => {
    return () => {
      resetStore()
    }
  }, [resetStore])

  // Función optimizada para manejar cambios de formulario
  const handleFormChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Función optimizada para manejar cambios de valores dinámicos
  const handleDynamicValueChange = useCallback((fieldKey: string, value: string | number | boolean | string[]) => {
    setFormValues(prev => ({
      ...prev,
      [fieldKey]: value
    }))
  }, [])

  const updateAgentMutation = api.agentes.updateAgente.useMutation({
    onMutate: async (newAgentData) => {
      // Optimistic update
      if (clientId && agentData) {
        updateAgentOptimistically(agentId, clientId, {
          name: newAgentData.name,
          isActive: newAgentData.isActive,
          isPrincipal: newAgentData.isPrincipal,
          customFields: newAgentData.customFields
        })
      }
    },
    onSuccess: () => {
      // Invalidar específicamente las queries de agentes
      if (clientId) {
        invalidateAgentsList(clientId)
      }
      
      // Limpiar el store después de actualizar exitosamente
      clearStorage()
      
      toast({
        title: "Agente actualizado",
        description: "El agente se ha actualizado exitosamente.",
      })
      router.push("/saas/agentes")
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setError(errorMessage)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Mapear los valores usando identificadores únicos a los nombres originales
      const mappedValues: Record<string, string | number | boolean | string[] | undefined> = {}
      
      if (template) {
        template.steps.forEach((step: { id: string; fields: Array<{ name: string }> }) => {
          step.fields.forEach((field: { name: string }) => {
            const fieldKey = `${step.id}_${field.name}`
            if (formValues[fieldKey] !== undefined) {
              mappedValues[field.name] = formValues[fieldKey]
            }
          })
        })
      }

      const agentData = {
        id: agentId,
        name: formData.name,
        isActive: formData.isActive,
        isPrincipal: formData.isPrincipal,
        customFields: mappedValues,
        clientId: isAureliaUser ? (clientId ?? undefined) : undefined
      }

      await updateAgentMutation.mutateAsync(agentData)
    } catch (error) {
      console.error("Error updating agent:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "user": return <User className="w-4 h-4" />
      case "building": return <Building2 className="w-4 h-4" />
      case "clock": return <Clock className="w-4 h-4" />
      case "trending-up": return <TrendingUp className="w-4 h-4" />
      case "file-text": return <FileText className="w-4 h-4" />
      case "palette": return <Palette className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  // Mostrar loading mientras se carga el contexto o el agente
  if (contextLoading || loadingAgent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">
            {contextLoading ? "Cargando contexto..." : "Cargando agente..."}
          </p>
        </div>
      </div>
    )
  }

  // Mostrar error si no se puede cargar el agente
  if (agentError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">Error al cargar el agente</h2>
          <p className="text-gray-600 mb-4">{agentError.message}</p>
          <Button onClick={() => router.push("/saas/agentes")}>
            Volver a Agentes
          </Button>
        </div>
      </div>
    )
  }

  // Si no hay agente, mostrar error
  if (!agentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">Agente no encontrado</h2>
          <p className="text-gray-600 mb-4">El agente que intentas editar no existe.</p>
          <Button onClick={() => router.push("/saas/agentes")}>
            Volver a Agentes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Editar agente" 
        description="Personaliza la configuración de tu agente"
      >
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-gray-300 bg-white hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </SectionHeader>

      {/* Progress */}
      <StepProgress />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <div className="space-y-8">
        {/* Formulario de información básica */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Settings className="w-5 h-5 mr-2 text-gray-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Agente *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Nombre del agente"
                required
                className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleFormChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Agente activo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPrincipal"
                checked={formData.isPrincipal}
                onCheckedChange={(checked) => handleFormChange("isPrincipal", checked)}
              />
              <Label htmlFor="isPrincipal">Agente principal</Label>
            </div>

            {templateData && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Configuración: {templateData.name}</h3>
                    <p className="text-sm text-gray-600">{templateData.description ?? "Sin descripción"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración Avanzada */}
        {templateData && !loadingTemplate && (
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-gray-600" />
                  Configuración Avanzada
                </CardTitle>
                <StepNavigation />
              </div>
            </CardHeader>
            <CardContent>
              <StepRenderer />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <div>
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="rounded-xl border-gray-300 bg-white hover:bg-gray-100"
              disabled={isLoading}
            >
              Atrás
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="rounded-xl border-gray-300 bg-white hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-violet-600 hover:bg-violet-700 rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Actualizando..." : "Actualizar Agente"}
          </Button>
        </div>
      </div>

      {loadingTemplate && (
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600">Cargando configuración...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {templateError && (
        <Alert variant="destructive" className="border-0 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar la configuración: {templateError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 