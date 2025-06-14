import {
  ArrowRight,
  Home,
  Users,
  Clock,
  CheckCircle,
  Star,
  Building,
  MessageSquare,
  BarChart3,
  Target,
  MapPin,
} from "lucide-react"
import { Button } from "@/app/(web)/_components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(web)/_components/card"
import { Badge } from "@/app/(web)/_components/badge"
import Image from "next/image"
import Link from "next/link"

export default function InmobiliariaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Image src="/images/logo.png" alt="Aurelia Logo" width={120} height={40} priority />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-green-600 transition-colors font-geomanist">
              Características
            </Link>
            <Link href="/#agents" className="text-gray-600 hover:text-green-600 transition-colors font-geomanist">
              Agentes IA
            </Link>
            <div className="relative group">
              <button className="text-gray-600 hover:text-green-600 transition-colors font-geomanist flex items-center">
                Industrias
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <Link
                    href="/industrias/educacion"
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 font-geomanist"
                  >
                    Educación
                  </Link>
                  <Link
                    href="/industrias/viajes"
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 font-geomanist"
                  >
                    Viajes
                  </Link>
                  <Link
                    href="/industrias/automotriz"
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 font-geomanist"
                  >
                    Automotriz
                  </Link>
                  <Link
                    href="/industrias/inmobiliaria"
                    className="block px-4 py-2 text-green-600 bg-green-50 font-geomanist font-semibold"
                  >
                    Inmobiliaria
                  </Link>
                  <Link
                    href="/industrias/seguros"
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 font-geomanist"
                  >
                    Seguros
                  </Link>
                  <Link
                    href="/industrias/salud"
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 font-geomanist"
                  >
                    Salud
                  </Link>
                  <Link
                    href="/industrias/servicios-profesionales"
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 font-geomanist"
                  >
                    Servicios Profesionales
                  </Link>
                </div>
              </div>
            </div>
            <Link href="/pricing" className="text-gray-600 hover:text-green-600 transition-colors font-geomanist">
              Precios
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="font-geomanist">
                Iniciar Sesión
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-geomanist">
              Prueba Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0 lg:pr-8">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 font-geomanist">
                🏠 Solución para Inmobiliarias
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 font-anantason leading-tight">
                Automatiza la Venta de Propiedades con IA
              </h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto lg:mx-0 font-geomanist leading-relaxed opacity-90">
                Transforma tu inmobiliaria con agentes IA que responden consultas, califican compradores y programan
                visitas las 24 horas del día, aumentando tus ventas hasta un 280%.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-geomanist"
                >
                  Solicitar Demo Inmobiliaria
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-6 rounded-xl font-geomanist"
                >
                  Ver Casos de Éxito
                </Button>
              </div>

              {/* Stats específicas para inmobiliaria */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">89%</div>
                  <div className="text-green-100 font-geomanist">Consultas Resueltas</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">24/7</div>
                  <div className="text-green-100 font-geomanist">Atención Continua</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">+280%</div>
                  <div className="text-green-100 font-geomanist">Aumento en Visitas</div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-80 h-20 bg-gradient-to-r from-green-300/40 via-emerald-300/40 to-green-300/40 rounded-full blur-xl"></div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-green-200/30 via-transparent to-emerald-200/30 rounded-full blur-2xl transform scale-110"></div>
                <Image
                  src="/images/new-avatar-3d.png"
                  alt="Aurelia - Asistente IA para Inmobiliarias"
                  width={500}
                  height={500}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problemas Específicos del Sector */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">¿Te Identificas con Estos Desafíos?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Las inmobiliarias enfrentan retos únicos en la captación y conversión de compradores
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-red-200 bg-red-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-red-700 font-anantason">Consultas Fuera de Horario</CardTitle>
                <CardDescription className="font-geomanist">
                  Los compradores buscan información sobre propiedades cuando tu equipo no está disponible.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-orange-700 font-anantason">Agentes Sobrecargados</CardTitle>
                <CardDescription className="font-geomanist">
                  Tus agentes inmobiliarios pasan horas respondiendo preguntas básicas en lugar de cerrar ventas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-yellow-200 bg-yellow-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-yellow-700 font-anantason">Seguimiento Inconsistente</CardTitle>
                <CardDescription className="font-geomanist">
                  Pierdes compradores potenciales porque no tienes un sistema automatizado de seguimiento de leads.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-emerald-200 bg-emerald-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-emerald-700 font-anantason">Falta de Datos y Métricas</CardTitle>
                <CardDescription className="font-geomanist">
                  No tienes visibilidad clara sobre qué propiedades generan más interés o cuáles son las objeciones
                  comunes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-green-700 font-anantason">Competencia Digital</CardTitle>
                <CardDescription className="font-geomanist">
                  Otras inmobiliarias están captando a tus clientes con procesos más ágiles y modernos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-teal-200 bg-teal-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-teal-700 font-anantason">Visitas Mal Coordinadas</CardTitle>
                <CardDescription className="font-geomanist">
                  El proceso de programación de visitas es manual y poco eficiente, perdiendo oportunidades.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Solución Específica para Inmobiliaria */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Aurelia: Tu Solución Inmobiliaria Completa</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Automatiza todo tu proceso de ventas con IA especializada en el sector inmobiliario
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Respuestas Instantáneas 24/7</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Tu agente IA responde preguntas sobre propiedades, precios, ubicaciones, características y
                    financiamiento en cualquier momento, capturando leads que antes se perdían.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Calificación Automática de Compradores</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Identifica automáticamente a los compradores más prometedores basándose en su presupuesto,
                    preferencias de ubicación y capacidad de financiamiento, priorizando el seguimiento de tu equipo.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Agendamiento de Visitas</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Programa automáticamente visitas a propiedades y reuniones con agentes, sincronizando con los
                    calendarios de tu equipo y la disponibilidad de las propiedades.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                <Image
                  src="/images/dashboard-main.png"
                  alt="Dashboard de Aurelia para Inmobiliarias"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Casos de Uso Específicos */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Casos de Éxito en Inmobiliaria</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Inmobiliarias que transformaron sus ventas con Aurelia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 hover:border-green-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-anantason">Propiedades Premium</CardTitle>
                    <CardDescription className="font-geomanist">Inmobiliaria de Lujo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 font-geomanist">
                    "Implementamos Aurelia para gestionar las 1,800+ consultas mensuales sobre nuestras propiedades de
                    lujo. Ahora respondemos el 89% de las preguntas automáticamente."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 font-anantason">+210%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Visitas Programadas</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600 font-anantason">72%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Reducción Tiempo Respuesta</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-4">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-anantason">Desarrollos Urbanos</CardTitle>
                    <CardDescription className="font-geomanist">Desarrolladora Inmobiliaria</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 font-geomanist">
                    "Aurelia nos ayudó a automatizar las consultas sobre nuestros desarrollos. Nuestras ventas
                    aumentaron 280% en 4 meses sin contratar agentes adicionales."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600 font-anantason">+280%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Ventas de Propiedades</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 font-anantason">24/7</div>
                      <div className="text-sm text-gray-600 font-geomanist">Atención Personalizada</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Características Específicas para Inmobiliaria */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Funcionalidades Diseñadas para Inmobiliaria</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Herramientas específicas que entienden las necesidades únicas del sector inmobiliario
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-green-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Catálogo de Propiedades Inteligente</CardTitle>
                <CardDescription className="font-geomanist">
                  Base de conocimiento completa sobre propiedades, características, precios y disponibilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Información detallada de propiedades
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Comparativas entre inmuebles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Disponibilidad en tiempo real
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Segmentación de Compradores</CardTitle>
                <CardDescription className="font-geomanist">
                  Clasifica automáticamente a los prospectos según su perfil y preferencias de compra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por tipo de propiedad de interés
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por presupuesto y financiamiento
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por urgencia de compra
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-teal-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Sistema de Visitas Integrado</CardTitle>
                <CardDescription className="font-geomanist">
                  Sincronización con tu calendario de visitas y disponibilidad de propiedades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Verificación de disponibilidad
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Programación automática
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Recordatorios automáticos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Específico */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 font-anantason leading-relaxed">
              "Aurelia revolucionó nuestra inmobiliaria. Pasamos de responder 80 consultas diarias manualmente a
              gestionar más de 600 automáticamente, con una tasa de conversión a visita 2.8 veces mayor."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                AS
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg font-anantason">Ana Sánchez</div>
                <div className="text-gray-600 font-geomanist">Directora, Propiedades Premium</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-anantason">
            ¿Listo para Transformar tu Inmobiliaria?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 font-geomanist">
            Únete a las inmobiliarias que ya están automatizando sus procesos de venta con Aurelia. Comienza tu prueba
            gratuita especializada para el sector inmobiliario.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4 font-geomanist">
              Comenzar Prueba Gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4 font-geomanist"
            >
              Solicitar Demo Personalizada
            </Button>
          </div>
          <div className="flex justify-center items-center space-x-8 text-sm opacity-75">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="font-geomanist">Implementación personalizada</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="font-geomanist">Configuración especializada</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="font-geomanist">Soporte dedicado</span>
            </div>
          </div>
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
                La plataforma de IA especializada en automatizar ventas en el sector inmobiliario.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 font-anantason">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/#features" className="hover:text-white transition-colors font-geomanist">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="/#agents" className="hover:text-white transition-colors font-geomanist">
                    Agentes IA
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors font-geomanist">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 font-anantason">Industrias</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/industrias/educacion" className="hover:text-white transition-colors font-geomanist">
                    Educación
                  </Link>
                </li>
                <li>
                  <Link href="/industrias/viajes" className="hover:text-white transition-colors font-geomanist">
                    Viajes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/industrias/inmobiliaria"
                    className="hover:text-white transition-colors font-geomanist text-green-400"
                  >
                    Inmobiliaria
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
