"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ClientCreationLoaderProps {
  state: 'creating_client' | 'creating_integration' | 'success' | 'error';
  error?: string | null;
  integrationError?: string | null;
  onCancel: () => void;
}

export function ClientCreationLoader({ 
  state, 
  error, 
  integrationError, 
  onCancel 
}: ClientCreationLoaderProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Estado: Creando Cliente */}
            {state === 'creating_client' && (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                <h3 className="text-lg font-semibold">Creando Cliente</h3>
                <p className="text-gray-600">Guardando información del cliente en la base de datos...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-1/3 animate-pulse"></div>
                </div>
              </>
            )}
            
            {/* Estado: Creando Integración */}
            {state === 'creating_integration' && (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
                <h3 className="text-lg font-semibold">Configurando Whatsapp</h3>
                <p className="text-gray-600">Creando contenedor Docker y configurando integración...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-2/3 animate-pulse"></div>
                </div>
              </>
            )}
            
            {/* Estado: Éxito */}
            {state === 'success' && (
              <>
                <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
                <h3 className="text-lg font-semibold text-green-600">¡Cliente Creado Exitosamente!</h3>
                <p className="text-gray-600">El cliente y su integración con Whatsapp están listos.</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-full"></div>
                </div>
                <p className="text-sm text-gray-500">Redirigiendo a la lista de clientes...</p>
              </>
            )}
            
            {/* Estado: Error */}
            {state === 'error' && (
              <>
                <XCircle className="w-8 h-8 mx-auto text-red-600" />
                <h3 className="text-lg font-semibold text-red-600">Error en la Creación</h3>
                
                {error && (
                  <div className="space-y-2">
                    <p className="text-red-600 font-medium">Error al crear el cliente:</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                {integrationError && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-gray-600">Cliente creado pero falló la integración con Whatsapp:</p>
                    </div>
                    <p className="text-red-600 text-sm">{integrationError}</p>
                    <p className="text-xs text-gray-500">
                      Puedes activar la integración con Whatsapp manualmente desde la configuración del cliente.
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={onCancel} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Volver al formulario
                  </Button>
                  {!error && (
                    <Button 
                      onClick={() => window.location.href = '/dashboard/clientes'} 
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Ver Clientes
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
