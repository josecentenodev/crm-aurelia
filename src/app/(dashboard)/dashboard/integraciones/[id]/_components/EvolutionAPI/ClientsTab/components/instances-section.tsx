"use client"

import { MessageSquare } from "lucide-react"
import { InstanceRow } from "./instance-row"
import type { UIInstance } from "../types"

interface Props {
  instances: UIInstance[]
  onDelete: (instanceName: string) => Promise<void> | void
  isDeleting?: boolean
}

export function InstancesSection({ instances, onDelete, isDeleting }: Props) {
  if (instances.length === 0) return null
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 flex items-center">
        <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
        Instancias Activas
      </h4>
      <div className="space-y-2">
        {instances.map((instance) => (
          <InstanceRow key={instance.id} instance={instance} onDelete={onDelete} isDeleting={isDeleting} />
        ))}
      </div>
    </div>
  )
}


