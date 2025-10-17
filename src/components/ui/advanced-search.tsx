"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
}

export interface SearchFilter {
  id: string
  label: string
  type: "text" | "select" | "checkbox" | "date"
  options?: FilterOption[]
  placeholder?: string
  multiple?: boolean
}

interface AdvancedSearchProps {
  placeholder?: string
  filters?: SearchFilter[]
  onSearch: (query: string, activeFilters: Record<string, any>) => void
  onClear?: () => void
  className?: string
  debounceMs?: number
}

export function AdvancedSearch({
  placeholder = "Buscar...",
  filters = [],
  onSearch,
  onClear,
  className = "",
  debounceMs = 300
}: AdvancedSearchProps) {
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Trigger search when query or filters change
  useEffect(() => {
    onSearch(debouncedQuery, activeFilters)
  }, [debouncedQuery, activeFilters, onSearch])

  const handleFilterChange = useCallback((filterId: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }))
  }, [])

  const handleFilterRemove = useCallback((filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[filterId]
      return newFilters
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setQuery("")
    setActiveFilters({})
    onClear?.()
  }, [onClear])

  const getActiveFiltersCount = () => {
    return Object.keys(activeFilters).filter(key => {
      const value = activeFilters[key]
      return value !== undefined && value !== null && value !== ""
    }).length
  }

  const renderFilterInput = (filter: SearchFilter) => {
    switch (filter.type) {
      case "text":
        return (
          <Input
            placeholder={filter.placeholder || `Buscar en ${filter.label.toLowerCase()}...`}
            value={activeFilters[filter.id] || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full"
          />
        )

      case "select":
        return (
          <Select
            value={activeFilters[filter.id] || ""}
            onValueChange={(value) => handleFilterChange(filter.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Seleccionar ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  {option.count && (
                    <Badge variant="secondary" className="ml-2">
                      {option.count}
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filter.id}-${option.value}`}
                  checked={
                    Array.isArray(activeFilters[filter.id])
                      ? activeFilters[filter.id]?.includes(option.value)
                      : false
                  }
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(activeFilters[filter.id])
                      ? activeFilters[filter.id] || []
                      : []
                    
                    if (checked) {
                      handleFilterChange(filter.id, [...currentValues, option.value])
                    } else {
                      handleFilterChange(
                        filter.id,
                        currentValues.filter((v: string) => v !== option.value)
                      )
                    }
                  }}
                />
                <Label htmlFor={`${filter.id}-${option.value}`} className="text-sm">
                  {option.label}
                  {option.count && (
                    <Badge variant="secondary" className="ml-2">
                      {option.count}
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </div>
        )

      case "date":
        return (
          <Input
            type="date"
            value={activeFilters[filter.id] || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Filters Toggle */}
        {filters.length > 0 && (
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtros</h4>
                  {getActiveFiltersCount() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-xs"
                    >
                      Limpiar todo
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.id} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {filter.label}
                      </Label>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear All */}
        {(query || getActiveFiltersCount() > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null

            const filter = filters.find(f => f.id === filterId)
            if (!filter) return null

            const getFilterLabel = () => {
              if (Array.isArray(value)) {
                return value.map(v => {
                  const option = filter.options?.find(o => o.value === v)
                  return option?.label || v
                }).join(", ")
              }
              return value
            }

            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter.label}: {getFilterLabel()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterRemove(filterId)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
} 