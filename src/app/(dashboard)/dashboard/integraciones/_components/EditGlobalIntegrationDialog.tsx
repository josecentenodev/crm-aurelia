"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface EditGlobalIntegrationDialogProps {
  integration: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditGlobalIntegrationDialog({ integration, open, onOpenChange, onSuccess }: EditGlobalIntegrationDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isEnabled: false,
    config: {}
  })

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name || "",
        description: integration.description || "",
        isEnabled: integration.isEnabled || false,
        config: integration.config || {}
      })
    }
  }, [integration])

  const updateIntegrationMutation = api.globalIntegrations.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Integración actualizada",
        description: "WhatsApp API ha sido actualizada correctamente",
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
      await updateIntegrationMutation.mutateAsync({
        id: integration.id,
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
      onOpenChange(false)
    }
  }

  if (!integration) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar WhatsApp API</DialogTitle>
          <DialogDescription>
            Modifica la configuración de WhatsApp API para todos los clientes.
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
              {isLoading ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 