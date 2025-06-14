"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Calendar, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
  contactName: string
  conversationId: string
}

export function ActivityModal({ isOpen, onClose, contactName, conversationId }: ActivityModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_type: "",
    scheduled_date: "",
    scheduled_time: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.activity_type || !formData.scheduled_date || !formData.scheduled_time) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    // Aquí se guardaría en la base de datos
    console.log("Guardando actividad:", {
      ...formData,
      conversationId,
      scheduled_datetime: `${formData.scheduled_date}T${formData.scheduled_time}`,
    })

    toast({
      title: "¡Actividad creada!",
      description: `Se ha programado "${formData.title}" para ${formData.scheduled_date} a las ${formData.scheduled_time}`,
    })

    // Resetear formulario y cerrar modal
    setFormData({
      title: "",
      description: "",
      activity_type: "",
      scheduled_date: "",
      scheduled_time: "",
    })
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const activityTypes = [
    { value: "call", label: "Llamada", icon: "📞" },
    { value: "meeting", label: "Reunión", icon: "🤝" },
    { value: "email", label: "Email", icon: "📧" },
    { value: "task", label: "Tarea", icon: "✅" },
    { value: "follow_up", label: "Seguimiento", icon: "🔄" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-aurelia-primary" />
            <span>Nueva Actividad</span>
          </DialogTitle>
          <DialogDescription>Programa una actividad para {contactName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ej: Llamada de seguimiento"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Tipo de Actividad */}
          <div className="space-y-2">
            <Label htmlFor="activity_type">Tipo de Actividad *</Label>
            <Select value={formData.activity_type} onValueChange={(value) => handleInputChange("activity_type", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center space-x-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Fecha *</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => handleInputChange("scheduled_date", e.target.value)}
                className="rounded-xl"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Hora *</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => handleInputChange("scheduled_time", e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales sobre la actividad..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-aurelia-primary hover:bg-purple-700 rounded-xl">
              <Save className="w-4 h-4 mr-2" />
              Guardar Actividad
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
