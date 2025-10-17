'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, QrCode } from 'lucide-react'
import { api } from '@/trpc/react'

interface QRCodeModalProps {
  instanceId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function QRCodeModal({ instanceId, isOpen, onClose, onSuccess }: QRCodeModalProps) {
  // Usar el mismo patrón que el componente que funciona
  const { data: qrData } = api.instances.getCurrentQR.useQuery(
    { instanceId },
    { 
      enabled: isOpen,
      refetchInterval: 10000, // Refetch cada 10 segundos como el componente que funciona
      staleTime: 2000
    }
  )

  const displayQr = qrData?.qrCode
  const isConnected = qrData?.isConnected || false
  const hasCalledSuccess = useRef(false)

  useEffect(() => {
    if (isConnected && !hasCalledSuccess.current) {
      hasCalledSuccess.current = true
      // Usar setTimeout para evitar el bucle infinito
      const timer = setTimeout(() => {
        onSuccess()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected, onSuccess])

  // Reset el flag cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      hasCalledSuccess.current = false
    }
  }, [isOpen])

  if (isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¡Conectado!</DialogTitle>
          </DialogHeader>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">¡Conectado!</h3>
                  <p className="text-sm text-green-600">
                    La instancia está conectada correctamente
                  </p>
                </div>
                <Button onClick={onClose} variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <span>Conectar Instancia WhatsApp</span>
          </DialogTitle>
        </DialogHeader>

        <Card className="border-blue-200">
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
                El código se actualiza automáticamente cada ~10 segundos
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}