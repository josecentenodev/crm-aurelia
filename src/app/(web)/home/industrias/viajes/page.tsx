import { ArrowRight, Plane, Users, Clock, CheckCircle, Star, Globe, MessageSquare, BarChart3, Target, Map } from "lucide-react"
import { Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import Image from "next/image"
import Link from "next/link"
import Header from "../../_components/Header"

export default function ViajesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Header */}
      <Header />


      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0 lg:pr-8">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 font-geomanist">
                ✈️ Solución para Turismo y Viajes
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 font-anantason leading-tight">
                Automatiza la Venta de Viajes con IA
              </h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto lg:mx-0 font-geomanist leading-relaxed opacity-90">
                Transforma tu agencia de viajes con agentes IA que responden consultas, recomiendan destinos y cierran
                ventas las 24 horas del día, aumentando tus reservas hasta un 250%.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-geomanist"
                >
                  Solicitar Demo Turística
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 rounded-xl font-geomanist"
                >
                  Ver Casos de Éxito
                </Button>
              </div>

              {/* Stats específicas para viajes */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">92%</div>
                  <div className="text-blue-100 font-geomanist">Consultas Resueltas</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">24/7</div>
                  <div className="text-blue-100 font-geomanist">Atención Continua</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">+250%</div>
                  <div className="text-blue-100 font-geomanist">Aumento en Reservas</div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-80 h-20 bg-gradient-to-r from-blue-300/40 via-cyan-300/40 to-blue-300/40 rounded-full blur-xl"></div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-200/30 via-transparent to-cyan-200/30 rounded-full blur-2xl transform scale-110"></div>
                <Image
                  src="/images/new-avatar-3d.png"
                  alt="Aurelia - Asistente IA para Viajes"
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
              Las agencias de viajes enfrentan retos únicos en la captación y conversión de clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-red-200 bg-red-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-red-700 font-anantason">Consultas a Todas Horas</CardTitle>
                <CardDescription className="font-geomanist">
                  Los clientes buscan información sobre destinos y paquetes cuando tu equipo no está disponible.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-orange-700 font-anantason">Equipo Sobrecargado</CardTitle>
                <CardDescription className="font-geomanist">
                  Tus agentes de viajes pasan horas respondiendo preguntas básicas en lugar de cerrar ventas.
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
                  Pierdes clientes potenciales porque no tienes un sistema automatizado de seguimiento de interesados.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-cyan-200 bg-cyan-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-cyan-700 font-anantason">Falta de Datos y Métricas</CardTitle>
                <CardDescription className="font-geomanist">
                  No tienes visibilidad clara sobre qué destinos generan más interés o cuáles son las objeciones
                  comunes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-blue-700 font-anantason">Competencia Digital</CardTitle>
                <CardDescription className="font-geomanist">
                  Las OTAs y competidores digitales están captando a tus clientes con procesos más ágiles y modernos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-green-700 font-anantason">Personalización Limitada</CardTitle>
                <CardDescription className="font-geomanist">
                  No puedes ofrecer recomendaciones personalizadas a escala para cada tipo de viajero.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Solución Específica para Viajes */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Aurelia: Tu Solución Turística Completa</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Automatiza todo tu proceso de ventas con IA especializada en el sector turístico
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Recomendaciones Personalizadas 24/7</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Tu agente IA responde preguntas sobre destinos, paquetes, requisitos de viaje y promociones en
                    cualquier momento, ofreciendo recomendaciones personalizadas según el perfil del viajero.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Calificación Automática de Prospectos</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Identifica automáticamente a los viajeros más prometedores basándose en su presupuesto, fechas,
                    destinos de interés y tamaño del grupo, priorizando el seguimiento de tu equipo.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Reservas y Cotizaciones Automáticas</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Genera cotizaciones instantáneas y permite a los clientes reservar directamente a través del chat,
                    sincronizando con tu sistema de reservas y disponibilidad en tiempo real.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                <Image
                  src="/images/dashboard-main.png"
                  alt="Dashboard de Aurelia para Turismo"
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
            <h2 className="text-4xl font-bold mb-4 font-anantason">Casos de Éxito en Turismo</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Agencias de viajes que transformaron sus ventas con Aurelia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-anantason">TravelWorld Agency</CardTitle>
                    <CardDescription className="font-geomanist">Agencia de Viajes Internacional</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 font-geomanist">
                    "Implementamos Aurelia para gestionar las 3,000+ consultas mensuales sobre nuestros destinos
                    internacionales. Ahora respondemos el 92% de las preguntas automáticamente."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 font-anantason">+220%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Reservas Confirmadas</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 font-anantason">78%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Reducción Tiempo Respuesta</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-cyan-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mr-4">
                    <Map className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-anantason">Aventuras Nacionales</CardTitle>
                    <CardDescription className="font-geomanist">Operador Turístico Local</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 font-geomanist">
                    "Aurelia nos ayudó a automatizar las consultas sobre tours y excursiones. Nuestras ventas aumentaron
                    250% en 5 meses sin contratar personal adicional."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600 font-anantason">+250%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Ventas de Tours</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 font-anantason">24/7</div>
                      <div className="text-sm text-gray-600 font-geomanist">Atención Multiidioma</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Características Específicas para Viajes */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Funcionalidades Diseñadas para Turismo</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Herramientas específicas que entienden las necesidades únicas del sector turístico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Catálogo de Destinos Inteligente</CardTitle>
                <CardDescription className="font-geomanist">
                  Base de conocimiento completa sobre destinos, hoteles, tours y requisitos de viaje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Información detallada de destinos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Requisitos de visado y documentación
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Recomendaciones personalizadas
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-cyan-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Segmentación de Viajeros</CardTitle>
                <CardDescription className="font-geomanist">
                  Clasifica automáticamente a los prospectos según su perfil y preferencias de viaje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por tipo de viajero (familias, parejas, etc.)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por presupuesto y duración
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por intereses específicos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Sistema de Reservas Integrado</CardTitle>
                <CardDescription className="font-geomanist">
                  Sincronización con tu sistema de reservas y disponibilidad en tiempo real
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
                    Cotizaciones automáticas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Confirmación de reservas
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
              "Aurelia transformó nuestra agencia de viajes. Pasamos de responder 40 consultas diarias manualmente a
              gestionar más de 400 automáticamente, con una tasa de conversión 2.5 veces mayor."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                LR
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg font-anantason">Laura Rodríguez</div>
                <div className="text-gray-600 font-geomanist">Directora, Destinos Globales Travel</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-anantason">
            ¿Listo para Transformar tu Agencia de Viajes?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 font-geomanist">
            Únete a las agencias de viajes que ya están automatizando sus procesos de venta con Aurelia. Comienza tu
            prueba gratuita especializada para turismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-geomanist">
              Comenzar Prueba Gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 font-geomanist"
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
                La plataforma de IA especializada en automatizar ventas en el sector turístico.
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
                  <Link href="/home/industrias/educacion" className="hover:text-white transition-colors font-geomanist">
                    Educación
                  </Link>
                </li>
                <li>
                  <Link
                    href="/home/industrias/viajes"
                    className="hover:text-white transition-colors font-geomanist text-blue-400"
                  >
                    Viajes
                  </Link>
                </li>
                <li>
                  <Link href="/home/industrias/inmobiliaria" className="hover:text-white transition-colors font-geomanist">
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
