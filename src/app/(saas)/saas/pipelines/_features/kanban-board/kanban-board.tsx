/**
 * Componente principal del Kanban Board
 * Orquesta la visualización del tablero con drag & drop
 */

"use client"

import { DragDropContext } from "@hello-pangea/dnd"
import { TotalSummaryPanel } from "./components/total-summary-panel"
import { UnassignedColumn } from "./components/unassigned-column"
import { PipelineColumn } from "./components/pipeline-column"
import { useKanbanTotals } from "../../_hooks"
import { convertRemToPixels } from "../../_utils"
import type { KanbanBoardProps } from "../../_types"

export function KanbanBoard(props: KanbanBoardProps) {
  const {
    unassigned,
    columns,
    opportunitiesByStage,
    onDragEnd,
    disableUnassignedDrop = true,
    colWidthRem = 24,
    headerHeightRem = 4
  } = props

  const { totalGeneral, unassignedTotal } = useKanbanTotals(unassigned, columns)
  const colWidthPx = convertRemToPixels(colWidthRem)

  // Contenido común del kanban
  const kanbanContent = (
    <>
      <TotalSummaryPanel totalAmount={totalGeneral} />
      <div
        className="grid grid-flow-col gap-6 h-full overflow-x-auto pr-2"
        style={{ gridAutoColumns: `${colWidthPx}px` }}
      >
        <UnassignedColumn
          opportunities={unassigned}
          totalAmount={unassignedTotal}
          headerHeightRem={headerHeightRem}
          disableDrop={disableUnassignedDrop}
        />

        {columns.map((column) => (
          <PipelineColumn
            key={column.id}
            column={column}
            opportunities={opportunitiesByStage[column.id] ?? []}
            headerHeightRem={headerHeightRem}
          />
        ))}
      </div>
    </>
  )

  // Si no hay onDragEnd, renderizar sin DragDropContext (modo solo lectura)
  if (!onDragEnd) {
    return (
      <div className="kanban-board-readonly">
        {kanbanContent}
      </div>
    )
  }

  // Si hay onDragEnd, renderizar con DragDropContext (modo interactivo)
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {kanbanContent}
    </DragDropContext>
  )
}

