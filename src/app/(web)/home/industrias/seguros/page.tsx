import { ArrowRight, Shield, Users, Clock, CheckCircle, Star, FileText, MessageSquare, BarChart3, Target } from "lucide-react"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import Image from "next/image"
import Link from "next/link"
import Header from "../../_components/Header"
export default function SegurosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <Header />


      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0 lg:pr-8">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 font-geomanist">
                <Shield className="w-4 h-4 mr-2" />
                Seguros
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 font-anantason leading-tight">
                Revoluciona la Atención al Cliente en
                <span className="text-blue-200"> Seguros</span>
              </h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto lg:mx-0 font-geomanist leading-relaxed opacity-90">
                Automatiza la gestión de pólizas, reclamos y consultas con IA conversacional. Mejora la satisfacción del
                cliente y reduce tiempos de respuesta en el sector asegurador.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-geomanist"
                >
                  Solicitar Demo
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

              {/* Stats específicas para seguros */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">85%</div>
                  <div className="text-blue-100 font-geomanist">Reducción en tiempo de reclamos</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">24/7</div>
                  <div className="text-blue-100 font-geomanist">Atención Continua</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">92%</div>
                  <div className="text-blue-100 font-geomanist">Satisfacción del cliente</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">60%</div>
                  <div className="text-blue-100 font-geomanist">Reducción en costos</div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-80 h-20 bg-gradient-to-r from-blue-300/40 via-indigo-300/40 to-blue-300/40 rounded-full blur-xl"></div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-200/30 via-transparent to-indigo-200/30 rounded-full blur-2xl transform scale-110"></div>
                <Image
                  src="/images/new-avatar-3d.png"
                  alt="Aurelia - Asistente IA para Seguros"
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
              Las compañías de seguros enfrentan retos únicos en la atención al cliente y gestión de reclamos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-red-200 bg-red-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-red-700 font-anantason">Tiempos de Respuesta Lentos</CardTitle>
                <CardDescription className="font-geomanist">
                  Los clientes esperan días para recibir respuestas sobre sus reclamos y consultas de pólizas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-orange-700 font-anantason">Personal Sobrecargado</CardTitle>
                <CardDescription className="font-geomanist">
                  Tu equipo de atención al cliente está saturado respondiendo las mismas preguntas repetitivamente.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-yellow-200 bg-yellow-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-yellow-700 font-anantason">Comunicación Inconsistente</CardTitle>
                <CardDescription className="font-geomanist">
                  Los clientes reciben información contradictoria dependiendo del canal o agente que los atienda.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-blue-700 font-anantason">Falta de Datos y Métricas</CardTitle>
                <CardDescription className="font-geomanist">
                  No tienes visibilidad clara sobre patrones de reclamos, satisfacción del cliente y eficiencia
                  operativa.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-indigo-200 bg-indigo-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-indigo-700 font-anantason">Competencia Digital</CardTitle>
                <CardDescription className="font-geomanist">
                  Otras aseguradoras están captando a tus clientes con procesos más ágiles y modernos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-purple-700 font-anantason">Detección de Fraudes Ineficiente</CardTitle>
                <CardDescription className="font-geomanist">
                  Los procesos manuales dificultan la identificación de patrones sospechosos en los reclamos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Solución Específica para Seguros */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Aurelia: Tu Solución Aseguradora Completa</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Automatiza todo tu proceso de atención al cliente con IA especializada en el sector asegurador
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Respuestas Instantáneas 24/7</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Tu agente IA responde preguntas sobre pólizas, coberturas, reclamos y pagos en cualquier momento,
                    mejorando la satisfacción del cliente y reduciendo la carga de tu equipo.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Procesamiento Inteligente de Reclamos</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Automatiza la validación inicial de reclamos, recopila la documentación necesaria y prioriza casos
                    según urgencia y complejidad, acelerando todo el proceso.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Detección Avanzada de Fraudes</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Identifica patrones sospechosos en reclamos mediante análisis de datos e inteligencia artificial,
                    reduciendo pérdidas por fraudes y agilizando los reclamos legítimos.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                <Image
                  src="/images/dashboard-main.png"
                  alt="Dashboard de Aurelia para Seguros"
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
            <h2 className="text-4xl font-bold mb-4 font-anantason">Casos de Éxito en Seguros</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Aseguradoras que transformaron su atención al cliente con Aurelia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-anantason">Seguros Premium</CardTitle>
                    <CardDescription className="font-geomanist">Seguros Generales</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 font-geomanist">
                    "Implementamos Aurelia para gestionar las 3,000+ consultas mensuales sobre pólizas y reclamos. Ahora
                    respondemos el 85% de las preguntas automáticamente."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 font-anantason">-75%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Tiempo de Procesamiento</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 font-anantason">92%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Satisfacción del Cliente</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-anantason">Grupo Asegurador Nacional</CardTitle>
                    <CardDescription className="font-geomanist">Seguros de Vida y Salud</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 font-geomanist">
                    "Aurelia nos ayudó a automatizar la gestión de pólizas y renovaciones. Nuestros costos operativos se
                    redujeron un 60% mientras mejoramos la satisfacción del cliente."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600 font-anantason">-60%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Costos Operativos</div>
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

      {/* Características Específicas para Seguros */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Funcionalidades Diseñadas para Seguros</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Herramientas específicas que entienden las necesidades únicas del sector asegurador
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Gestión de Pólizas</CardTitle>
                <CardDescription className="font-geomanist">
                  Automatiza consultas sobre pólizas, renovaciones, modificaciones y pagos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Consultas de coberturas y exclusiones
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Recordatorios de renovación
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Gestión de pagos y facturación
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Procesamiento de Reclamos</CardTitle>
                <CardDescription className="font-geomanist">
                  Acelera el proceso de reclamos con validación automática y seguimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Validación inicial de documentos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Seguimiento en tiempo real
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Priorización inteligente de casos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Evaluación de Riesgos</CardTitle>
                <CardDescription className="font-geomanist">
                  Asiste en la evaluación de riesgos y cotizaciones personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Análisis de perfiles de cliente
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Cotizaciones personalizadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Recomendaciones de cobertura
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
              "Aurelia transformó completamente nuestra atención al cliente. Reducimos el tiempo de procesamiento de
              reclamos de días a horas, y nuestros clientes están más satisfechos que nunca."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                MG
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg font-anantason">María González</div>
                <div className="text-gray-600 font-geomanist">Directora de Operaciones, Seguros Premium</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-anantason">
            ¿Listo para Revolucionar tu Compañía de Seguros?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 font-geomanist">
            Únete a las aseguradoras líderes que ya están transformando su atención al cliente con IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-geomanist">
              Solicitar Demo Gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 font-geomanist"
            >
              Hablar con un Experto
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
                Transformando la atención al cliente en seguros con inteligencia artificial conversacional.
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
                  <Link href="/home/industrias/viajes" className="hover:text-white transition-colors font-geomanist">
                    Viajes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/home/industrias/seguros"
                    className="hover:text-white transition-colors font-geomanist text-blue-400"
                  >
                    Seguros
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
