/**
 * Header de columna del kanban
 * Muestra el nombre, color y estadísticas de la columna
 */

"use client"

import { Card, Badge } from "@/components/ui"
import { MoreVertical } from "lucide-react"
import { formatCurrency } from "../../../_utils"
import type { ColumnHeaderProps } from "../../../_types"

export function ColumnHeader({ column, count, headerHeightPx: _headerHeightPx, totalAmount }: ColumnHeaderProps) {
  return (
    <>
      <div
        className="w-full h-1 rounded-t-2xl mb-[1rem]"
        style={{ backgroundColor: column.color }}
        aria-hidden="true"
      />
      <Card className="rounded-2xl shadow-sm border-0 bg-white mb-4 p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }}></div>
            <span className="font-medium text-gray-900">{column.name}</span>
            <Badge 
              variant="secondary" 
              style={{ backgroundColor: column.color, color: 'white' }}
            >
              {count}
            </Badge>
          </div>
          {false && <button 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Opciones de columna"
          >
            <MoreVertical className="w-5 h-5" />
          </button>}
        </div>
        {totalAmount && totalAmount > 0 && (
          <div className="text-2xl font-semibold text-gray-900">
            {formatCurrency(totalAmount)}
          </div>
        )}
      </Card>
    </>
  )
}

