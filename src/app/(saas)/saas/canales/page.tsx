"use client"

import { Alert, AlertDescription, Button, Badge, Switch, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components"
import { Radio, CheckCircle, AlertCircle, Settings, ExternalLink, RefreshCw, Zap, Users, MessageSquare } from "lucide-react"
import { canalesData } from "@/server/api/mock-data"
import { stats } from "@/server/api/mock-data"
import { SectionHeader } from "../_components/header"
// TODO: REFACTORIZAR COMPONENTE. MODULARIZAR EN COMPONENTES MÁS PEQUEÑOS. 

export default function CanalesPage() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader title={"Canales de Comunicación"} description={"Conecta tus canales de comunicación para que tus agentes IA puedan interactuar con tus clientes"} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canales Activos</p>
                <p className="text-2xl font-bold text-aurelia-primary">{stats.canalesActivos}</p>
              </div>
              <Radio className="h-8 w-8 text-aurelia-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes Hoy</p>
                <p className="text-2xl font-bold text-green-600">{stats.mensajesHoy.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversaciones</p>
                <p className="text-2xl font-bold text-blue-600">{stats.conversacionesActivas}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Respuesta</p>
                <p className="text-2xl font-bold text-purple-600">{stats.tiempoRespuesta}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Canales Grid */}
      {/* TODO: UTILIZAR NEXT/IMAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canalesData.map((canal) => (
          <Card key={canal.id} className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm border">
                    <img
                      src={canal.logo || "/placeholder.svg"}
                      alt={`${canal.nombre} logo`}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{canal.nombre}</CardTitle>
                    <CardDescription>{canal.descripcion}</CardDescription>
                  </div>
                </div>
                <Switch checked={canal.conectado} onCheckedChange={()=>{console.log('handleChanel')}} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Estado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {canal.conectado ? (
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Desconectado
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {canal.tipo}
                  </Badge>
                </div>
              </div>

              {/* Configuración específica por canal */}
              {canal.conectado && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  {canal.configuracion === "qr" && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <img
                          src={"/placeholder.svg"}
                          alt="QR Code"
                          className="w-32 h-32 mx-auto border rounded-lg"
                        />
                        <p className="text-sm text-gray-600 mt-2">Escanea este código con WhatsApp Business</p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerar QR
                        </Button>
                      </div>
                    </div>
                  )}

                  {canal.configuracion === "api" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone-number">Número de Teléfono</Label>
                        <Input id="phone-number" placeholder="+54 9 11 1234-5678" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-name">Nombre del Negocio</Label>
                        <Input id="business-name" placeholder="Mi Empresa SRL" />
                      </div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>La verificación de Meta puede tomar 1-3 días hábiles.</AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {canal.configuracion === "oauth" && (
                    <div className="space-y-4">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Conectar con {canal.nombre}
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Serás redirigido a {canal.nombre} para autorizar la conexión
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Ventajas y Limitaciones */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-green-700 mb-2">Ventajas:</p>
                  <ul className="space-y-1">
                    {canal.ventajas.map((ventaja, index) => (
                      <li key={index} className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                        {ventaja}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-orange-700 mb-2">Limitaciones:</p>
                  <ul className="space-y-1">
                    {canal.limitaciones.map((limitacion, index) => (
                      <li key={index} className="text-xs text-orange-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                        {limitacion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
                <Button
                  size="sm"
                  className={`flex-1 rounded-xl ${canal.conectado ? "bg-red-500 hover:bg-red-600" : "bg-aurelia-primary hover:bg-purple-700"
                    }`}
                  onClick={()=>{console.log('handleChanel')}}
                >
                  {canal.conectado ? "Desconectar" : "Conectar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
