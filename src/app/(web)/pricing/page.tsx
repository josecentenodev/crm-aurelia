import { ArrowRight, MessageSquare, TrendingUp, Users, Zap, CheckCircle, Target, Globe } from "lucide-react"
import { Button } from "@/app/(web)/_components/button"
import { Badge } from "@/app/(web)/_components/badge"
import Image from "next/image"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Image src="/images/logo.png" alt="Aurelia Logo" width={120} height={40} priority />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-purple-600 transition-colors font-geomanist">
              Características
            </Link>
            <Link href="/#agents" className="text-gray-600 hover:text-purple-600 transition-colors font-geomanist">
              Agentes IA
            </Link>
            <div className="relative group">
              <button className="text-gray-600 hover:text-purple-600 transition-colors font-geomanist flex items-center">
                Industrias
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <Link
                    href="/industrias/educacion"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-geomanist"
                  >
                    Educación
                  </Link>
                  <Link
                    href="/industrias/viajes"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-geomanist"
                  >
                    Viajes
                  </Link>
                  <Link
                    href="/industrias/automotriz"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-geomanist"
                  >
                    Automotriz
                  </Link>
                  <Link
                    href="/industrias/inmobiliaria"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-geomanist"
                  >
                    Inmobiliaria
                  </Link>
                  <Link
                    href="/industrias/seguros"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-geomanist"
                  >
                    Seguros
                  </Link>
                  <Link
                    href="/industrias/salud"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-geomanist"
                  >
                    Salud
                  </Link>
                  <Link
                    href="/industrias/servicios-profesionales"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-geomanist"
                  >
                    Servicios Profesionales
                  </Link>
                </div>
              </div>
            </div>
            <Link href="/pricing" className="text-purple-600 font-semibold transition-colors font-geomanist">
              Precios
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="font-geomanist">
                Iniciar Sesión
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-geomanist">
              Prueba Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-anantason">Planes que se Adaptan a tu Negocio</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 font-geomanist">
            Desde startups hasta empresas, tenemos el plan perfecto para automatizar tus ventas
          </p>
          <div className="flex justify-center items-center space-x-4 mb-8">
            <Badge className="bg-white/20 text-white border-white/30 font-geomanist">
              ✅ Implementación personalizada
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 font-geomanist">✅ Soporte especializado</Badge>
            <Badge className="bg-white/20 text-white border-white/30 font-geomanist">✅ Resultados garantizados</Badge>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Plan Cards Container */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto col-span-full">
              {/* Plan Starter */}
              <div className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg relative bg-white rounded-lg overflow-hidden">
                {/* Card Header */}
                <div className="text-center p-6 pb-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 font-anantason">Starter</h3>
                  <p className="text-gray-600 mb-4 font-geomanist">Perfecto para PYMEs pequeñas</p>
                  <div className="text-4xl font-bold text-gray-900 mb-2 font-anantason">
                    $149
                    <span className="text-lg font-normal text-gray-600 font-geomanist">/mes</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-lg font-semibold text-blue-700 font-geomanist">Hasta 300 conversaciones/mes</p>
                  </div>
                </div>

                {/* Features List - Fixed Height */}
                <div className="p-6 pt-0">
                  <div className="h-[320px] overflow-y-auto mb-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">
                          IA Básica de Preguntas Frecuentes y Precalificación
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">1 canal (WhatsApp)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">1 usuario incluido</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">CRM Aurelia incluido</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Soporte por email</span>
                      </li>
                    </ul>
                  </div>

                  {/* Button - Fixed Position */}
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-geomanist">
                    Comenzar Ahora
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-4 font-geomanist">
                    Ideal para inmobiliarias y agencias pequeñas
                  </p>
                </div>
              </div>

              {/* Plan Growth */}
              <div className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl relative bg-gradient-to-b from-purple-50 to-white rounded-lg overflow-hidden">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 font-geomanist">
                    Más Popular
                  </Badge>
                </div>
                {/* Card Header */}
                <div className="text-center p-6 pb-0 pt-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 font-anantason">Growth</h3>
                  <p className="text-gray-600 mb-4 font-geomanist">Para empresas en crecimiento</p>
                  <div className="text-4xl font-bold text-gray-900 mb-2 font-anantason">
                    $299
                    <span className="text-lg font-normal text-gray-600 font-geomanist">/mes</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 mb-4">
                    <p className="text-lg font-semibold text-purple-700 font-geomanist">
                      Hasta 1,500 conversaciones/mes
                    </p>
                  </div>
                </div>

                {/* Features List - Fixed Height */}
                <div className="p-6 pt-0">
                  <div className="h-[320px] overflow-y-auto mb-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">
                          IA avanzada (Seguimiento automático y recontactos)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Hasta 3 canales (WA + IG/Facebook)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">3 usuarios incluidos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Agendamiento automático y confirmación de turnos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Embudos ilimitados</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">CRM Aurelia incluido</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">
                          Integración con otros CRM (HubSpot, Pipedrive, Salesforce)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Soporte por Email / Chat</span>
                      </li>
                    </ul>
                  </div>

                  {/* Button - Fixed Position */}
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-geomanist">
                    Comenzar Ahora
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-4 font-geomanist">
                    Perfecto para equipos comerciales activos
                  </p>
                </div>
              </div>

              {/* Plan Pro */}
              <div className="border-2 hover:border-orange-200 transition-all duration-300 hover:shadow-lg relative bg-white rounded-lg overflow-hidden">
                {/* Card Header */}
                <div className="text-center p-6 pb-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 font-anantason">Pro</h3>
                  <p className="text-gray-600 mb-4 font-geomanist">Para equipos profesionales</p>
                  <div className="text-4xl font-bold text-gray-900 mb-2 font-anantason">
                    $499
                    <span className="text-lg font-normal text-gray-600 font-geomanist">/mes</span>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 mb-4">
                    <p className="text-lg font-semibold text-orange-700 font-geomanist">
                      Hasta 3,000 conversaciones/mes
                    </p>
                  </div>
                </div>

                {/* Features List - Fixed Height */}
                <div className="p-6 pt-0">
                  <div className="h-[320px] overflow-y-auto mb-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">IA avanzada + IA predictiva</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Hasta 3 canales (WhatsApp + IG/Facebook)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">WhatsApp API oficial</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Hasta 5 usuarios</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Integraciones con ERP</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Campañas masivas salientes de WhatsApp</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Soporte prioritario</span>
                      </li>
                    </ul>
                  </div>

                  {/* Button - Fixed Position */}
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-geomanist">
                    Comenzar Ahora
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-4 font-geomanist">
                    Ideal para concesionarias y equipos grandes
                  </p>
                </div>
              </div>

              {/* Plan Enterprise */}
              <div className="border-2 hover:border-gray-300 transition-all duration-300 hover:shadow-lg relative bg-white rounded-lg overflow-hidden">
                {/* Card Header */}
                <div className="text-center p-6 pb-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 font-anantason">Enterprise</h3>
                  <p className="text-gray-600 mb-4 font-geomanist">Solución empresarial completa</p>
                  <div className="text-4xl font-bold text-gray-900 mb-2 font-anantason">Contactar</div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-lg font-semibold text-gray-700 font-geomanist">
                      A partir de 10,000 conversaciones/mes
                    </p>
                  </div>
                </div>

                {/* Features List - Fixed Height */}
                <div className="p-6 pt-0">
                  <div className="h-[320px] overflow-y-auto mb-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Todo lo anterior incluido</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Lógica personalizada</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Reportes avanzados</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Integración directa ERP/CRM</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Training personalizado</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Soporte dedicado 24/7</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-geomanist">Usuarios ilimitados</span>
                      </li>
                    </ul>
                  </div>

                  {/* Button - Fixed Position */}
                  <Button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black font-geomanist">
                    Contactar Ventas
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-4 font-geomanist">
                    Para empresas con +10 vendedores
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Adicionales Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-6 font-anantason text-gray-700">
              Servicios Adicionales
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-800 font-geomanist">Conversaciones Extra</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600 font-anantason">$0.35 c/u</div>
                </div>

                <div className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Globe className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-gray-800 font-geomanist">WhatsApp Adicional</span>
                  </div>
                  <div className="text-lg font-bold text-green-600 font-anantason">$49/mes</div>
                </div>

                <div className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-gray-800 font-geomanist">Usuario Adicional</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600 font-anantason">$25/mes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Features Comparison */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-center mb-8 font-anantason">Comparación Detallada</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold font-anantason">Características</th>
                    <th className="text-center py-4 px-4 font-semibold font-anantason">Starter</th>
                    <th className="text-center py-4 px-4 font-semibold font-anantason">Growth</th>
                    <th className="text-center py-4 px-4 font-semibold font-anantason">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold font-anantason">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="bg-blue-50">
                    <td className="py-4 px-4 font-bold font-anantason">Conversaciones/mes</td>
                    <td className="text-center py-4 px-4 font-semibold font-geomanist">Hasta 300</td>
                    <td className="text-center py-4 px-4 font-semibold font-geomanist">Hasta 1,500</td>
                    <td className="text-center py-4 px-4 font-semibold font-geomanist">Hasta 3,000</td>
                    <td className="text-center py-4 px-4 font-semibold font-geomanist">+10,000</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Tipo de IA</td>
                    <td className="text-center py-4 px-4 font-geomanist">FAQ + Precalificación</td>
                    <td className="text-center py-4 px-4 font-geomanist">Seguimiento automático</td>
                    <td className="text-center py-4 px-4 font-geomanist">IA Predictiva</td>
                    <td className="text-center py-4 px-4 font-geomanist">Personalizada</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Usuarios incluidos</td>
                    <td className="text-center py-4 px-4 font-geomanist">1</td>
                    <td className="text-center py-4 px-4 font-geomanist">3</td>
                    <td className="text-center py-4 px-4 font-geomanist">5</td>
                    <td className="text-center py-4 px-4 font-geomanist">Ilimitados</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Canales de comunicación</td>
                    <td className="text-center py-4 px-4 font-geomanist">1 (WhatsApp)</td>
                    <td className="text-center py-4 px-4 font-geomanist">3 (WA + IG/FB)</td>
                    <td className="text-center py-4 px-4 font-geomanist">3 (WA + IG/FB)</td>
                    <td className="text-center py-4 px-4 font-geomanist">Todos</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">WhatsApp API Oficial</td>
                    <td className="text-center py-4 px-4">❌</td>
                    <td className="text-center py-4 px-4">❌</td>
                    <td className="text-center py-4 px-4">✅</td>
                    <td className="text-center py-4 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Agendamiento automático</td>
                    <td className="text-center py-4 px-4">❌</td>
                    <td className="text-center py-4 px-4">✅</td>
                    <td className="text-center py-4 px-4">✅</td>
                    <td className="text-center py-4 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Embudos</td>
                    <td className="text-center py-4 px-4 font-geomanist">Básicos</td>
                    <td className="text-center py-4 px-4 font-geomanist">Ilimitados</td>
                    <td className="text-center py-4 px-4 font-geomanist">Ilimitados</td>
                    <td className="text-center py-4 px-4 font-geomanist">Ilimitados</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Integración CRM externo</td>
                    <td className="text-center py-4 px-4">❌</td>
                    <td className="text-center py-4 px-4 font-geomanist">HubSpot, Pipedrive, SF</td>
                    <td className="text-center py-4 px-4 font-geomanist">Todos los CRM</td>
                    <td className="text-center py-4 px-4 font-geomanist">API Directa</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Integración ERP</td>
                    <td className="text-center py-4 px-4">❌</td>
                    <td className="text-center py-4 px-4">❌</td>
                    <td className="text-center py-4 px-4">✅</td>
                    <td className="text-center py-4 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Campañas masivas WhatsApp</td>
                    <td className="text-center py-4 px-4">❌</td>
                    <td className="text-center py-4 px-4">❌</td>
                    <td className="text-center py-4 px-4">✅</td>
                    <td className="text-center py-4 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium font-geomanist">Soporte</td>
                    <td className="text-center py-4 px-4 font-geomanist">Email</td>
                    <td className="text-center py-4 px-4 font-geomanist">Email / Chat</td>
                    <td className="text-center py-4 px-4 font-geomanist">Prioritario</td>
                    <td className="text-center py-4 px-4 font-geomanist">24/7 Dedicado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Pricing */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8 font-anantason">Preguntas Frecuentes sobre Precios</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div>
                <h4 className="font-semibold mb-2 font-anantason">¿Puedo cambiar de plan en cualquier momento?</h4>
                <p className="text-gray-600 text-sm font-geomanist">
                  Sí, puedes actualizar o reducir tu plan en cualquier momento. Los cambios se aplican en el próximo
                  ciclo de facturación.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 font-anantason">¿Qué pasa si excedo mi límite de conversaciones?</h4>
                <p className="text-gray-600 text-sm font-geomanist">
                  Te notificaremos cuando te acerques al límite. Las conversaciones adicionales se cobran a $0.35 cada
                  una.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 font-anantason">¿Ofrecen descuentos por pago anual?</h4>
                <p className="text-gray-600 text-sm font-geomanist">
                  Sí, ofrecemos 2 meses gratis al pagar anualmente. Contacta a nuestro equipo para más detalles.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 font-anantason">¿Hay período de prueba gratuito?</h4>
                <p className="text-gray-600 text-sm font-geomanist">
                  Todos los planes incluyen una implementación personalizada con soporte especializado para garantizar
                  resultados.
                </p>
              </div>
            </div>
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
              Contactar Ventas
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75 font-geomanist">
            Implementación personalizada • Soporte especializado • Resultados garantizados
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
