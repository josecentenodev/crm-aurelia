/**
 * Columna de pipeline del kanban
 * Wrapper que combina header y contenido
 */

"use client"

import { ColumnHeader } from "./column-header"
import { ColumnContent } from "./column-content"
import { convertRemToPixels } from "../../../_utils"
import type { PipelineColumnProps } from "../../../_types"

export function PipelineColumn({
  column,
  opportunities,
  headerHeightRem
}: PipelineColumnProps) {
  const headerHeightPx = convertRemToPixels(headerHeightRem)

  return (
    <div className="flex flex-col min-w-0">
      <ColumnHeader
        column={column}
        count={opportunities.length}
        headerHeightPx={headerHeightPx}
        totalAmount={column.totalAmount}
      />
      <ColumnContent
        opportunities={opportunities}
        columnColor={column.color}
        columnId={column.id}
        columnName={column.name}
      />
    </div>
  )
}

