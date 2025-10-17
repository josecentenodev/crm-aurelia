"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import type { Integration } from "@/domain/Integraciones"

export interface InstanceFormData {
  instanceName: string
  phoneNumber: string
  description: string
}

export interface InstanceManagementState {
  isCreatingInstance: boolean
  showCreateForm: boolean
  showQRModal: string | null
  showDeleteConfirm: string | null
  showWebhookConfig: string | null
  expandedInstance: string | null
  formData: InstanceFormData
}

export function useInstanceManagement(integration: Integration, onUpdate: () => void) {
  const { clientId } = useClientContext()
  const { toast } = useToast()

  const [state, setState] = useState<InstanceManagementState>({
    isCreatingInstance: false,
    showCreateForm: false,
    showQRModal: null,
    showDeleteConfirm: null,
    showWebhookConfig: null,
    expandedInstance: null,
    formData: {
      instanceName: "",
      phoneNumber: "",
      description: ""
    }
  })

  // Queries
  const { data: instancesData, refetch: refetchInstances } = api.instances.listByClient.useQuery({
    clientId: clientId!,
    integrationId: integration.clientIntegration?.id
  }, {
    enabled: !!clientId && !!integration.clientIntegration?.id
  })

  const { data: integrationsData, refetch: refetchIntegrations } = api.integraciones.getClientIntegrationsByType.useQuery({
    integrationType: "EVOLUTION_API"
  }, {
    enabled: !!clientId
  })

  // Mutations
  const createInstanceMutation = api.instances.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia creada",
        description: "La instancia se ha creado correctamente"
      })
      setState(prev => ({
        ...prev,
        formData: { instanceName: "", phoneNumber: "", description: "" },
        showCreateForm: false
      }))
      void refetchInstances()
      void refetchIntegrations()
      onUpdate()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const connectInstanceMutation = api.instances.connect.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia conectada",
        description: "Se ha generado el código QR para conectar la instancia"
      })
      void refetchInstances()
      void refetchIntegrations()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const disconnectInstanceMutation = api.instances.disconnect.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia desconectada",
        description: "La instancia ha sido desconectada correctamente"
      })
      void refetchInstances()
      void refetchIntegrations()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const deleteInstanceMutation = api.instances.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia eliminada",
        description: "La instancia ha sido eliminada correctamente"
      })
      void refetchInstances()
      void refetchIntegrations()
      onUpdate()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Actions
  const actions = {
    setShowCreateForm: (show: boolean) => setState(prev => ({ ...prev, showCreateForm: show })),
    setShowQRModal: (instanceName: string | null) => setState(prev => ({ ...prev, showQRModal: instanceName })),
    setShowDeleteConfirm: (instanceId: string | null) => setState(prev => ({ ...prev, showDeleteConfirm: instanceId })),
    setShowWebhookConfig: (instanceId: string | null) => setState(prev => ({ ...prev, showWebhookConfig: instanceId })),
    setExpandedInstance: (instanceId: string | null) => setState(prev => ({ ...prev, expandedInstance: instanceId })),
    updateFormData: (data: Partial<InstanceFormData>) => setState(prev => ({ 
      ...prev, 
      formData: { ...prev.formData, ...data } 
    })),
    
    createInstance: async () => {
      if (!state.formData.instanceName.trim()) {
        toast({
          title: "Error",
          description: "El nombre de la instancia es requerido",
          variant: "destructive"
        })
        return
      }

      if (!clientId || !integration.clientIntegration?.id) return

      setState(prev => ({ ...prev, isCreatingInstance: true }))
      try {
        await createInstanceMutation.mutateAsync({
          clientId,
          integrationId: integration.clientIntegration.id,
          instanceName: state.formData.instanceName.trim(),
          phoneNumber: state.formData.phoneNumber || undefined,
          config: {
            description: state.formData.description || undefined
          }
        })
      } finally {
        setState(prev => ({ ...prev, isCreatingInstance: false }))
      }
    },

    connectInstance: async (instanceId: string) => {
      await connectInstanceMutation.mutateAsync(instanceId)
    },

    disconnectInstance: async (instanceId: string) => {
      await disconnectInstanceMutation.mutateAsync(instanceId)
    },

    deleteInstance: async (instanceId: string) => {
      await deleteInstanceMutation.mutateAsync(instanceId)
      setState(prev => ({ ...prev, showDeleteConfirm: null }))
    },

    handleConnected: () => {
      toast({
        title: "¡Conectado!",
        description: "La instancia se ha conectado correctamente"
      })
      setTimeout(() => setState(prev => ({ ...prev, showQRModal: null })), 2000)
      void refetchInstances()
      void refetchIntegrations()
    }
  }

  // Computed values
  const instances = instancesData?.instances ?? []
  const maxInstances = integration.maxInstances ?? 5
  const currentInstances = integration.currentInstances ?? instances.length
  const canCreateMore = currentInstances < maxInstances
  const remainingInstances = maxInstances - currentInstances

  return {
    state,
    actions,
    instances,
    maxInstances,
    currentInstances,
    canCreateMore,
    remainingInstances,
    mutations: {
      createInstance: createInstanceMutation,
      connectInstance: connectInstanceMutation,
      disconnectInstance: disconnectInstanceMutation,
      deleteInstance: deleteInstanceMutation
    }
  }
}
