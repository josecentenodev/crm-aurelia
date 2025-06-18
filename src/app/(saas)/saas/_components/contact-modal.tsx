"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { User, Save, X, Plus, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Contact {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  empresa?: string
  canal: string
  estado: string
  origen: string
  etiquetas: string[]
  notas?: string
  fechaCreacion: string
}

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onSave: (contact: Contact) => void
}

export function ContactModal({ isOpen, onClose, contact, onSave }: ContactModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Contact>({
    id: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    empresa: "",
    canal: "",
    estado: "",
    origen: "",
    etiquetas: [],
    notas: "",
    fechaCreacion: "",
  })
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (contact) {
      setFormData(contact)
    } else {
      setFormData({
        id: "",
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        empresa: "",
        canal: "",
        estado: "nuevo",
        origen: "",
        etiquetas: [],
        notas: "",
        fechaCreacion: new Date().toLocaleDateString(),
      })
    }
  }, [contact])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.apellido || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios (nombre, apellido, email)",
        variant: "destructive",
      })
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    onSave(formData)

    toast({
      title: contact ? "¡Contacto actualizado!" : "¡Contacto creado!",
      description: `${formData.nombre} ${formData.apellido} ha sido ${contact ? "actualizado" : "creado"} exitosamente`,
    })

    onClose()
  }

  const handleInputChange = (field: keyof Contact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.etiquetas.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        etiquetas: [...prev.etiquetas, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      etiquetas: prev.etiquetas.filter((tag) => tag !== tagToRemove),
    }))
  }

  const canales = ["WhatsApp", "Instagram", "Facebook", "Web", "Email", "Teléfono"]
  const estados = ["nuevo", "calificado", "agendado", "cliente", "descartado"]
  const origenes = ["Sitio Web", "Redes Sociales", "Referido", "Publicidad", "Evento", "Otro"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-aurelia-primary" />
            <span>{contact ? "Editar Contacto" : "Nuevo Contacto"}</span>
          </DialogTitle>
          <DialogDescription>
            {contact ? "Modifica la información del contacto" : "Agrega un nuevo contacto a tu base de datos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información Personal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Juan"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                placeholder="Pérez"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@empresa.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="+54 9 11 1234-5678"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              placeholder="Nombre de la empresa"
              value={formData.empresa}
              onChange={(e) => handleInputChange("empresa", e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Canal, Estado, Origen */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="canal">Canal</Label>
              <Select value={formData.canal} onValueChange={(value) => handleInputChange("canal", value)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {canales.map((canal) => (
                    <SelectItem key={canal} value={canal}>
                      {canal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="origen">Origen</Label>
              <Select value={formData.origen} onValueChange={(value) => handleInputChange("origen", value)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {origenes.map((origen) => (
                    <SelectItem key={origen} value={origen}>
                      {origen}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Etiquetas */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Agregar etiqueta"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 rounded-xl"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" className="rounded-xl">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.etiquetas.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Información adicional sobre el contacto..."
              value={formData.notas}
              onChange={(e) => handleInputChange("notas", e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-aurelia-primary hover:bg-purple-700 rounded-xl">
              <Save className="w-4 h-4 mr-2" />
              {contact ? "Actualizar" : "Crear"} Contacto
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
