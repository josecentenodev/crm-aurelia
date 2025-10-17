/**
 * Componente de filtro de fecha para conversaciones
 * Permite seleccionar rangos predefinidos: hoy, semana, mes, trimestre, año
 */

"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Calendar } from "lucide-react"
import { useChatsFiltersStore } from "../../../_store/chats-filters-store"

export function DateFilterSelect() {
  const { dateFilter, setDateFilter } = useChatsFiltersStore()

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger className="w-32 rounded-xl border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoy</SelectItem>
          <SelectItem value="week">Esta semana</SelectItem>
          <SelectItem value="month">Este mes</SelectItem>
          <SelectItem value="quarter">Este trimestre</SelectItem>
          <SelectItem value="year">Este año</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

