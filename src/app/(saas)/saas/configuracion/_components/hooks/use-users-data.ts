import { useMemo } from "react"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { UserData, RoleData, UsersTabFilters } from "../types"

export function useUsersData(filters: UsersTabFilters) {
  const { clientId, isLoading: isClientLoading } = useClientContext()

  const { 
    data: usersData, 
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers 
  } = api.usuarios.listByClient.useQuery({
    clientId: clientId!,
    search: filters.search || undefined,
    type: filters.typeFilter === "all" ? undefined : filters.typeFilter as "ADMIN" | "CUSTOMER" | undefined,
    active: filters.activeFilter === "all" ? undefined : filters.activeFilter === "true",
    limit: 50
  }, {
    enabled: !!clientId && !isClientLoading
  })

  const { 
    data: roles = [], 
    isLoading: isRolesLoading,
    refetch: refetchRoles 
  } = api.permisos.listRoles.useQuery({ 
    clientId: clientId! 
  }, {
    enabled: !!clientId
  })

  const isLoading = isClientLoading || isUsersLoading || isRolesLoading

  const users = useMemo((): UserData[] => {
    return usersData?.users ?? []
  }, [usersData?.users])

  const activeUsers = useMemo((): UserData[] => {
    return users.filter(user => user.active)
  }, [users])

  const inactiveUsers = useMemo((): UserData[] => {
    return users.filter(user => !user.active)
  }, [users])

  const adminUsers = useMemo((): UserData[] => {
    return users.filter(user => user.type === "ADMIN")
  }, [users])

  const customerUsers = useMemo((): UserData[] => {
    return users.filter(user => user.type === "CUSTOMER")
  }, [users])

  const usersByRole = useMemo(() => {
    const grouped: Record<string, UserData[]> = {}
    users.forEach(user => {
      // TODO: Implementar agrupación por rol cuando esté disponible
      const roleKey = user.type
      if (!grouped[roleKey]) {
        grouped[roleKey] = []
      }
      grouped[roleKey].push(user)
    })
    return grouped
  }, [users])

  const filteredUsers = useMemo((): UserData[] => {
    let filtered = users

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.typeFilter !== "all") {
      filtered = filtered.filter(user => user.type === filters.typeFilter)
    }

    if (filters.activeFilter !== "all") {
      const isActive = filters.activeFilter === "true"
      filtered = filtered.filter(user => user.active === isActive)
    }

    return filtered
  }, [users, filters])

  const handleRefresh = async () => {
    await Promise.all([
      refetchUsers(),
      refetchRoles()
    ])
  }

  return {
    users,
    activeUsers,
    inactiveUsers,
    adminUsers,
    customerUsers,
    usersByRole,
    filteredUsers,
    roles: roles as RoleData[],
    isLoading,
    error: usersError,
    clientId,
    handleRefresh,
    refetch: handleRefresh // Alias para compatibilidad
  }
}
