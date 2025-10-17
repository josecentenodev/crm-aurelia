/**
 * Contenido de columna del kanban
 * Renderiza las oportunidades dentro de una columna con drag & drop
 */

"use client"

import { Droppable, Draggable } from "@hello-pangea/dnd"
import { OpportunityCard } from "../../opportunity-management/opportunity-card"
import type { ColumnContentProps } from "../../../_types"

export function ColumnContent({
  opportunities,
  columnColor,
  columnId,
  columnName
}: ColumnContentProps) {
  return (
    <Droppable droppableId={columnId}>
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
                    columnColor={columnColor}
                    columnName={columnName}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

