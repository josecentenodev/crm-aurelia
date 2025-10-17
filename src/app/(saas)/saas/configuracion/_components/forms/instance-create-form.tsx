"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Phone } from "lucide-react"
import type { InstanceCreateFormData } from "../types"
import { isNotEmpty, isValidPhone } from "../utils"

interface InstanceCreateFormProps {
  onSubmit: (data: InstanceCreateFormData) => void
  onCancel: () => void
  isLoading?: boolean
  maxInstances?: number
  currentInstances?: number
}

export function InstanceCreateForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  maxInstances = 999,
  currentInstances = 0
}: InstanceCreateFormProps) {
  const [formData, setFormData] = useState<InstanceCreateFormData>({
    instanceName: "",
    phoneNumber: "",
    description: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const canCreateMore = currentInstances < maxInstances
  const remainingInstances = maxInstances - currentInstances

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!isNotEmpty(formData.instanceName)) {
      newErrors.instanceName = "El nombre de la instancia es requerido"
    }

    if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
      newErrors.phoneNumber = "El número de teléfono no es válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canCreateMore) {
      setErrors({ general: `Has alcanzado el límite máximo de ${maxInstances} instancias para esta integración.` })
      return
    }

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof InstanceCreateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="rounded-2xl border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          Crear Nueva Instancia
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Información de límites */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700">
                {currentInstances} de {maxInstances} instancias utilizadas
              </span>
            </div>
            <div className="text-sm text-blue-600">
              {remainingInstances} disponibles
            </div>
          </div>
        </div>

        {/* Alerta si no se pueden crear más instancias */}
        {!canCreateMore && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Límite alcanzado
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Has alcanzado el límite máximo de {maxInstances} instancias para esta integración.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error general */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Nombre de la instancia */}
          <div className="space-y-2">
            <Label htmlFor="instanceName">Nombre de la Instancia *</Label>
            <Input
              id="instanceName"
              value={formData.instanceName}
              onChange={(e) => handleInputChange("instanceName", e.target.value)}
              placeholder="ej: ventas-whatsapp"
              className="rounded-xl"
              required
            />
            <p className="text-xs text-gray-500">
              Nombre único para identificar esta instancia
            </p>
            {errors.instanceName && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.instanceName}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Número de teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número de Teléfono (Opcional)</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder="+1234567890"
              className="rounded-xl"
            />
            <p className="text-xs text-gray-500">
              Número de teléfono asociado a esta instancia
            </p>
            {errors.phoneNumber && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.phoneNumber}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción de la instancia..."
              className="rounded-xl"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Información adicional sobre esta instancia
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.instanceName || !canCreateMore}
              className="flex-1 rounded-xl"
            >
              {isLoading ? "Creando..." : "Crear Instancia"}
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
