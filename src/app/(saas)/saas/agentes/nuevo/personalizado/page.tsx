"use client"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components"
import { ArrowLeft, Settings, Construction } from "lucide-react"
import Link from "next/link"

export default function NuevoAsistentePersonalizadoPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/asistentes/nuevo">
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Asistente Personalizado</h1>
          <p className="text-gray-600 mt-1">Configura un asistente a medida para tu caso específico</p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Construction className="w-5 h-5 text-gray-600" />
            <span>En Desarrollo</span>
          </CardTitle>
          <CardDescription>Configuración avanzada para casos específicos</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Asistente Personalizado</h3>
          <p className="text-gray-600 mb-6">
            Pronto podrás crear asistentes completamente personalizados para casos de uso específicos.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Configuración libre de todos los módulos</p>
            <p>• Flujos de conversación personalizados</p>
            <p>• Integraciones avanzadas</p>
            <p>• Lógica de negocio específica</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
