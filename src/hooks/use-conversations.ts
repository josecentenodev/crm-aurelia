"use client"

import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { 
  ConversationFilters, 
  ConversationsByInstance, 
  ConversationWithDetails,
  EvolutionInstanceWithStats,
  CreateConversationWithInstance,
  UpdateConversation
} from "@/domain/Conversaciones"
import { useToast } from "@/hooks/use-toast"

interface UseConversationsOptions {
  clientId?: string // Permitir clientId como prop opcional
  groupByInstance?: boolean
  instanceId?: string
  filters?: ConversationFilters
  enabled?: boolean
}

/**
 * HOOK PRINCIPAL PARA CONVERSACIONES
 * 
 * Proporciona una interfaz completa para:
 * - Obtener conversaciones (unificadas o agrupadas por instancia)
 * - Gestionar instancias de Evolution API
 * - Crear, actualizar, eliminar conversaciones
 * - Enviar mensajes
 * - Estadísticas y métricas
 */
export function useConversations(options?: UseConversationsOptions) {
  const contextClientId = useClientContext().clientId
  const { toast } = useToast()
  const utils = api.useUtils()

  const {
    clientId = contextClientId, // Usar prop o contexto como fallback
    groupByInstance = false,
    instanceId,
    filters,
    enabled = true
  } = options || {}

  // ===== QUERIES PRINCIPALES =====

  // Query principal que puede devolver conversaciones agrupadas o unificadas
  const conversationsQuery = api.conversaciones.list.useQuery(
    {
      clientId: clientId!,
      filters: {
        ...filters,
        evolutionInstanceId: instanceId,
        groupByInstance
      }
    },
    {
      enabled: !!clientId && enabled,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  )

  // Query para instancias del cliente
  const instancesQuery = api.conversaciones.getClientInstances.useQuery(
    { clientId: clientId! },
    {
      enabled: !!clientId && enabled,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutos
    }
  )

  // Query para estadísticas
  const statsQuery = api.conversaciones.stats.useQuery(
    { clientId: clientId! },
    {
      enabled: !!clientId && enabled,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  )

  // ===== MUTATIONS =====

  // Crear conversación (unificada con soporte para instancias)
  const createConversationMutation = api.conversaciones.create.useMutation({
    onSuccess: (data) => {
      utils.conversaciones.invalidate()
      toast({
        title: "Conversación creada",
        description: `Nueva conversación con ${data.contact?.name}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error al crear conversación",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Actualizar conversación
  const updateConversationMutation = api.conversaciones.update.useMutation({
    onSuccess: () => {
      utils.conversaciones.invalidate()
      toast({
        title: "Conversación actualizada",
        description: "Los cambios se han guardado correctamente",
      })
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar conversación",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Eliminar conversación
  const deleteConversationMutation = api.conversaciones.delete.useMutation({
    onSuccess: () => {
      utils.conversaciones.invalidate()
      toast({
        title: "Conversación eliminada",
        description: "La conversación se ha eliminado correctamente",
      })
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar conversación",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Agregar mensaje
  const addMessageMutation = api.conversaciones.addMessage.useMutation({
    onSuccess: () => {
      utils.conversaciones.invalidate()
    },
    onError: (error) => {
      toast({
        title: "Error al enviar mensaje",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Mensaje con OpenAI
  const openaiMessageMutation = api.conversaciones.openaiMessage.useMutation({
    onSuccess: () => {
      utils.conversaciones.invalidate()
    },
    onError: (error) => {
      toast({
        title: "Error en respuesta de IA",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Marcar conversación como leída
  const markAsReadMutation = api.conversaciones.markAsRead.useMutation({
    onSuccess: () => {
      utils.conversaciones.invalidate()
    },
    onError: (error) => {
      toast({
        title: "Error al marcar como leída",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Asignar agente
  const assignAgentMutation = api.conversaciones.assignAgent.useMutation({
    onSuccess: () => {
      utils.conversaciones.invalidate()
      toast({
        title: "Agente asignado",
        description: "El agente se ha asignado correctamente",
      })
    },
    onError: (error) => {
      toast({
        title: "Error al asignar agente",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // ===== FUNCIONES DE UTILIDAD =====

  // Obtener conversaciones agrupadas por instancia
  const getConversationsByInstance = (instanceId: string) => {
    if (groupByInstance && conversationsQuery.data) {
      return (conversationsQuery.data as ConversationsByInstance[])
        .find(group => group.instanceId === instanceId)
    }
    return null
  }

  // Obtener todas las instancias
  const getAllInstances = (): EvolutionInstanceWithStats[] => {
    return instancesQuery.data ?? []
  }

  // Obtener estadísticas de una instancia específica
  const getInstanceStats = (instanceId: string) => {
    const conversations = getConversationsByInstance(instanceId)
    return conversations?.stats
  }

  // Filtrar conversaciones por criterios
  const filterConversations = (searchTerm?: string, status?: string) => {
    if (!conversationsQuery.data || groupByInstance) return []
    
    const conversations = conversationsQuery.data as ConversationWithDetails[]
    
    return conversations.filter(conv => {
      // Filtro por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesName = conv.contact?.name?.toLowerCase().includes(term)
        const matchesPhone = conv.contact?.phone?.includes(searchTerm)
        const matchesTitle = conv.title?.toLowerCase().includes(term)
        
        if (!matchesName && !matchesPhone && !matchesTitle) {
          return false
        }
      }
      
      // Filtro por estado
      if (status && status !== 'all' && conv.status !== status) {
        return false
      }
      
      return true
    })
  }

  // Obtener instancia por ID
  const getInstanceById = (instanceId: string) => {
    return instancesQuery.data?.find(instance => instance.id === instanceId)
  }

  // Verificar si una conversación puede enviar mensajes de WhatsApp
  const canSendWhatsAppMessage = (conversation: ConversationWithDetails) => {
    return !!(
      conversation.evolutionInstance && 
      conversation.evolutionInstance.status === 'CONNECTED' &&
      conversation.contact?.phone &&
      conversation.status === 'ACTIVA'
    )
  }

  // ===== FUNCIONES PÚBLICAS =====

  const createConversation = async (data: CreateConversationWithInstance) => {
    if (!clientId) throw new Error('ClientId is required')
    return createConversationMutation.mutateAsync(data)
  }

  const updateConversation = async (data: UpdateConversation & { id: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    return updateConversationMutation.mutateAsync({ ...data, clientId })
  }

  const deleteConversation = async (data: { id: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    return deleteConversationMutation.mutateAsync({ ...data, clientId })
  }

  const addMessage = async (data: { conversationId: string; content: string; role?: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    
    // 🔧 CAMBIO: No enviar el clientId del contexto, dejar que el backend lo determine desde la conversación
    return addMessageMutation.mutateAsync({ 
      ...data, 
      // Removido: clientId del contexto
      role: data.role as any || 'USER'
    })
  }

  const sendOpenAIMessage = async (data: { conversationId: string; content: string }) => {
    return openaiMessageMutation.mutateAsync(data)
  }

  const assignAgent = async (data: { conversationId: string; agentId?: string }) => {
    return assignAgentMutation.mutateAsync(data)
  }

  // Marcar conversación como leída
  const markConversationAsRead = async (conversationId: string) => {
    await markAsReadMutation.mutateAsync({ conversationId })
  }

  const refetch = () => {
    conversationsQuery.refetch()
    instancesQuery.refetch()
    statsQuery.refetch()
  }

  const invalidate = () => {
    utils.conversaciones.invalidate()
  }

  // ===== RETURN =====

  return {
    // Datos principales
    conversations: conversationsQuery.data,
    instances: instancesQuery.data,
    stats: statsQuery.data,
    isGroupedByInstance: groupByInstance,
    
    // Estados de carga
    isLoading: conversationsQuery.isLoading || instancesQuery.isLoading || statsQuery.isLoading,
    isLoadingConversations: conversationsQuery.isLoading,
    isLoadingInstances: instancesQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    
    // Errores
    error: conversationsQuery.error || instancesQuery.error || statsQuery.error,
    conversationsError: conversationsQuery.error,
    instancesError: instancesQuery.error,
    statsError: statsQuery.error,
    
    // Mutations - funciones
    createConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    sendOpenAIMessage,
    assignAgent,
    markConversationAsRead,
    
    // Estados de mutations
    isCreating: createConversationMutation.isPending,
    isUpdating: updateConversationMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
    isAddingMessage: addMessageMutation.isPending,
    isSendingOpenAI: openaiMessageMutation.isPending,
    isAssigningAgent: assignAgentMutation.isPending,
    
    // Errores de mutations
    createError: createConversationMutation.error,
    updateError: updateConversationMutation.error,
    deleteError: deleteConversationMutation.error,
    addMessageError: addMessageMutation.error,
    openaiError: openaiMessageMutation.error,
    assignAgentError: assignAgentMutation.error,
    
    // Funciones de utilidad
    getConversationsByInstance,
    getAllInstances,
    getInstanceStats,
    filterConversations,
    getInstanceById,
    canSendWhatsAppMessage,
    refetch,
    invalidate,
    
    // Meta información
    clientId,
    isEnabled: enabled
  }
}

// Hook especializado para vista agrupada por instancias
export function useConversationsGrouped(options?: Omit<UseConversationsOptions, 'groupByInstance'>) {
  return useConversations({
    ...options,
    groupByInstance: true
  })
}

// Hook especializado para una instancia específica
export function useConversationsByInstance(instanceId: string, options?: Omit<UseConversationsOptions, 'instanceId'>) {
  return useConversations({
    ...options,
    instanceId
  })
}

// Hook para obtener solo las instancias
export function useEvolutionInstances() {
  const { instances, isLoadingInstances, instancesError, getAllInstances, getInstanceById } = useConversations({
    enabled: true
  })

  return {
    instances,
    isLoading: isLoadingInstances,
    error: instancesError,
    getAllInstances,
    getInstanceById
  }
}
