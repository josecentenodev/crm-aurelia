"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../_components/ui/card"
import { Button } from "../_components/ui/button"
import { Badge } from "../_components/ui/badge"
import { Switch } from "../_components/ui/switch"
import { Input } from "../_components/ui/input"
import { Label } from "../_components/ui/label"
import { Puzzle, CheckCircle, Calendar, Database, Zap, Settings, Link, FileText } from "lucide-react"
// TODO: PROBABLEMENTE ESTE SEA EL ULTIMO COMPONENTE QUE SE DESARROLLARA.
// DEBERA REFACTORIZARSE PARA APLICAR LA MISMA LOGICA DE DESARROLLO QUE EL RESTO DE LA APLICACIÓN.
export default function IntegracionesPage() {
  const [integraciones, setIntegraciones] = useState({
    hubspot: false,
    pipedrive: false,
    salesforce: false,
    odoo: false,
    zoho: false,
    googleCalendar: false,
    outlookCalendar: false,
    zapier: false,
  })

  const handleToggleIntegracion = (integracion: string) => {
    setIntegraciones((prev) => ({
      ...prev,
      [integracion]: !prev[integracion as keyof typeof prev],
    }))
  }

  const crmIntegraciones = [
    {
      id: "hubspot",
      nombre: "HubSpot",
      descripcion: "CRM completo con marketing automation",
      logo: "🟠",
      categoria: "CRM",
      documentacion: "https://developers.hubspot.com/",
      conectado: integraciones.hubspot,
      caracteristicas: ["Contactos", "Deals", "Tickets", "Marketing"],
    },
    {
      id: "pipedrive",
      nombre: "Pipedrive",
      descripcion: "CRM enfocado en pipeline de ventas",
      logo: "🟢",
      categoria: "CRM",
      documentacion: "https://developers.pipedrive.com/",
      conectado: integraciones.pipedrive,
      caracteristicas: ["Pipeline", "Actividades", "Contactos", "Reportes"],
    },
    {
      id: "salesforce",
      nombre: "Salesforce",
      descripcion: "Plataforma CRM empresarial líder",
      logo: "🔵",
      categoria: "CRM",
      documentacion: "https://developer.salesforce.com/",
      conectado: integraciones.salesforce,
      caracteristicas: ["Leads", "Opportunities", "Accounts", "Analytics"],
    },
    {
      id: "odoo",
      nombre: "Odoo",
      descripcion: "Suite empresarial con CRM integrado",
      logo: "🟣",
      categoria: "ERP/CRM",
      documentacion: "https://www.odoo.com/documentation/",
      conectado: integraciones.odoo,
      caracteristicas: ["CRM", "Ventas", "Inventario", "Contabilidad"],
    },
    {
      id: "zoho",
      nombre: "Zoho CRM",
      descripcion: "CRM con inteligencia artificial",
      logo: "🔴",
      categoria: "CRM",
      documentacion: "https://www.zoho.com/crm/developer/",
      conectado: integraciones.zoho,
      caracteristicas: ["IA Zia", "Workflow", "Analytics", "Social CRM"],
    },
  ]

  const calendarioIntegraciones = [
    {
      id: "googleCalendar",
      nombre: "Google Calendar",
      descripcion: "Sincroniza reuniones y eventos",
      logo: "📅",
      conectado: integraciones.googleCalendar,
      caracteristicas: ["Eventos", "Recordatorios", "Invitaciones", "Disponibilidad"],
    },
    {
      id: "outlookCalendar",
      nombre: "Outlook Calendar",
      descripcion: "Integración con Microsoft 365",
      logo: "📆",
      conectado: integraciones.outlookCalendar,
      caracteristicas: ["Reuniones", "Teams", "Disponibilidad", "Recordatorios"],
    },
  ]

  const automatizacionIntegraciones = [
    {
      id: "zapier",
      nombre: "Zapier",
      descripcion: "Conecta Aurelia con 5000+ aplicaciones",
      logo: "⚡",
      conectado: integraciones.zapier,
      caracteristicas: ["Workflows", "Triggers", "Actions", "Filters"],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integraciones</h1>
        <p className="text-gray-600 mt-1">
          Conecta Aurelia con tus herramientas favoritas para maximizar la productividad
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Integraciones Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(integraciones).filter(Boolean).length}
                </p>
              </div>
              <Puzzle className="h-8 w-8 text-aurelia-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CRM Conectados</p>
                <p className="text-2xl font-bold text-green-600">
                  {crmIntegraciones.filter((crm) => crm.conectado).length}
                </p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calendarios</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calendarioIntegraciones.filter((cal) => cal.conectado).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automatizaciones</p>
                <p className="text-2xl font-bold text-purple-600">
                  {automatizacionIntegraciones.filter((auto) => auto.conectado).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CRM Integraciones */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-aurelia-primary" />
            <span>Sistemas CRM</span>
          </CardTitle>
          <CardDescription>
            Sincroniza tus contactos y oportunidades con los principales CRM del mercado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crmIntegraciones.map((crm) => (
              <Card key={crm.id} className="rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{crm.logo}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{crm.nombre}</h3>
                          <Badge variant="outline" className="text-xs">
                            {crm.categoria}
                          </Badge>
                        </div>
                      </div>
                      <Switch checked={crm.conectado} onCheckedChange={() => handleToggleIntegracion(crm.id)} />
                    </div>

                    {/* Descripción */}
                    <p className="text-sm text-gray-600">{crm.descripcion}</p>

                    {/* Estado */}
                    <div className="flex items-center space-x-2">
                      {crm.conectado ? (
                        <Badge className="bg-green-100 text-green-800 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge variant="outline">Desconectado</Badge>
                      )}
                    </div>

                    {/* Características */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Características:</p>
                      <div className="flex flex-wrap gap-1">
                        {crm.caracteristicas.map((caracteristica, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {caracteristica}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl"
                        onClick={() => window.open(crm.documentacion, "_blank")}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Docs
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 rounded-xl ${
                          crm.conectado ? "bg-red-500 hover:bg-red-600" : "bg-aurelia-primary hover:bg-purple-700"
                        }`}
                        onClick={() => handleToggleIntegracion(crm.id)}
                      >
                        <Link className="w-4 h-4 mr-2" />
                        {crm.conectado ? "Desconectar" : "Conectar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendarios */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-aurelia-primary" />
            <span>Calendarios</span>
          </CardTitle>
          <CardDescription>Sincroniza reuniones y eventos para una gestión eficiente del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {calendarioIntegraciones.map((calendario) => (
              <Card key={calendario.id} className="rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{calendario.logo}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{calendario.nombre}</h3>
                          <p className="text-sm text-gray-600">{calendario.descripcion}</p>
                        </div>
                      </div>
                      <Switch
                        checked={calendario.conectado}
                        onCheckedChange={() => handleToggleIntegracion(calendario.id)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      {calendario.conectado ? (
                        <Badge className="bg-green-100 text-green-800 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge variant="outline">Desconectado</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Funcionalidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {calendario.caracteristicas.map((caracteristica, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {caracteristica}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      className={`w-full rounded-xl ${
                        calendario.conectado ? "bg-red-500 hover:bg-red-600" : "bg-aurelia-primary hover:bg-purple-700"
                      }`}
                      onClick={() => handleToggleIntegracion(calendario.id)}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      {calendario.conectado ? "Desconectar" : "Conectar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automatizaciones */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-aurelia-primary" />
            <span>Automatizaciones</span>
          </CardTitle>
          <CardDescription>Conecta Aurelia con miles de aplicaciones para automatizar workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {automatizacionIntegraciones.map((auto) => (
              <Card key={auto.id} className="rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{auto.logo}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{auto.nombre}</h3>
                          <p className="text-sm text-gray-600">{auto.descripcion}</p>
                        </div>
                      </div>
                      <Switch checked={auto.conectado} onCheckedChange={() => handleToggleIntegracion(auto.id)} />
                    </div>

                    <div className="flex items-center space-x-2">
                      {auto.conectado ? (
                        <Badge className="bg-green-100 text-green-800 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge variant="outline">Desconectado</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Capacidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {auto.caracteristicas.map((caracteristica, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {caracteristica}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      className={`w-full rounded-xl ${
                        auto.conectado ? "bg-red-500 hover:bg-red-600" : "bg-aurelia-primary hover:bg-purple-700"
                      }`}
                      onClick={() => handleToggleIntegracion(auto.id)}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      {auto.conectado ? "Desconectar" : "Conectar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuración de API */}
      <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-aurelia-primary">Configuración de API</CardTitle>
          <CardDescription>Configura las credenciales para las integraciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key de Aurelia</Label>
                <Input id="api-key" type="password" placeholder="••••••••••••••••" className="rounded-xl" />
                <p className="text-xs text-gray-500">Usa esta clave para conectar aplicaciones externas con Aurelia</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value="https://api.aurelia.com/webhooks/your-id"
                  readOnly
                  className="rounded-xl bg-gray-50"
                />
                <p className="text-xs text-gray-500">URL para recibir notificaciones de eventos</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">Estado de la API</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge className="bg-green-100 text-green-800 border-0">Activa</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Requests hoy:</span>
                    <span className="text-sm font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Límite:</span>
                    <span className="text-sm font-medium">10,000/día</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-aurelia-primary hover:bg-purple-700 rounded-xl">
                <Settings className="w-4 h-4 mr-2" />
                Regenerar API Key
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
