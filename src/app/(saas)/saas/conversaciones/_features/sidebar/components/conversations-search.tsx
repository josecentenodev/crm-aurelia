/**
 * Input de búsqueda para conversaciones
 * Componente controlado - recibe value y onChange desde el padre
 */

"use client"

import { Input } from "@/components/ui"
import { Search } from "lucide-react"

interface ConversationsSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ConversationsSearch({ 
  value, 
  onChange,
  placeholder = "Buscar chats..."
}: ConversationsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 rounded-xl border-gray-300 focus:border-violet-500 focus:ring-violet-500"
      />
    </div>
  )
}

