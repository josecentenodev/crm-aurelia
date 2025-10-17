"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Layers } from "lucide-react"
import type { PipelineCreateFormData } from "../types"
import { isNotEmpty } from "../utils"

interface PipelineCreateFormProps {
  onSubmit: (data: PipelineCreateFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PipelineCreateForm({ onSubmit, onCancel, isLoading = false }: PipelineCreateFormProps) {
  const [formData, setFormData] = useState<PipelineCreateFormData>({
    name: "",
    description: "",
    isDefault: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!isNotEmpty(formData.name)) {
      newErrors.name = "El nombre del pipeline es requerido"
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

  const handleInputChange = (field: keyof PipelineCreateFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: "" }))
    }
  }

  return (
    <Card className="rounded-2xl border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-600" />
          Crear Nuevo Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Ventas B2B"
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

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción del pipeline..."
              className="rounded-xl"
            />
          </div>

          {/* Pipeline por defecto */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleInputChange("isDefault", checked)}
              />
              <Label htmlFor="isDefault">Establecer como pipeline por defecto</Label>
            </div>
            <p className="text-xs text-gray-500">
              El pipeline por defecto se usará automáticamente para nuevas oportunidades
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 rounded-xl"
            >
              {isLoading ? "Creando..." : "Crear Pipeline"}
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
