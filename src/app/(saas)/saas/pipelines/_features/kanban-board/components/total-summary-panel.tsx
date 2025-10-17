/**
 * Panel de resumen de totales
 * Muestra el total general de todas las oportunidades
 */

"use client"

import { DollarSign } from "lucide-react"
import { formatCurrency } from "../../../_utils"
import type { TotalSummaryPanelProps } from "../../../_types"

export function TotalSummaryPanel({ totalAmount }: TotalSummaryPanelProps) {
  if (totalAmount <= 0) return null

  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Total General de Oportunidades</span>
        </div>
        <span className="text-lg font-bold text-blue-900">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  )
}

