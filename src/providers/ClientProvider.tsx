"use client"

import { createContext, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useClientStore } from '@/store/client-store'

interface ClientContextType {
  clientId: string | null
  isAureliaUser: boolean
  isLoading: boolean
  error: string | null
  setClientId?: (clientId: string | null) => void // Solo para AURELIA
  clearClientId?: () => void // Solo para AURELIA
}

const ClientContext = createContext<ClientContextType | null>(null)

interface ClientProviderProps {
  children: ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  const { data: session, status } = useSession()
  const {
    selectedClientId,
    setSelectedClientId,
    clearSelectedClient,
    isHydrated,
    isInitialized,
    markAsInitialized
  } = useClientStore()

  // ✅ OPTIMIZACIÓN: Memoizar funciones del store para evitar cambios de referencia
  const stableActions = useMemo(
    () => ({
      setClientId: setSelectedClientId,
      clearClientId: clearSelectedClient
    }),
    [setSelectedClientId, clearSelectedClient]
  )

  // Efecto para sincronizar el store con la sesión
  useEffect(() => {
    // Solo proceder si el store está hidratado y la sesión está lista
    if (!isHydrated || status === 'loading') {
      return
    }

    // ✅ OPTIMIZACIÓN: Usar isInitialized del store (eliminar estado local redundante)
    if (isInitialized) {
      return
    }

    const isAureliaUser = session?.user?.type === 'AURELIA'
    const sessionClientId = session?.user?.clientId

    if (isAureliaUser) {
      // Para usuarios AURELIA: usar el store persistido o el de la sesión
      if (!selectedClientId && sessionClientId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 ClientProvider: Initializing AURELIA user with session clientId:', sessionClientId)
        }
        setSelectedClientId(sessionClientId)
      } else if (selectedClientId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 ClientProvider: Using persisted clientId for AURELIA user:', selectedClientId)
        }
      }
    } else {
      // Para usuarios no-AURELIA: siempre usar el de la sesión
      if (sessionClientId && selectedClientId !== sessionClientId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 ClientProvider: Syncing non-AURELIA user with session clientId:', sessionClientId)
        }
        setSelectedClientId(sessionClientId)
      }
    }

    // ✅ OPTIMIZACIÓN: Solo marcar una vez en el store
    markAsInitialized()
  }, [
    isHydrated, 
    status, 
    isInitialized,
    session?.user?.type, 
    session?.user?.clientId, 
    selectedClientId,
    setSelectedClientId,
    markAsInitialized
  ])

  // ✅ OPTIMIZACIÓN: Memoizar el valor derivado con dependencias precisas
  const { clientId, isAureliaUser, isLoading, error } = useMemo(() => {
    // Si la sesión está cargando o el store no está hidratado, mostrar loading
    if (status === 'loading' || !isHydrated) {
      return {
        clientId: null,
        isAureliaUser: false,
        isLoading: true,
        error: null
      }
    }

    // Si no hay sesión, error
    if (!session?.user) {
      return {
        clientId: null,
        isAureliaUser: false,
        isLoading: false,
        error: 'No hay sesión activa'
      }
    }

    const isAureliaUser = session.user.type === 'AURELIA'

    // Para usuarios AURELIA, usar el cliente seleccionado del store
    // Si no hay cliente seleccionado, usar el de la sesión
    let clientId: string | null = null

    if (isAureliaUser) {
      clientId = selectedClientId ?? session.user.clientId ?? null
    } else {
      clientId = session.user.clientId ?? null
    }

    // Validar que clientId sea un string válido si existe
    if (clientId && typeof clientId !== 'string') {
      return {
        clientId: null,
        isAureliaUser,
        isLoading: false,
        error: 'ClientId inválido'
      }
    }

    return {
      clientId,
      isAureliaUser,
      isLoading: false,
      error: clientId ? null : 'No hay cliente asignado'
    }
  }, [
    status,
    isHydrated,
    session?.user?.type,
    session?.user?.clientId,
    selectedClientId
  ])

  // ✅ OPTIMIZACIÓN: Context value con funciones estables memoizadas
  const contextValue: ClientContextType = useMemo(
    () => isAureliaUser
      ? { clientId, isAureliaUser, isLoading, error, ...stableActions }
      : { clientId, isAureliaUser, isLoading, error },
    [clientId, isAureliaUser, isLoading, error, stableActions]
  )

  return (
    <ClientContext.Provider value={contextValue}>
      {children}
    </ClientContext.Provider>
  )
}

/**
 * useClientContext: Hook para acceder al contexto de cliente.
 * - clientId: string | null (siempre null o string válido)
 * - isAureliaUser: boolean
 * - isLoading: boolean
 * - error: string | null
 * - setClientId: (clientId: string | null) => void (solo para AURELIA)
 * - clearClientId: () => void (solo para AURELIA)
 */
export function useClientContext() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider')
  }
  return context
} 