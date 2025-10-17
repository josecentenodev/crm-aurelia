"use client"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Settings } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useAgentCreationStore } from "@/store/agent-creation-store"

// Reuse wizard components from SAAS to avoid duplication
import { StepProgress } from "@/app/(saas)/saas/agentes/crear/_components/StepProgress"
import { ProgressIndicator } from "@/app/(saas)/saas/agentes/crear/_components/ProgressIndicator"
import { AgentPreview } from "@/app/(saas)/saas/agentes/crear/_components/AgentPreview"
import { TemplateStepRenderer } from "@/app/(saas)/saas/agentes/crear/_components/TemplateStepRenderer"
import { TemplateConfirmStep } from "@/app/(saas)/saas/agentes/crear/_components/TemplateConfirmStep"
import { Step1SeleccionTemplate } from "@/app/(saas)/saas/agentes/_components/Step1SeleccionTemplate"

interface FormData {
  name: string
  isActive: boolean
  isPrincipal: boolean
}

export default function CrearAgenteDashboardPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    isActive: true,
    isPrincipal: false,
  })

  // Wizard store
  const {
    selectedTemplate,
    currentStep,
    totalSteps,
    formValues,
    setSelectedTemplate,
    setCurrentStep,
    setLoadingState,
    setError,
    getMissingRequiredFields,
    reset
  } = useAgentCreationStore()

  // Load templates for this client (include global ones)
  const { data: templates = [], isLoading: loadingTemplates, error: templatesError } = api.superadmin.getTemplatesByClient.useQuery({ clientId, includeGlobal: true }, { enabled: !!clientId })

  // Create agent mutation (superadmin scope)
  const createAgenteMutation = api.superadmin.createAgenteForClient.useMutation({
    onSuccess: () => {
      toast({ title: "Agente creado", description: "El agente se ha creado exitosamente." })
      reset()
      router.push(`/dashboard/clientes/${clientId}`)
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  })

  // Reset store on mount
  useEffect(() => { reset() }, [reset])

  const handleTemplateSelect = (tpl: any) => {
    setSelectedTemplate(tpl)
    if (!formData.name) setFormData(prev => ({ ...prev, name: `${tpl.name} - Nuevo agente` }))
  }

  const handleNext = () => {
    // From basic config (0) -> template select (1)
    if (currentStep === 0) { setCurrentStep(1); return }
    // From selection (1) the click happens in the list; no-op here
    if (selectedTemplate && currentStep < totalSteps - 1) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }

  const handleClearForm = () => {
    // Only clear dynamic fields; keep basic config
    useAgentCreationStore.setState({ formValues: {}, error: null })
  }

  const getCanProceed = () => {
    if (currentStep === 0) return formData.name.trim().length > 0
    if (currentStep === 1) return false
    return !!selectedTemplate && currentStep < totalSteps - 1
  }

  const handleSubmit = async () => {
    if (!selectedTemplate) return
    if (!formData.name.trim()) { setError("El nombre del agente es requerido"); return }

    const missing = getMissingRequiredFields()
    if (missing.length > 0) { setError(`Campos requeridos faltantes: ${missing.join(', ')}`); return }

    setLoadingState(true)
    setError(null)
    try {
      const mappedValues: Record<string, unknown> = {}

      selectedTemplate.steps.forEach((step: { id: string; fields: Array<{ name: string }> }) => {
        step.fields.forEach((field: {name: string}) => {
          const key = `${step.id}_${field.name}`
          if (formValues[key] !== undefined) {
            mappedValues[field.name] = formValues[key]
          }
        })
      })

      await createAgenteMutation.mutateAsync({
        clientId,
        name: formData.name.trim(),
        templateId: selectedTemplate.id,
        customFields: mappedValues,
        isActive: formData.isActive,
        isPrincipal: formData.isPrincipal,
        description: selectedTemplate.description ?? "",
      })
    } finally {
      setLoadingState(false)
    }
  }

  const isBasicConfigStep = currentStep === 0
  const isTemplateSelectionStep = currentStep === 1
  const isConfirmationStep = selectedTemplate && currentStep === (selectedTemplate.steps?.length ?? 0) + 2

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" onClick={() => router.push(`/dashboard/clientes/${clientId}`)} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear nuevo agente</h1>
          <p className="text-gray-600">Configura un nuevo agente para este cliente</p>
        </div>
      </div>

      {/* Progress */}
      <StepProgress />
      <ProgressIndicator />

      {/* Error de templates */}
      {templatesError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">Error al cargar templates: {templatesError.message}</CardContent>
        </Card>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 0: Configuración Básica */}
          {isBasicConfigStep && (
            <Card className="border-0 bg-white shadow-sm mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-gray-600" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Agente *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del agente" required className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isActive" checked={formData.isActive} onCheckedChange={(v) => setFormData(p => ({ ...p, isActive: v }))} />
                  <Label htmlFor="isActive">Agente activo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isPrincipal" checked={formData.isPrincipal} onCheckedChange={(v) => setFormData(p => ({ ...p, isPrincipal: v }))} />
                  <Label htmlFor="isPrincipal">Agente principal</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Selección de Template */}
          {isTemplateSelectionStep && (
            <Step1SeleccionTemplate templates={templates} selected={selectedTemplate as any} setSelected={handleTemplateSelect as any} />
          )}

          {/* Steps del Template */}
          {selectedTemplate && !isBasicConfigStep && !isTemplateSelectionStep && !isConfirmationStep && (
            <div className="space-y-6">
              <TemplateStepRenderer />
            </div>
          )}

          {/* Confirmación */}
          {isConfirmationStep && selectedTemplate && (
            <TemplateConfirmStep onSubmit={handleSubmit} loading={createAgenteMutation.isPending} />
          )}
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <AgentPreview agentName={formData.name} isActive={formData.isActive} isPrincipal={formData.isPrincipal} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="rounded-xl">Atrás</Button>
          )}
          {selectedTemplate && !isBasicConfigStep && !isTemplateSelectionStep && (
            <Button variant="outline" onClick={handleClearForm} className="rounded-xl">Limpiar Formulario</Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`/dashboard/clientes/${clientId}`)} className="rounded-xl">Cancelar</Button>
          {getCanProceed() && (
            <Button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700 rounded-xl">Siguiente</Button>
          )}
        </div>
      </div>
    </div>
  )
}


