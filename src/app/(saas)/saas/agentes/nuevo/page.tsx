"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "../../_components/ui/badge"
import { TIPOS_AGENTES } from "@/server/api/mock-data"

// TODO: REFACTORIZAR A COMPONENTES MÁS PEQUEÑOS Y REUTILIZABLES
export default function NuevoAgentePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null)

  const handleContinuar = () => {
    if (!tipoSeleccionado) {
      toast({
        title: "Selecciona un tipo",
        description: "Por favor selecciona un tipo de agente para continuar",
        variant: "destructive",
      })
      return
    }

    // Redirigir al wizard específico según el tipo seleccionado
    switch (tipoSeleccionado) {
      case "faq":
        router.push("/asistentes/nuevo/faq")
        break
      case "leads":
        router.push("/asistentes/nuevo/leads")
        break
      case "agenda":
        router.push("/asistentes/nuevo/agenda")
        break
      case "ventas":
        router.push("/asistentes/nuevo/ventas")
        break
      case "ecommerce":
        router.push("/asistentes/nuevo/ecommerce")
        break
      case "personalizado":
        router.push("/asistentes/nuevo/personalizado")
        break
      default:
        toast({
          title: "Próximamente",
          description: "Este tipo de agente estará disponible pronto",
          variant: "destructive",
        })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/asistentes">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Agente</h1>
            <p className="text-gray-600 mt-1">Selecciona el tipo de agente que deseas configurar</p>
          </div>
        </div>
      </div>

      {/* Selección de Tipo */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-aurelia-primary" />
            <span>¿Qué tipo de agente necesitas?</span>
          </CardTitle>
          <CardDescription>Selecciona el tipo de agente que mejor se adapte a tus objetivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPOS_AGENTES.map((tipo) => {
              const Icono = tipo.icono
              const isSelected = tipoSeleccionado === tipo.id

              return (
                <div
                  key={tipo.id}
                  className={`relative cursor-pointer rounded-xl border-2 transition-all ${
                    isSelected ? "border-aurelia-primary bg-purple-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setTipoSeleccionado(tipo.id)}
                >
                  {/* Indicador de selección */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-aurelia-primary text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <div className={`w-12 h-12 rounded-lg ${tipo.color} flex items-center justify-center mb-4`}>
                      <Icono className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{tipo.nombre}</h3>
                    <p className="text-gray-600 text-sm mb-4">{tipo.descripcion}</p>

                    {/* Pasos */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Pasos de configuración:</p>
                      <div className="flex flex-wrap gap-1">
                        {tipo.pasos.map((paso, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {paso}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Casos de uso */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Ideal para:</p>
                      <div className="flex flex-wrap gap-1">
                        {tipo.casos.map((caso, index) => (
                          <Badge key={index} className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs">
                            {caso}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Link href="/asistentes">
            <Button variant="outline" className="rounded-xl">
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={handleContinuar}
            className="bg-aurelia-primary hover:bg-purple-700 rounded-xl"
            disabled={!tipoSeleccionado}
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>

      {/* Sección de Ayuda */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle>¿No estás seguro qué elegir?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">Cada tipo de agente está optimizado para diferentes objetivos de negocio:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-medium text-blue-800 mb-2">Preguntas Frecuentes</h4>
                <p className="text-sm text-blue-700">
                  Ideal si quieres reducir tickets de soporte y responder preguntas repetitivas automáticamente.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-medium text-green-800 mb-2">Calificación de Leads</h4>
                <p className="text-sm text-green-700">
                  Perfecto para filtrar prospectos y solo transferir a tu equipo los leads calificados.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl">
                <h4 className="font-medium text-purple-800 mb-2">Agenda</h4>
                <p className="text-sm text-purple-700">
                  Excelente para negocios donde programar citas o demos es parte crucial del proceso.
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl">
                <h4 className="font-medium text-orange-800 mb-2">Ventas Completo</h4>
                <p className="text-sm text-orange-700">
                  La solución más completa para automatizar todo el proceso de ventas consultivas.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Recuerda que puedes personalizar cualquier agente después de crearlo para adaptarlo a tus necesidades
              específicas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
