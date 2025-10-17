"use client"

import { useCallback } from "react"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"

export function useClient() {
  const { clientId } = useClientContext()

  const { data: client, isLoading, error, refetch } = api.clientes.getById.useQuery(
    { id: clientId! },
    { enabled: !!clientId }
  )

  const updateClient = api.clientes.updateClient.useMutation()
  const deleteClient = api.clientes.deleteClient.useMutation()

  const handleUpdateClient = useCallback(async (data: {
    name?: string
    email?: string
    description?: string
    planId?: string
  }) => {
    if (!clientId) throw new Error("No client ID")
    
    return await updateClient.mutateAsync({
      id: clientId,
      ...data
    })
  }, [clientId, updateClient])

  const handleDeleteClient = useCallback(async () => {
    if (!clientId) throw new Error("No client ID")
    
    return await deleteClient.mutateAsync({ id: clientId })
  }, [clientId, deleteClient])

  return {
    client,
    isLoading,
    error,
    refetch,
    updateClient: handleUpdateClient,
    deleteClient: handleDeleteClient,
    isUpdating: updateClient.isLoading,
    isDeleting: deleteClient.isLoading
  }
}

