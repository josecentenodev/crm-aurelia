"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/app/(web)/_components/button"
import { Card, CardContent } from "@/app/(web)/_components/card"
import { Badge } from "@/app/(web)/_components/badge"
import {
  ChevronDown,
  Menu,
  X,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  MessageCircle,
  BarChart3,
  Calendar,
  Stethoscope,
  Shield,
  Users,
  Clock,
} from "lucide-react"

export default function SaludPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isIndustriasOpen, setIsIndustriasOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleIndustrias = () => setIsIndustriasOpen(!isIndustriasOpen)

  return (
    <div className="min-h-screen bg-white font-geomanist">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Update 1 - Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/images/logo.png" alt="Aurelia" className="h-8 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Características
              </Link>
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Agentes IA
              </Link>
              <div className="relative">
                <button
                  onClick={toggleIndustrias}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Industrias</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isIndustriasOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/industrias/educacion"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Educación
                    </Link>
                    <Link href="/industrias/viajes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Viajes
                    </Link>
                    <Link
                      href="/industrias/automotriz"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Automotriz
                    </Link>
                    <Link
                      href="/industrias/inmobiliaria"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Inmobiliaria
                    </Link>
                    <Link
                      href="/industrias/seguros"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Seguros
                    </Link>
                    <Link
                      href="/industrias/salud"
                      className="block px-4 py-2 text-sm text-blue-600 bg-blue-50 font-medium"
                    >
                      Salud
                    </Link>
                    <Link
                      href="/industrias/servicios-profesionales"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Servicios Profesionales
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Precios
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                Iniciar Sesión
              </Link>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Prueba Gratis</Button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-700">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Características
                </Link>
                <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Agentes IA
                </Link>
                <div>
                  <button
                    onClick={toggleIndustrias}
                    className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    <span>Industrias</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isIndustriasOpen && (
                    <div className="pl-4 space-y-1">
                      <Link href="/industrias/educacion" className="block px-3 py-2 text-sm text-gray-700">
                        Educación
                      </Link>
                      <Link href="/industrias/viajes" className="block px-3 py-2 text-sm text-gray-700">
                        Viajes
                      </Link>
                      <Link href="/industrias/automotriz" className="block px-3 py-2 text-sm text-gray-700">
                        Automotriz
                      </Link>
                      <Link href="/industrias/inmobiliaria" className="block px-3 py-2 text-sm text-gray-700">
                        Inmobiliaria
                      </Link>
                      <Link href="/industrias/seguros" className="block px-3 py-2 text-sm text-gray-700">
                        Seguros
                      </Link>
                      <Link href="/industrias/salud" className="block px-3 py-2 text-sm text-blue-600 font-medium">
                        Salud
                      </Link>
                      <Link
                        href="/industrias/servicios-profesionales"
                        className="block px-3 py-2 text-sm text-gray-700"
                      >
                        Servicios Profesionales
                      </Link>
                    </div>
                  )}
                </div>
                <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Precios
                </Link>
                <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-500 via-green-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-100">
                <Heart className="w-4 h-4 mr-2" />
                Salud
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-anantason leading-tight">
                Revoluciona la
                <br />
                Atención al Paciente
                <br />
                en <span className="text-green-200">Salud</span>
              </h1>
              <p className="text-xl mb-8 text-green-100 leading-relaxed">
                Automatiza la gestión de citas, consultas médicas y atención al paciente. Mejora la satisfacción del
                paciente y reduce tiempos de respuesta en el sector sanitario.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Solicitar Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-green-600"
                >
                  Ver Casos de Éxito
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold mb-2 font-anantason">75%</div>
                  <div className="text-green-100 text-sm">Reducción en tiempo de gestión de citas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 font-anantason">24/7</div>
                  <div className="text-green-100 text-sm">Atención automatizada para pacientes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 font-anantason">95%</div>
                  <div className="text-green-100 text-sm">Satisfacción del paciente</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 font-anantason">50%</div>
                  <div className="text-green-100 text-sm">Reducción en llamadas perdidas</div>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <img src="/images/new-avatar-3d.png" alt="Avatar Aurelia 3D" className="w-80 h-80 object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections remain the same as the Seguros page structure... */}
      {/* I'll continue with the same pattern for all other sections */}

      {/* Challenges Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">Desafíos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-anantason">
              ¿Te Identificas con Estos Desafíos?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los centros de salud enfrentan retos únicos en la atención al paciente y la gestión de recursos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Tiempos de Espera Prolongados</h3>
                <p className="text-gray-600">
                  Pacientes frustrados por largas esperas telefónicas y dificultad para agendar citas médicas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Llamadas Perdidas</h3>
                <p className="text-gray-600">
                  Personal insuficiente para atender todas las llamadas, resultando en pacientes insatisfechos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Ausencias a Citas</h3>
                <p className="text-gray-600">
                  Alto porcentaje de pacientes que no asisten a sus citas programadas, generando ineficiencias.
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
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">Solución</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-anantason">
              Aurelia: Tu Solución Sanitaria Completa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Optimiza la experiencia del paciente y la eficiencia operativa con nuestra plataforma de IA conversacional
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/dashboard-main.png"
                alt="Dashboard Aurelia para Salud"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Gestión Inteligente de Citas</h3>
                  <p className="text-gray-600">
                    Automatiza la programación, reprogramación y cancelación de citas médicas con confirmaciones
                    automáticas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Triaje Virtual Avanzado</h3>
                  <p className="text-gray-600">
                    Evalúa síntomas y prioriza casos según urgencia, dirigiendo pacientes al especialista adecuado.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Atención Multicanal 24/7</h3>
                  <p className="text-gray-600">
                    Ofrece atención continua a través de WhatsApp, web chat, email y teléfono para mejor accesibilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">Casos de Éxito</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-anantason">
              Casos de Éxito en Salud
            </h2>
            <p className="text-xl text-gray-600">
              Descubre cómo Aurelia mejora la atención sanitaria y la experiencia del paciente
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Recordatorios de Citas</h3>
                  <p className="text-gray-600">
                    Envía recordatorios automáticos por WhatsApp, SMS o email para reducir ausencias y optimizar la
                    agenda médica.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Información Médica</h3>
                  <p className="text-gray-600">
                    Proporciona información sobre preparación para exámenes, horarios de atención y servicios
                    disponibles.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Seguimiento Post-Consulta</h3>
                  <p className="text-gray-600">
                    Automatiza el seguimiento de pacientes con recordatorios de medicación y próximas citas de control.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Gestión de Emergencias</h3>
                  <p className="text-gray-600">
                    Prioriza casos urgentes y proporciona instrucciones básicas mientras se espera atención médica.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Educación del Paciente</h3>
                  <p className="text-gray-600">
                    Comparte información educativa sobre prevención, cuidados y tratamientos de manera personalizada.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-anantason">Resultados de Exámenes</h3>
                  <p className="text-gray-600">
                    Notifica cuando los resultados están listos y programa citas para revisión con el médico tratante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">Funcionalidades</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-anantason">
              Funcionalidades Diseñadas para Salud
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas especializadas para optimizar la atención sanitaria y mejorar la experiencia del paciente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Gestión de Citas</h3>
                <p className="text-gray-600">
                  Automatiza la programación, reprogramación y cancelación de citas médicas con confirmaciones
                  automáticas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Triaje Inteligente</h3>
                <p className="text-gray-600">
                  Evalúa síntomas y prioriza casos según urgencia, dirigiendo pacientes al especialista adecuado.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Consultas Virtuales</h3>
                <p className="text-gray-600">
                  Facilita teleconsultas y seguimiento post-consulta con recordatorios de medicación y cuidados.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Soporte Multicanal</h3>
                <p className="text-gray-600">
                  Integra WhatsApp, web chat, email y teléfono para una comunicación fluida con pacientes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Analytics Médicos</h3>
                <p className="text-gray-600">
                  Analiza patrones de consultas, satisfacción del paciente y eficiencia operativa del centro médico.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-anantason">Privacidad HIPAA</h3>
                <p className="text-gray-600">
                  Cumple con estándares de privacidad médica y protege la información sensible de los pacientes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-6 font-anantason">
              "Aurelia revolucionó nuestra clínica. Los pacientes pueden agendar citas 24/7, reciben recordatorios
              automáticos y tenemos un 95% menos de ausencias."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <img src="/images/avatar.png" alt="Director Médico" className="w-12 h-12 rounded-full" />
              <div className="text-left">
                <div className="font-semibold text-gray-900 font-anantason">Dr. Carlos Mendoza</div>
                <div className="text-gray-600">Director Médico, Clínica San Rafael</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-anantason">
            ¿Listo para Transformar tu Centro de Salud?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Únete a los centros médicos que ya están mejorando la atención al paciente con IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Solicitar Demo Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Hablar con un Experto
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Update 2 - Footer Logo Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/images/logo.png" alt="Aurelia" className="h-8 w-auto" />
              </div>
              <p className="text-gray-400 mb-4">
                Mejorando la atención sanitaria con inteligencia artificial conversacional.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 font-anantason">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Integraciones
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 font-anantason">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
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
