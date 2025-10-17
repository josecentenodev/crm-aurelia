"use client"

import { Badge, Button, Card, CardContent } from "@/components/ui"
import { Briefcase, CheckCircle, Star, ArrowRight, Phone, BarChart3, Calendar, FileText, Target, Scale, Users, Clock } from "lucide-react"
import Link from "next/link"
import Header from "../../_components/Header"

export default function ServiciosProfesionalesPage() {


  return (
    <div className="min-h-screen bg-white font-geomanist">
      {/* Header */}
      <Header />


      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 border-0">
                <Briefcase className="w-4 h-4 mr-2" />
                Servicios Profesionales
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-anantason leading-tight">
                Revoluciona la Atención al Cliente en <span className="text-yellow-300">Servicios Profesionales</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Automatiza la gestión de clientes, consultas y citas para abogados, consultores y contadores. Mejora la
                eficiencia y la experiencia del cliente con IA conversacional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                  Solicitar Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600"
                >
                  Ver Casos de Éxito
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 font-anantason">80%</div>
                  <div className="text-white/80 text-sm">Reducción en tiempo de gestión</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 font-anantason">24/7</div>
                  <div className="text-white/80 text-sm">Atención Continua</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 font-anantason">90%</div>
                  <div className="text-white/80 text-sm">Satisfacción del cliente</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 font-anantason">65%</div>
                  <div className="text-white/80 text-sm">Aumento en captación</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/images/new-avatar-3d.png"
                  alt="Aurelia Avatar 3D"
                  className="w-full max-w-md mx-auto drop-shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-anantason">
              ¿Te Identificas con Estos Desafíos?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los profesionales enfrentan retos únicos en la gestión de clientes y casos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Gestión Manual de Consultas</h3>
                <p className="text-gray-600">
                  Tiempo excesivo respondiendo consultas básicas que podrían automatizarse, reduciendo la productividad.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Programación de Citas Compleja</h3>
                <p className="text-gray-600">
                  Dificultad para coordinar horarios y confirmar citas, generando pérdida de tiempo y clientes.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Seguimiento Inconsistente</h3>
                <p className="text-gray-600">
                  Falta de seguimiento sistemático con clientes, afectando la satisfacción y retención.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-anantason">
              Aurelia: Tu Solución Profesional Completa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Automatiza y optimiza la gestión de tu firma profesional con inteligencia artificial
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 font-anantason">Gestión Inteligente de Clientes</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Consultas Automatizadas</h4>
                    <p className="text-gray-600">Responde consultas frecuentes 24/7 y deriva casos complejos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Programación Inteligente</h4>
                    <p className="text-gray-600">Automatiza la programación y confirmación de citas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Seguimiento Proactivo</h4>
                    <p className="text-gray-600">Mantén contacto regular con clientes y casos activos</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img src="/images/dashboard-main.png" alt="Dashboard Aurelia" className="rounded-lg shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-anantason">
              Funcionalidades Diseñadas para Servicios Profesionales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas especializadas para abogados, consultores, contadores y otros profesionales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Gestión de Citas</h3>
                <p className="text-gray-600">
                  Automatiza la programación de consultas y reuniones con confirmaciones automáticas.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Consultas Legales</h3>
                <p className="text-gray-600">
                  Proporciona información inicial sobre servicios y dirige al especialista adecuado.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Gestión de Documentos</h3>
                <p className="text-gray-600">
                  Automatiza el seguimiento de documentos y recordatorios de vencimientos.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Soporte Multicanal</h3>
                <p className="text-gray-600">
                  Integra WhatsApp, web chat, email y teléfono para comunicación profesional.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Analytics Profesionales</h3>
                <p className="text-gray-600">Analiza patrones de consultas, satisfacción y eficiencia en la gestión.</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-anantason">Captación de Clientes</h3>
                <p className="text-gray-600">Califica leads automáticamente y programa consultas iniciales.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-anantason">
              Casos de Éxito en Servicios Profesionales
            </h2>
            <p className="text-xl text-gray-600">Descubre cómo Aurelia optimiza la gestión de firmas profesionales</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Consultas Iniciales</h3>
                  <p className="text-gray-600">
                    Automatiza la recopilación de información básica y programa consultas iniciales.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Seguimiento de Casos</h3>
                  <p className="text-gray-600">
                    Mantén a los clientes informados sobre el progreso con actualizaciones automáticas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Recordatorios de Plazos</h3>
                  <p className="text-gray-600">Automatiza recordatorios de fechas límite y citas importantes.</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Facturación Automática</h3>
                  <p className="text-gray-600">Envía recordatorios de pago y facilita el proceso de facturación.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Información de Servicios</h3>
                  <p className="text-gray-600">Proporciona información detallada sobre servicios y tarifas.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Gestión de Referencias</h3>
                  <p className="text-gray-600">Automatiza el seguimiento de referencias y comunicación profesional.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-6 font-anantason">
              "Aurelia transformó nuestra firma legal. Ahora podemos atender consultas 24/7, automatizar seguimientos y
              nuestros clientes están más satisfechos que nunca."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <img src="/images/avatar.png" alt="Socio Director" className="w-12 h-12 rounded-full" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Lic. Ana Rodríguez</div>
                <div className="text-gray-600">Socia Directora, Rodríguez & Asociados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-anantason">
            ¿Listo para Potenciar tu Firma Profesional?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Únete a los profesionales que ya están optimizando su gestión con IA conversacional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Solicitar Demo Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600"
            >
              Hablar con un Experto
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/images/logo.png" alt="Aurelia" className="h-8 w-auto" />
              </div>
              <p className="text-gray-400 mb-4">
                Optimizando servicios profesionales con inteligencia artificial conversacional.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/home" className="hover:text-white transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/home" className="hover:text-white transition-colors">
                    Integraciones
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/home" className="hover:text-white transition-colors">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link href="/home" className="hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/home" className="hover:text-white transition-colors">
                    Soporte
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Aurelia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
