"use client"

import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"

export function useUsuariosListByClient() {
  const { clientId } = useClientContext()

  return api.usuarios.getUsers.useQuery(
    { clientId },
    { enabled: !!clientId }
  )
}

export function useCreateUsuario() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.usuarios.createUser.useMutation({
    onSuccess: () => {
      utils.usuarios.getUsers.invalidate({ clientId })
    }
  })
}

export function useUpdateUsuario() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.usuarios.updateUser.useMutation({
    onSuccess: () => {
      utils.usuarios.getUsers.invalidate({ clientId })
    }
  })
}

export function useDeleteUsuario() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.usuarios.deleteUser.useMutation({
    onSuccess: () => {
      utils.usuarios.getUsers.invalidate({ clientId })
    }
  })
}

