"use client"

import { useState, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { useClientStore } from "@/store/client-store"
import { api } from "@/trpc/react"
import { usePathname } from "next/navigation"

interface UseClientSelectionProps {
  enabled?: boolean
}

interface UseClientSelectionReturn {
  clients: Array<{ id: string; name: string; status: { name: string } }>
  selectedClientId: string | null
  isLocalSwitching: boolean
  isLoading: boolean
  handleClientChange: (clientId: string) => Promise<void>
  currentClient: { id: string; name: string; status: { name: string } } | undefined
}

export function useClientSelection({ enabled = true }: UseClientSelectionProps = {}): UseClientSelectionReturn {
  const { toast } = useToast()
  const { selectedClientId, setSelectedClientId } = useClientStore()
  const [isLocalSwitching, setIsLocalSwitching] = useState(false)
  const pathname = usePathname()
  const utils = api.useUtils()

  const { data: clients = [], isLoading } = api.usuarios.getAvailableClients.useQuery(undefined, {
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos - lista de clientes raramente cambia
    gcTime: 15 * 60 * 1000 // 15 minutos de cache
  })

  const handleClientChange = useCallback(async (clientId: string) => {
    if (clientId === selectedClientId) return
    
    setIsLocalSwitching(true)
    
    try {
      console.log('🔄 ClientSelector: Starting client switch to:', clientId)
      
      // 🚀 OPTIMIZACIÓN: Prefetch de datos críticos ANTES de cambiar el cliente
      // Esto mejora la percepción de velocidad al precargar datos
      const prefetchPromises = [
        // Siempre prefetch del cliente actual
        utils.clientes.getCurrent.prefetch({ id: clientId }),
      ]

      // Prefetch selectivo basado en la ruta actual
      if (pathname.includes('/contactos')) {
        prefetchPromises.push(utils.contactos.list.prefetch({ clientId }))
      } else if (pathname.includes('/agentes')) {
        prefetchPromises.push(utils.agentes.getAgentesByClient.prefetch({ clientId }))
      } else if (pathname.includes('/conversaciones')) {
        prefetchPromises.push(utils.conversaciones.list.prefetch({ clientId, filters: { groupByInstance: true } }))
      } else if (pathname.includes('/pipelines')) {
        prefetchPromises.push(utils.pipelines.boardData.prefetch({ clientId }))
      }

      // Ejecutar prefetch en paralelo (no esperamos que complete)
      Promise.all(prefetchPromises).catch(err => {
        console.warn('⚠️ Prefetch failed (non-critical):', err)
      })
      
      // Actualizar el store (esto dispara las queries que ya fueron prefetched)
      setSelectedClientId(clientId)
      
      const selectedClient = clients.find(client => client.id === clientId)
      toast({
        title: "Cliente cambiado",
        description: `Ahora estás trabajando con ${selectedClient?.name ?? 'el cliente seleccionado'}`,
      })
      
      console.log('✅ ClientSelector: Client switch successful')
    } catch (error) {
      console.error('❌ ClientSelector: Error switching client:', error)
      toast({
        title: "Error",
        description: "Error al cambiar de cliente",
        variant: "destructive"
      })
    } finally {
      setIsLocalSwitching(false)
    }
  }, [selectedClientId, clients, setSelectedClientId, toast, pathname, utils])

  const currentClient = useMemo(() => 
    clients.find(client => client.id === selectedClientId),
    [clients, selectedClientId]
  )

  return {
    clients,
    selectedClientId,
    isLocalSwitching,
    isLoading,
    handleClientChange,
    currentClient
  }
}
