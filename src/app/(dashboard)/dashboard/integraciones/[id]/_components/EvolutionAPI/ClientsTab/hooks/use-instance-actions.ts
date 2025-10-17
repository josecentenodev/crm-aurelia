"use client"

import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import type { UIInstance } from "../types"

export function useInstanceActions(refetch: () => Promise<unknown>) {
  const { toast } = useToast()

  const createInstance = api.integraciones.createWhatsAppInstance.useMutation({
    onSuccess: async (result) => {
      if (result.webhookConfigured) {
        toast({ 
          title: "Instancia creada", 
          description: "Se creó la instancia y se configuró el webhook automáticamente" 
        })
      } else {
        toast({ 
          title: "Instancia creada", 
          description: `Se creó la instancia. ${result.webhookError ? 'Error configurando webhook: ' + result.webhookError : 'Webhook no configurado'}`,
          variant: result.webhookError ? "destructive" : "default"
        })
      }
      await refetch()
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  const deleteInstance = api.integraciones.deleteWhatsAppInstance.useMutation({
    onSuccess: async () => {
      toast({ title: "Instancia eliminada", description: "Se eliminó correctamente" })
      await refetch()
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  async function create(clientId: string, instanceName: string): Promise<UIInstance> {
    const result = await createInstance.mutateAsync({ clientId, instanceName })
    // Mapear a UIInstance
    return {
      id: result.id,
      instanceName: result.instanceName,
      status: result.status as UIInstance["status"],
      lastConnected: result.lastConnected ?? null,
      phoneNumber: null, // No se asigna hasta conectar
      qrCode: result.qrCode ?? null,
    }
  }

  async function remove(clientId: string, instanceName: string) {
    await deleteInstance.mutateAsync({ clientId, instanceName })
  }

  return { create, remove, createInstance, deleteInstance }
}


