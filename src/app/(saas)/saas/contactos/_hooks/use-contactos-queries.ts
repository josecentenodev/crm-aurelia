"use client"

import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"

export function useContactosList() {
  const { clientId } = useClientContext()

  return api.contactos.list.useQuery(
    { clientId },
    { enabled: !!clientId }
  )
}

export function useCreateContacto() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.contactos.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.contactos.list.invalidate(),
        utils.contactos.stats.invalidate()
      ])
    }
  })
}

export function useUpdateContacto() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.contactos.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.contactos.list.invalidate(),
        utils.contactos.stats.invalidate()
      ])
    }
  })
}

export function useDeleteContacto() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.contactos.delete.useMutation({
    onSuccess: () => {
      utils.contactos.list.invalidate({ clientId })
    }
  })
}

