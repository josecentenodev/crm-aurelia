"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, HelpCircle } from "lucide-react"
import type { StageCreateFormData } from "../types"
import { isNotEmpty, isPositiveNumber } from "../utils"

interface StageCreateFormProps {
  onSubmit: (data: StageCreateFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function StageCreateForm({ onSubmit, onCancel, isLoading = false }: StageCreateFormProps) {
  const [formData, setFormData] = useState<StageCreateFormData>({
    name: "",
    color: "#e5e7eb",
    slaMinutes: "",
    isWon: false,
    isLost: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!isNotEmpty(formData.name)) {
      newErrors.name = "El nombre de la etapa es requerido"
    }

    if (formData.slaMinutes && !isPositiveNumber(formData.slaMinutes)) {
      newErrors.slaMinutes = "El SLA debe ser un número positivo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof StageCreateFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: "" }))
    }
  }

  const handleSlaChange = (value: string) => {
    const numericValue = value === "" ? "" : Number(value)
    handleInputChange("slaMinutes", numericValue)
  }

  const handleWonChange = (checked: boolean) => {
    handleInputChange("isWon", checked)
    if (checked) {
      handleInputChange("isLost", false)
    }
  }

  const handleLostChange = (checked: boolean) => {
    handleInputChange("isLost", checked)
    if (checked) {
      handleInputChange("isWon", false)
    }
  }

  return (
    <Card className="rounded-2xl border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Crear Nueva Etapa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primera fila: Nombre, Color, SLA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Calificado"
                className="rounded-xl"
                required
              />
              {errors.name && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                className="h-10 w-16 p-1 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="slaMinutes">SLA (min)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium mb-1">Service Level Agreement</p>
                      <p className="text-sm">Tiempo objetivo máximo para que una oportunidad avance o responda en esta etapa. Ej: 120 min = 2 horas.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="slaMinutes"
                inputMode="numeric"
                value={formData.slaMinutes}
                onChange={(e) => handleSlaChange(e.target.value)}
                placeholder="Opcional"
                className="rounded-xl"
              />
              {errors.slaMinutes && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.slaMinutes}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Separator />

          {/* Segunda fila: Switches */}
          <div className="flex items-center gap-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isWon"
                      checked={formData.isWon}
                      onCheckedChange={handleWonChange}
                    />
                    <Label htmlFor="isWon" className="text-sm font-medium">Ganada</Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Marca esta etapa como resultado final positivo</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isLost"
                      checked={formData.isLost}
                      onCheckedChange={handleLostChange}
                    />
                    <Label htmlFor="isLost" className="text-sm font-medium">Perdida</Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Marca esta etapa como resultado final negativo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Botones */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 rounded-xl"
            >
              {isLoading ? "Creando..." : "Crear Etapa"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
