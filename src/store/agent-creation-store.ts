import { create } from 'zustand'
import type { AgentTemplate, AgentField } from '@/domain/Agentes'

// Tipos para el store
export type AgentFormValues = Record<string, string | number | boolean | string[] | undefined>

export interface FieldProgress {
  stepId: string
  fieldName: string
  isCompleted: boolean
  value: string | number | boolean | string[] | undefined
}

export interface StepProgress {
  stepId: string
  stepName: string
  totalFields: number
  completedFields: number
  percentage: number
}

export interface AgentCreationState {
  // Estado del template y navegación
  selectedTemplate: AgentTemplate | null
  currentStep: number
  totalSteps: number
  
  // Valores del formulario
  formValues: AgentFormValues
  
  // Progreso de campos
  fieldProgress: FieldProgress[]
  
  // Estados de UI
  isLoading: boolean
  error: string | null
  loading: boolean
  
  // Acciones
  setSelectedTemplate: (template: AgentTemplate | null) => void
  setCurrentStep: (step: number) => void
  setFormValue: (stepId: string, fieldName: string, value: string | number | boolean | string[]) => void
  setFormValues: (values: AgentFormValues) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLoadingState: (loading: boolean) => void
  reset: () => void
  clearForm: () => void
  
  // Computed values
  getStepProgress: () => StepProgress[]
  getOverallProgress: () => number
  getCompletedFieldsCount: () => number
  getTotalFieldsCount: () => number
  isFormValid: () => boolean
  getMissingRequiredFields: () => string[]
  canNavigateToStep: (step: number) => boolean
}

const initialState = {
  selectedTemplate: null,
  currentStep: 0,
  totalSteps: 3, // Config básica + Selección template + Confirmación (mínimo)
  formValues: {},
  fieldProgress: [],
  isLoading: false,
  error: null,
  loading: false,
}

export const useAgentCreationStore = create<AgentCreationState>()(
  (set, get) => ({
    ...initialState,

    setSelectedTemplate: (template) => {
      set({
        selectedTemplate: template,
        currentStep: 2, // Ir al primer step del template (después de config básica y selección)
        totalSteps: template ? template.steps.length + 3 : 3, // +3 para incluir config básica, selección y confirmación
        formValues: {},
        fieldProgress: [],
        error: null,
      })
    },

    setCurrentStep: (step) => {
      const { totalSteps } = get()
      if (step >= 0 && step < totalSteps) {
        set({ currentStep: step })
      }
    },

    setFormValue: (stepId, fieldName, value) => {
      const { formValues, fieldProgress, selectedTemplate } = get()
      const fieldKey = `${stepId}_${fieldName}`
      
      // Actualizar valores del formulario
      const newFormValues = { ...formValues, [fieldKey]: value }
      
      // Actualizar progreso del campo
      const existingProgressIndex = fieldProgress.findIndex(
        fp => fp.stepId === stepId && fp.fieldName === fieldName
      )
      
      const isCompleted = value !== undefined && value !== null && value !== ''
      const newFieldProgress = [...fieldProgress]
      
      if (existingProgressIndex >= 0) {
        newFieldProgress[existingProgressIndex] = {
          stepId,
          fieldName,
          isCompleted,
          value,
        }
      } else {
        newFieldProgress.push({
          stepId,
          fieldName,
          isCompleted,
          value,
        })
      }
      
      set({
        formValues: newFormValues,
        fieldProgress: newFieldProgress,
      })
    },

    setFormValues: (values) => {
      set({ formValues: values })
    },

    setLoading: (loading) => {
      set({ isLoading: loading })
    },

    setError: (error) => {
      set({ error })
    },

    setLoadingState: (loading) => {
      set({ loading })
    },

    reset: () => {
      set(initialState)
    },

    clearForm: () => {
      set({
        formValues: {},
        fieldProgress: [],
        error: null,
      })
    },

    // Computed values
    getStepProgress: () => {
      const { selectedTemplate, fieldProgress } = get()
      if (!selectedTemplate) return []

      return selectedTemplate.steps.map(step => {
        const stepFields = fieldProgress.filter(fp => fp.stepId === step.id)
        const completedFields = stepFields.filter(fp => fp.isCompleted).length
        const totalFields = step.fields.length
        const percentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0

        return {
          stepId: step.id,
          stepName: step.name,
          totalFields,
          completedFields,
          percentage: Math.round(percentage),
        }
      })
    },

    getOverallProgress: () => {
      const { getCompletedFieldsCount, getTotalFieldsCount } = get()
      const completed = getCompletedFieldsCount()
      const total = getTotalFieldsCount()
      return total > 0 ? Math.round((completed / total) * 100) : 0
    },

    getCompletedFieldsCount: () => {
      const { fieldProgress } = get()
      return fieldProgress.filter(fp => fp.isCompleted).length
    },

    getTotalFieldsCount: () => {
      const { selectedTemplate } = get()
      if (!selectedTemplate) return 0
      return selectedTemplate.steps.reduce((total, step) => total + step.fields.length, 0)
    },

    isFormValid: () => {
      const { selectedTemplate, formValues } = get()
      if (!selectedTemplate) return false

      // Verificar que todos los campos requeridos estén completados
      const requiredFields = selectedTemplate.steps.flatMap(step =>
        step.fields
          .filter(field => field.required)
          .map(field => ({ stepId: step.id, fieldName: field.name }))
      )

      return requiredFields.every(({ stepId, fieldName }) => {
        const fieldKey = `${stepId}_${fieldName}`
        const value = formValues[fieldKey]
        return value !== undefined && value !== null && value !== ''
      })
    },

    getMissingRequiredFields: () => {
      const { selectedTemplate, formValues } = get()
      if (!selectedTemplate) return []

      const missingFields: string[] = []
      
      selectedTemplate.steps.forEach(step => {
        step.fields.forEach(field => {
          if (field.required) {
            const fieldKey = `${step.id}_${field.name}`
            const value = formValues[fieldKey]
            if (value === undefined || value === null || value === '') {
              missingFields.push(field.label)
            }
          }
        })
      })

      return missingFields
    },

    canNavigateToStep: (step) => {
      const { totalSteps } = get()
      return step >= 0 && step < totalSteps
    },
  })
) 
