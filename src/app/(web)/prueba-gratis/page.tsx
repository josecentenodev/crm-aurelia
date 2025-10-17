"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PruebaGratisRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir inmediatamente a /trial
    router.replace("/trial")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo a la página de prueba gratuita...</p>
      </div>
    </div>
  )
}
