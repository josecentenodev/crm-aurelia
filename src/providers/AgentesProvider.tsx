"use client"

import { useMemo } from 'react'
import { api } from '@/trpc/react'
import { useClientContext } from './ClientProvider'
import type {
  Agent,
  CreateAgent,
  UpdateAgent,
  AgentTemplate,
  CreateAgentTemplate,
  UpdateAgentTemplate,
  AgentField,
  CreateAgentField,
  UpdateAgentField,
  DeleteAgentField
} from '@/domain/Agentes'

export function useAgentesProvider() {
  const { clientId, isAureliaUser, isLoading, error } = useClientContext()

  // Query para obtener agentes - usar enabled para controlar ejecución
  const agentesQuery = api.agentes.getAgentesByClient.useQuery(
    { clientId: clientId! },
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  )

  // Query para obtener templates - usar enabled para controlar ejecución
  const templatesQuery = api.agentes.getTemplatesByClient.useQuery(
    { clientId: clientId! },
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutos
    }
  );

  // Mutations
  const createAgenteMutation = api.agentes.createAgente.useMutation({
    onSuccess: (newAgent) => {
      if (clientId) {
        // Optimistic update
        utils.agentes.getAgentesByClient.setData(
          { clientId },
          (oldData) => {
            if (!oldData) return [newAgent]
            return [...oldData, newAgent]
          }
        )
      }
    }
  })
  const updateAgenteMutation = api.agentes.updateAgente.useMutation({
    onSuccess: (updatedAgent) => {
      if (clientId) {
        // Optimistic update
        utils.agentes.getAgentesByClient.setData(
          { clientId },
          (oldData) => {
            if (!oldData) return oldData
            return oldData.map(agent => 
              agent.id === updatedAgent.id ? updatedAgent : agent
            )
          }
        )
      }
    }
  })
  const deleteAgenteMutation = api.agentes.deleteAgente.useMutation({
    onSuccess: (deletedAgent) => {
      if (clientId) {
        // Optimistic update
        utils.agentes.getAgentesByClient.setData(
          { clientId },
          (oldData) => {
            if (!oldData) return oldData
            return oldData.filter(agent => agent.id !== deletedAgent.id)
          }
        )
      }
    }
  })
  const createTemplateMutation = api.agentes.createTemplate.useMutation()
  const updateTemplateMutation = api.agentes.updateTemplate.useMutation()
  const deleteTemplateMutation = api.agentes.deleteTemplate.useMutation()
  const createFieldMutation = api.agentes.createField.useMutation()
  const updateFieldMutation = api.agentes.updateField.useMutation()
  const deleteFieldMutation = api.agentes.deleteField.useMutation()

  // Utils para invalidar queries
  const utils = api.useUtils()
  const invalidateAgentes = () => { 
    if (clientId) {
      void utils.agentes.getAgentesByClient.invalidate({ clientId })
    }
  }
  const invalidateTemplates = () => { 
    if (clientId) {
      void utils.agentes.getTemplatesByClient.invalidate({ clientId })
    }
  }
  const invalidateAll = () => { 
    if (clientId) {
      void utils.agentes.invalidate()
    }
  }

  const isLoadingData = isLoading ?? agentesQuery.isLoading ?? templatesQuery.isLoading
  const hasError = error ?? agentesQuery.error ?? templatesQuery.error

  // Validar y limpiar datos de agentes
  const agentes = useMemo(() => {
    const data = agentesQuery.data ?? []
    return data.filter(agente => 
      agente && 
      agente.id && 
      agente.name && 
      agente.templateId && 
      agente.clientId
    )
  }, [agentesQuery.data])

  // Validar y limpiar datos de templates
  const templates = useMemo(() => {
    const data = templatesQuery.data ?? []
    return data.filter(template => 
      template && 
      template.id && 
      template.name &&
      template.steps &&
      Array.isArray(template.steps)
    )
  }, [templatesQuery.data])

  // Mutations tipadas
  const createAgente = async (data: CreateAgent) => {
    if (!clientId) throw new Error('ClientId is required')
    return createAgenteMutation.mutateAsync({ ...data, clientId })
  }
  const updateAgente = async (data: UpdateAgent & { id: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    return updateAgenteMutation.mutateAsync({ ...data, clientId })
  }
  const deleteAgente = async (data: { id: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    return deleteAgenteMutation.mutateAsync({ ...data, clientId })
  }
  const createTemplate = async (data: CreateAgentTemplate) => {
    if (!clientId) throw new Error('ClientId is required')
    return createTemplateMutation.mutateAsync({ ...data, clientId })
  }
  const updateTemplate = async (data: UpdateAgentTemplate & { id: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    // El router espera description como string | undefined, no null
    const { description, ...rest } = data
    const cleanData = {
      ...rest,
      description: description ?? undefined
    }
    return updateTemplateMutation.mutateAsync(cleanData)
  }
  const deleteTemplate = async (data: { id: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    return deleteTemplateMutation.mutateAsync({ ...data, clientId })
  }
  // Los campos ahora pertenecen a steps, no necesitan clientId en los routers
  const createField = async (data: CreateAgentField) => {
    return createFieldMutation.mutateAsync(data)
  }
  const updateField = async (data: UpdateAgentField) => {
    return updateFieldMutation.mutateAsync(data)
  }
  const deleteField = async (data: DeleteAgentField) => {
    return deleteFieldMutation.mutateAsync(data)
  }

  // Estados de mutations
  const isCreatingAgente = createAgenteMutation.isPending
  const isUpdatingAgente = updateAgenteMutation.isPending
  const isDeletingAgente = deleteAgenteMutation.isPending
  const isCreatingTemplate = createTemplateMutation.isPending
  const isUpdatingTemplate = updateTemplateMutation.isPending
  const isDeletingTemplate = deleteTemplateMutation.isPending
  const isCreatingField = createFieldMutation.isPending
  const isUpdatingField = updateFieldMutation.isPending
  const isDeletingField = deleteFieldMutation.isPending

  // Errores de mutations
  const createAgenteError = createAgenteMutation.error
  const updateAgenteError = updateAgenteMutation.error
  const deleteAgenteError = deleteAgenteMutation.error
  const createTemplateError = createTemplateMutation.error
  const updateTemplateError = updateTemplateMutation.error
  const deleteTemplateError = deleteTemplateMutation.error
  const createFieldError = createFieldMutation.error
  const updateFieldError = updateFieldMutation.error
  const deleteFieldError = deleteFieldMutation.error

  return {
    // Estado
    clientId,
    isAureliaUser,
    isLoading: isLoadingData,
    error: hasError,

    // Datos
    agentes,
    templates,

    // Mutations
    createAgente,
    updateAgente,
    deleteAgente,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createField,
    updateField,
    deleteField,

    // Estados de mutations
    isCreatingAgente,
    isUpdatingAgente,
    isDeletingAgente,
    isCreatingTemplate,
    isUpdatingTemplate,
    isDeletingTemplate,
    isCreatingField,
    isUpdatingField,
    isDeletingField,

    // Funciones de invalidación
    invalidateAgentes,
    invalidateTemplates,
    invalidateAll,

    // Errores de mutations
    createAgenteError,
    updateAgenteError,
    deleteAgenteError,
    createTemplateError,
    updateTemplateError,
    deleteTemplateError,
    createFieldError,
    updateFieldError,
    deleteFieldError,
  }
} 
