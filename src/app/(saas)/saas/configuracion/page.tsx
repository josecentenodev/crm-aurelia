"use client"

import { useState } from "react"
import { Button, Input, Label, Badge, Switch, Card, CardContent, CardDescription, CardHeader, CardTitle, Avatar, AvatarFallback, AvatarImage, Tabs, TabsContent, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components"
import { User, CreditCard, Users, Puzzle, Settings, Bell, Download, Eye, Edit, Trash2, Plus, Crown, CheckCircle, Link } from "lucide-react"
import { usuarios } from "@/server/api/mock-data"

// TODO: REFACTORIZAR COMPONENTE. MODULARIZAR EN COMPONENTES MÁS PEQUEÑOS.
// LOS TABS DEBERÍAN SER COMPONENTES INDEPENDIENTES.

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("cuenta")
  // TODO: ESTOS ESTADOS DEBERÍAN SER MANEJADOS POR UN CONTEXTO GLOBAL O UN ESTADO GLOBAL ZUSTAND (propuesta)
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    push: false,
    sms: true,
  })

  const [integraciones, setIntegraciones] = useState({
    hubspot: false,
    pipedrive: false,
    salesforce: false,
    googleCalendar: false,
    zapier: false,
  })

  const handleToggleIntegracion = (integracion: string) => {
    setIntegraciones((prev) => ({
      ...prev,
      [integracion]: !prev[integracion as keyof typeof prev],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Gestiona tu cuenta, plan, equipo e integraciones</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-gray-100 p-1">
          <TabsTrigger value="cuenta" className="rounded-xl">
            <User className="w-4 h-4 mr-2" />
            Mi Cuenta
          </TabsTrigger>
          <TabsTrigger value="plan" className="rounded-xl">
            <CreditCard className="w-4 h-4 mr-2" />
            Plan y Facturación
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="rounded-xl">
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="integraciones" className="rounded-xl">
            <Puzzle className="w-4 h-4 mr-2" />
            Integraciones
          </TabsTrigger>
        </TabsList>

        {/* Mi Cuenta */}
        <TabsContent value="cuenta" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <Card className="rounded-2xl shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-aurelia-primary" />
                  <span>Información Personal</span>
                </CardTitle>
                <CardDescription>Actualiza tu información de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=Aurelia Team" />
                    <AvatarFallback className="bg-gradient-to-br from-aurelia-primary to-aurelia-secondary text-white text-lg">
                      AU
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Edit className="w-4 h-4 mr-2" />
                      Cambiar foto
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" defaultValue="Aurelia" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" defaultValue="Team" className="rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="team@aurelia.com" className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input id="empresa" defaultValue="Aurelia SaaS" className="rounded-xl" />
                </div>

                <Button className="w-full bg-aurelia-primary hover:bg-purple-700 rounded-xl">
                  <Settings className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>

            {/* Preferencias */}
            <Card className="rounded-2xl shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-aurelia-primary" />
                  <span>Notificaciones</span>
                </CardTitle>
                <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones por email</p>
                    <p className="text-sm text-gray-500">Recibe actualizaciones importantes por email</p>
                  </div>
                  <Switch
                    checked={notificaciones.email}
                    onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones push</p>
                    <p className="text-sm text-gray-500">Recibe notificaciones en tiempo real</p>
                  </div>
                  <Switch
                    checked={notificaciones.push}
                    onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, push: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-gray-500">Alertas críticas por mensaje de texto</p>
                  </div>
                  <Switch
                    checked={notificaciones.sms}
                    onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, sms: checked })}
                  />
                </div>

                <div className="pt-4">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select defaultValue="america/argentina">
                    <SelectTrigger className="rounded-xl mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america/argentina">Argentina (GMT-3)</SelectItem>
                      <SelectItem value="america/mexico">México (GMT-6)</SelectItem>
                      <SelectItem value="america/colombia">Colombia (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plan y Facturación */}
        <TabsContent value="plan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Actual */}
            <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-aurelia-primary" />
                  <span>Plan Actual</span>
                </CardTitle>
                <CardDescription>Tu suscripción y beneficios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className="bg-aurelia-primary text-white border-0 text-lg px-4 py-2">Plan Pro</Badge>
                  <p className="text-3xl font-bold text-gray-900 mt-2">$99/mes</p>
                  <p className="text-sm text-gray-600">Facturación mensual</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Hasta 10 usuarios</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Asistentes IA ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Todas las integraciones</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Soporte prioritario</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1 rounded-xl">
                    Cambiar Plan
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Facturación */}
            <Card className="rounded-2xl shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-aurelia-primary" />
                  <span>Facturación</span>
                </CardTitle>
                <CardDescription>Método de pago y facturas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Visa • Vence 12/25</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Próxima facturación:</span>
                    <span className="text-sm font-medium">15 Nov 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monto:</span>
                    <span className="text-sm font-medium">$99.00</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Facturas
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usuarios */}
        <TabsContent value="usuarios" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
              <p className="text-gray-600">Administra los miembros de tu equipo</p>
            </div>
            <Button className="bg-aurelia-primary hover:bg-purple-700 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          <div className="space-y-4">
            {usuarios.map((usuario) => (
              <Card key={usuario.id} className="rounded-2xl shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre} ${usuario.apellido}`}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-aurelia-primary to-aurelia-secondary text-white">
                          {usuario.nombre.charAt(0)}
                          {usuario.apellido.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {usuario.nombre} {usuario.apellido}
                        </h4>
                        <p className="text-sm text-gray-600">{usuario.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {usuario.rol}
                          </Badge>
                          <Badge
                            className={`text-xs border-0 ${
                              usuario.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {usuario.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integraciones */}
        <TabsContent value="integraciones" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Integraciones Disponibles</h3>
            <p className="text-gray-600">Conecta Aurelia con tus herramientas favoritas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: "hubspot",
                nombre: "HubSpot",
                descripcion: "CRM completo con marketing automation",
                logo: "🟠",
                conectado: integraciones.hubspot,
              },
              {
                id: "pipedrive",
                nombre: "Pipedrive",
                descripcion: "CRM enfocado en pipeline de ventas",
                logo: "🟢",
                conectado: integraciones.pipedrive,
              },
              {
                id: "salesforce",
                nombre: "Salesforce",
                descripcion: "Plataforma CRM empresarial líder",
                logo: "🔵",
                conectado: integraciones.salesforce,
              },
              {
                id: "googleCalendar",
                nombre: "Google Calendar",
                descripcion: "Sincroniza reuniones y eventos",
                logo: "📅",
                conectado: integraciones.googleCalendar,
              },
              {
                id: "zapier",
                nombre: "Zapier",
                descripcion: "Conecta con 5000+ aplicaciones",
                logo: "⚡",
                conectado: integraciones.zapier,
              },
            ].map((integracion) => (
              <Card key={integracion.id} className="rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{integracion.logo}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{integracion.nombre}</h4>
                          <p className="text-sm text-gray-600">{integracion.descripcion}</p>
                        </div>
                      </div>
                      <Switch
                        checked={integracion.conectado}
                        onCheckedChange={() => handleToggleIntegracion(integracion.id)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      {integracion.conectado ? (
                        <Badge className="bg-green-100 text-green-800 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge variant="outline">Desconectado</Badge>
                      )}
                    </div>

                    <Button
                      className={`w-full rounded-xl ${
                        integracion.conectado ? "bg-red-500 hover:bg-red-600" : "bg-aurelia-primary hover:bg-purple-700"
                      }`}
                      onClick={() => handleToggleIntegracion(integracion.id)}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      {integracion.conectado ? "Desconectar" : "Conectar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
