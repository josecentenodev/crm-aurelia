/**
 * Panel de personalización del board
 * Permite ajustar el ancho de columnas y altura de headers
 */

"use client"

import { Card } from "@/components/ui"
import { Button, Slider, Separator } from "@/components/ui"
import { Plus, ZoomIn, ZoomOut, Minus, Palette, X } from "lucide-react"
import type { BoardCustomizationProps } from "../../_types"

export function BoardCustomizationPanel({
  colWidth,
  headerHeight,
  onColWidthChange,
  onHeaderHeightChange,
  onClose
}: BoardCustomizationProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Personalización del Board</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ZoomOut className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Ancho de columna</span>
            <ZoomIn className="w-4 h-4 text-gray-500" />
          </div>
          <Slider
            min={12}
            max={28}
            step={2}
            value={[colWidth]}
            className="w-32"
            onValueChange={(v) => onColWidthChange(v[0]!)}
          />
          <span className="text-sm text-gray-600 min-w-[3rem]">{colWidth}rem</span>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Altura header</span>
            <Plus className="w-4 h-4 text-gray-500" />
          </div>
          <Slider
            min={4}
            max={8}
            step={0.5}
            value={[headerHeight]}
            className="w-32"
            onValueChange={(v) => onHeaderHeightChange(v[0]!)}
          />
          <span className="text-sm text-gray-600 min-w-[3rem]">{headerHeight}rem</span>
        </div>
      </div>
    </Card>
  )
}

