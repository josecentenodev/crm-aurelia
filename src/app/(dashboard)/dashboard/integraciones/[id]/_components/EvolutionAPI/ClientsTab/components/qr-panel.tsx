"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, QrCode, X } from "lucide-react"
import { api } from "@/trpc/react"

interface Props {
  clientId: string
  instanceName: string
  initialQrCode?: string
  onClose: () => void
  onConnected?: () => void
}

export function QrPanel({ clientId, instanceName, initialQrCode, onClose, onConnected }: Props) {
  // Usar solo polling para obtener QR
  const { data: qrData } = api.integraciones.getCurrentQR.useQuery(
    { clientId, instanceName },
    { 
      refetchInterval: 5000, // Refetch cada 5 segundos
      staleTime: 2000
    }
  )

  // Priorizar QR del polling sobre inicial
  const displayQr = qrData?.qrCode || initialQrCode
  const isConnected = qrData?.isConnected || false

  useEffect(() => {
    if (isConnected) {
      onConnected?.()
    }
  }, [isConnected, onConnected])

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">¡Conectado!</h3>
              <p className="text-sm text-green-600">
                La instancia <strong>{instanceName}</strong> está conectada correctamente
              </p>
            </div>
            <Button onClick={onClose} variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <span className="text-lg">Código QR - {instanceName}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {displayQr ? (
            <div className="p-4 bg-white rounded-lg border">
              <Image
                src={displayQr.startsWith("data:") ? displayQr : `data:image/png;base64,${displayQr}`}
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
          <p className="text-xs text-gray-400">
            El código se actualiza automáticamente cada ~30 segundos
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
