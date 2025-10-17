/**
 * Hook para cargar usuarios vendedores del cliente actual
 * Centraliza la query de usuarios para evitar duplicación
 */

import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { User } from "@/domain/Usuarios"
import type { UseSellerUsersReturn } from "../_types"

export function useSellerUsers(): UseSellerUsersReturn {
  const { clientId } = useClientContext()

  const { data: users = [], isLoading } = api.usuarios.getUsers.useQuery(
    { clientId: clientId! },
    { 
      enabled: !!clientId,
      staleTime: 5 * 60 * 1000, // 5 minutos - los usuarios no cambian frecuentemente
    }
  )

  return {
    users: users as Array<Pick<User, 'id' | 'name' | 'email'>>,
    isLoading,
  }
}

