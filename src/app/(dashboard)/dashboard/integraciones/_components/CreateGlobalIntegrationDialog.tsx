"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface CreateGlobalIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateGlobalIntegrationDialog({ open, onOpenChange, onSuccess }: CreateGlobalIntegrationDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "WhatsApp API",
    description: "Conecta con WhatsApp a través de WhatsApp API",
    isEnabled: false,
    config: {}
  })

  const createIntegrationMutation = api.globalIntegrations.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Integración creada",
        description: "WhatsApp API ha sido configurada correctamente",
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await createIntegrationMutation.mutateAsync({
        type: "EVOLUTION_API",
        name: formData.name,
        description: formData.description,
        isEnabled: formData.isEnabled,
        config: formData.config
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: "WhatsApp API",
        description: "Conecta con WhatsApp a través de WhatsApp API",
        isEnabled: false,
        config: {}
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar WhatsApp API</DialogTitle>
          <DialogDescription>
            Configura la integración global de WhatsApp API para que todos los clientes puedan conectarse a WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la integración</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="WhatsApp API"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Conecta con WhatsApp a través de WhatsApp API"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isEnabled"
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
            />
            <Label htmlFor="isEnabled">Habilitar integración</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creando..." : "Crear Integración"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 