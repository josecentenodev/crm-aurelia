/**
 * Filtros de categorías para conversaciones
 * Muestra botones con iconos y badges de conteo
 * Componente presentacional - lógica de conteo viene desde el padre
 */

"use client"

import { Button, Badge } from "@/components/ui"
import type { LucideIcon } from "lucide-react"
import type { ConversationCategory } from '../../../_types/conversations.types'

export interface CategoryFilter {
  id: ConversationCategory
  label: string
  icon: LucideIcon
  count: number
}

interface ConversationsFiltersProps {
  categories: CategoryFilter[]
  selectedCategory: ConversationCategory
  onSelectCategory: (category: ConversationCategory) => void
}

export function ConversationsFilters({
  categories,
  selectedCategory,
  onSelectCategory
}: ConversationsFiltersProps) {
  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const Icon = category.icon
        const isSelected = selectedCategory === category.id

        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "ghost"}
            className={`w-full justify-start rounded-xl ${
              isSelected
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <Icon className="w-4 h-4 mr-3" />
            <span className="flex-1 text-left">{category.label}</span>
            {category.count > 0 && (
              <Badge
                variant={isSelected ? "secondary" : "outline"}
                className={`ml-2 ${
                  isSelected
                    ? "bg-white text-purple-600 border-white"
                    : "bg-gray-100 text-gray-600 border-gray-300"
                }`}
              >
                {category.count}
              </Badge>
            )}
          </Button>
        )
      })}
    </div>
  )
}

