import { ArrowRight, BookOpen, Users, Clock, CheckCircle, Star, GraduationCap, MessageSquare, BarChart3, Target } from "lucide-react"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import Image from "next/image"
import Link from "next/link"
import Header from "../../_components/Header"

export default function EducacionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <Header />


      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0 lg:pr-8">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 font-geomanist">
                🎓 Solución para Educación
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 font-anantason leading-tight">
                Automatiza la Captación de Estudiantes con IA
              </h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto lg:mx-0 font-geomanist leading-relaxed opacity-90">
                Transforma tu proceso de admisiones con agentes IA que responden consultas, califican prospectos y
                programan visitas las 24 horas del día, aumentando tus inscripciones hasta un 300%.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-geomanist"
                >
                  Solicitar Demo Educativa
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

              {/* Stats específicas para educación */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">85%</div>
                  <div className="text-blue-100 font-geomanist">Consultas Resueltas</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">24/7</div>
                  <div className="text-blue-100 font-geomanist">Atención Continua</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-2 font-anantason">+300%</div>
                  <div className="text-blue-100 font-geomanist">Leads Calificados</div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-80 h-20 bg-gradient-to-r from-blue-300/40 via-indigo-300/40 to-blue-300/40 rounded-full blur-xl"></div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-200/30 via-transparent to-indigo-200/30 rounded-full blur-2xl transform scale-110"></div>
                <Image
                  src="/images/new-avatar-3d.png"
                  alt="Aurelia - Asistente IA para Educación"
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
              Los centros educativos enfrentan retos únicos en la captación y retención de estudiantes
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
                  Los padres y estudiantes hacen preguntas cuando tu equipo no está disponible, perdiendo oportunidades
                  valiosas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-orange-700 font-anantason">Sobrecarga del Personal</CardTitle>
                <CardDescription className="font-geomanist">
                  Tu equipo de admisiones está saturado respondiendo las mismas preguntas repetitivamente.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-yellow-200 bg-yellow-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-yellow-700 font-anantason">Seguimiento Manual Ineficiente</CardTitle>
                <CardDescription className="font-geomanist">
                  Pierdes estudiantes potenciales porque no tienes un sistema automatizado de seguimiento y nurturing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-purple-700 font-anantason">Falta de Datos y Métricas</CardTitle>
                <CardDescription className="font-geomanist">
                  No tienes visibilidad clara sobre qué estrategias de captación funcionan mejor para tu institución.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-blue-700 font-anantason">Competencia Intensa</CardTitle>
                <CardDescription className="font-geomanist">
                  Otras instituciones están captando a tus estudiantes potenciales con procesos más ágiles y modernos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-green-700 font-anantason">Proceso de Admisión Lento</CardTitle>
                <CardDescription className="font-geomanist">
                  Los estudiantes abandonan el proceso porque es muy largo y no reciben respuestas inmediatas.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Solución Específica para Educación */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Aurelia: Tu Solución Educativa Completa</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Automatiza todo tu proceso de admisiones con IA especializada en el sector educativo
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
                    Tu agente IA responde preguntas sobre programas académicos, requisitos de admisión, becas, horarios
                    y costos en cualquier momento del día, capturando leads que antes se perdían.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Calificación Automática de Prospectos</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Identifica automáticamente a los estudiantes más prometedores basándose en su perfil académico,
                    intereses y capacidad de pago, priorizando el seguimiento de tu equipo.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-anantason flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 font-anantason">Agendamiento de Visitas y Entrevistas</h3>
                  <p className="text-gray-600 font-geomanist leading-relaxed">
                    Programa automáticamente tours por el campus, entrevistas de admisión y sesiones informativas,
                    sincronizando con los calendarios de tu equipo académico.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border">
                <Image
                  src="/images/dashboard-main.png"
                  alt="Dashboard de Aurelia para Educación"
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
            <h2 className="text-4xl font-bold mb-4 font-anantason">Casos de Éxito en Educación</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Instituciones educativas que transformaron sus admisiones con Aurelia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-anantason">Universidad Tecnológica del Norte</CardTitle>
                    <CardDescription className="font-geomanist">Educación Superior</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 font-geomanist">
                    "Implementamos Aurelia para gestionar las 2,000+ consultas mensuales sobre nuestros programas de
                    ingeniería. Ahora respondemos el 95% de las preguntas automáticamente."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 font-anantason">+250%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Leads Calificados</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 font-anantason">85%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Reducción Tiempo Respuesta</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-anantason">Instituto de Idiomas GlobalSpeak</CardTitle>
                    <CardDescription className="font-geomanist">Educación de Idiomas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 font-geomanist">
                    "Aurelia nos ayudó a automatizar las consultas sobre cursos, horarios y niveles. Nuestras
                    inscripciones aumentaron 180% en 6 meses."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 font-anantason">+180%</div>
                      <div className="text-sm text-gray-600 font-geomanist">Inscripciones</div>
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

      {/* Características Específicas para Educación */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-anantason">Funcionalidades Diseñadas para Educación</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Herramientas específicas que entienden las necesidades únicas del sector educativo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Base de Conocimiento Académica</CardTitle>
                <CardDescription className="font-geomanist">
                  Información detallada sobre programas, requisitos, becas y procesos de admisión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Catálogo de programas académicos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Requisitos de admisión por carrera
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Información de becas y financiamiento
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Segmentación de Estudiantes</CardTitle>
                <CardDescription className="font-geomanist">
                  Clasifica automáticamente a los prospectos según su perfil y intereses académicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por área de interés académico
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por nivel educativo previo
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Por capacidad de inversión
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-anantason">Calendario Académico Integrado</CardTitle>
                <CardDescription className="font-geomanist">
                  Sincronización con fechas importantes y períodos de admisión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 font-geomanist">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Fechas límite de inscripción
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Períodos de exámenes de admisión
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Inicio de clases y orientación
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
              "Aurelia revolucionó nuestro proceso de admisiones. Pasamos de responder 50 consultas diarias manualmente
              a gestionar 500+ automáticamente, con una tasa de conversión 3 veces mayor."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                DR
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg font-anantason">Dr. Roberto Martínez</div>
                <div className="text-gray-600 font-geomanist">Director de Admisiones, Universidad Metropolitana</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-anantason">
            ¿Listo para Transformar tus Admisiones?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 font-geomanist">
            Únete a las instituciones educativas que ya están automatizando sus procesos de captación con Aurelia.
            Comienza tu prueba gratuita especializada para educación.
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
                La plataforma de IA especializada en automatizar admisiones educativas.
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
                  <Link
                    href="/home/industrias/educacion"
                    className="hover:text-white transition-colors font-geomanist text-blue-400"
                  >
                    Educación
                  </Link>
                </li>
                <li>
                  <Link href="/home/industrias/viajes" className="hover:text-white transition-colors font-geomanist">
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
