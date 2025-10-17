import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import type { InstanceCreateFormData } from "../types"

export function useInstancesMutations() {
  const { clientId } = useClientContext()
  const { toast } = useToast()
  const utils = api.useUtils()

  const invalidateInstances = async () => {
    if (clientId) {
      await utils.instances.listByClient.invalidate({ clientId })
    }
  }

  // Crear instancia
  const createInstance = api.instances.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia creada",
        description: "La instancia ha sido creada correctamente",
      })
      invalidateInstances()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Conectar instancia
  const connectInstance = api.instances.connect.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia conectada",
        description: "Se ha generado el código QR para conectar la instancia",
      })
      invalidateInstances()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Desconectar instancia
  const disconnectInstance = api.instances.disconnect.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia desconectada",
        description: "La instancia ha sido desconectada correctamente",
      })
      invalidateInstances()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Eliminar instancia
  const deleteInstance = api.instances.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Instancia eliminada",
        description: "La instancia ha sido eliminada correctamente",
      })
      invalidateInstances()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Handlers
  const handleCreateInstance = async (
    data: InstanceCreateFormData,
    integrationId?: string
  ) => {
    if (!clientId) return

    await createInstance.mutateAsync({
      clientId,
      integrationId: integrationId!,
      instanceName: data.instanceName,
      phoneNumber: data.phoneNumber || undefined,
      config: {
        description: data.description || undefined
      }
    })
  }

  const handleConnectInstance = async (instanceId: string) => {
    await connectInstance.mutateAsync(instanceId)
  }

  const handleDisconnectInstance = async (instanceId: string) => {
    await disconnectInstance.mutateAsync(instanceId)
  }

  const handleDeleteInstance = async (instanceId: string) => {
    await deleteInstance.mutateAsync(instanceId)
  }

  return {
    createInstance: {
      mutate: handleCreateInstance,
      isLoading: createInstance.isLoading,
      status: createInstance.status
    },
    connectInstance: {
      mutate: handleConnectInstance,
      isLoading: connectInstance.isLoading,
      status: connectInstance.status
    },
    disconnectInstance: {
      mutate: handleDisconnectInstance,
      isLoading: disconnectInstance.isLoading,
      status: disconnectInstance.status
    },
    deleteInstance: {
      mutate: handleDeleteInstance,
      isLoading: deleteInstance.isLoading,
      status: deleteInstance.status
    },
    invalidateInstances
  }
}
