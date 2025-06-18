"use client"
// TODO: Refactorizar este componente que es gigante y tiene demasiada lógica
// También se puede dividir en varios componentes más pequeños para mejorar la legibilidad y mantenibilidad
import { useState } from "react"
import {
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  Star,
  Play,
  BarChart3,
  Target,
  Clock,
  Globe,
} from "lucide-react"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components"
import Image from "next/image"
import Link from "next/link"
import { VideoModal } from "./_components/VideoModal"
import Header from "./_components/Header"

export default function HomePage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const handleVideoClick = () => {
    setIsVideoModalOpen(true)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Hero Section - Rediseñado con avatar más grande y mejores sombras */}
        <section className="py-20 px-4 bg-[#f8f5ff] overflow-hidden">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0 lg:pr-8">
                <Badge className="mb-6 bg-purple-100 text-purple-700 hover:bg-purple-200 font-geomanist">
                  🚀 Automatización de Ventas con IA
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-anantason leading-tight">
                  Transforma tus Ventas con Aurelia
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 font-geomanist leading-relaxed">
                  La plataforma de inteligencia artificial que automatiza todo tu proceso de ventas consultivas. Desde
                  la captación hasta el cierre, con agentes IA especializados que trabajan 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6 rounded-xl font-geomanist"
                  >
                    Comenzar Gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 rounded-xl border-2 font-geomanist"
                    onClick={handleVideoClick}
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Ver Demo
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-purple-600 mb-2 font-anantason">68%</div>
                    <div className="text-gray-600 font-geomanist">Tasa de Conversión</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-blue-600 mb-2 font-anantason">1.2s</div>
                    <div className="text-gray-600 font-geomanist">Tiempo Respuesta</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-green-600 mb-2 font-anantason">24/7</div>
                    <div className="text-gray-600 font-geomanist">Disponibilidad</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-orange-600 mb-2 font-anantason">+300%</div>
                    <div className="text-gray-600 font-geomanist">ROI Promedio</div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Sombra mejorada y más definida */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-80 h-20 bg-gradient-to-r from-purple-300/40 via-blue-300/40 to-purple-300/40 rounded-full blur-xl"></div>
                  <div className="absolute -z-10 inset-0 bg-gradient-to-br from-purple-200/30 via-transparent to-blue-200/30 rounded-full blur-2xl transform scale-110"></div>
                  {/* Avatar más grande */}
                  <Image
                    src="/images/new-avatar-3d.png"
                    alt="Aurelia - Asistente IA"
                    width={600}
                    height={600}
                    className="relative z-10 drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Showcase */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 font-anantason">Todo tu Proceso de Venta en un Solo Lugar</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
                Desde la configuración de agentes hasta el cierre de ventas, gestiona todo tu embudo comercial con una
                plataforma integrada
              </p>
            </div>

            <div className="space-y-20">
              {/* Dashboard */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold font-anantason">Dashboard Inteligente</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6 font-geomanist leading-relaxed">
                    Visualiza todas tus métricas de ventas en tiempo real. Conversaciones totales, leads calificados,
                    tasa de conversión y tiempo de respuesta, todo en un dashboard intuitivo y fácil de entender.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Métricas en tiempo real</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Análisis de rendimiento por canal</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Estado de canales de comunicación</span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur-3xl opacity-20"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                    <Image
                      src="/images/dashboard-main.png"
                      alt="Dashboard Principal de Aurelia"
                      width={800}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Agent Configuration */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="lg:order-2">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold font-anantason">Configuración de Agentes IA</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6 font-geomanist leading-relaxed">
                    Crea y personaliza agentes IA especializados en minutos. Desde asistentes de FAQ hasta agentes de
                    ventas completos, configura la personalidad y conocimiento de tu equipo virtual.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Wizard de configuración paso a paso</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Base de conocimiento personalizable</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Vista previa en tiempo real</span>
                    </li>
                  </ul>
                </div>
                <div className="relative lg:order-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-3xl opacity-20"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                    <Image
                      src="/images/agent-config.png"
                      alt="Configuración de Agentes IA"
                      width={800}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Conversations */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold font-anantason">Gestión de Conversaciones</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6 font-geomanist leading-relaxed">
                    Centraliza todas las conversaciones de tus diferentes canales. Chat automático inteligente que
                    califica leads, programa citas y mantiene el contexto de cada interacción.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Chat automático con IA</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Información completa del contacto</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Gestión de leads integrada</span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl blur-3xl opacity-20"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                    <Image
                      src="/images/conversations-view.png"
                      alt="Gestión de Conversaciones"
                      width={800}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* CRM Pipeline */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="lg:order-2">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-4">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold font-anantason">Pipeline de Ventas CRM</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6 font-geomanist leading-relaxed">
                    Visualiza y gestiona tu embudo de ventas con una vista Kanban intuitiva. Desde prospecto hasta
                    cierre, mantén el control de cada oportunidad con seguimiento automático del progreso.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Vista Kanban visual</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Seguimiento de progreso automático</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Gestión de oportunidades por valor</span>
                    </li>
                  </ul>
                </div>
                <div className="relative lg:order-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur-3xl opacity-20"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                    <Image
                      src="/images/crm-pipeline.png"
                      alt="Pipeline de Ventas CRM"
                      width={800}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Contacts Management */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold font-anantason">Base de Datos de Contactos</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6 font-geomanist leading-relaxed">
                    Centraliza y organiza todos tus contactos y leads. Segmentación automática, etiquetado inteligente y
                    seguimiento completo del historial de interacciones de cada prospecto.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Segmentación automática por estado</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Etiquetado y categorización</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-geomanist">Historial completo de interacciones</span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-3xl opacity-20"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                    <Image
                      src="/images/contacts-management.png"
                      alt="Gestión de Contactos"
                      width={800}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4 font-anantason">¿Listo para ver Aurelia en acción?</h3>
                <p className="text-gray-600 mb-6 font-geomanist">
                  Descubre cómo puedes automatizar todo tu proceso de ventas en una sola plataforma
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-geomanist"
                >
                  Solicitar Demo Gratuita
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 font-anantason">Características Principales</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
                Todo lo que necesitas para automatizar y optimizar tu proceso de ventas
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="font-anantason">Conversaciones Inteligentes</CardTitle>
                  <CardDescription className="font-geomanist">
                    Chat automático con IA que califica leads y programa citas automáticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Respuestas automáticas 24/7
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Calificación inteligente de leads
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Integración multicanal
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="font-anantason">CRM Avanzado</CardTitle>
                  <CardDescription className="font-geomanist">
                    Pipeline de ventas visual con seguimiento automático de oportunidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Vista Kanban intuitiva
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Seguimiento automático
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Reportes en tiempo real
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="font-anantason">Gestión de Contactos</CardTitle>
                  <CardDescription className="font-geomanist">
                    Base de datos centralizada con segmentación automática y etiquetado inteligente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Segmentación automática
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Etiquetado inteligente
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Historial completo
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="font-anantason">Canales Múltiples</CardTitle>
                  <CardDescription className="font-geomanist">
                    Conecta WhatsApp, Instagram, Facebook Messenger y más canales de comunicación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      WhatsApp Business API
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Redes sociales
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Configuración fácil
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="font-anantason">Automatización Completa</CardTitle>
                  <CardDescription className="font-geomanist">
                    Flujos de trabajo automatizados que escalan tu proceso de ventas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Flujos personalizables
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Triggers inteligentes
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Escalamiento automático
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="font-anantason">Analytics Avanzado</CardTitle>
                  <CardDescription className="font-geomanist">
                    Métricas detalladas y reportes que te ayudan a optimizar tus ventas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Dashboards personalizables
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Métricas en tiempo real
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Reportes automáticos
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section - Con nuevo avatar en situación de presentación */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 font-anantason">¿Cómo Funciona Aurelia?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
                Automatiza tu proceso de ventas en tres simples pasos
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Paso 1 */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 font-anantason">Configura tus Agentes IA</h3>
                    <p className="text-gray-600 font-geomanist leading-relaxed">
                      Selecciona el tipo de agente que necesitas según tus objetivos de ventas. Personaliza sus
                      respuestas y conecta tus canales de comunicación preferidos.
                    </p>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 font-anantason">Activa tus Canales</h3>
                    <p className="text-gray-600 font-geomanist leading-relaxed">
                      Conecta WhatsApp, Instagram, Facebook o cualquier otro canal donde estén tus clientes. Aurelia se
                      encargará de mantener conversaciones naturales y efectivas.
                    </p>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 font-anantason">Analiza y Optimiza</h3>
                    <p className="text-gray-600 font-geomanist leading-relaxed">
                      Visualiza en tiempo real el rendimiento de tus agentes, las conversaciones exitosas y las
                      oportunidades de mejora para maximizar tus conversiones.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Sombra mejorada y más definida */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-80 h-20 bg-gradient-to-r from-purple-300/40 via-blue-300/40 to-purple-300/40 rounded-full blur-xl"></div>
                  <div className="absolute -z-10 inset-0 bg-gradient-to-br from-purple-200/30 via-transparent to-blue-200/30 rounded-full blur-2xl transform scale-110"></div>
                  {/* Nuevo avatar 3D */}
                  <Image
                    src="/images/new-avatar-3d.png"
                    alt="Aurelia - Proceso de automatización"
                    width={500}
                    height={500}
                    className="relative z-10 drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Agents Section */}
        <section id="agents" className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 font-anantason">Agentes IA Especializados</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
                Elige el agente perfecto para cada etapa de tu proceso de ventas
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-700 font-anantason">Agente de FAQ</CardTitle>
                  <CardDescription className="font-geomanist">
                    Responde automáticamente a preguntas frecuentes de tus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Badge variant="secondary" className="font-geomanist">
                      Soporte técnico
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Información de productos
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Políticas y procedimientos
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-green-200 transition-all duration-300 hover:shadow-lg bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-green-700 font-anantason">Agente de Calificación</CardTitle>
                  <CardDescription className="font-geomanist">
                    Califica automáticamente tus prospectos según criterios BANT
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Badge variant="secondary" className="font-geomanist">
                      Generación de leads
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Calificación inicial
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Filtrado de prospectos
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-purple-700 font-anantason">Agente de Agenda</CardTitle>
                  <CardDescription className="font-geomanist">
                    Programa citas y demos sin intervención humana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Badge variant="secondary" className="font-geomanist">
                      Programación de demos
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Consultas
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Eventos
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-orange-200 transition-all duration-300 hover:shadow-lg bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-orange-700 font-anantason">Agente de Ventas Completo</CardTitle>
                  <CardDescription className="font-geomanist">
                    Automatiza todo el proceso de ventas consultivas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Badge variant="secondary" className="font-geomanist">
                      Ventas consultivas
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Ciclos largos
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Productos complejos
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-pink-200 transition-all duration-300 hover:shadow-lg bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-pink-700 font-anantason">Agente de eCommerce</CardTitle>
                  <CardDescription className="font-geomanist">
                    Ayuda a tus clientes a encontrar y comprar productos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Badge variant="secondary" className="font-geomanist">
                      Tiendas online
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Marketplaces
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Venta de productos
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-gray-200 transition-all duration-300 hover:shadow-lg bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-700 font-anantason">Agente Personalizado</CardTitle>
                  <CardDescription className="font-geomanist">
                    Configura un agente a medida para tu caso específico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Badge variant="secondary" className="font-geomanist">
                      Casos específicos
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Necesidades únicas
                    </Badge>
                    <Badge variant="secondary" className="font-geomanist">
                      Flujos complejos
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 font-anantason">Lo que dicen nuestros clientes</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
                Empresas de todos los tamaños confían en Aurelia para automatizar sus ventas
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white border-2 hover:border-purple-200 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 font-geomanist">
                    "Aurelia transformó completamente nuestro proceso de ventas. Ahora generamos 3x más leads
                    calificados con la mitad del esfuerzo."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      MG
                    </div>
                    <div>
                      <div className="font-semibold font-anantason">María González</div>
                      <div className="text-sm text-gray-600 font-geomanist">CEO, TechCorp</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 hover:border-purple-200 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 font-geomanist">
                    "La automatización de Aurelia nos permitió escalar nuestras ventas sin aumentar el equipo. ROI
                    increíble."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      CR
                    </div>
                    <div>
                      <div className="font-semibold font-anantason">Carlos Ruiz</div>
                      <div className="text-sm text-gray-600 font-geomanist">Director Ventas, InnovateCo</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 hover:border-purple-200 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 font-geomanist">
                    "Implementamos Aurelia en 2 semanas y ya vemos resultados. La IA realmente entiende a nuestros
                    clientes."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      AM
                    </div>
                    <div>
                      <div className="font-semibold font-anantason">Ana Martínez</div>
                      <div className="text-sm text-gray-600 font-geomanist">CMO, StartupXYZ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-anantason">¿Listo para Automatizar tus Ventas?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 font-geomanist">
              Únete a cientos de empresas que ya están transformando sus ventas con Aurelia. Comienza tu prueba gratuita
              hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 font-geomanist">
                Comenzar Prueba Gratuita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 font-geomanist"
              >
                Agendar Demo
              </Button>
            </div>
            <p className="text-sm mt-6 opacity-75 font-geomanist">
              Soporte especializado • Implementación rápida • Resultados garantizados
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Image src="/images/logo.png" alt="Aurelia Logo" width={120} height={40} className="brightness-200" />
                </div>
                <p className="text-gray-400 mb-4 font-geomanist">
                  La plataforma de IA que automatiza tus ventas consultivas y maximiza tu ROI.
                </p>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                    <span className="text-sm">f</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                    <span className="text-sm">t</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                    <span className="text-sm">in</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 font-anantason">Producto</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#features" className="hover:text-white transition-colors font-geomanist">
                      Características
                    </Link>
                  </li>
                  <li>
                    <Link href="#agents" className="hover:text-white transition-colors font-geomanist">
                      Agentes IA
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-white transition-colors font-geomanist">
                      Precios
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      API
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 font-anantason">Empresa</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      Sobre nosotros
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      Carreras
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 font-anantason">Soporte</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      Centro de ayuda
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      Documentación
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      Estado del servicio
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors font-geomanist">
                      Comunidad
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm font-geomanist">© 2024 Aurelia. Todos los derechos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors font-geomanist">
                  Privacidad
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors font-geomanist">
                  Términos
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors font-geomanist">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Video Modal */}
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl="https://www.loom.com/embed/b87cfff53507437c94b58229a334ed1e?sid=cb1abffb-a731-498f-bf27-17fcd8ecf559"
        />
      </div>
    </>
  )
}
