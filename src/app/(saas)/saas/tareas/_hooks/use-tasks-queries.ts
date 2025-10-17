"use client"

import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import type { CrmTaskFilters } from "@/domain/Tareas"

export function useTasksList(filters?: CrmTaskFilters) {
  const { clientId } = useClientContext()

  return api.tareas.list.useQuery(
    { clientId, filters },
    { enabled: !!clientId }
  )
}

export function useMyTasks() {
  return api.tareas.myTasks.useQuery(
    { filters: {} }
  )
}

export function useTaskById(id: string) {
  const { clientId } = useClientContext()

  return api.tareas.byId.useQuery(
    { id, clientId },
    { enabled: !!clientId && !!id }
  )
}

export function useTasksStats() {
  const { clientId } = useClientContext()

  return api.tareas.stats.useQuery(
    { clientId },
    { enabled: !!clientId }
  )
}

export function useCreateTask() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.tareas.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.tareas.list.invalidate(),
        utils.tareas.myTasks.invalidate(),
        utils.tareas.stats.invalidate()
      ])
    }
  })
}

export function useUpdateTask() {
  const utils = api.useUtils()

  return api.tareas.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.tareas.list.invalidate(),
        utils.tareas.myTasks.invalidate(),
        utils.tareas.stats.invalidate(),
        utils.tareas.byId.invalidate()
      ])
    }
  })
}

export function useDeleteTask() {
  const utils = api.useUtils()
  const { clientId } = useClientContext()

  return api.tareas.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.tareas.list.invalidate({ clientId: clientId! }),
        utils.tareas.myTasks.invalidate(),
        utils.tareas.stats.invalidate()
      ])
    }
  })
}
