/**
 * Columna de oportunidades sin asignar
 * Muestra las oportunidades que no tienen etapa asignada
 */

"use client"

import { Droppable, Draggable } from "@hello-pangea/dnd"
import { Card } from "@/components/ui"
import { DollarSign } from "lucide-react"
import { OpportunityCard } from "../../opportunity-management/opportunity-card"
import { formatCurrency, convertRemToPixels } from "../../../_utils"
import type { UnassignedColumnProps } from "../../../_types"

export function UnassignedColumn({
  opportunities,
  totalAmount,
  headerHeightRem,
  disableDrop = true
}: UnassignedColumnProps) {
  const headerHeightPx = convertRemToPixels(headerHeightRem)

  return (
    <div className="flex flex-col min-w-0">
      <div
        className="w-full h-1 rounded-t-2xl mb-[1rem]"
        style={{ backgroundColor: "#e5e7eb" }}
        aria-hidden="true"
      />
      <Card className="rounded-2xl shadow-sm border-0 bg-white mb-4 p-4">
        <div
          className="flex flex-col justify-between"
          style={{ height: `${headerHeightPx}px` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-sm font-medium">Nueva Oportunidad</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">{opportunities.length}</span>
              {totalAmount > 0 && (
                <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(totalAmount)}
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 min-h-4" />
        </div>
      </Card>
      <Droppable droppableId="unassigned" isDropDisabled={disableDrop}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 space-y-3 p-2 rounded-xl bg-gray-50 overflow-y-auto"
          >
            {opportunities.map((opportunity, index) => (
              <Draggable key={opportunity.id} draggableId={String(opportunity.id)} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <OpportunityCard
                      opportunity={opportunity}
                      columnColor="#e5e7eb"
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

