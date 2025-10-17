"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, X, Plus, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { Contact, UpdateContact } from "@/domain/Contactos"
import { CONTACT_STATUSES } from "@/domain/Contactos"

interface QuickEditContactModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  status: string
  tags: string[]
}

export function QuickEditContactModal({ contact, isOpen, onClose, onSuccess }: QuickEditContactModalProps) {
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")
  const [formData, setFormData] = useState<FormData>({
    name: "",
    status: "ACTIVE",
    tags: []
  })

  const updateContactMutation = api.contactos.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Contacto actualizado",
        description: "El contacto se ha actualizado exitosamente.",
      })
      onSuccess()
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setError(error.message)
    }
  })

  // Actualizar formulario cuando se abre el modal
  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        name: contact.name || "",
        status: contact.status || "ACTIVE",
        tags: contact.tags || []
      })
      setError(null)
      setNewTag("")
    }
  }, [contact, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contact) return

    if (!formData.name.trim()) {
      setError("El nombre es requerido")
      return
    }

    setError(null)
    
    const contactData: UpdateContact & { id: string } = {
      id: contact.id,
      name: formData.name.trim(),
      status: formData.status as any,
      tags: formData.tags,
    }

    updateContactMutation.mutate(contactData)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span>Edición Rápida - {contact?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Modifica los campos más importantes del contacto
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)} 
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateContactMutation.isPending}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateContactMutation.isPending}
              className="bg-violet-500 hover:bg-violet-600 rounded-xl"
            >
              {updateContactMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 