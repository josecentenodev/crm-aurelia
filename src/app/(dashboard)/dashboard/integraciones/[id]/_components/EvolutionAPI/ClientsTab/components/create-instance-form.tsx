"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"

interface Props {
  onCreate: (instanceName: string) => Promise<void> | void
  isLoading?: boolean
}

export function CreateInstanceForm({ onCreate, isLoading }: Props) {
  const [name, setName] = useState("")

  async function handleCreate() {
    if (!name.trim()) return
    await onCreate(name.trim())
    setName("")
  }

  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Nombre de la instancia (ej: ventas)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Button onClick={handleCreate} disabled={isLoading || !name.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Crear
      </Button>
    </div>
  )
}


