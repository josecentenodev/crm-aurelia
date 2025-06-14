"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function Header() {
  const [isIndustriasOpen, setIsIndustriasOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-600 font-anantason">Aurelia</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/caracteristicas"
              className="text-gray-600 hover:text-purple-600 transition-colors font-geomanist"
            >
              Características
            </Link>
            <Link href="/agentes-ia" className="text-gray-600 hover:text-purple-600 transition-colors font-geomanist">
              Agentes IA
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsIndustriasOpen(!isIndustriasOpen)}
                className="flex items-center text-gray-600 hover:text-purple-600 transition-colors font-geomanist"
              >
                Industrias
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {isIndustriasOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/industrias/educacion"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Educación
                  </Link>
                  <Link
                    href="/industrias/viajes"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Viajes
                  </Link>
                  <Link
                    href="/industrias/automotriz"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Automotriz
                  </Link>
                  <Link
                    href="/industrias/inmobiliaria"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Inmobiliaria
                  </Link>
                  <Link
                    href="/industrias/seguros"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Seguros
                  </Link>
                  <Link
                    href="/industrias/salud"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Salud
                  </Link>
                  <Link
                    href="/industrias/servicios-profesionales"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Servicios Profesionales
                  </Link>
                </div>
              )}
            </div>

            <Link href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors font-geomanist">
              Precios
            </Link>
            <Link
              href="/calculadora-roi"
              className="text-gray-600 hover:text-purple-600 transition-colors font-geomanist"
            >
              Calculadora ROI
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-purple-600 transition-colors font-geomanist">
              Iniciar Sesión
            </Link>
            <Link
              href="/prueba-gratis"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-geomanist"
            >
              Prueba Gratis
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
