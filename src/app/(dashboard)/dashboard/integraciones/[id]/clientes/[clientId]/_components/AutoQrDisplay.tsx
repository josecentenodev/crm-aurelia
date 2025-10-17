"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, RefreshCw, AlertCircle } from "lucide-react"
import { api } from "@/trpc/react"

interface Props {
  clientId: string
  instanceName: string
}

export function AutoQrDisplay({ clientId, instanceName }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  // Query para obtener el QR actual
  const { 
    data: qrData, 
    refetch, 
    error 
  } = api.integraciones.getCurrentQR.useQuery(
    { clientId, instanceName },
    { 
      enabled: true,
      refetchInterval: 5000, // Refetch cada 5 segundos
      staleTime: 2000
    }
  )

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await refetch()
    } finally {
      setIsLoading(false)
    }
  }

  // Si está conectado, no mostrar nada (el componente padre se encarga)
  if (qrData?.isConnected) {
    return null
  }

  // Si hay error
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error al obtener QR</h3>
              <p className="text-sm text-red-600">
                {error.message || "No se pudo obtener el código QR"}
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar QR normal
  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <span className="text-lg">Código QR - {instanceName}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Estado de polling */}
            <Badge variant="secondary" className="text-xs">
              Actualización automática
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {qrData?.qrCode ? (
            <div className="p-4 bg-white rounded-lg border">
              <Image
                src={qrData.qrCode.startsWith("data:") ? qrData.qrCode : `data:image/png;base64,${qrData.qrCode}`}
                alt="QR para conectar WhatsApp"
                width={200}
                height={200}
                className="rounded-md"
                unoptimized
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Esperando código QR...</p>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Escanea este código QR con WhatsApp para conectar la instancia
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>Actualización automática activa</span>
            {qrData?.timestamp && (
              <span>Última: {new Date(qrData.timestamp).toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        {/* Botón manual de refresh */}
        <div className="flex justify-center pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar Ahora
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}