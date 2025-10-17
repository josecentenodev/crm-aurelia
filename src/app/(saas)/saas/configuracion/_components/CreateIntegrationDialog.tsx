"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import { IntegrationType } from "@/domain/Integraciones"

interface CreateIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateIntegrationDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateIntegrationDialogProps) {
  const { clientId } = useClientContext()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "EVOLUTION_API" as IntegrationType,
    description: "Conexión con WhatsApp",
    apiKey: "",
    serverUrl: "",
    webhookUrl: ""
  })

  // Mutation para crear integración
  const createIntegrationMutation = api.integraciones.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Integración creada",
        description: "La integración ha sido creada correctamente",
      })
      onSuccess()
      // Reset form
      setFormData({
        type: "EVOLUTION_API" as IntegrationType,
        description: "Conexión con WhatsApp",
        apiKey: "",
        serverUrl: "",
        webhookUrl: ""
      })
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
    
    if (!clientId) return

    setIsLoading(true)
    try {
      const config: Record<string, any> = {}
      
      // Configuración específica para Evolution API
      config.apiKey = formData.apiKey
      config.serverUrl = formData.serverUrl
      config.webhookUrl = formData.webhookUrl

      await createIntegrationMutation.mutateAsync({
        clientId,
        type: formData.type,
        description: formData.description || undefined,
        isActive: true,
        config
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      // Reset form
      setFormData({
        type: "EVOLUTION_API" as IntegrationType,
        description: "Conexión con WhatsApp",
        apiKey: "",
        serverUrl: "",
        webhookUrl: ""
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Integración</DialogTitle>
          <DialogDescription>
            Configura una nueva integración con WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la integración..."
              className="rounded-xl"
              rows={3}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium">Configuración Whatsapp</h4>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Tu API key de Whatsapp"
                className="rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serverUrl">URL del Servidor *</Label>
              <Input
                id="serverUrl"
                value={formData.serverUrl}
                onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                placeholder="https://tu-servidor-whatsapp.com"
                className="rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL del Webhook</Label>
              <Input
                id="webhookUrl"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://aurelia.com/webhooks/evolution"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.apiKey || !formData.serverUrl}
              className="flex-1 rounded-xl"
            >
              {isLoading ? "Creando..." : "Crear Integración"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 