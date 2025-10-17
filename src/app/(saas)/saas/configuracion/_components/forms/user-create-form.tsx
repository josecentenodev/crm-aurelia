"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, UserPlus } from "lucide-react"
import type { UserCreateFormData } from "../types"
import { isNotEmpty, isValidEmail } from "../utils"

interface UserCreateFormProps {
  onSubmit: (data: UserCreateFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function UserCreateForm({ onSubmit, onCancel, isLoading = false }: UserCreateFormProps) {
  const [formData, setFormData] = useState<UserCreateFormData>({
    name: "",
    email: "",
    type: "CUSTOMER",
    active: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!isNotEmpty(formData.name)) {
      newErrors.name = "El nombre es requerido"
    }

    if (!isNotEmpty(formData.email)) {
      newErrors.email = "El email es requerido"
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "El email no es válido"
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

  const handleInputChange = (field: keyof UserCreateFormData, value: string | boolean) => {
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
          <UserPlus className="w-5 h-5 text-blue-600" />
          Crear Nuevo Usuario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Juan Pérez"
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

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Ej: juan@empresa.com"
              className="rounded-xl"
              required
            />
            {errors.email && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.email}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tipo de usuario */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Usuario</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value as "ADMIN" | "CUSTOMER")}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Usuario</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Los administradores tienen acceso completo al sistema
            </p>
          </div>

          {/* Estado activo */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange("active", checked)}
              />
              <Label htmlFor="active">Usuario activo</Label>
            </div>
            <p className="text-xs text-gray-500">
              Los usuarios inactivos no pueden acceder al sistema
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.email.trim()}
              className="flex-1 rounded-xl"
            >
              {isLoading ? "Creando..." : "Crear Usuario"}
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
