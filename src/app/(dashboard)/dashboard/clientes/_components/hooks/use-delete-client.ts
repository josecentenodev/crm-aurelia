"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface UseDeleteClientOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useDeleteClient(options?: UseDeleteClientOptions) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletionProgress, setDeletionProgress] = useState<{
    step: string
    progress: number
    isCompleted: boolean
    hasError: boolean
  }>({
    step: '',
    progress: 0,
    isCompleted: false,
    hasError: false
  })
  const { toast } = useToast()

  const deleteClientMutation = api.superadmin.deleteClientCompletely.useMutation({
    onSuccess: (data) => {
      toast({
        title: data.message,
        description: `Se eliminaron ${data.totalDeletedRecords} registros en total`,
        variant: "success"
      })
      
      setDeletionProgress({
        step: 'Completado',
        progress: 100,
        isCompleted: true,
        hasError: false
      })
      
      setIsDeleting(false)
      options?.onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar cliente",
        description: error.message,
        variant: "destructive"
      })
      
      setDeletionProgress(prev => ({
        ...prev,
        hasError: true,
        step: 'Error'
      }))
      
      setIsDeleting(false)
      options?.onError?.(error)
    }
  })

  const deleteClient = async (clientId: string) => {
    setIsDeleting(true)
    setDeletionProgress({
      step: 'Iniciando eliminación...',
      progress: 0,
      isCompleted: false,
      hasError: false
    })

    try {
      await deleteClientMutation.mutateAsync({ 
        clientId,
        confirmDeletion: true,
        backupBeforeDelete: false
      })
    } catch (error) {
      // Error ya manejado en onError
    }
  }

  const resetProgress = () => {
    setDeletionProgress({
      step: '',
      progress: 0,
      isCompleted: false,
      hasError: false
    })
  }

  return {
    deleteClient,
    isDeleting,
    deletionProgress,
    resetProgress,
    error: deleteClientMutation.error
  }
}
