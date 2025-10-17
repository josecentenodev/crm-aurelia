/**
 * Selector de vendedor asignado a una oportunidad
 * Permite cambiar el vendedor asignado con actualización inmediata
 */

"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui"
import { api } from "@/trpc/react"
import { useClientContext } from "@/providers/ClientProvider"
import { useSellerUsers } from "../../../_hooks"
import type { SellerSelectorProps } from "../../../_types"

export function SellerSelector({ opportunityId, currentUserId }: SellerSelectorProps) {
  const { clientId } = useClientContext()
  const utils = api.useUtils()
  const { users } = useSellerUsers()

  const update = api.oportunidades.update.useMutation({
    onSuccess: async () => {
      if (clientId) {
        await utils.pipelines.boardData.invalidate({ clientId })
      }
    }
  })

  const handleChange = (val: string) => {
    const nextId = val === "__unassigned__" ? null : val
    if (nextId === (currentUserId ?? null)) return
    
    update.mutate({ id: opportunityId, assignedUserId: nextId })
  }

  return (
    <Select 
      value={currentUserId ?? "__unassigned__"} 
      onValueChange={handleChange}
      disabled={update.isPending}
    >
      <SelectTrigger className="h-6 px-2 text-xs" aria-label="Vendedor asignado">
        <SelectValue placeholder="Seleccionar" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__unassigned__">Sin asignar</SelectItem>
        {users.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.name ?? u.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

