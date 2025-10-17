import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentTemplate, AgentField, Agent } from '@/domain/Agentes'

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

export interface AgentEditionState {
  // Estado del agente y template
  agent: Agent | null
  template: AgentTemplate | null
  
  // Navegación libre
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
  setAgent: (agent: Agent | null) => void
  setTemplate: (template: AgentTemplate | null) => void
  setCurrentStep: (step: number) => void
  setFormValue: (stepId: string, fieldName: string, value: string | number | boolean | string[]) => void
  setFormValues: (values: AgentFormValues) => void
  setFieldProgress: (fieldProgress: FieldProgress[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLoadingState: (loading: boolean) => void
  reset: () => void
  clearStorage: () => void
  
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
  agent: null,
  template: null,
  currentStep: 0,
  totalSteps: 1,
  formValues: {},
  fieldProgress: [],
  isLoading: false,
  error: null,
  loading: false,
}

export const useAgentEditionStore = create<AgentEditionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAgent: (agent) => {
        set({ agent })
      },

      setTemplate: (template) => {
        const { agent } = get()
        set({
          template,
          totalSteps: template ? template.steps.length : 1,
          currentStep: 0, // Empezar en el primer step
        })
      },

      setCurrentStep: (step) => {
        const { totalSteps } = get()
        if (step >= 0 && step < totalSteps) {
          set({ currentStep: step })
        }
      },

      setFormValue: (stepId, fieldName, value) => {
        const { formValues, fieldProgress } = get()
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

      setFieldProgress: (fieldProgress) => {
        set({ fieldProgress })
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

      // Función para limpiar completamente el localStorage
      clearStorage: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('agent-edition-storage')
        }
        set(initialState)
      },

      // Computed values
      getStepProgress: () => {
        const { template, fieldProgress } = get()
        if (!template) return []

        return template.steps.map(step => {
          const stepFields = fieldProgress.filter(fp => fp.stepId === step.id)
          const requiredFields = step.fields.filter(field => field.required)
          const completedRequiredFields = requiredFields.filter(field => {
            const fieldProgress = stepFields.find(fp => fp.fieldName === field.name)
            return fieldProgress?.isCompleted ?? false
          }).length
          
          const totalRequiredFields = requiredFields.length
          const percentage = totalRequiredFields > 0 ? (completedRequiredFields / totalRequiredFields) * 100 : 100

          return {
            stepId: step.id,
            stepName: step.name,
            totalFields: totalRequiredFields,
            completedFields: completedRequiredFields,
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
        const { template } = get()
        if (!template) return 0
        return template.steps.reduce((total, step) => 
          total + step.fields.filter(field => field.required).length, 0
        )
      },

      isFormValid: () => {
        const { template, formValues } = get()
        if (!template) return false

        // Verificar que todos los campos requeridos estén completados
        const requiredFields = template.steps.flatMap(step =>
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
        const { template, formValues } = get()
        if (!template) return []

        const missingFields: string[] = []
        
        template.steps.forEach(step => {
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
    }),
    {
      name: 'agent-edition-storage',
      // Solo persistir ciertos campos para evitar problemas de hidratación
      partialize: (state) => ({
        currentStep: state.currentStep,
        formValues: state.formValues,
        fieldProgress: state.fieldProgress,
      }),
    }
  )
) 