// Renombrado de TestingTab.tsx para mejor organización sin tabs
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, TestTube, CheckCircle, XCircle } from "lucide-react"
import type { UIGlobalIntegration, UIClientLite } from "@/lib/mappers/integrations"

interface Props {
  client: UIClientLite
  integration: UIGlobalIntegration
}

export function TestingSection({ client, integration }: Props) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [selectedInstance, setSelectedInstance] = useState("")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulario de Envío de Prueba */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5 text-purple-600" />
            <span>Envío de Mensaje de Prueba</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="instance">Instancia</Label>
              <select
                id="instance"
                value={selectedInstance}
                onChange={(e) => setSelectedInstance(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar instancia...</option>
                <option value="ventas">ventas</option>
                <option value="soporte">soporte</option>
              </select>
            </div>
            <div>
              <Label htmlFor="phone">Número de teléfono</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="ej: +54911234567"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje de prueba aquí..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Este mensaje se enviará usando WhatsApp API
            </p>
            <Button 
              disabled={!selectedInstance || !phoneNumber || !message}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensaje
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Pruebas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pruebas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">+54911234567</p>
                  <p className="text-sm text-green-600">Hola, este es un mensaje de prueba</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Hace 5 min</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">+54919876543</p>
                  <p className="text-sm text-red-600">Error: Número no válido</p>
                </div>
              </div>
              <span className="text-sm text-red-600">Hace 15 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">+54912345678</p>
                  <p className="text-sm text-green-600">Mensaje enviado correctamente</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Hace 1 hora</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
