"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Phone } from "lucide-react"
import type { InstanceFormData } from "./hooks/useInstanceManagement"

interface InstanceFormProps {
  formData: InstanceFormData
  isCreating: boolean
  canCreateMore: boolean
  onFormDataChange: (data: Partial<InstanceFormData>) => void
  onCreateInstance: () => void
  onCancel: () => void
}

export function InstanceForm({
  formData,
  isCreating,
  canCreateMore,
  onFormDataChange,
  onCreateInstance,
  onCancel
}: InstanceFormProps) {
  return (
    <Card className="rounded-2xl border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          Crear Nueva Instancia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">Nombre de la Instancia *</Label>
            <Input
              id="instanceName"
              value={formData.instanceName}
              onChange={(e) => onFormDataChange({ instanceName: e.target.value })}
              placeholder="ej: ventas-whatsapp"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número de Teléfono (Opcional)</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => onFormDataChange({ phoneNumber: e.target.value })}
              placeholder="+1234567890"
              className="rounded-xl"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Descripción de la instancia..."
            className="rounded-xl"
            rows={3}
          />
        </div>
        <div className="flex space-x-2 pt-4">
          <Button
            onClick={onCreateInstance}
            disabled={isCreating || !formData.instanceName.trim() || !canCreateMore}
            className="flex-1 rounded-xl"
          >
            {isCreating ? "Creando..." : "Crear Instancia"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
            className="rounded-xl"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
