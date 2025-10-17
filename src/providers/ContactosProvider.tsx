"use client"

import { api } from '@/trpc/react'
import { useClientContext } from './ClientProvider'
import type { Contact, CreateContact, UpdateContact, ContactFilters } from '@/domain/Contactos'

export function useContactosProvider(filters?: ContactFilters) {
  const { clientId, isAureliaUser, isLoading, error } = useClientContext()

  // Query para obtener contactos - usar enabled para controlar ejecución
  const contactosQuery = api.contactos.list.useQuery(
    { clientId: clientId!, filters },
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  )

  // Query para obtener estadísticas - usar enabled para controlar ejecución
  const statsQuery = api.contactos.stats.useQuery(
    { clientId: clientId! },
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  )

  // Mutation para crear contacto
  const createContactoMutation = api.contactos.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.contactos.list.invalidate(),
        utils.contactos.stats.invalidate()
      ])
    }
  })

  // Mutation para actualizar contacto
  const updateContactoMutation = api.contactos.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.contactos.list.invalidate(),
        utils.contactos.stats.invalidate()
      ])
    }
  })

  // Mutation para eliminar contacto
  const deleteContactoMutation = api.contactos.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.contactos.list.invalidate(),
        utils.contactos.stats.invalidate()
      ])
    }
  })

  // Utils para invalidar queries
  const utils = api.useUtils()

  // Función para invalidar queries de contactos
  const invalidateContactos = async () => {
    await Promise.all([
      utils.contactos.list.invalidate(),
      utils.contactos.stats.invalidate()
    ])
  }

  // Función para invalidar todo
  const invalidateAll = async () => {
    await Promise.all([
      utils.contactos.list.invalidate(),
      utils.contactos.stats.invalidate()
    ])
  }

  const isLoadingData = isLoading ?? contactosQuery.isLoading ?? statsQuery.isLoading
  const hasError = error ?? contactosQuery.error ?? statsQuery.error

  // Mutation para crear contacto
  const createContacto = async (data: CreateContact) => {
    if (!clientId) throw new Error('ClientId is required')
    return createContactoMutation.mutateAsync({ ...data, clientId })
  }
  // Mutation para actualizar contacto
  const updateContacto = async (data: UpdateContact & { id: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    return updateContactoMutation.mutateAsync({ ...data, clientId })
  }
  // Mutation para eliminar contacto
  const deleteContacto = async (data: { id: string }) => {
    if (!clientId) throw new Error('ClientId is required')
    return deleteContactoMutation.mutateAsync({ ...data, clientId })
  }

  return {
    // Estado
    clientId,
    isAureliaUser,
    isLoading: isLoadingData,
    error: hasError,

    // Datos
    contactos: contactosQuery.data ?? [],
    stats: statsQuery.data,

    // Mutations
    createContacto,
    updateContacto,
    deleteContacto,

    // Estados de mutations
    isCreatingContacto: createContactoMutation.isPending,
    isUpdatingContacto: updateContactoMutation.isPending,
    isDeletingContacto: deleteContactoMutation.isPending,

    // Funciones de invalidación
    invalidateContactos,
    invalidateAll,

    // Errores de mutations
    createContactoError: createContactoMutation.error,
    updateContactoError: updateContactoMutation.error,
    deleteContactoError: deleteContactoMutation.error,
  }
} 