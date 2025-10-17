"use client"

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Bot, MessageSquare, Users, TrendingUp, Plus, Eye, Calendar, Activity } from "lucide-react"
import { useState } from "react"
import { SectionHeader } from "../../../components/ui/section-header"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useDashboardProvider } from '@/providers/DashboardProvider'

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // Usar el provider
  const {
    metrics,
    channelMetrics,
    recentActivity,
    isLoading,
    error
  } = useDashboardProvider()

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Dashboard" description="Error al cargar las métricas" />
        <div className="text-red-600 p-4 bg-red-50 rounded-xl">
          Error: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-10">
      {/* Header Principal */}
      <SectionHeader 
        title="¡Bienvenido a Aurelia! 👋" 
        description="Tu plataforma de inteligencia artificial para automatizar ventas consultivas"
      >
        <Button 
          className="rounded-xl bg-purple-600 hover:bg-purple-700"
          onClick={() => router.push('/saas/agentes/crear')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Agente
        </Button>
      </SectionHeader>

      {/* KPIs Principales - Solo métricas reales disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Contactos */}
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Contactos</CardTitle>
            <Users className="h-10 w-10 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : metrics?.contacts.total ?? 0}
            </div>
            <p className={`text-xs flex items-center mt-1 ${
              (metrics?.contacts.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics?.contacts.change ?? 0}% vs semana anterior
            </p>
          </CardContent>
        </Card>

        {/* Contactos Nuevos Esta Semana */}
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Nuevos Esta Semana</CardTitle>
            <Calendar className="h-10 w-10 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : metrics?.contacts.newThisWeek ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contactos activos: {metrics?.contacts.active ?? 0}
            </p>
          </CardContent>
        </Card>

        {/* Total de Conversaciones */}
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversaciones</CardTitle>
            <MessageSquare className="h-10 w-10 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : metrics?.conversations.total ?? 0}
            </div>
            <p className={`text-xs flex items-center mt-1 ${
              (metrics?.conversations.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics?.conversations.change ?? 0}% vs semana anterior
            </p>
          </CardContent>
        </Card>

        {/* Mensajes Totales */}
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mensajes</CardTitle>
            <Activity className="h-10 w-10 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : metrics?.messages.total ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Conversaciones activas: {metrics?.conversations.active ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas por Canal - Solo si hay datos */}
      {channelMetrics && (channelMetrics.conversations.length > 0 || channelMetrics.contacts.length > 0) && (
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-purple-600">Actividad por Canal</CardTitle>
            <CardDescription>Distribución de contactos y conversaciones por canal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channelMetrics.contacts.map((item: { channel: string; count: number }) => (
                <div key={item.channel} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.channel}</h3>
                      <p className="text-sm text-gray-500">{item.count} contactos</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 border-0">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actividad Reciente */}
      {recentActivity && (recentActivity.conversations.length > 0 || recentActivity.contacts.length > 0) && (
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en tu plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...recentActivity.conversations, ...recentActivity.contacts]
              .sort((a, b) => new Date(b.type === 'conversation' ? b.updatedAt : b.createdAt).getTime() - 
                               new Date(a.type === 'conversation' ? a.updatedAt : a.createdAt).getTime())
              .slice(0, 5)
              .map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'conversation' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.type === 'conversation' ? 'Conversación' : 'Contacto'} - {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.type === 'conversation' ? item.contactName : item.status} - 
                      {new Date(item.type === 'conversation' ? item.updatedAt : item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Acciones Rápidas */}
      <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-aurelia-primary">Acciones Rápidas</CardTitle>
          <CardDescription>Gestiona tu plataforma de manera eficiente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 h-auto bg-white rounded-xl shadow-sm"
            onClick={() => router.push('/saas/agentes/crear')}
          >
            <Bot className="h-5 w-5 text-aurelia-primary mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Crear Nuevo Agente</p>
              <p className="text-sm text-gray-500">Configura un asistente para un nuevo canal</p>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 h-auto bg-white rounded-xl shadow-sm"
            onClick={() => router.push('/saas/conversaciones')}
          >
            <MessageSquare className="h-5 w-5 text-aurelia-primary mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Ver Conversaciones</p>
              <p className="text-sm text-gray-500">Revisa las últimas interacciones con leads</p>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 h-auto bg-white rounded-xl shadow-sm"
            onClick={() => router.push('/saas/contactos')}
          >
            <Users className="h-5 w-5 text-aurelia-primary mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Gestionar Contactos</p>
              <p className="text-sm text-gray-500">Administra tu base de datos de contactos</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Próximas Funcionalidades */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-600">🚀 Próximas Funcionalidades</CardTitle>
          <CardDescription>Funcionalidades que se agregarán conforme avance el desarrollo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">🤖 Gestión de Agentes</h4>
              <p className="text-sm text-gray-600">
                Crear y configurar agentes de IA personalizados para diferentes canales y propósitos.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">📱 Integración de APIs</h4>
              <p className="text-sm text-gray-600">
                Conectar con WhatsApp Business API, Instagram, Facebook Messenger y más.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">📊 Analytics Avanzados</h4>
              <p className="text-sm text-gray-600">
                Métricas detalladas, reportes personalizados y análisis de rendimiento.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">🎯 Automatización</h4>
              <p className="text-sm text-gray-600">
                Flujos de trabajo automatizados, respuestas automáticas y seguimiento inteligente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
