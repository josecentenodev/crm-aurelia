"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api } from "@/trpc/react"
import type { User } from "@prisma/client"
import { useClientContext } from "./ClientProvider"
import { Logger } from "@/lib/utils/client-utils"

interface UsuariosContextType {
  users: User[]
  isLoading: boolean
  error: string | null
  stats: {
    total: number
    active: number
    inactive: number
    admins: number
    customers: number
  } | null
  refetch: () => Promise<void>
  createUser: (data: CreateUserData) => Promise<User>
  updateUser: (id: string, data: UpdateUserData) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  toggleUserStatus: (id: string) => Promise<void>
}

interface CreateUserData {
  email: string
  name: string
  role: "ADMIN" | "CUSTOMER"
  password: string
}

interface UpdateUserData {
  email?: string
  name?: string
  role?: "ADMIN" | "CUSTOMER"
  isActive?: boolean
}

const UsuariosContext = createContext<UsuariosContextType | undefined>(undefined)

export function UsuariosProvider({ children }: { children: React.ReactNode }) {
  const { clientId } = useClientContext()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<UsuariosContextType['stats']>(null)

  // Queries
  const { data: usersData, refetch: refetchUsers } = api.usuarios.getUsers.useQuery(
    { clientId },
    { 
      enabled: !!clientId,
      refetchOnWindowFocus: false
    }
  )

  const { data: statsData } = api.usuarios.getUserStats.useQuery(
    { clientId },
    { 
      enabled: !!clientId,
      refetchOnWindowFocus: false
    }
  )

  // Mutations
  const createUserMutation = api.usuarios.createUser.useMutation()
  const updateUserMutation = api.usuarios.updateUser.useMutation()
  const deleteUserMutation = api.usuarios.deleteUser.useMutation()
  const toggleStatusMutation = api.usuarios.toggleUserStatus.useMutation()

  // Update local state when data changes
  useEffect(() => {
    if (usersData) {
      setUsers(usersData)
      Logger.log('Users data updated', { count: usersData.length })
    }
  }, [usersData])

  useEffect(() => {
    if (statsData) {
      setStats(statsData)
      Logger.log('User stats updated', statsData)
    }
  }, [statsData])

  const refetch = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      await refetchUsers()
      Logger.log('Users refetched successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuarios'
      setError(errorMessage)
      Logger.error('Error refetching users', err)
    } finally {
      setIsLoading(false)
    }
  }, [refetchUsers])

  const createUser = useCallback(async (data: CreateUserData): Promise<User> => {
    try {
      const newUser = await createUserMutation.mutateAsync({
        ...data,
        clientId
      })
      
      setUsers(prev => [...prev, newUser])
      Logger.log('User created successfully', { userId: newUser.id })
      
      return newUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario'
      setError(errorMessage)
      Logger.error('Error creating user', err)
      throw err
    }
  }, [createUserMutation, clientId])

  const updateUser = useCallback(async (id: string, data: UpdateUserData): Promise<User> => {
    try {
      const updatedUser = await updateUserMutation.mutateAsync({
        id,
        ...data
      })
      
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ))
      Logger.log('User updated successfully', { userId: id })
      
      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario'
      setError(errorMessage)
      Logger.error('Error updating user', err)
      throw err
    }
  }, [updateUserMutation])

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteUserMutation.mutateAsync({ id })
      
      setUsers(prev => prev.filter(user => user.id !== id))
      Logger.log('User deleted successfully', { userId: id })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario'
      setError(errorMessage)
      Logger.error('Error deleting user', err)
      throw err
    }
  }, [deleteUserMutation])

  const toggleUserStatus = useCallback(async (id: string): Promise<void> => {
    try {
      await toggleStatusMutation.mutateAsync({ id })
      
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, active: !user.active } : user
      ))
      Logger.log('User status toggled successfully', { userId: id })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado del usuario'
      setError(errorMessage)
      Logger.error('Error toggling user status', err)
      throw err
    }
  }, [toggleStatusMutation])

  const value: UsuariosContextType = {
    users,
    isLoading: isLoading || createUserMutation.isLoading || updateUserMutation.isLoading || deleteUserMutation.isLoading || toggleStatusMutation.isLoading,
    error,
    stats,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  }

  return (
    <UsuariosContext.Provider value={value}>
      {children}
    </UsuariosContext.Provider>
  )
}

export function useUsuariosContext(): UsuariosContextType {
  const context = useContext(UsuariosContext)
  if (context === undefined) {
    throw new Error('useUsuariosContext must be used within a UsuariosProvider')
  }
  return context
} 