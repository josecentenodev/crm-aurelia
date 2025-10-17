"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RotateCcw, Settings } from "lucide-react"
import { useAgentesProvider } from "@/providers/AgentesProvider"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { StepProgress } from "./_components/StepProgress"
import { ProgressIndicator } from "./_components/ProgressIndicator"
import { AgentPreview } from "./_components/AgentPreview"
import { TemplateStepRenderer } from "./_components/TemplateStepRenderer"
import { TemplateConfirmStep } from "./_components/TemplateConfirmStep"
import { Step1SeleccionTemplate } from "../_components/Step1SeleccionTemplate"
import { StepNavigation } from "./_components/StepNavigation"
import { useAgentCreationStore } from "@/store/agent-creation-store"
import { SectionHeader } from "../../../../../components/ui/section-header"
import type { AgentTemplate } from "@/domain/Agentes"

interface FormData {
  name: string
  isActive: boolean
  isPrincipal: boolean
}

export default function CrearAgentePage() {
  const router = useRouter()
  const { templates, createAgente, isCreatingAgente } = useAgentesProvider()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    isActive: true,
    isPrincipal: false,
  })
  
  const { 
    selectedTemplate, 
    currentStep, 
    totalSteps,
    formValues,
    loading,
    error,
    setSelectedTemplate, 
    setCurrentStep, 
    setLoadingState, 
    setError,
    getMissingRequiredFields,
    clearForm,
    reset
  } = useAgentCreationStore()

  // Limpiar el store cuando se monta la página de creación
  useEffect(() => {
    // Limpiar completamente el store al montar la página de creación
    reset()
  }, [reset])

  // Calcular steps dinámicamente
  const isBasicConfigStep = currentStep === 0
  const isTemplateSelectionStep = currentStep === 1
  const isConfirmationStep = selectedTemplate && currentStep === selectedTemplate.steps.length + 2
  const currentTemplateStep = selectedTemplate ? currentStep - 2 : -1 // -2 porque step 0 es config básica y step 1 es selección de template

  // Debug logs
  console.log('Page Debug:', {
    currentStep,
    selectedTemplate: selectedTemplate?.name,
    stepsLength: selectedTemplate?.steps?.length,
    totalSteps,
    isBasicConfigStep,
    isTemplateSelectionStep,
    isConfirmationStep,
    currentTemplateStep,
    shouldShowConfirmation: isConfirmationStep && selectedTemplate
  })

  const handleNext = () => {
    console.log('handleNext called:', { currentStep, totalSteps, selectedTemplate: selectedTemplate?.name })
    
    // En el step de configuración básica, ir a selección de template
    if (isBasicConfigStep) {
      setCurrentStep(1)
      return
    }
    
    // En el step de selección de template, el template se selecciona directamente
    // No necesitamos manejar esto aquí porque handleTemplateSelect ya lo hace
    
    // En los steps del template, avanzar al siguiente
    if (selectedTemplate && !isConfirmationStep) {
      if (currentStep < totalSteps - 1) {
        console.log('Moving to next step:', currentStep + 1)
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template)
    // Establecer un nombre por defecto basado en el template si no se ha configurado
    if (!formData.name) {
      setFormData(prev => ({
        ...prev,
        name: `${template.name} - Nuevo agente`
      }))
    }
    // Ir al primer step del template (step 2)
    setCurrentStep(2)
  }

  const handleClearForm = () => {
    clearForm()
    // No limpiar el nombre y configuración básica, solo los campos del template
    // setFormData({
    //   name: "",
    //   isActive: true,
    //   isPrincipal: false,
    // })
  }

  const handleSubmit = async () => {
    if (!selectedTemplate) return
    
    // Validar que el nombre esté presente
    if (!formData.name.trim()) {
      setError("El nombre del agente es requerido")
      return
    }
    
    // Validar campos requeridos antes del envío
    const missingFields = getMissingRequiredFields()
    if (missingFields.length > 0) {
      setError(`Campos requeridos faltantes: ${missingFields.join(', ')}`)
      return
    }

    setLoadingState(true)
    setError(null)
    
    try {
      // Mapear los valores usando identificadores únicos a los nombres originales
      const mappedValues: Record<string, unknown> = {}

      selectedTemplate.steps.forEach((step: { id: string; fields: Array<{ name: string }> }) => {
        step.fields.forEach((field: { name: string }) => {
          const fieldKey = `${step.id}_${field.name}`
          if (formValues[fieldKey] !== undefined) {
            mappedValues[field.name] = formValues[fieldKey]
          }
        })
      })

      await createAgente({
        name: formData.name.trim(),
        templateId: selectedTemplate.id,
        customFields: mappedValues,
        isActive: formData.isActive,
        isPrincipal: formData.isPrincipal,
        description: selectedTemplate.description ?? "",
      })

      // Limpiar el store después de crear exitosamente
      reset()
      router.push('/saas/agentes')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Error al crear el agente"
      setError(errorMessage)
    } finally {
      setLoadingState(false)
    }
  }

  // Función para determinar si se puede avanzar al siguiente step
  const canProceedToNext = () => {
    // En el step de configuración básica, verificar que el nombre esté presente
    if (isBasicConfigStep) {
      return formData.name.trim().length > 0
    }
    
    // En el step de selección de template, no mostrar botón siguiente
    // porque la selección se hace directamente
    if (isTemplateSelectionStep) {
      return false
    }
    
    // En los steps del template, verificar que el step actual esté completo
    if (selectedTemplate && !isConfirmationStep) {
      const currentTemplateStepIndex = currentStep - 2
      const currentTemplateStep = selectedTemplate.steps[currentTemplateStepIndex]
      
      if (!currentTemplateStep) return false
      
      // Verificar que todos los campos requeridos del step actual estén completos
      const requiredFields = currentTemplateStep.fields.filter(field => field.required)
      const completedRequiredFields = requiredFields.every(field => {
        const fieldKey = `${currentTemplateStep.id}_${field.name}`
        const value = formValues[fieldKey]
        return value !== undefined && value !== null && value !== ''
      })
      
      return completedRequiredFields
    }
    
    // En el step de confirmación, no se puede avanzar más
    return false
  }

  if (isCreatingAgente) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando templates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Crear nuevo agente" 
        description="Configura un nuevo agente de IA para tu negocio"
      >
        <Button 
          variant="ghost" 
          onClick={() => router.push('/saas/agentes')}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </SectionHeader>

      {/* Progress */}
      <StepProgress />

      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del agente"
                    required
                    className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Agente activo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPrincipal"
                    checked={formData.isPrincipal}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrincipal: checked }))}
                  />
                  <Label htmlFor="isPrincipal">Agente principal</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Selección de Template */}
          {isTemplateSelectionStep && (
            <Step1SeleccionTemplate
              templates={templates}
              selected={selectedTemplate}
              setSelected={handleTemplateSelect}
            />
          )}

          {/* Steps del Template con navegación libre */}
          {(() => {
            console.log('Template steps condition:', {
              selectedTemplate: !!selectedTemplate,
              isBasicConfigStep,
              isTemplateSelectionStep,
              isConfirmationStep,
              shouldRender: selectedTemplate && !isBasicConfigStep && !isTemplateSelectionStep && !isConfirmationStep
            })
            return selectedTemplate && !isBasicConfigStep && !isTemplateSelectionStep && !isConfirmationStep
          })() && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <StepNavigation />
              </div>
              <TemplateStepRenderer />
            </div>
          )}

          {/* Step de Confirmación */}
          {(() => {
            console.log('Confirmation step condition:', {
              isConfirmationStep,
              selectedTemplate: !!selectedTemplate,
              shouldRender: isConfirmationStep && selectedTemplate
            })
            return isConfirmationStep && selectedTemplate
          })() && (
            <TemplateConfirmStep
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <AgentPreview 
            agentName={formData.name}
            isActive={formData.isActive}
            isPrincipal={formData.isPrincipal}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="rounded-xl">
              Atrás
            </Button>
          )}
          {selectedTemplate && !isBasicConfigStep && !isTemplateSelectionStep && (
            <Button 
              variant="outline" 
              onClick={handleClearForm}
              className="rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar Formulario
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/saas/agentes')}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          {canProceedToNext() && (
            <Button
              onClick={handleNext}
              className="bg-violet-600 hover:bg-violet-700 rounded-xl"
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 
