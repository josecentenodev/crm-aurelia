"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CreditCard } from "lucide-react"
import { usePlanUsage } from "../hooks/use-plan-usage"
import { PlanUsageCard } from "../ui/plan-usage-card"

export function PlanTab() {
  const planUsage = usePlanUsage()

  if (!planUsage.clientId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente no seleccionado</h3>
          <p className="text-gray-500 text-center">
            Selecciona un cliente para ver la información de su plan
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Plan y Facturación</h2>
        <p className="text-gray-600">Gestiona tu suscripción, límites y facturación</p>
      </div>

      {/* Información del plan actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Actual */}
        <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 text-violet-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-semibold">Plan Actual</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Tu suscripción y beneficios</p>
            
            <div className="text-center mb-6">
              <div className="inline-block bg-violet-500 text-white text-lg px-4 py-2 rounded-lg mb-2">
                Plan Pro
              </div>
              <p className="text-3xl font-bold text-gray-900">$99/mes</p>
              <p className="text-sm text-gray-600">Facturación mensual</p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 text-green-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Hasta 10 usuarios</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 text-green-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Asistentes IA ilimitados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 text-green-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Todas las integraciones</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 text-green-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Soporte prioritario</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cambiar Plan
              </button>
              <button className="flex-1 bg-violet-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-violet-700">
                Ver Facturación
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Uso Actual */}
        <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 text-blue-600">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">Uso Actual</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Consumo de recursos este mes</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Usuarios</span>
                  <span>3/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Conversaciones</span>
                  <span>1,247/5,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Almacenamiento</span>
                  <span>2.1GB/10GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '21%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjeta de uso detallado */}
      <PlanUsageCard clientId={planUsage.clientId} />
    </div>
  )
}
