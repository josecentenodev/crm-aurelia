"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, CheckCircle, XCircle, Settings, Zap, Shield, Globe } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

interface ConfigurationTabProps {
  integration: {
    id: string
    type: string
    name: string
    description?: string
    icon?: string
    isActive: boolean
    isConfigurable: boolean
    backendUrl?: string
    apiKey?: string
  }
}

export function ConfigurationTab({ integration }: ConfigurationTabProps) {
  const { toast } = useToast()
  const [backendUrl, setBackendUrl] = useState(integration.backendUrl ?? "")
  const [apiKey, setApiKey] = useState(integration.apiKey ?? "")
  const [isActive, setIsActive] = useState(integration.isActive)
  const [testResult, setTestResult] = useState<null | boolean>(null)

  useEffect(() => {
    setBackendUrl(integration.backendUrl ?? "")
    setApiKey(integration.apiKey ?? "")
    setIsActive(integration.isActive)
  }, [integration])

  const testConnectionMutation = api.integraciones.testEvolutionConnection.useMutation({
    onSuccess: res => {
      setTestResult(res.healthy)
      toast({
        title: res.healthy ? "Conexión exitosa" : "Conexión fallida",
        description: res.healthy
          ? "Whatsapp API está disponible"
          : "No se pudo conectar con Whatsapp API",
        variant: res.healthy ? undefined : "destructive"
      })
    },
    onError: () => {
      setTestResult(false)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con Whatsapp API",
        variant: "destructive"
      })
    }
  })

  const saveConfigMutation = api.integraciones.updateGlobal.useMutation({
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración se guardó correctamente"
      })
    },
    onError: error => {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const toggleActiveMutation = api.integraciones.toggleGlobalActive.useMutation({
    onSuccess: () => {
      toast({
        title: isActive ? "Whatsapp API desactivada" : "Whatsapp API activada",
        description: `Whatsapp API se ha ${isActive ? "desactivado" : "activado"} correctamente`
      })
    },
    onError: error => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      setIsActive(!isActive)
    }
  })

  function handleTestConnection() {
    setTestResult(null)
    testConnectionMutation.mutate({ backendUrl, apiKey })
  }

  function handleSaveConfiguration() {
    const updateData: {
      id: string
      backendUrl?: string
      apiKey?: string
    } = { id: integration.id }
    if (integration.isConfigurable) {
      if (backendUrl) updateData.backendUrl = backendUrl
      if (apiKey) updateData.apiKey = apiKey
    }
    saveConfigMutation.mutate(updateData)
  }

  function handleToggleActive() {
    const newActiveState = !isActive
    setIsActive(newActiveState)
    toggleActiveMutation.mutate({ id: integration.id })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4">
          <Settings className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración de WhatsApp API</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Configura los parámetros de conexión para WhatsApp API y gestiona su estado global
        </p>
      </div>

      {/* Global Status Card */}
      <Card className="border-2 border-gray-200 hover:border-green-300 transition-colors">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Estado Global</CardTitle>
                <p className="text-sm text-gray-600">
                  {isActive
                    ? "Disponible para todos los clientes"
                    : "Deshabilitada globalmente"}
                </p>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={toggleActiveMutation.isPending}
              aria-label="Activar o desactivar WhatsApp API"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Card */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Configuración de Conexión</CardTitle>
              <p className="text-sm text-gray-600">
                Configura la URL del backend y la API key para WhatsApp API
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="backendUrl" className="text-sm font-medium text-gray-700">
                URL Backend
              </Label>
              <Input
                id="backendUrl"
                value={backendUrl}
                onChange={e => setBackendUrl(e.target.value)}
                placeholder="http://localhost:5001"
                autoComplete="off"
                disabled={!integration.isConfigurable}
                className="h-11"
              />
              <p className="text-xs text-gray-500">
                URL base del servidor de WhatsApp API
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
                API Key
              </Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                type="password"
                placeholder="supersecrettoken"
                autoComplete="off"
                disabled={!integration.isConfigurable}
                className="h-11"
              />
              <p className="text-xs text-gray-500">
                Clave de autenticación para WhatsApp API
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending || !backendUrl || !apiKey}
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {testConnectionMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Shield className="w-4 h-4 mr-2" />
              Probar conexión
            </Button>
            <Button
              onClick={handleSaveConfiguration}
              disabled={saveConfigMutation.isPending || !backendUrl || !apiKey}
              size="lg"
              className="flex-1"
            >
              {saveConfigMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Settings className="w-4 h-4 mr-2" />
              Guardar configuración
            </Button>
          </div>

          {/* Test Result */}
          {testResult !== null && (
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg border">
              {testResult ? (
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Conexión exitosa</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Conexión fallida</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Información Importante</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Asegúrate de que el servidor WhatsApp API esté ejecutándose</li>
                <li>• La API key debe tener los permisos necesarios</li>
                <li>• La URL debe ser accesible desde el servidor</li>
                <li>• Prueba la conexión antes de guardar la configuración</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
